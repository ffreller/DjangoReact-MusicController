from urllib import response
from venv import create
from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, put, get
from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_token(session_key):
    user_tokens = SpotifyToken.objects.filter(user=session_key)
    if user_tokens.exists():
        return user_tokens.first()
    return None


def create_or_update_user_token(session_key, access_token, token_type, expires_in, refresh_token):
    token = get_user_token(session_key)
    expires_in = timezone.now() + timedelta(seconds=expires_in)
    
    if token:
        token.access_token = access_token
        token.refresh_token = refresh_token
        token.expires_in = expires_in
        token.token_type = token_type
        # print(access_token, token_type, expires_in, refresh_token)
        token.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
        
    else:
        token = SpotifyToken(user=session_key, access_token=access_token, refresh_token=refresh_token, expires_in=expires_in, token_type=token_type)
        token.save()

        
def is_spotify_authenticated(session_key):
    token = get_user_token(session_key)
    if token:
        if token.expires_in <= timezone.now():
            refresh_spotify_token(session_key)
        return True
    return False


def refresh_spotify_token(session_key):
    refresh_token = get_user_token(session_key=session_key).refresh_token
    
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()
    
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = refresh_token

    create_or_update_user_token(session_key=session_key, access_token=access_token,
                                token_type=token_type, expires_in=expires_in, refresh_token=refresh_token)
    
    
def execute_spotify_api_request(session_key, endpoint, post_=False, put_=False):
    token = get_user_token(session_key)
    headers = {'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token.access_token}
    
    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        put(BASE_URL + endpoint, headers=headers)
        
    response = get(BASE_URL + endpoint, {}, headers=headers)
    try:
        return response.json()
    except:
        if len(response.content) == 0:
            return {'error': 'Response is empty'}
        return {'error': 'Response could not be transformed to json'}