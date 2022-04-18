from django.shortcuts import redirect, render
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from requests import Request, post
from .utils import create_or_update_user_token, is_spotify_authenticated, execute_spotify_api_request, play_song, pause_song, skip_song
from api.models import Room
from spotify_conn.models import Vote

class AuthURL(APIView):
    def get(self, request, format=None):
        scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        
        url = Request("GET", "https://accounts.spotify.com/authorize", params={
            'scope': scope,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            "client_id": CLIENT_ID,
            
        }).prepare().url
        
        return Response({'url': url}, status.HTTP_200_OK)
    

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    # error = request.GET.get('error')
    
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()
    
    access_token = response.get('access_token')
    refresh_token = response.get('refresh_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    error = response.get('error')
    
    if not request.session.exists(request.session.session_key):
        request.session.create()
    
    create_or_update_user_token(session_key=request.session.session_key, access_token=access_token,
                                token_type=token_type, expires_in=expires_in, refresh_token=refresh_token)
    
    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'is_authenticated': is_authenticated}, status.HTTP_200_OK)
    
    
class CurrentSong(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        room_code = self.request.session.get('room_code')
        rooms = Room.objects.filter(code=room_code)
        if rooms.exists():
            room = rooms.first()
        else:
            return(Response({'Issue with request to spotify': 'Room does not exist'}, status.HTTP_404_NOT_FOUND))
        host = room.host
        endpoint = "player/currently_playing"
        response = execute_spotify_api_request(host, endpoint)
        
        if ('error' in response) or ('item' not in response):
            return(Response({'Issue with request to spotify': response.get('error')}, status.HTTP_404_NOT_FOUND))
        
        item = response.get('item')
        progress = response.get('progress_ms')
        is_playing = response.get('is_playing')
        duration = item.get('duration_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        song_id = item.get('id')
        
        artist_string = ""
        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name
        
        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'progress': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_to_skip': room.votes_to_skip,
            'id': song_id
        }
        
        self.update_room_song(room, song_id)
        
        return Response(song, status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        current_song = room.current_song
        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()
    
  
class PlaySong(APIView):
    def put(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        room_code = self.request.session.get('room_code')
        rooms = Room.objects.filter(code=room_code)
        if rooms.exists():
            room = rooms.first()
        else:
            return(Response({'Issue with request to spotify': 'Room does not exist'}, status.HTTP_404_NOT_FOUND))
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"Can't play"}, status=status.HTTP_403_FORBIDDEN)  
  
    
class PauseSong(APIView):
    def put(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        room_code = self.request.session.get('room_code')
        rooms = Room.objects.filter(code=room_code)
        if rooms.exists():
            room = rooms.first()
        else:
            return(Response({'Issue with request to spotify': 'Room does not exist'}, status.HTTP_404_NOT_FOUND))
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({'message':"Can't pause"}, status=status.HTTP_403_FORBIDDEN)
    

class SkipSong(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(request.session.session_key):
            self.request.session.create()
        room_code = self.request.session.get('room_code')
        rooms = Room.objects.filter(code=room_code)
        
        if rooms.exists():
            room = rooms.first()
        else:
            return(Response({'Issue with request to spotify': 'Room does not exist'}, status.HTTP_404_NOT_FOUND))
        
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        uses_who_voted = []
        if len(votes) > 0:
            users_who_voted = [vote.user for vote in votes]
        votes_to_skip = room.votes_to_skip
        
        if len(votes) == 0 or self.request.session.session_key not in users_who_voted:
            if (self.request.session.session_key == room.host) or (len(votes)+1 >= votes_to_skip):
                votes.delete()
                skip_song(room.host)
            else:
                vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song)
                vote.save()
        else:
            return Response({'message':'already voted'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        
        


    
    
    
