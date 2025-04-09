from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from .models import User, Demand, DemandResponse, Product, ProductOffer, FarmerProfile, BuyerProfile, Notification, FarmerRating, BuyerRating, FavoriteProduct, FavoriteDemand, Report

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        print("Validation data:", attrs)
        
        return attrs


    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.get('role', 1)
        user = User.objects.create(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=role,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class FarmerProfileSerializer(serializers.ModelSerializer):
    # Add these fields to include user data
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    rating = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmerProfile
        fields = '__all__'  # This already includes all fields from FarmerProfile
    
    def get_rating(self, obj):
        from .models import FarmerRating
        from django.db.models import Avg
        
        # Get the average rating for this farmer
        ratings = FarmerRating.objects.filter(farmer=obj.user)
        if ratings.exists():
            # Calculate the average rating
            avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
            return round(float(avg_rating), 1)
        return 0.0  # Default rating if no ratings exist

class BuyerProfileSerializer(serializers.ModelSerializer):
    # Add these fields to include user data
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    rating = serializers.SerializerMethodField()
    
    class Meta:
        model = BuyerProfile
        fields = '__all__'  # This already includes all fields from BuyerProfile
    
    def get_rating(self, obj):
        from .models import BuyerRating
        from django.db.models import Avg
        
        # Get the average rating for this buyer
        ratings = BuyerRating.objects.filter(buyer=obj.user)
        if ratings.exists():
            # Calculate the average rating
            avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
            return round(float(avg_rating), 1)
        return 0.0  # Default rating if no ratings exist

class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    farmer = serializers.PrimaryKeyRelatedField(read_only=True)  # Make farmer field read-only
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'price', 'unit', 'quantity', 'farmer', 'farmer_name', 'created_at', 'updated_at', 'is_active', 'can_deliver']
    
    def get_farmer_name(self, obj):
        return f"{obj.farmer.first_name} {obj.farmer.last_name}"

class ProductOfferSerializer(serializers.ModelSerializer):
    buyer_name = serializers.SerializerMethodField()
    product_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductOffer
        fields = ['id', 'product', 'buyer', 'buyer_name', 'offered_price', 
                 'quantity', 'notes', 'status', 'created_at', 
                 'updated_at', 'product_details', 'farmer_message', 'delivery_status',
                 'break_requested', 'break_requested_by', 'is_paid', 'payment_id', 'payment_date',
                 'complete_requested', 'complete_requested_by']
    
    def __init__(self, *args, **kwargs):
        super(ProductOfferSerializer, self).__init__(*args, **kwargs)
        
        # Get request from context
        request = self.context.get('request')
        
        # If the user is a buyer, make status read-only
        if request and request.user.is_authenticated:
            if request.user.role == 2:  # 2 is Buyer
                self.fields['status'].read_only = True
            # For farmers (role 1) and admins (role 0), status is writable
    
    def get_buyer_name(self, obj):
        return f"{obj.buyer.first_name} {obj.buyer.last_name}"
    
    def get_product_details(self, obj):
        product = obj.product
        return {
            'id': product.id,
            'name': product.name,
            'category': product.category,
            'price': product.price,
            'unit': product.unit,
            'quantity': product.quantity,
            'farmer_id': product.farmer.id,
            'farmer_name': f"{product.farmer.first_name} {product.farmer.last_name}"
        }
    
    def create(self, validated_data):
        # Get the requesting user
        user = self.context['request'].user
        
        # Ensure the user is a buyer
        if user.role != 2:  # 2 is the role code for Buyer
            raise serializers.ValidationError({"detail": "Only buyers can make offers on products"})
        
        # Set the buyer field to the current user
        validated_data['buyer'] = user
        
        # Check if this buyer has already made an offer on this product
        product = validated_data.get('product')
        existing_offer = ProductOffer.objects.filter(product=product, buyer=user).first()
        
        if existing_offer:
            # Update the existing offer instead of creating a new one
            for key, value in validated_data.items():
                setattr(existing_offer, key, value)
            existing_offer.save()
            return existing_offer
        
        # Create a new offer
        return super().create(validated_data)

class DemandSerializer(serializers.ModelSerializer):
    buyer_name = serializers.SerializerMethodField()
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Demand
        fields = ['id', 'category', 'price_per_unit', 'quantity', 'unit', 'valid_until', 'is_active', 'status', 'buyer', 'buyer_name', 'created_at', 'updated_at']
    
    def get_buyer_name(self, obj):
        return f"{obj.buyer.first_name} {obj.buyer.last_name}"
        
    def validate(self, data):
        print(f"Validating demand data: {data}")
        return data

class DemandResponseSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    demand_details = serializers.SerializerMethodField()
    
    class Meta:
        model = DemandResponse
        fields = ['id', 'demand', 'farmer', 'farmer_name', 'offered_price', 
                 'offered_quantity', 'notes', 'status', 'created_at', 
                 'updated_at', 'demand_details', 'buyer_message', 'can_deliver', 'delivery_status',
                 'break_requested', 'break_requested_by', 'is_paid', 'payment_id', 'payment_date',
                 'complete_requested', 'complete_requested_by']
    
    def __init__(self, *args, **kwargs):
        super(DemandResponseSerializer, self).__init__(*args, **kwargs)
        
        # Get request from context
        request = self.context.get('request')
        
        # If the user is a farmer, make status read-only
        if request and request.user.is_authenticated:
            if request.user.role == 1:  # 1 is Farmer
                self.fields['status'].read_only = True
            # For buyers (role 2) and admins (role 0), status is writable
    
    def get_farmer_name(self, obj):
        return f"{obj.farmer.first_name} {obj.farmer.last_name}"
    
    def get_demand_details(self, obj):
        demand = obj.demand
        return {
            'id': demand.id,
            'category': demand.category,
            'price_per_unit': demand.price_per_unit,
            'quantity': demand.quantity,
            'unit': demand.unit,
            'valid_until': demand.valid_until,
            'buyer_id': demand.buyer.id,
            'buyer_name': f"{demand.buyer.first_name} {demand.buyer.last_name}"
        }
    
    def create(self, validated_data):
        # Get the requesting user
        user = self.context['request'].user
        
        # Ensure the user is a farmer
        if user.role != 1:  # 1 is the role code for Farmer
            raise serializers.ValidationError({"detail": "Only farmers can respond to demands"})
        
        # Set the farmer field to the current user
        validated_data['farmer'] = user
        
        # Check if this farmer has already responded to this demand
        demand = validated_data.get('demand')
        existing_response = DemandResponse.objects.filter(demand=demand, farmer=user).first()
        
        if existing_response:
            # Update the existing response instead of creating a new one
            for key, value in validated_data.items():
                setattr(existing_response, key, value)
            existing_response.save()
            return existing_response
        
        # Create a new response
        return super().create(validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'sender', 'sender_name', 'message', 
            'notification_type', 'is_read', 'demand_id', 'response_id', 
            'product_id', 'offer_id', 'redirect_url', 'created_at', 
            'created_at_formatted', 'updated_at', 'chat_room_id'
        ]
        read_only_fields = ['id', 'recipient', 'sender', 'created_at', 'updated_at']
    
    def get_sender_name(self, obj):
        if obj.sender:
            return f"{obj.sender.first_name} {obj.sender.last_name}"
        return None
    
    def get_created_at_formatted(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days == 0:
            if diff.seconds < 3600:
                minutes = diff.seconds // 60
                return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
            return f"{diff.seconds // 3600} hour{'s' if diff.seconds // 3600 != 1 else ''} ago"
        
        if diff.days < 7:
            return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
        
        return timesince(obj.created_at)

class FarmerRatingSerializer(serializers.ModelSerializer):
    rated_by_name = serializers.SerializerMethodField()
    farmer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmerRating
        fields = ['id', 'farmer', 'rated_by', 'rated_by_name', 'farmer_name', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['rated_by', 'created_at', 'updated_at']
    
    def get_rated_by_name(self, obj):
        return f"{obj.rated_by.first_name} {obj.rated_by.last_name}"
    
    def get_farmer_name(self, obj):
        return f"{obj.farmer.first_name} {obj.farmer.last_name}"
    
    def create(self, validated_data):
        # Get the requesting user
        user = self.context['request'].user
        
        # Ensure the user is a buyer
        if user.role != 2:  # 2 is the role code for Buyer
            raise serializers.ValidationError({"detail": "Only buyers can rate farmers"})
        
        # Set the rated_by field to the current user
        validated_data['rated_by'] = user
        
        # Check if this buyer has already rated this farmer
        farmer = validated_data.get('farmer')
        existing_rating = FarmerRating.objects.filter(farmer=farmer, rated_by=user).first()
        
        if existing_rating:
            # Update the existing rating instead of creating a new one
            for key, value in validated_data.items():
                setattr(existing_rating, key, value)
            existing_rating.save()
            return existing_rating
        
        # Create a new rating
        return super().create(validated_data)

class BuyerRatingSerializer(serializers.ModelSerializer):
    rated_by_name = serializers.SerializerMethodField()
    buyer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BuyerRating
        fields = ['id', 'buyer', 'rated_by', 'rated_by_name', 'buyer_name', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['rated_by', 'created_at', 'updated_at']
    
    def get_rated_by_name(self, obj):
        return f"{obj.rated_by.first_name} {obj.rated_by.last_name}"
    
    def get_buyer_name(self, obj):
        return f"{obj.buyer.first_name} {obj.buyer.last_name}"
    
    def create(self, validated_data):
        # Get the requesting user
        user = self.context['request'].user
        
        # Ensure the user is a farmer
        if user.role != 1:  # 1 is the role code for Farmer
            raise serializers.ValidationError({"detail": "Only farmers can rate buyers"})
        
        # Set the rated_by field to the current user
        validated_data['rated_by'] = user
        
        # Check if this farmer has already rated this buyer
        buyer = validated_data.get('buyer')
        existing_rating = BuyerRating.objects.filter(buyer=buyer, rated_by=user).first()
        
        if existing_rating:
            # Update the existing rating instead of creating a new one
            for key, value in validated_data.items():
                setattr(existing_rating, key, value)
            existing_rating.save()
            return existing_rating
        
        # Create a new rating
        return super().create(validated_data)

class ReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    reported_user_name = serializers.SerializerMethodField()
    reporter_role = serializers.SerializerMethodField()
    reported_user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reported_user', 'reporter_name', 'reported_user_name', 
                 'reporter_role', 'reported_user_role', 'reason', 'status', 'admin_notes', 
                 'warning_sent', 'warning_message', 'warning_read', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'admin_notes', 'warning_sent', 
                           'warning_message', 'warning_read']
    
    def get_reporter_name(self, obj):
        return f"{obj.reporter.first_name} {obj.reporter.last_name}"
    
    def get_reported_user_name(self, obj):
        return f"{obj.reported_user.first_name} {obj.reported_user.last_name}"
    
    def get_reporter_role(self, obj):
        return obj.reporter.get_role_display()
    
    def get_reported_user_role(self, obj):
        return obj.reported_user.get_role_display()

# Favorite serializers
class FavoriteProductSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = FavoriteProduct
        fields = ['id', 'user', 'product', 'created_at', 'product_details']
        read_only_fields = ['created_at']
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Remove the product ID field to avoid duplication
        if 'product_details' in representation:
            representation.pop('product', None)
        return representation


class FavoriteDemandSerializer(serializers.ModelSerializer):
    demand_details = DemandSerializer(source='demand', read_only=True)
    
    class Meta:
        model = FavoriteDemand
        fields = ['id', 'user', 'demand', 'created_at', 'demand_details']
        read_only_fields = ['created_at']
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Remove the demand ID field to avoid duplication
        if 'demand_details' in representation:
            representation.pop('demand', None)
        return representation
