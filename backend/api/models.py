from django.db import models

# Create your models here.

class User(models.Model):
    USER_TYPES = [
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    user_type = models.CharField(max_length=10, choices=USER_TYPES)

    def __str__(self):
        return self.email
