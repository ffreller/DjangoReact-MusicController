from django.shortcuts import redirect, render
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from requests import Request, post
from .utils import create_or_update_user_token, is_spotify_authenticated, execute_spotify_api_request
from api.models import Room

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
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'is_authenticated': is_authenticated}, status.HTTP_200_OK)
    
    
class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        rooms = Room.objects.filter(code=room_code)
        if rooms.exists():
            room = rooms.first()
        else:
            return(Response({'Issue with request to spotify': 'Room does not exist'}, status.HTTP_404_NOT_FOUND))
        host = room.host
        print(room.host)
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
        
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'progress': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes_to_skip': 0,
            'id': song_id
        }
        
        return Response(song, status.HTTP_200_OK)


    
    
    
