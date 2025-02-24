from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.crypto import get_random_string
from django.conf import settings


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)  # Ensure email is unique
    first_name = models.CharField(max_length=30, blank=False, null=False)
    last_name = models.CharField(max_length=30, blank=False, null=False)
    ROLE_CHOICES = [
        (0, 'Admin'),
        (1, 'Farmer'),
        (2, 'Buyer'),
    ]
    role = models.IntegerField(choices=ROLE_CHOICES, default=1)  # Default to Farmer


    is_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, blank=True, null=True)

    USERNAME_FIELD = 'email'  # Set email as the identifier for login
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']  # No need for username
    
    def generate_verification_token(self):
        self.email_verification_token = get_random_string(32)
        self.save()

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_role_display()})"

class FarmerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Foreign key to User table
    bio = models.TextField(blank=True, null=True)
    profilepic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    phoneno = models.CharField(max_length=15, unique=True)
    dob = models.DateField(blank=True, null=True)
    pincode = models.CharField(max_length=10)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    address = models.TextField()
    lat = models.DecimalField(max_digits=15, decimal_places=11, blank=True, null=True)
    lng = models.DecimalField(max_digits=15, decimal_places=11, blank=True, null=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.city}"