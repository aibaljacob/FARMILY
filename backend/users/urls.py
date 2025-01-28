from django.urls import path
from .views import RegisterUserView
from .views import CustomTokenObtainPairView
from .views import UserDashboardView
from .views import UserLoginView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
    path('api/users/login/', UserLoginView.as_view(), name='login'),
]