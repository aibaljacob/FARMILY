# Create your views here.
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.mail import send_mail
from rest_framework import status
from django.utils import timezone
from .serializers import UserRegistrationSerializer,FarmerProfileSerializer, BuyerProfileSerializer, ProductSerializer, DemandSerializer, DemandResponseSerializer, ProductOfferSerializer, NotificationSerializer, FarmerRatingSerializer, BuyerRatingSerializer, FavoriteProductSerializer, FavoriteDemandSerializer, ReportSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model, password_validation
from rest_framework.serializers import ModelSerializer
from .models import User,FarmerProfile, BuyerProfile, Product, Demand, DemandResponse, ProductOffer, Notification, FarmerRating, BuyerRating, FavoriteProduct, FavoriteDemand, Report
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.conf import settings
from .utils import send_verification_email
from django.core.cache import cache
import random
from rest_framework.decorators import api_view
from .serializers import ProductSerializer
from .models import Product
from .serializers import BuyerProfileSerializer
from .models import BuyerProfile
from .serializers import DemandSerializer, DemandResponseSerializer
from .models import Demand, DemandResponse
from .serializers import ProductOfferSerializer
from .models import ProductOffer
from .serializers import NotificationSerializer
from .models import Notification
from .serializers import FarmerRatingSerializer, BuyerRatingSerializer
from .models import FarmerRating, BuyerRating

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
            "user": {  # 
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
    

class BuyerProfileCreateView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only logged-in users can add profiles

    def get(self, request):
        """Retrieve the logged-in user's profile if it exists."""
        try:
            profile = BuyerProfile.objects.get(user_id=request.user.id)
            serializer = BuyerProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except BuyerProfile.DoesNotExist:
            return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Create a new profile for the logged-in user."""
        if BuyerProfile.objects.filter(user_id=request.user.id).exists():
            return Response({"message": "Profile already exists"}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['user_id'] = request.user.id  # Automatically link the logged-in user

        serializer = BuyerProfileSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile created successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def put(self, request):
        """Update an existing profile."""
        try:
            profile = BuyerProfile.objects.get(user_id=request.user.id)
        except BuyerProfile.DoesNotExist:
            return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BuyerProfileSerializer(profile, data=request.data, partial=True)
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

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # Requires authentication
def product_list_create(request):
    if request.method == 'GET':  # Handle GET request
        products = Product.objects.all()
        
        # Add select_related to get the user (farmer) data efficiently
        products = products.select_related('farmer')
        
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':  # Handle POST request
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(farmer=request.user)  # Assign logged-in user as farmer
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])  
def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)  # 

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.delete()
        return Response({"message": "Product deleted"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_buyer_profiles(request):
    """
    Endpoint for farmers to view all buyer profiles without requiring the buyer's token.
    Any authenticated user can access this endpoint.
    """
    buyer_profiles = BuyerProfile.objects.all()
    
    # Include related user data to get names and other details
    buyer_profiles = buyer_profiles.select_related('user')
    
    serializer = BuyerProfileSerializer(buyer_profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_farmer_profiles(request):
    """
    Endpoint for viewing all farmer profiles.
    Any authenticated user can access this endpoint.
    """
    farmer_profiles = FarmerProfile.objects.all()
    
    # Include related user data to get names and other details
    farmer_profiles = farmer_profiles.select_related('user')
    
    serializer = FarmerProfileSerializer(farmer_profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_user(request, user_id):
    """
    Endpoint for admins to approve a user.
    Only users with admin role (role=0) can approve other users.
    """
    # Check if the requesting user is an admin
    if request.user.role != 0:
        return Response(
            {"message": "Only administrators can approve users"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get the user to approve
        user_to_approve = User.objects.get(pk=user_id)
        
        # Mark the user as verified
        user_to_approve.is_verified = True
        user_to_approve.save()
        
        return Response(
            {"message": f"User {user_to_approve.email} has been approved successfully"},
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            {"message": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"message": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def demand_list_create(request):
    if request.method == 'GET':
        # Check if we should filter by current user
        user_only = request.query_params.get('user_only', 'false').lower() == 'true'
        
        if user_only:
            # Return only demands created by the current user
            demands = Demand.objects.filter(buyer=request.user)
        else:
            # Return all demands (original behavior)
            demands = Demand.objects.all()
            
        demands = demands.select_related('buyer')
        serializer = DemandSerializer(demands, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        print(f"Received demand data: {request.data}")
        serializer = DemandSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(buyer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def demand_detail(request, pk):
    demand = get_object_or_404(Demand, pk=pk)

    if request.method == 'GET':
        serializer = DemandSerializer(demand)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DemandSerializer(demand, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        demand.delete()
        return Response({"message": "Demand deleted"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def demand_response_list_create(request):
    """
    List all demand responses or create a new one
    """
    if request.method == 'GET':
        # Admin or buyer gets all responses
        if request.user.role == 0 or request.user.role == 2:  # Admin or Buyer
            responses = DemandResponse.objects.all()
        else:  # Farmer gets only their responses
            responses = DemandResponse.objects.filter(farmer=request.user)
            
        serializer = DemandResponseSerializer(responses, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Make sure user is a farmer
        if request.user.role != 1:
            return Response({"detail": "Only farmers can respond to demands"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Add farmer to the data
        data = request.data.copy()
        data['farmer'] = request.user.id
        
        # Check if the demand exists
        demand_id = data.get('demand')
        try:
            demand = Demand.objects.get(pk=demand_id)
        except Demand.DoesNotExist:
            return Response({"detail": "Demand not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Ensure demand is active
        if not demand.is_active or demand.status != 'active':
            return Response({"detail": "This demand is no longer active"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        serializer = DemandResponseSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            response = serializer.save()
            
            # Create notification for the buyer
            category_display = dict(Demand.CATEGORY_CHOICES).get(demand.category, demand.category)
            create_notification(
                recipient=demand.buyer,
                sender=request.user,
                message=f"New response to your demand for {category_display}!",
                notification_type='demand_response',
                demand_id=demand.id,
                response_id=response.id,
                redirect_url=f"/buyer/demand/{demand.id}/responses"
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def demand_response_detail(request, pk):
    """
    Get, update or delete a demand response
    """
    try:
        response = DemandResponse.objects.get(pk=pk)
    except DemandResponse.DoesNotExist:
        return Response({"detail": "Response not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Ensure the user has permission to view/edit the response
    if (request.user.role == 1 and response.farmer.id != request.user.id) and \
       (request.user.role == 2 and response.demand.buyer.id != request.user.id) and \
       (request.user.role != 0):  # Admin can view all
        return Response({"detail": "You do not have permission to view this response"}, 
                      status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = DemandResponseSerializer(response, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Only the original farmer or the demand's buyer can update
        if request.user.role == 1 and response.farmer.id != request.user.id:
            return Response({"detail": "You can only update your own responses"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Log the incoming data for debugging
        print(f"PUT Request data: {request.data}")
        
        # Store the old status for notification check
        old_status = response.status
        
        # Farmers can update offered price, quantity, and notes, but not status
        if request.user.role == 1:
            allowed_fields = ['offered_price', 'offered_quantity', 'notes']
            data = {k: v for k, v in request.data.items() if k in allowed_fields}
            serializer = DemandResponseSerializer(response, data=data, partial=True, 
                                              context={'request': request})
        else:  # Buyers and admins can update status
            serializer = DemandResponseSerializer(response, data=request.data, partial=True, 
                                              context={'request': request})
        
        if serializer.is_valid():
            updated_response = serializer.save()
            
            # Check if status changed to accepted or rejected
            new_status = updated_response.status
            if old_status != new_status:
                demand = response.demand
                category_display = dict(Demand.CATEGORY_CHOICES).get(demand.category, demand.category)
                
                # Create notification for status change
                if new_status == 'accepted':
                    # Notify the farmer
                    create_notification(
                        recipient=response.farmer,
                        sender=request.user,
                        message=f"Your response to the demand for {category_display} has been accepted!",
                        notification_type='response_accepted',
                        demand_id=demand.id,
                        response_id=response.id,
                        redirect_url=f"/farmer/deals"
                    )
                    # Update the demand status to fulfilled
                    demand.status = 'fulfilled'
                    demand.save()
                
                elif new_status == 'rejected':
                    # Notify the farmer
                    create_notification(
                        recipient=response.farmer,
                        sender=request.user,
                        message=f"Your response to the demand for {category_display} has been rejected.",
                        notification_type='response_rejected',
                        demand_id=demand.id,
                        response_id=response.id,
                        redirect_url=f"/farmer/responses"
                    )
            
            # Log the updated instance
            print(f"Updated response: status={updated_response.status}")
            return Response(serializer.data)
            
        # Log validation errors
        print(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only admin, the farmer who created it, or the buyer who owns the demand can delete
        if (request.user.role == 0 or  # Admin
            (request.user.role == 1 and response.farmer.id == request.user.id) or  # Original farmer
            (request.user.role == 2 and response.demand.buyer.id == request.user.id)):  # Demand's buyer
            response.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"detail": "Not authorized to delete this response"}, 
                          status=status.HTTP_403_FORBIDDEN)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_demand_responses(request):
    """
    Get all responses for the current user's demands (if buyer) or
    all responses the current user has made (if farmer)
    """
    if request.user.role == 1:  # Farmer
        responses = DemandResponse.objects.filter(farmer=request.user)
    elif request.user.role == 2:  # Buyer
        responses = DemandResponse.objects.filter(demand__buyer=request.user)
    else:  # Admin can see all
        responses = DemandResponse.objects.all()
    
    serializer = DemandResponseSerializer(responses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def demand_responses(request, demand_id):
    """
    Get all responses for a specific demand
    """
    try:
        demand = Demand.objects.get(pk=demand_id)
    except Demand.DoesNotExist:
        return Response({"detail": "Demand not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check authorization
    if request.user.role != 0 and request.user.id != demand.buyer.id:
        # Not admin or demand owner - check if they're a farmer who responded
        if request.user.role == 1:
            has_response = DemandResponse.objects.filter(demand=demand, farmer=request.user).exists()
            if not has_response:
                return Response({"detail": "Not authorized to view these responses"}, 
                              status=status.HTTP_403_FORBIDDEN)
            # If they responded, they can only see their own response
            responses = DemandResponse.objects.filter(demand=demand, farmer=request.user)
        else:
            return Response({"detail": "Not authorized to view these responses"}, 
                          status=status.HTTP_403_FORBIDDEN)
    else:
        # Admin or demand owner can see all responses
        responses = DemandResponse.objects.filter(demand=demand)
    
    serializer = DemandResponseSerializer(responses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_product_by_id(request, product_id):
    """
    Get a specific product by ID
    """
    try:
        product = Product.objects.get(pk=product_id)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_offer_list_create(request):
    """
    List all product offers or create a new one
    """
    if request.method == 'GET':
        # Admin or farmer gets all offers
        if request.user.role == 0 or request.user.role == 1:  # Admin or Farmer
            offers = ProductOffer.objects.all()
        else:  # Buyer gets only their offers
            offers = ProductOffer.objects.filter(buyer=request.user)
            
        serializer = ProductOfferSerializer(offers, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Make sure user is a buyer
        if request.user.role != 2:
            return Response({"detail": "Only buyers can make offers on products"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Add buyer to the data
        data = request.data.copy()
        data['buyer'] = request.user.id
        
        # Check if the product exists
        product_id = data.get('product')
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Ensure product is active
        if not product.is_active:
            return Response({"detail": "This product is no longer active"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProductOfferSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            offer = serializer.save()
            
            # Create notification for the farmer
            product_name = product.name or dict(Product.CATEGORY_CHOICES).get(product.category, product.category)
            create_notification(
                recipient=product.farmer,
                sender=request.user,
                message=f"New offer on your {product_name}!",
                notification_type='product_offer',
                product_id=product.id,
                offer_id=offer.id,
                redirect_url=f"/farmer/products/{product.id}/offers"
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_offer_detail(request, pk):
    """
    Get, update or delete a product offer
    """
    try:
        offer = ProductOffer.objects.get(pk=pk)
    except ProductOffer.DoesNotExist:
        return Response({"detail": "Offer not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Ensure the user has permission to view/edit the offer
    product_owner = offer.product.farmer
    if (request.user.role == 2 and offer.buyer.id != request.user.id) and \
       (request.user.role == 1 and product_owner.id != request.user.id) and \
       (request.user.role != 0):  # Admin can view all
        return Response({"detail": "You do not have permission to view this offer"}, 
                      status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = ProductOfferSerializer(offer, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Only the original buyer or the product's farmer can update
        if request.user.role == 2 and offer.buyer.id != request.user.id:
            return Response({"detail": "You can only update your own offers"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Log the incoming data for debugging
        print(f"PUT Request data: {request.data}")
        
        # Store the old status for notification check
        old_status = offer.status
        
        # Buyers can update offered price, quantity, and notes, but not status
        if request.user.role == 2:
            allowed_fields = ['offered_price', 'quantity', 'notes']
            data = {k: v for k, v in request.data.items() if k in allowed_fields}
            serializer = ProductOfferSerializer(offer, data=data, partial=True, 
                                              context={'request': request})
        else:  # Farmers and admins can update status
            serializer = ProductOfferSerializer(offer, data=request.data, partial=True, 
                                              context={'request': request})
        
        if serializer.is_valid():
            updated_offer = serializer.save()
            
            # Check if status changed to accepted or rejected
            new_status = updated_offer.status
            if old_status != new_status:
                product = offer.product
                product_name = product.name or dict(Product.CATEGORY_CHOICES).get(product.category, product.category)
                
                # Create notification for status change
                if new_status == 'accepted':
                    # Notify the buyer
                    create_notification(
                        recipient=offer.buyer,
                        sender=request.user,
                        message=f"Your offer for {product_name} has been accepted!",
                        notification_type='offer_accepted',
                        product_id=product.id,
                        offer_id=offer.id,
                        redirect_url=f"/buyer/deals"
                    )
                    
                    # Update product quantity
                    remaining_quantity = max(0, product.quantity - offer.quantity)
                    product.quantity = remaining_quantity
                    if remaining_quantity <= 0:
                        product.is_active = False
                    product.save()
                
                elif new_status == 'rejected':
                    # Notify the buyer
                    create_notification(
                        recipient=offer.buyer,
                        sender=request.user,
                        message=f"Your offer for {product_name} has been rejected.",
                        notification_type='offer_rejected',
                        product_id=product.id,
                        offer_id=offer.id,
                        redirect_url=f"/buyer/products"
                    )
            
            # Log the updated instance
            print(f"Updated offer: status={updated_offer.status}")
            return Response(serializer.data)
            
        # Log validation errors
        print(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only admin, the buyer who created it, or the farmer who owns the product can delete
        if (request.user.role == 0 or  # Admin
            (request.user.role == 2 and offer.buyer.id == request.user.id) or  # Original buyer
            (request.user.role == 1 and offer.product.farmer.id == request.user.id)):  # Product's farmer
            offer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"detail": "Not authorized to delete this offer"}, 
                          status=status.HTTP_403_FORBIDDEN)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_product_offers(request):
    """
    Get all offers for the current user's products (if farmer) or
    all offers the current user has made (if buyer)
    """
    if request.user.role == 2:  # Buyer
        offers = ProductOffer.objects.filter(buyer=request.user)
    elif request.user.role == 1:  # Farmer
        offers = ProductOffer.objects.filter(product__farmer=request.user)
    else:  # Admin can see all
        offers = ProductOffer.objects.all()
    
    serializer = ProductOfferSerializer(offers, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_offers(request, product_id):
    """
    Get all offers for a specific product
    """
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check authorization
    if request.user.role != 0 and request.user.id != product.farmer.id:
        # Not admin or product owner - check if they're a buyer who made an offer
        if request.user.role == 2:
            has_offer = ProductOffer.objects.filter(product=product, buyer=request.user).exists()
            if not has_offer:
                return Response({"detail": "Not authorized to view these offers"}, 
                              status=status.HTTP_403_FORBIDDEN)
            # If they made an offer, they can only see their own offer
            offers = ProductOffer.objects.filter(product=product, buyer=request.user)
        else:
            return Response({"detail": "Not authorized to view these offers"}, 
                          status=status.HTTP_403_FORBIDDEN)
    else:
        # Admin or product owner can see all offers
        offers = ProductOffer.objects.filter(product=product)
    
    serializer = ProductOfferSerializer(offers, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_products(request):
    """
    Get all products created by the currently authenticated farmer
    """
    if request.user.role != 1:  # Only farmers can use this endpoint
        return Response({"detail": "Only farmers can access their products"}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    products = Product.objects.filter(farmer=request.user)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_deals(request):
    """
    Get all deals for a user - both from accepted demand responses and accepted product offers
    """
    if request.user.role == 1:  # Farmer
        # Get accepted demand responses where the current farmer responded
        demand_responses = DemandResponse.objects.filter(
            farmer=request.user,
            status='Accepted'
        )
        demand_deals = DemandResponseSerializer(demand_responses, many=True, context={'request': request}).data
        
        # Get accepted product offers for the farmer's products
        product_offers = ProductOffer.objects.filter(
            product__farmer=request.user,
            status='accepted'
        )
        product_deals = ProductOfferSerializer(product_offers, many=True, context={'request': request}).data
        
    elif request.user.role == 2:  # Buyer
        # Get accepted responses to the buyer's demands
        demand_responses = DemandResponse.objects.filter(
            demand__buyer=request.user,
            status='Accepted'
        )
        demand_deals = DemandResponseSerializer(demand_responses, many=True, context={'request': request}).data
        
        # Get the buyer's accepted offers on products
        product_offers = ProductOffer.objects.filter(
            buyer=request.user,
            status='accepted'
        )
        product_deals = ProductOfferSerializer(product_offers, many=True, context={'request': request}).data
        
    else:  # Admin can see all
        demand_responses = DemandResponse.objects.filter(status='Accepted')
        demand_deals = DemandResponseSerializer(demand_responses, many=True, context={'request': request}).data
        
        product_offers = ProductOffer.objects.filter(status='accepted')
        product_deals = ProductOfferSerializer(product_offers, many=True, context={'request': request}).data
    
    # Return both types of deals with a type indicator
    return Response({
        'demand_deals': demand_deals,
        'product_deals': product_deals
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_demand_response_delivery(request, pk):
    """
    Update the delivery status of a demand response.
    Only the farmer who created the response can update its delivery status.
    """
    try:
        response = DemandResponse.objects.get(pk=pk)
    except DemandResponse.DoesNotExist:
        return Response({"detail": "Demand response not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Ensure only the farmer who created the response can update delivery status
    if request.user.role != 1 or response.farmer.id != request.user.id:
        return Response({"detail": "You can only update delivery status for your own responses"}, 
                      status=status.HTTP_403_FORBIDDEN)
    
    # Ensure response is accepted
    if response.status != 'accepted':
        return Response({"detail": "Only accepted responses can have delivery updates"}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    # Ensure can_deliver is True
    if not response.can_deliver:
        return Response({"detail": "Only deliverable responses can have delivery updates"}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    # Store the old status for notification check
    old_status = response.delivery_status
    
    # Update the delivery status
    delivery_status = request.data.get('delivery_status')
    if delivery_status not in ['ready', 'out_for_delivery', 'delivered']:
        return Response({"detail": "Invalid delivery status"}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    response.delivery_status = delivery_status
    response.save()
    
    # Create notification if status changed
    if old_status != delivery_status:
        demand = response.demand
        category_display = dict(Demand.CATEGORY_CHOICES).get(demand.category, demand.category)
        
        # Message based on the status
        status_message = ""
        if delivery_status == 'out_for_delivery':
            status_message = f"Your order for {category_display} is now out for delivery!"
        elif delivery_status == 'delivered':
            status_message = f"Your order for {category_display} has been delivered."
        elif delivery_status == 'ready':
            status_message = f"Your order for {category_display} is ready for delivery."
        
        # Notify the buyer
        create_notification(
            recipient=demand.buyer,
            sender=request.user,
            message=status_message,
            notification_type='delivery_status',
            demand_id=demand.id,
            response_id=response.id,
            redirect_url=f"/buyer/deals"
        )
    
    serializer = DemandResponseSerializer(response, context={'request': request})
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_product_offer_delivery(request, pk):
    """
    Update the delivery status of a product offer.
    Only the farmer who owns the product can update its delivery status.
    """
    try:
        offer = ProductOffer.objects.get(pk=pk)
    except ProductOffer.DoesNotExist:
        return Response({"detail": "Product offer not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Ensure only the farmer who owns the product can update delivery status
    product = offer.product
    if request.user.role != 1 or product.farmer.id != request.user.id:
        return Response({"detail": "You can only update delivery status for your own product offers"}, 
                      status=status.HTTP_403_FORBIDDEN)
    
    # Ensure offer is accepted
    if offer.status != 'accepted':
        return Response({"detail": "Only accepted offers can have delivery updates"}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    # Ensure product can be delivered
    if not product.can_deliver:
        return Response({"detail": "Only deliverable products can have delivery updates"}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    # Store the old status for notification check
    old_status = offer.delivery_status
    
    # Update the delivery status
    delivery_status = request.data.get('delivery_status')
    if delivery_status not in ['ready', 'out_for_delivery', 'delivered']:
        return Response({"detail": "Invalid delivery status"}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    offer.delivery_status = delivery_status
    offer.save()
    
    # Create notification if status changed
    if old_status != delivery_status:
        product_name = product.name or dict(Product.CATEGORY_CHOICES).get(product.category, product.category)
        
        # Message based on the status
        status_message = ""
        if delivery_status == 'out_for_delivery':
            status_message = f"Your order for {product_name} is now out for delivery!"
        elif delivery_status == 'delivered':
            status_message = f"Your order for {product_name} has been delivered."
        elif delivery_status == 'ready':
            status_message = f"Your order for {product_name} is ready for delivery."
        
        # Notify the buyer
        create_notification(
            recipient=offer.buyer,
            sender=request.user,
            message=status_message,
            notification_type='delivery_status',
            product_id=product.id,
            offer_id=offer.id,
            redirect_url=f"/buyer/deals"
        )
    
    serializer = ProductOfferSerializer(offer, context={'request': request})
    return Response(serializer.data)

# Get products by farmer ID
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_farmer_products(request, farmer_id):
    """
    Get all products created by a specific farmer
    """
    try:
        # Find the user with the given farmer_id
        farmer_user = User.objects.get(id=farmer_id)
        products = Product.objects.filter(farmer=farmer_user)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Farmer not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Get demands by buyer ID
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_buyer_demands(request, buyer_id):
    """
    Get all demands created by a specific buyer
    """
    try:
        # Find the user with the given buyer_id
        buyer_user = User.objects.get(id=buyer_id)
        demands = Demand.objects.filter(buyer=buyer_user)
        serializer = DemandSerializer(demands, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Buyer not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Utility function to create notifications
def create_notification(recipient, message, notification_type, sender=None, **kwargs):
    """
    Create a notification for a user
    
    Parameters:
    recipient -- User object who will receive the notification
    message -- Text message for the notification
    notification_type -- Type of notification (from Notification.NOTIFICATION_TYPES)
    sender -- User object who triggered the notification (optional)
    kwargs -- Additional fields like demand_id, response_id, etc.
    """
    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        message=message,
        notification_type=notification_type,
        demand_id=kwargs.get('demand_id'),
        response_id=kwargs.get('response_id'),
        product_id=kwargs.get('product_id'),
        offer_id=kwargs.get('offer_id'),
        chat_room_id=kwargs.get('chat_room_id'),
        redirect_url=kwargs.get('redirect_url')
    )
    return notification

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get all notifications for the current user"""
    notifications = Notification.objects.filter(recipient=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_notifications(request):
    """Get unread notifications for the current user"""
    notifications = Notification.objects.filter(recipient=request.user, is_read=False)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    """Mark a notification as read"""
    try:
        notification = Notification.objects.get(pk=pk, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({"detail": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
    
    notification.is_read = True
    notification.save()
    serializer = NotificationSerializer(notification)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({"detail": "All notifications marked as read"}, status=status.HTTP_200_OK)

# Favorite Product views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favorite_products(request):
    """
    GET: List all favorite products for the current user
    POST: Add a product to favorites
    """
    if request.method == 'GET':
        favorites = FavoriteProduct.objects.filter(user=request.user)
        serializer = FavoriteProductSerializer(favorites, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Check if product_id is provided
        product_id = request.data.get('product')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if product exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already favorited
        if FavoriteProduct.objects.filter(user=request.user, product=product).exists():
            return Response({"error": "Product already in favorites"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create favorite
        favorite = FavoriteProduct(user=request.user, product=product)
        favorite.save()
        
        serializer = FavoriteProductSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favorite_product(request, product_id):
    """
    Remove a product from favorites
    """
    try:
        favorite = FavoriteProduct.objects.get(user=request.user, product_id=product_id)
    except FavoriteProduct.DoesNotExist:
        return Response({"error": "Product not in favorites"}, status=status.HTTP_404_NOT_FOUND)
    
    favorite.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# Favorite Demand views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favorite_demands(request):
    """
    GET: List all favorite demands for the current user
    POST: Add a demand to favorites
    """
    if request.method == 'GET':
        favorites = FavoriteDemand.objects.filter(user=request.user)
        serializer = FavoriteDemandSerializer(favorites, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Check if demand_id is provided
        demand_id = request.data.get('demand')
        if not demand_id:
            return Response({"error": "Demand ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if demand exists
        try:
            demand = Demand.objects.get(id=demand_id)
        except Demand.DoesNotExist:
            return Response({"error": "Demand not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already favorited
        if FavoriteDemand.objects.filter(user=request.user, demand=demand).exists():
            return Response({"error": "Demand already in favorites"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create favorite
        favorite = FavoriteDemand(user=request.user, demand=demand)
        favorite.save()
        
        serializer = FavoriteDemandSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favorite_demand(request, demand_id):
    """
    Remove a demand from favorites
    """
    try:
        favorite = FavoriteDemand.objects.get(user=request.user, demand_id=demand_id)
    except FavoriteDemand.DoesNotExist:
        return Response({"error": "Demand not in favorites"}, status=status.HTTP_404_NOT_FOUND)
    
    favorite.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_favorite_product(request, product_id):
    """
    Check if a product is in the user's favorites
    """
    is_favorite = FavoriteProduct.objects.filter(user=request.user, product_id=product_id).exists()
    return Response({"is_favorite": is_favorite})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_favorite_demand(request, demand_id):
    """
    Check if a demand is in the user's favorites
    """
    is_favorite = FavoriteDemand.objects.filter(user=request.user, demand_id=demand_id).exists()
    return Response({"is_favorite": is_favorite})

# Farmer Rating views
@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def farmer_ratings(request):
    """
    POST: Create a new rating for a farmer
    GET: List all ratings (admin only)
    """
    if request.method == 'POST':
        # Extract farmer_id from request data
        farmer_id = request.data.get('farmer_id')
        if not farmer_id:
            return Response({'error': 'farmer_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the farmer user
            farmer = User.objects.get(id=farmer_id, role=1)
        except User.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create serializer with farmer added to data
        data = request.data.copy()
        data['farmer'] = farmer.id
        
        serializer = FarmerRatingSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            rating = serializer.save()
            
            # Update the average rating for the farmer
            update_farmer_average_rating(farmer)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET - List all ratings (admin only)
    if request.user.role != 0:  # 0 is Admin
        return Response({'error': 'Only admins can view all ratings'}, status=status.HTTP_403_FORBIDDEN)
    
    ratings = FarmerRating.objects.all()
    serializer = FarmerRatingSerializer(ratings, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def farmer_ratings_detail(request, farmer_id):
    """
    Get all ratings for a specific farmer
    """
    try:
        farmer = User.objects.get(id=farmer_id, role=1)
    except User.DoesNotExist:
        return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    ratings = FarmerRating.objects.filter(farmer=farmer)
    serializer = FarmerRatingSerializer(ratings, many=True)
    
    # Include average rating in response
    avg_rating = calculate_average_rating(ratings)
    
    response_data = {
        'average_rating': avg_rating,
        'ratings_count': ratings.count(),
        'ratings': serializer.data
    }
    
    return Response(response_data)

# Buyer Rating views
@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def buyer_ratings(request):
    """
    POST: Create a new rating for a buyer
    GET: List all ratings (admin only)
    """
    if request.method == 'POST':
        # Extract buyer_id from request data
        buyer_id = request.data.get('buyer_id')
        if not buyer_id:
            return Response({'error': 'buyer_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the buyer user
            buyer = User.objects.get(id=buyer_id, role=2)
        except User.DoesNotExist:
            return Response({'error': 'Buyer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create serializer with buyer added to data
        data = request.data.copy()
        data['buyer'] = buyer.id
        
        serializer = BuyerRatingSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            rating = serializer.save()
            
            # Update the average rating for the buyer
            update_buyer_average_rating(buyer)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET - List all ratings (admin only)
    if request.user.role != 0:  # 0 is Admin
        return Response({'error': 'Only admins can view all ratings'}, status=status.HTTP_403_FORBIDDEN)
    
    ratings = BuyerRating.objects.all()
    serializer = BuyerRatingSerializer(ratings, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buyer_ratings_detail(request, buyer_id):
    """
    Get all ratings for a specific buyer
    """
    try:
        buyer = User.objects.get(id=buyer_id, role=2)
    except User.DoesNotExist:
        return Response({'error': 'Buyer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    ratings = BuyerRating.objects.filter(buyer=buyer)
    serializer = BuyerRatingSerializer(ratings, many=True)
    
    # Include average rating in response
    avg_rating = calculate_average_rating(ratings)
    
    response_data = {
        'average_rating': avg_rating,
        'ratings_count': ratings.count(),
        'ratings': serializer.data
    }
    
    return Response(response_data)

# Helper functions for ratings
def calculate_average_rating(ratings):
    """Calculate the average rating from a queryset of ratings"""
    if not ratings.exists():
        return 0
    
    total = sum(rating.rating for rating in ratings)
    return round(total / ratings.count(), 1)

def update_farmer_average_rating(farmer):
    """Update the average rating for a farmer in their profile serialization"""
    ratings = FarmerRating.objects.filter(farmer=farmer)
    avg_rating = calculate_average_rating(ratings)
    
    # Store the average rating in a cache or other mechanism
    # For now, we'll calculate it on-the-fly when needed
    
    # You could add a rating field to FarmerProfile if you want to store it permanently
    try:
        profile = FarmerProfile.objects.get(user=farmer)
        # If you add a rating field to FarmerProfile, uncomment this:
        # profile.rating = avg_rating
        # profile.save()
    except FarmerProfile.DoesNotExist:
        pass
    
    return avg_rating

def update_buyer_average_rating(buyer):
    """Update the average rating for a buyer in their profile serialization"""
    ratings = BuyerRating.objects.filter(buyer=buyer)
    avg_rating = calculate_average_rating(ratings)
    
    # Store the average rating in a cache or other mechanism
    # For now, we'll calculate it on-the-fly when needed
    
    # You could add a rating field to BuyerProfile if you want to store it permanently
    try:
        profile = BuyerProfile.objects.get(user=buyer)
        # If you add a rating field to BuyerProfile, uncomment this:
        # profile.rating = avg_rating
        # profile.save()
    except BuyerProfile.DoesNotExist:
        pass
    
    return avg_rating

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_user(request, user_id):
    """
    Temporarily deactivate a user for a specified time period.
    Only admin users can deactivate other users.
    """
    try:
        # Check if the requesting user is an admin
        if request.user.role != 0:  # 0 is Admin role
            return Response(
                {"detail": "Only administrators can deactivate users."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Log the user_id being received
        print(f"Attempting to deactivate user with ID: {user_id}")
        
        # Try to find the user directly
        try:
            user_to_deactivate = User.objects.get(id=user_id)
        except User.DoesNotExist:
            # If not found, check if this is a profile ID and try to find the user through their profile
            print(f"User with ID {user_id} not found directly, checking profiles...")
            
            # Check if this is a farmer profile ID
            try:
                farmer_profile = FarmerProfile.objects.get(id=user_id)
                user_to_deactivate = farmer_profile.user
                print(f"Found user through farmer profile: {user_to_deactivate.id}")
            except FarmerProfile.DoesNotExist:
                # Check if this is a buyer profile ID
                try:
                    buyer_profile = BuyerProfile.objects.get(id=user_id)
                    user_to_deactivate = buyer_profile.user
                    print(f"Found user through buyer profile: {user_to_deactivate.id}")
                except BuyerProfile.DoesNotExist:
                    # If we still can't find the user, raise a 404
                    return Response(
                        {"detail": f"No user found with ID {user_id}"},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        # Get the deactivation period in days from the request
        deactivation_days = request.data.get('deactivation_days', 7)  # Default to 7 days if not specified
        
        try:
            deactivation_days = int(deactivation_days)
            if deactivation_days <= 0:
                return Response(
                    {"detail": "Deactivation period must be a positive number."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid deactivation period. Please provide a valid number of days."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate the reactivation date
        reactivation_date = timezone.now() + timezone.timedelta(days=deactivation_days)
        
        # Set the user as inactive and store the reactivation date
        user_to_deactivate.is_active = False
        user_to_deactivate.reactivation_date = reactivation_date
        user_to_deactivate.save()
        
        # Create a notification for the user
        Notification.objects.create(
            recipient=user_to_deactivate,
            message=f"Your account has been temporarily deactivated by an administrator for {deactivation_days} days. Your account will be reactivated on {reactivation_date.strftime('%Y-%m-%d')}.",
            notification_type='system',
            is_read=False
        )
        
        # Send email notification to the user
        deactivation_email_subject = "Your Farmily Account Has Been Temporarily Deactivated"
        deactivation_email_message = f"""
        Dear {user_to_deactivate.first_name} {user_to_deactivate.last_name},
        
        Your Farmily account has been temporarily deactivated by an administrator for {deactivation_days} days.
        
        Your account will be automatically reactivated on {reactivation_date.strftime('%Y-%m-%d')}.
        
        If you have any questions or concerns, please contact our support team.
        
        Regards,
        The Farmily Team
        """
        
        try:
            # Check if DEFAULT_FROM_EMAIL is properly configured
            from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@farmily.com'
            
            send_mail(
                deactivation_email_subject,
                deactivation_email_message,
                from_email,
                [user_to_deactivate.email],
                fail_silently=True,
            )
        except Exception as email_error:
            # Log the error but continue with the deactivation process
            print(f"Failed to send deactivation email: {str(email_error)}")
        
        return Response({
            "detail": f"User {user_to_deactivate.email} has been deactivated until {reactivation_date.strftime('%Y-%m-%d')}."
        })
        
    except Exception as e:
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reactivate_user(request, user_id):
    """
    Manually reactivate a deactivated user.
    Only admin users can reactivate other users.
    """
    try:
        # Check if the requesting user is an admin
        if request.user.role != 0:  # 0 is Admin role
            return Response(
                {"detail": "Only administrators can reactivate users."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Log the user_id being received
        print(f"Attempting to reactivate user with ID: {user_id}")
        
        # Try to find the user directly
        try:
            user_to_reactivate = User.objects.get(id=user_id)
        except User.DoesNotExist:
            # If not found, check if this is a profile ID and try to find the user through their profile
            print(f"User with ID {user_id} not found directly, checking profiles...")
            
            # Check if this is a farmer profile ID
            try:
                farmer_profile = FarmerProfile.objects.get(id=user_id)
                user_to_reactivate = farmer_profile.user
                print(f"Found user through farmer profile: {user_to_reactivate.id}")
            except FarmerProfile.DoesNotExist:
                # Check if this is a buyer profile ID
                try:
                    buyer_profile = BuyerProfile.objects.get(id=user_id)
                    user_to_reactivate = buyer_profile.user
                    print(f"Found user through buyer profile: {user_to_reactivate.id}")
                except BuyerProfile.DoesNotExist:
                    # If we still can't find the user, raise a 404
                    return Response(
                        {"detail": f"No user found with ID {user_id}"},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        # Check if the user is already active
        if user_to_reactivate.is_active:
            return Response(
                {"detail": "This user is already active."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reactivate the user
        user_to_reactivate.is_active = True
        user_to_reactivate.reactivation_date = None
        user_to_reactivate.save()
        
        # Create a notification for the user
        Notification.objects.create(
            recipient=user_to_reactivate,
            message="Your account has been reactivated by an administrator.",
            notification_type='system',
            is_read=False
        )
        
        # Send email notification to the user
        reactivation_email_subject = "Your Farmily Account Has Been Reactivated"
        reactivation_email_message = f"""
        Dear {user_to_reactivate.first_name} {user_to_reactivate.last_name},
        
        Your Farmily account has been reactivated by an administrator.
        
        You can now log in to your account and resume your activities.
        
        If you have any questions or concerns, please contact our support team.
        
        Regards,
        The Farmily Team
        """
        
        try:
            # Check if DEFAULT_FROM_EMAIL is properly configured
            from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@farmily.com'
            
            send_mail(
                reactivation_email_subject,
                reactivation_email_message,
                from_email,
                [user_to_reactivate.email],
                fail_silently=True,
            )
        except Exception as email_error:
            # Log the error but continue with the reactivation process
            print(f"Failed to send reactivation email: {str(email_error)}")
        
        return Response({
            "detail": f"User {user_to_reactivate.email} has been reactivated successfully."
        })
        
    except Exception as e:
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_inactive_users(request):
    """
    Get a list of all inactive users.
    Only admin users can view inactive users.
    """
    try:
        # Check if the requesting user is an admin
        if request.user.role != 0:  # 0 is Admin role
            return Response(
                {"detail": "Only administrators can view inactive users."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all inactive users
        inactive_users = User.objects.filter(is_active=False)
        
        # Serialize the user data
        user_data = []
        for user in inactive_users:
            user_data.append({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.get_role_display(),
                'reactivation_date': user.reactivation_date.strftime('%Y-%m-%d %H:%M:%S') if user.reactivation_date else None
            })
        
        return Response(user_data)
        
    except Exception as e:
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Report views
@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def reports(request):
    """
    POST: Create a new report
    GET: List all reports (admin only)
    """
    if request.method == 'POST':
        # Create a new report
        data = request.data.copy()
        data['reporter'] = request.user.id
        
        serializer = ReportSerializer(data=data)
        if serializer.is_valid():
            report = serializer.save()
            
            # Create notification for admin
            admin_users = User.objects.filter(role=0)
            for admin in admin_users:
                create_notification(
                    recipient=admin,
                    sender=request.user,
                    message=f"New report submitted by {request.user.first_name} {request.user.last_name}",
                    notification_type="system"
                )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'GET':
        # Only admins can view all reports
        if request.user.role != 0:
            return Response({"detail": "You do not have permission to view all reports."}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        reports = Report.objects.all()
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def report_detail(request, pk):
    """
    Get, update or delete a report
    """
    try:
        report = Report.objects.get(pk=pk)
    except Report.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Only admin or the reporter can view the report
    if request.user.role != 0 and request.user.id != report.reporter.id:
        return Response({"detail": "You do not have permission to access this report."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = ReportSerializer(report)
        return Response(serializer.data)
    
    # Only admins can update or delete reports
    if request.user.role != 0:
        return Response({"detail": "You do not have permission to modify this report."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        serializer = ReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            updated_report = serializer.save()
            
            # If admin is sending a warning
            if 'warning_message' in request.data and request.data['warning_message']:
                updated_report.warning_sent = True
                updated_report.warning_read = False
                updated_report.save()
                
                # Create notification for the reported user
                create_notification(
                    recipient=report.reported_user,
                    sender=request.user,
                    message="You have received a warning from admin",
                    notification_type="system"
                )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reports(request):
    """
    Get all reports made by the current user
    """
    reports = Report.objects.filter(reporter=request.user)
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_warning_read(request, pk):
    """
    Mark a warning as read by the reported user
    """
    try:
        report = Report.objects.get(pk=pk)
    except Report.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Only the reported user can mark warnings as read
    if request.user.id != report.reported_user.id:
        return Response({"detail": "You do not have permission to mark this warning as read."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    if not report.warning_sent:
        return Response({"detail": "No warning has been sent for this report."}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    report.warning_read = True
    report.save()
    
    return Response({"detail": "Warning marked as read."})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_warnings(request):
    """
    Get all warnings received by the current user
    """
    warnings = Report.objects.filter(reported_user=request.user, warning_sent=True)
    serializer = ReportSerializer(warnings, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reports(request):
    """
    GET: List all reports (admin only)
    This is a dedicated endpoint for admin dashboard
    """
    # Only admins can view all reports
    if request.user.role != 0:
        return Response({"detail": "You do not have permission to view all reports."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    reports = Report.objects.all()
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)

# Break deal functionality for product offers
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_break_product_offer(request, pk):
    """
    Request to break a product offer deal.
    Only the farmer who owns the product or the buyer who made the offer can request to break the deal.
    """
    try:
        product_offer = ProductOffer.objects.get(pk=pk)
        
        # Check if the deal is in a state that can be broken (accepted or completed)
        if product_offer.status not in ['accepted', 'completed']:
            return Response(
                {"detail": "Only accepted or completed deals can be broken."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the user is either the farmer or the buyer
        user = request.user
        is_farmer = user.id == product_offer.product.farmer.id
        is_buyer = user.id == product_offer.buyer.id
        
        if not (is_farmer or is_buyer):
            return Response(
                {"detail": "You don't have permission to break this deal."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Set break request fields
        product_offer.break_requested = True
        product_offer.break_requested_by = 'farmer' if is_farmer else 'buyer'
        product_offer.save()
        
        # Create notification for the other party
        recipient = product_offer.buyer if is_farmer else product_offer.product.farmer
        sender = user
        message = f"{'Farmer' if is_farmer else 'Buyer'} has requested to break the deal for {product_offer.product.name}"
        
        create_notification(
            recipient=recipient,
            message=message,
            notification_type='break_request',
            sender=sender,
            product_id=product_offer.product.id,
            offer_id=product_offer.id,
            redirect_url=f"/deals"
        )
        
        return Response(
            {"detail": "Break request sent successfully."},
            status=status.HTTP_200_OK
        )
    
    except ProductOffer.DoesNotExist:
        return Response(
            {"detail": "Product offer not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_break_product_offer(request, pk):
    """
    Accept a request to break a product offer deal.
    Only the party who did not initiate the break request can accept it.
    """
    try:
        product_offer = ProductOffer.objects.get(pk=pk)
        
        # Check if there is a break request
        if not product_offer.break_requested:
            return Response(
                {"detail": "No break request found for this deal."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the user is the correct party to accept the break
        user = request.user
        is_farmer = user.id == product_offer.product.farmer.id
        is_buyer = user.id == product_offer.buyer.id
        
        if not (is_farmer or is_buyer):
            return Response(
                {"detail": "You don't have permission to accept this break request."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the user is the party who should accept the break
        if (is_farmer and product_offer.break_requested_by == 'farmer') or \
           (is_buyer and product_offer.break_requested_by == 'buyer'):
            return Response(
                {"detail": "You cannot accept your own break request."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the deal status to canceled
        product_offer.status = 'canceled'
        product_offer.save()
        
        # Create notification for the other party
        recipient = product_offer.buyer if is_farmer else product_offer.product.farmer
        sender = user
        message = f"Your request to break the deal for {product_offer.product.name} has been accepted."
        
        create_notification(
            recipient=recipient,
            message=message,
            notification_type='deal_canceled',
            sender=sender,
            product_id=product_offer.product.id,
            offer_id=product_offer.id,
            redirect_url=f"/deals"
        )
        
        return Response(
            {"detail": "Deal has been canceled successfully."},
            status=status.HTTP_200_OK
        )
    
    except ProductOffer.DoesNotExist:
        return Response(
            {"detail": "Product offer not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Break deal functionality for demand responses
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_break_demand_response(request, pk):
    """
    Request to break a demand response deal.
    Only the farmer who made the response or the buyer who owns the demand can request to break the deal.
    """
    try:
        demand_response = DemandResponse.objects.get(pk=pk)
        
        # Check if the deal is in a state that can be broken (accepted or completed)
        if demand_response.status not in ['accepted', 'completed']:
            return Response(
                {"detail": "Only accepted or completed deals can be broken."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the user is either the farmer or the buyer
        user = request.user
        is_farmer = user.id == demand_response.farmer.id
        is_buyer = user.id == demand_response.demand.buyer.id
        
        if not (is_farmer or is_buyer):
            return Response(
                {"detail": "You don't have permission to break this deal."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Set break request fields
        demand_response.break_requested = True
        demand_response.break_requested_by = 'farmer' if is_farmer else 'buyer'
        demand_response.save()
        
        # Create notification for the other party
        recipient = demand_response.demand.buyer if is_farmer else demand_response.farmer
        sender = user
        message = f"{'Farmer' if is_farmer else 'Buyer'} has requested to break the deal for {demand_response.demand.category}"
        
        create_notification(
            recipient=recipient,
            message=message,
            notification_type='break_request',
            sender=sender,
            demand_id=demand_response.demand.id,
            response_id=demand_response.id,
            redirect_url=f"/deals"
        )
        
        return Response(
            {"detail": "Break request sent successfully."},
            status=status.HTTP_200_OK
        )
    
    except DemandResponse.DoesNotExist:
        return Response(
            {"detail": "Demand response not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_break_demand_response(request, pk):
    """
    Accept a request to break a demand response deal.
    Only the party who did not initiate the break request can accept it.
    """
    try:
        demand_response = DemandResponse.objects.get(pk=pk)
        
        # Check if there is a break request
        if not demand_response.break_requested:
            return Response(
                {"detail": "No break request found for this deal."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the user is the correct party to accept the break
        user = request.user
        is_farmer = user.id == demand_response.farmer.id
        is_buyer = user.id == demand_response.demand.buyer.id
        
        if not (is_farmer or is_buyer):
            return Response(
                {"detail": "You don't have permission to accept this break request."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the user is the party who should accept the break
        if (is_farmer and demand_response.break_requested_by == 'farmer') or \
           (is_buyer and demand_response.break_requested_by == 'buyer'):
            return Response(
                {"detail": "You cannot accept your own break request."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the deal status to canceled
        demand_response.status = 'canceled'
        demand_response.save()
        
        # Create notification for the other party
        recipient = demand_response.demand.buyer if is_farmer else demand_response.farmer
        sender = user
        message = f"Your request to break the deal for {demand_response.demand.category} has been accepted."
        
        create_notification(
            recipient=recipient,
            message=message,
            notification_type='deal_canceled',
            sender=sender,
            demand_id=demand_response.demand.id,
            response_id=demand_response.id,
            redirect_url=f"/deals"
        )
        
        return Response(
            {"detail": "Deal has been canceled successfully."},
            status=status.HTTP_200_OK
        )
    
    except DemandResponse.DoesNotExist:
        return Response(
            {"detail": "Demand response not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )