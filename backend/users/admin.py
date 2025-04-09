from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, FarmerProfile, BuyerProfile, Product, Demand, DemandResponse

# Register your models here.

@admin.register(DemandResponse)
class DemandResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'demand', 'farmer', 'offered_price', 'offered_quantity', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('farmer__first_name', 'farmer__last_name', 'demand__category', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('farmer', 'demand')
    date_hierarchy = 'created_at'
