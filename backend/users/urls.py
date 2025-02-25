from django.urls import path
from .views import RegisterUserView
from .views import CustomTokenObtainPairView
from .views import UserDashboardView
from .views import UserLoginView
from .views import PasswordResetRequestAPIView, PasswordResetConfirmAPIView
from .views import verify_email
from .views import ResendVerificationEmailView,FarmerProfileCreateView
from .views import product_list_create
from . import views
from django.conf.urls.static import static
from django.conf import settings
from .views import product_detail

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
     path('api/send-otp/', views.send_otp, name='send_otp'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/products/', product_list_create, name='product-list-create'),
    path('api/products/<int:pk>/',  product_detail, name='product-detail'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)