from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('demand.urls')),
    path('api/', include('product.urls')),
    path('api/', include('chat.urls')),
    path('api/payment/', include('payment.urls')),  # Changed to avoid URL conflicts
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)