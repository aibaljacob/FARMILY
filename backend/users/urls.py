from django.urls import path, include
from .views import RegisterUserView
from .views import CustomTokenObtainPairView
from .views import UserDashboardView
from .views import UserLoginView
from .views import PasswordResetRequestAPIView, PasswordResetConfirmAPIView
from .views import verify_email
from .views import ResendVerificationEmailView,FarmerProfileCreateView
from .views import product_list_create
from . import views
from .views import BuyerProfileCreateView
from django.conf.urls.static import static
from django.conf import settings
from .views import product_detail
from rest_framework_simplejwt.views import TokenRefreshView
from .google_auth import google_login, complete_google_signup

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
    path('api/users/login/', UserLoginView.as_view(), name='login'),
    path('api/password-reset/', PasswordResetRequestAPIView.as_view(), name='password_reset_request'),
    path('api/reset/<int:user_id>/<str:token>/', PasswordResetConfirmAPIView.as_view(), name='password_reset_confirm'),
    path("api/verify-email/<str:token>/", verify_email, name="verify-email"),
    path("api/resend-verification-email/", ResendVerificationEmailView.as_view(), name="resend-verification"),
    path('api/farmer-profile/', FarmerProfileCreateView.as_view(), name='farmer-profile-create'),
    path('api/buyer-profile/', BuyerProfileCreateView.as_view(), name='buyer-profile'),
    path('api/all-buyer-profiles/', views.all_buyer_profiles, name='all-buyer-profiles'),
    path('api/all-farmer-profiles/', views.all_farmer_profiles, name='all-farmer-profiles'),
    path('api/approve-user/<int:user_id>/', views.approve_user, name='approve-user'),
    path('api/deactivate-user/<int:user_id>/', views.deactivate_user, name='deactivate-user'),
    path('api/reactivate-user/<int:user_id>/', views.reactivate_user, name='reactivate-user'),
    path('api/inactive-users/', views.get_inactive_users, name='inactive-users'),
    path('api/send-otp/', views.send_otp, name='send_otp'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/products/', product_list_create, name='product-list-create'),
    path('api/products/my-products/', views.my_products, name='my-products'),
    path('api/products/<int:pk>/',  product_detail, name='product-detail'),
    path('api/products/<int:product_id>/offers/', views.product_offers, name='product-offers'),
    path('api/products/<int:product_id>/', views.get_product_by_id, name='get-product-by-id'),
    path('api/demands/', views.demand_list_create, name='demand-list-create'),
    path('api/demands/<int:pk>/', views.demand_detail, name='demand-detail'),
    path('api/demand-responses/', views.demand_response_list_create, name='demand-response-list-create'),
    path('api/demand-responses/<int:pk>/', views.demand_response_detail, name='demand-response-detail'),
    path('api/my-demand-responses/', views.my_demand_responses, name='my-demand-responses'),
    path('api/demands/<int:demand_id>/responses/', views.demand_responses, name='demand-responses'),
    
    # New endpoints for products by farmer and demands by buyer
    path('api/farmers/<int:farmer_id>/products/', views.get_farmer_products, name='farmer-products'),
    path('api/buyers/<int:buyer_id>/demands/', views.get_buyer_demands, name='buyer-demands'),
    
    # Product offers endpoints
    path('api/product-offers/', views.product_offer_list_create, name='product-offer-list-create'),
    path('api/product-offers/<int:pk>/', views.product_offer_detail, name='product-offer-detail'),
    path('api/my-product-offers/', views.my_product_offers, name='my-product-offers'),
    path('api/all-deals/', views.get_all_deals, name='all-deals'),
    
    # Delivery status update endpoints
    path('api/demand-responses/<int:pk>/update-delivery/', views.update_demand_response_delivery, name='update-demand-response-delivery'),
    path('api/product-offers/<int:pk>/update-delivery/', views.update_product_offer_delivery, name='update-product-offer-delivery'),
    
    # Notification endpoints
    path('api/notifications/', views.get_notifications, name='get-notifications'),
    path('api/notifications/unread/', views.get_unread_notifications, name='get-unread-notifications'),
    path('api/notifications/<int:pk>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('api/notifications/mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    
    # Rating endpoints
    path('api/farmers/<int:farmer_id>/ratings/', views.farmer_ratings, name='farmer_ratings'),
    path('api/buyers/<int:buyer_id>/ratings/', views.buyer_ratings, name='buyer_ratings'),
    
    # Favorites
    path('api/favorites/products/', views.favorite_products, name='favorite_products'),
    path('api/favorites/products/<int:product_id>/remove/', views.remove_favorite_product, name='remove_favorite_product'),
    path('api/favorites/products/<int:product_id>/check/', views.check_favorite_product, name='check_favorite_product'),
    path('api/favorites/demands/', views.favorite_demands, name='favorite_demands'),
    path('api/favorites/demands/<int:demand_id>/remove/', views.remove_favorite_demand, name='remove_favorite_demand'),
    path('api/favorites/demands/<int:demand_id>/check/', views.check_favorite_demand, name='check_favorite_demand'),
    
    # Report endpoints
    path('api/reports/', views.reports, name='reports'),
    path('api/reports/<int:pk>/', views.report_detail, name='report-detail'),
    path('api/my-reports/', views.my_reports, name='my-reports'),
    path('api/my-warnings/', views.my_warnings, name='my-warnings'),
    path('api/reports/<int:pk>/mark-warning-read/', views.mark_warning_read, name='mark-warning-read'),
    path('api/admin-reports/', views.admin_reports, name='admin-reports'),
    
    # Break deal endpoints
    path('api/product-offers/<int:pk>/request-break/', views.request_break_product_offer, name='request-break-product-offer'),
    path('api/product-offers/<int:pk>/accept-break/', views.accept_break_product_offer, name='accept-break-product-offer'),
    path('api/demand-responses/<int:pk>/request-break/', views.request_break_demand_response, name='request-break-demand-response'),
    path('api/demand-responses/<int:pk>/accept-break/', views.accept_break_demand_response, name='accept-break-demand-response'),
    
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Google OAuth endpoints
    path('api/auth/google/', google_login, name='google_login'),
    path('api/auth/google/complete/', complete_google_signup, name='complete_google_signup'),
    path('accounts/', include('allauth.urls')),  # Include all django-allauth URLs
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)