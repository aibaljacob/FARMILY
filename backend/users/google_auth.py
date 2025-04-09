from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.crypto import get_random_string
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
import json

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """
    Verify the Google ID token and create/login the user
    """
    try:
        # Get the token from the request
        token = request.data.get('token')
        if not token:
            return JsonResponse({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.SOCIALACCOUNT_PROVIDERS['google']['CLIENT_ID']
        )
        
        # Check if the token is valid
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return JsonResponse({'error': 'Invalid token issuer'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user info from the token
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        # Check if user exists
        user_exists = User.objects.filter(email=email).exists()
        
        if user_exists:
            # User exists, log them in
            user = User.objects.get(email=email)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return JsonResponse({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_verified': user.is_verified
                },
                'is_new_user': False
            })
        else:
            # This is a new user, we need to collect more information
            # Instead of using sessions, we'll encrypt the user data and send it directly
            # to the frontend, which will pass it back when completing signup
            
            # Create a secure hash of the email to verify later
            import hashlib
            email_hash = hashlib.sha256(email.encode()).hexdigest()
            
            return JsonResponse({
                'is_new_user': True,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'picture': picture,
                'email_hash': email_hash  # Used to verify the data when completing signup
            })
            
    except ValueError as e:
        # Invalid token
        return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Other errors
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def complete_google_signup(request):
    """
    Complete the signup process for a Google user by setting their role and creating a basic profile
    """
    try:
        # Get the role from the request (always required)
        role = request.data.get('role')
        if not role:
            return JsonResponse({'error': 'Role is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if we're using the temp_token approach (old method)
        temp_token = request.data.get('temp_token')
        if temp_token:
            # Try to get data from session first
            google_data_key = f"google_data_{temp_token}"
            google_data = request.session.get(google_data_key)
            
            # If session data exists, use it
            if google_data:
                email = google_data.get('email')
                first_name = google_data.get('first_name')
                last_name = google_data.get('last_name')
            else:
                # Fall back to data from request
                email = request.data.get('email')
                first_name = request.data.get('first_name')
                last_name = request.data.get('last_name')
        else:
            # Direct data approach
            email = request.data.get('email')
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            email_hash = request.data.get('email_hash')
            
            # Validate email and hash for direct approach
            if not email or not email_hash:
                return JsonResponse({'error': 'Email and email_hash are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify the email hash
            import hashlib
            calculated_hash = hashlib.sha256(email.encode()).hexdigest()
            if calculated_hash != email_hash:
                return JsonResponse({'error': 'Invalid data integrity check'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Final validation
        if not email:
            return JsonResponse({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists (extra safety check)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the user
        user = User.objects.create(
            email=email,
            first_name=first_name or '',
            last_name=last_name or '',
            role=int(role),  # Convert to int (1 for Farmer, 2 for Buyer)
            is_verified=True,  # Google has already verified the email
        )
        
        # Set a random password (user will login via Google)
        random_password = get_random_string(16)
        user.set_password(random_password)
        user.save()
        
        # Create a basic profile with minimal information
        # The user will be redirected to complete their profile
        if int(role) == 1:  # Farmer
            from users.models import FarmerProfile
            profile = FarmerProfile.objects.create(
                user=user,
                phoneno="",  # Empty placeholder
                address="",  # Empty placeholder
                city="",  # Empty placeholder
                state="",  # Empty placeholder
                country="",  # Empty placeholder
                pincode=""  # Empty placeholder
            )
            profile_complete = False
        else:  # Buyer
            from users.models import BuyerProfile
            profile = BuyerProfile.objects.create(
                user=user,
                phoneno="",  # Empty placeholder
                address="",  # Empty placeholder
                city="",  # Empty placeholder
                state="",  # Empty placeholder
                country="",  # Empty placeholder
                pincode=""  # Empty placeholder
            )
            profile_complete = False
        
        # Clear session data if we used it
        if temp_token:
            google_data_key = f"google_data_{temp_token}"
            if google_data_key in request.session:
                del request.session[google_data_key]
                request.session.modified = True
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return JsonResponse({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_verified': user.is_verified
            },
            'profile_complete': profile_complete
        })
        
    except Exception as e:
        # Handle errors
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
