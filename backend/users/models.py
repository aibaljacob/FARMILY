from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)  # Ensure email is unique
    username = models.CharField(max_length=150)  # Make username optional

    USERNAME_FIELD = 'email'  # Set email as the identifier for login
    REQUIRED_FIELDS = ['username', 'is_farmer', 'is_buyer']
    is_farmer = models.BooleanField(default=False)
    is_buyer = models.BooleanField(default=False)

    def __str__(self):
        return self.username
