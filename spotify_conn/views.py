from django.shortcuts import redirect, render
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from requests import Request, post
from .utils import create_or_update_user_token, is_spotify_authenticated

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
        return Response({'status': is_authenticated}, status.HTTP_200_OK)



    
    
    
