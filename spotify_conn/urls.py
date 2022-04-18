from django.urls import path
from .views import AuthURL, spotify_callback, IsAuthenticated, CurrentSong

urlpatterns = [
    path('get_auth_url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is_authenticated', IsAuthenticated.as_view()),
    path('current_song', CurrentSong.as_view()),
]
