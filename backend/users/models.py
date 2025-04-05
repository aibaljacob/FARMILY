from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.crypto import get_random_string
from django.conf import settings
from django.utils import timezone


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
    reactivation_date = models.DateTimeField(blank=True, null=True, help_text="Date when a deactivated user should be reactivated")

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
    
class BuyerProfile(models.Model):
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
    
class Product(models.Model):
    CATEGORY_CHOICES = [
        ('rubber', 'Rubber'),
        ('coconut', 'Coconut'),
        ('jackfruit', 'Jackfruit'),
        ('banana', 'Banana'),
        ('pepper', 'Black Pepper'),
        ('cardamom', 'Cardamom'),
        ('tea', 'Tea'),
        ('coffee', 'Coffee'),
        ('arecanut', 'Arecanut'),
        ('cashew', 'Cashew'),
        ('ginger', 'Ginger'),
        ('turmeric', 'Turmeric'),
        ('nutmeg', 'Nutmeg'),
        ('clove', 'Clove'),
        ('tapioca', 'Tapioca'),
        ('mango', 'Mango'),
        ('pineapple', 'Pineapple'),
        ('others', 'Others'),  # For products not listed above
    ]
    
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('count', 'Count/Pieces'),
        ('dozen', 'Dozen'),
        ('lb', 'Pound'),
        ('quintal', 'Quintal'),
        ('ton', 'Ton'),
        ('bundle', 'Bundle'),
    ]

    name = models.CharField(max_length=255, blank=True, null=True)  # Make name field optional
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='kg')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.0, help_text="Amount/quantity of product (e.g. 5 kg, 10 pieces)")
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 1})  # Role 1 is Farmer
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    can_deliver = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # If name is not provided, use category display name
        if not self.name:
            for code, display_name in self.CATEGORY_CHOICES:
                if code == self.category:
                    self.name = display_name
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        category_display = dict(self.CATEGORY_CHOICES).get(self.category, self.category)
        return f"{category_display} - {self.quantity} {self.get_unit_display()} - ₹{self.price}"

class ProductOffer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('negotiating', 'Negotiating'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='offers')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 2})  # Role 2 is Buyer
    offered_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Buyer's offered price per unit")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Quantity the buyer wants to purchase")
    notes = models.TextField(blank=True, null=True, help_text="Additional details or terms from the buyer")
    farmer_message = models.TextField(blank=True, null=True, help_text="Message from farmer when accepting the offer")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    delivery_status = models.CharField(max_length=20, default='ready', blank=True, null=True, help_text="Current delivery status if delivery is available")
    break_requested = models.BooleanField(default=False, help_text="Whether a break has been requested for this deal")
    break_requested_by = models.CharField(max_length=10, blank=True, null=True, help_text="Who requested to break the deal (farmer/buyer)")
    
    class Meta:
        unique_together = ['product', 'buyer']  # A buyer can only have one active offer per product
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.buyer.first_name} {self.buyer.last_name} offer for {self.product} - {self.get_status_display()}"

class Demand(models.Model):
    CATEGORY_CHOICES = [
        ('rubber', 'Rubber'),
        ('coconut', 'Coconut'),
        ('jackfruit', 'Jackfruit'),
        ('banana', 'Banana'),
        ('pepper', 'Black Pepper'),
        ('cardamom', 'Cardamom'),
        ('tea', 'Tea'),
        ('coffee', 'Coffee'),
        ('arecanut', 'Arecanut'),
        ('cashew', 'Cashew'),
        ('ginger', 'Ginger'),
        ('turmeric', 'Turmeric'),
        ('nutmeg', 'Nutmeg'),
        ('clove', 'Clove'),
        ('tapioca', 'Tapioca'),
        ('mango', 'Mango'),
        ('pineapple', 'Pineapple'),
        ('others', 'Others'),
    ]
    
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('count', 'Count/Pieces'),
        ('dozen', 'Dozen'),
        ('lb', 'Pound'),
        ('quintal', 'Quintal'),
        ('ton', 'Ton'),
        ('bundle', 'Bundle'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('fulfilled', 'Fulfilled'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 2}, related_name='demands')  # Role 2 is Buyer
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        category_display = dict(self.CATEGORY_CHOICES).get(self.category, self.category)
        return f"{category_display} - {self.quantity} {self.get_unit_display()} - ₹{self.price_per_unit}"

class DemandResponse(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('negotiating', 'Negotiating'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]
    
    demand = models.ForeignKey(Demand, on_delete=models.CASCADE, related_name='responses')
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 1})  # Role 1 is Farmer
    offered_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Farmer's offered price per unit")
    offered_quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Quantity the farmer can provide")
    notes = models.TextField(blank=True, null=True, help_text="Additional details or terms from the farmer")
    buyer_message = models.TextField(blank=True, null=True, help_text="Message from buyer when accepting the response")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    can_deliver = models.BooleanField(default=False, help_text="Whether the farmer can deliver this product to the buyer")
    delivery_status = models.CharField(max_length=20, default='ready', blank=True, null=True, help_text="Current delivery status if delivery is available")
    break_requested = models.BooleanField(default=False, help_text="Whether a break has been requested for this deal")
    break_requested_by = models.CharField(max_length=10, blank=True, null=True, help_text="Who requested to break the deal (farmer/buyer)")
    
    class Meta:
        unique_together = ['demand', 'farmer']  # A farmer can only have one active response per demand
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.farmer.first_name} {self.farmer.last_name} response to {self.demand.category} demand - {self.get_status_display()}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('demand_response', 'Demand Response'),
        ('response_accepted', 'Response Accepted'),
        ('response_rejected', 'Response Rejected'),
        ('product_offer', 'Product Offer'),
        ('offer_accepted', 'Offer Accepted'),
        ('offer_rejected', 'Offer Rejected'),
        ('delivery_status', 'Delivery Status Update'),
        ('message', 'Message'),
        ('system', 'System Notification'),
        ('break_request', 'Break Deal Request'),
        ('deal_canceled', 'Deal Canceled'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='sent_notifications')
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    demand_id = models.IntegerField(null=True, blank=True)
    response_id = models.IntegerField(null=True, blank=True)
    product_id = models.IntegerField(null=True, blank=True)
    offer_id = models.IntegerField(null=True, blank=True)
    chat_room_id = models.IntegerField(null=True, blank=True)
    redirect_url = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} for {self.recipient.first_name} {self.recipient.last_name}"

class FarmerRating(models.Model):
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farmer_ratings', limit_choices_to={'role': 1})
    rated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rated_farmers', limit_choices_to={'role': 2})
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('farmer', 'rated_by')
        
    def __str__(self):
        return f"Rating for {self.farmer.first_name} by {self.rated_by.first_name}"

class BuyerRating(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_ratings', limit_choices_to={'role': 2})
    rated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rated_buyers', limit_choices_to={'role': 1})
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('buyer', 'rated_by')
        
    def __str__(self):
        return f"Rating for {self.buyer.first_name} by {self.rated_by.first_name}"

# Favorite models
class FavoriteProduct(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"


class FavoriteDemand(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_demands')
    demand = models.ForeignKey(Demand, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'demand')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.demand.category}"

class Report(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    warning_sent = models.BooleanField(default=False)
    warning_message = models.TextField(blank=True, null=True)
    warning_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report by {self.reporter} against {self.reported_user} - {self.get_status_display()}"