from django.db import models
from string import ascii_uppercase
from random import choices

def generate_unique_code():
    lentgh = 6
    while True:
        code = ''.join(choices(ascii_uppercase, k=lentgh))
        if Room.objects.filter(code=code).count() == 0:
            return code

# Create your models here.
class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    guest_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)