from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.http import JsonResponse

def product_list(request):
    # Static data for now
    products = [
        {"id": 1, "name": "Apples", "description": "Fresh apples", "price": 1.5, "available_quantity": 100},
        {"id": 2, "name": "Tomatoes", "description": "Ripe tomatoes", "price": 2.0, "available_quantity": 50},
    ]
    return JsonResponse({"products": products})