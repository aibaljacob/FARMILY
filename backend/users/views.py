
# Create your views here.
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
import requests
from rest_framework.response import Response
from django.core.mail import send_mail
from rest_framework import status
from .serializers import UserRegistrationSerializer,FarmerProfileSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model, password_validation
from rest_framework.serializers import ModelSerializer
from .models import User,FarmerProfile
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.tokens import default_token_generator
from django.http import JsonResponse
from django.conf import settings
from .utils import send_verification_email
from django.core.cache import cache
import random
from rest_framework.decorators import api_view

User = get_user_model()

class ResendVerificationEmailView(APIView):
    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()

        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_verified:
            return Response({"message": "Email is already verified."}, status=status.HTTP_200_OK)

        # Generate a new verification token
        user.generate_verification_token()

        # Send verification email
        verification_link = f"http://127.0.0.1:8000/api/verify-email/{user.email_verification_token}/"
        send_mail(
            "Verify Your Email",
            f"Click the link to verify your email: {verification_link}",
            "your-email@example.com",
            [user.email],
            fail_silently=False,
        )

        return Response({"message": "Verification email sent successfully!"}, status=status.HTTP_200_OK)

def verify_email(request,token):
    user = User.objects.filter(email_verification_token=token).first()

    if not user:
        return JsonResponse({"error": "Invalid or expired token!"}, status=400)
    
    if user.is_verified:
        return JsonResponse({"message": "Email already verified!"}, status=200)

    user.is_verified = True
    user.email_verification_token = None  # Clear token after verification
    user.save()

    return JsonResponse({"message": "Email verified successfully!"}, status=200)


class RegisterUserView(APIView):
    def post(self, request):
        print("Received data:", request.data)  # Debugging

        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            try:
                send_verification_email(user, request)  # Send email
                return Response(
                    {"message": "User registered successfully! Check your email to verify your account."},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                print("Email sending failed:", str(e))  # Log failure
                return Response(
                    {"message": "User registered, but verification email could not be sent."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        print("Validation errors:", serializer.errors)  # Debugging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            reset_url = f"http://localhost:5173/reset-password/{user.id}/{token}/"

            
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_url}',
                'noreply@farmily.com',
                [email],
            )
            return Response({"message": "Password reset email sent!"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "User not found!"}, status=status.HTTP_400_BAD_REQUEST)


# Password Reset Confirmation View
class PasswordResetConfirmAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, user_id, token):
        new_password = request.data.get('new_password')
        try:
            user = User.objects.get(id=user_id)
            if default_token_generator.check_token(user, token):
                # Validate password strength before updating
                try:
                    password_validation.validate_password(new_password, user)
                    user.set_password(new_password)
                    user.save()
                    return Response({"message": "Password successfully reset!"}, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({"message": f"Password validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"message": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"message": "User not found!"}, status=status.HTTP_400_BAD_REQUEST)



# Optionally, create a custom view to extend the behavior if needed
class CustomTokenObtainPairView(TokenObtainPairView):
    pass


class UserDetailSerializer(ModelSerializer):
    class Meta:
        model = User # Use your custom User model here
        fields = ['email', 'first_name', 'last_name', 'role', 'is_verified']  # Add any fields you want to display

class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Serialize the logged-in user's data
        user = request.user
        user_data = UserDetailSerializer(user).data

        return Response({
            'message': 'Welcome to your dashboard!',
            'user': user_data,
        })

User = get_user_model()    

class UserLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)  # Fetch user by email
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):  # Manually check password
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_verified:
            return Response({"detail": "Please verify your email before logging in."}, status=status.HTTP_400_BAD_REQUEST)


        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

            

        return Response({
            "access": str(access_token),
            "refresh": str(refresh),
            "user": {  # ✅ Include full user details
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role
                },
            "message": "Login successful!"
        }, status=status.HTTP_200_OK
        )
        
        # return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)


class FarmerProfileCreateView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only logged-in users can add profiles

    def get(self, request):
        """Retrieve the logged-in user's profile if it exists."""
        try:
            profile = FarmerProfile.objects.get(user_id=request.user.id)
            serializer = FarmerProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except FarmerProfile.DoesNotExist:
            return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Create a new profile for the logged-in user."""
        if FarmerProfile.objects.filter(user_id=request.user.id).exists():
            return Response({"message": "Profile already exists"}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['user_id'] = request.user.id  # Automatically link the logged-in user

        serializer = FarmerProfileSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile created successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """Update an existing profile."""
        try:
            profile = FarmerProfile.objects.get(user_id=request.user.id)
        except FarmerProfile.DoesNotExist:
            return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = FarmerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully!", "data": serializer.data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def send_otp(request):
    phone_number = request.data.get('phoneNumber')
    
    if not phone_number:
        return Response({'error': 'Phone number is required'}, status=400)
    
    # Generate 6-digit OTP
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Store OTP in cache with 5 minutes expiry
    cache_key = f'otp_{phone_number}'
    cache.set(cache_key, otp, timeout=300)  # 300 seconds = 5 minutes
    
    # Here you would integrate with SMS service like Twilio
    # For demo, just printing the OTP
    print(f"OTP for {phone_number}: {otp}")
    
    return Response({'message': 'OTP sent successfully'})

@api_view(['POST'])
def verify_otp(request):
    phone_number = request.data.get('phoneNumber')
    otp = request.data.get('otp')
    
    if not phone_number or not otp:
        return Response({'error': 'Phone number and OTP are required'}, status=400)
    
    # Get stored OTP from cache
    cache_key = f'otp_{phone_number}'
    stored_otp = cache.get(cache_key)
    
    if not stored_otp:
        return Response({'error': 'OTP expired'}, status=400)
    
    if otp != stored_otp:
        return Response({'error': 'Invalid OTP'}, status=400)
    
    # Clear the OTP from cache
    cache.delete(cache_key)
    
    return Response({'message': 'Phone number verified successfully'})