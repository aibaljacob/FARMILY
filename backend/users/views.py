
# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework.serializers import ModelSerializer
from .models import User

class RegisterUserView(APIView):
    def post(self, request):
        print("Received data:", request.data)
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Optionally, create a custom view to extend the behavior if needed
class CustomTokenObtainPairView(TokenObtainPairView):
    pass


class UserDetailSerializer(ModelSerializer):
    class Meta:
        model = User # Use your custom User model here
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_farmer', 'is_buyer']  # Add any fields you want to display

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

        user = authenticate(request, username=email, password=password)
        if user is not None:
            # Create a refresh token for the user
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            # Assuming you have custom fields like is_farmer, is_buyer, is_admin
            user_type = 'farmer' if user.is_farmer else ('buyer' if user.is_buyer else 'admin')

            return Response({
                "access": str(access_token),
                "refresh": str(refresh),
                "user_type": user_type,  # Sending the user type back
                "message": "Login successful!"
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

