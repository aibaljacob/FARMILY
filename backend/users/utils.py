from django.core.mail import send_mail
from django.conf import settings
from .models import User
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode

def send_verification_email(user, request):
    """Generate a token and send a verification email to the user."""
    user.generate_verification_token()  # Create a unique token
    token = user.email_verification_token
    
    domain = get_current_site(request).domain
    verification_link = f"http://{domain}/api/verify-email/{token}/"

    send_mail(
        "Verify Your Email",
        f"Click the link to verify your email: {verification_link}",
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )