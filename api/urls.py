from django.urls import path
from .views import GetRoom, RoomView, CreateRoomView, JoinRoom

urlpatterns = [
    path('room', RoomView.as_view()),
    path('create_room', CreateRoomView.as_view()),
    path('get_room', GetRoom.as_view()),
    path('join_room', JoinRoom.as_view()),
]
