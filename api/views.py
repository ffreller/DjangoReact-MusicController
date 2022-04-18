from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response


# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'
    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if room.exists():
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room not found':'Invalid room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad request':'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'
    def post(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if room_result.exists():
                self.request.session['room_code'] = code
                return Response({"message":"Room joined"}, status=status.HTTP_200_OK)
            return Response({'Room not found':'Invalid room Code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad request':'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    def post(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            # created_at = serializer.data.get('created_at')
            host = self.request.session.session_key
            
            #Check if there is a room with the same host
            queryset = Room.objects.filter(host=host)
            
            #If there is, update the room. If not, create room
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                # room.created_at = created_at
                self.request.session['room_code'] = room.code
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code    
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        code = self.request.session.get('room_code')
        room_results = Room.objects.filter(code=code)
        if room_results.exists():
            data = {'code': code}
            return JsonResponse(data, status=status.HTTP_200_OK)
        data = {'code':''}
        return JsonResponse(data, status=status.HTTP_200_OK)
    
    
class LeaveRoom(APIView):
    def post(self, request, format=None):
        if "room_code" in self.request.session:
            self.request.session.pop("room_code")
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if room_results.exists():
                room = room_results[0]
                room.delete()
                
        return Response({'message':"Success"}, status=status.HTTP_201_CREATED)
            
            
class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    def put(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')
            
            queryset = Room.objects.filter(code=code)
            if queryset.exists():
                room = queryset[0]
                user_id = self.request.session.session_key
                if room.host == user_id:
                    room.guest_can_pause = guest_can_pause
                    room.votes_to_skip = votes_to_skip
                    room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                    return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
                return Response({'message':'You are not the host of this room'}, status=status.HTTP_403_FORBIDDEN)
            return Response({'message':'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad request':'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)