from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max, F, ExpressionWrapper, BooleanField
from django.utils import timezone
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from users.models import ProductOffer, DemandResponse, FarmerProfile, Notification
from users.views import create_notification
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_all_chat_rooms(request):
    """Debug view to list all chat rooms in the database"""
    try:
        chat_rooms = ChatRoom.objects.all()
        serializer = ChatRoomSerializer(chat_rooms, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error listing chat rooms: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_room_list(request):
    """
    List all chat rooms for the authenticated user with last message preview and unread count
    """
    # Check if the user is a farmer
    is_farmer = request.user.role == 1
    user_id = request.user.id
    
    # If the user is a farmer, get their farmer profile
    farmer_id = None
    if is_farmer:
        try:
            farmer_profile = FarmerProfile.objects.get(user=request.user)
            farmer_id = request.user.id  # For a farmer, the user_id is the farmer_id
        except FarmerProfile.DoesNotExist:
            # If the farmer profile doesn't exist, they don't have access to any chat rooms
            return Response({"detail": "Farmer profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all product offers and demand responses IDs where the user is involved
    if is_farmer:
        product_offers = ProductOffer.objects.filter(
            Q(product__farmer=user_id)
        ).values_list('id', flat=True)
        
        demand_responses = DemandResponse.objects.filter(
            Q(farmer=user_id)
        ).values_list('id', flat=True)
    else:
        # User is a buyer
        product_offers = ProductOffer.objects.filter(
            Q(buyer=user_id)
        ).values_list('id', flat=True)
        
        demand_responses = DemandResponse.objects.filter(
            Q(demand__buyer=user_id)
        ).values_list('id', flat=True)
    
    # Get chat rooms for these deals
    chat_rooms = ChatRoom.objects.filter(
        (Q(deal_type='product_offer') & Q(deal_id__in=product_offers)) |
        (Q(deal_type='demand_response') & Q(deal_id__in=demand_responses))
    )
    
    # Get the last message for each chat room
    for chat_room in chat_rooms:
        # Get the last message
        last_message = Message.objects.filter(chat_room=chat_room).order_by('-timestamp').first()
        if last_message:
            chat_room.last_message = last_message
        
        # Count unread messages for this user
        unread_count = Message.objects.filter(
            ~Q(sender=request.user),
            chat_room=chat_room,
            is_read=False
        ).count()
        chat_room.unread_count = unread_count
    
    serializer = ChatRoomSerializer(chat_rooms, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_room_detail(request, deal_type, deal_id):
    """
    Retrieve a chat room or create if it doesn't exist
    GET: Get the chat room details with messages
    POST: Create a new message in the chat room
    """
    try:
        # Log the request details for debugging
        logger.info(f"Chat room request for: deal_type={deal_type}, deal_id={deal_id}, user={request.user.id}")
        
        # Check if the chat room exists
        try:
            chat_room = ChatRoom.objects.get(deal_type=deal_type, deal_id=deal_id)
            logger.info(f"Found existing chat room: {chat_room.id}")
        except ChatRoom.DoesNotExist:
            logger.info(f"Chat room does not exist, verifying deal and permissions")
            # Verify that the deal exists and the user is authorized
            if deal_type == 'product_offer':
                try:
                    deal = get_object_or_404(ProductOffer, id=deal_id)
                    logger.info(f"Found product offer: {deal.id}, buyer={deal.buyer.id}, farmer={deal.product.farmer.id}")
                    
                    # Check if the user is the buyer or the farmer who created the product
                    if not (deal.buyer.id == request.user.id or deal.product.farmer.id == request.user.id):
                        logger.warning(f"Permission denied: user {request.user.id} is neither buyer nor farmer")
                        return Response(
                            {"detail": "You don't have permission to access this chat room."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except ProductOffer.DoesNotExist:
                    logger.warning(f"Product offer {deal_id} does not exist")
                    return Response(
                        {"detail": "Product offer not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif deal_type == 'demand_response':
                try:
                    deal = get_object_or_404(DemandResponse, id=deal_id)
                    logger.info(f"Found demand response: {deal.id}, buyer={deal.demand.buyer.id}, farmer={deal.farmer.id}")
                    
                    # Check if the user is the buyer who created the demand or the farmer who responded
                    if not (deal.demand.buyer.id == request.user.id or deal.farmer.id == request.user.id):
                        logger.warning(f"Permission denied: user {request.user.id} is neither buyer nor farmer")
                        return Response(
                            {"detail": "You don't have permission to access this chat room."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except DemandResponse.DoesNotExist:
                    logger.warning(f"Demand response {deal_id} does not exist")
                    return Response(
                        {"detail": "Demand response not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                logger.warning(f"Invalid deal type: {deal_type}")
                return Response(
                    {"detail": f"Invalid deal type: {deal_type}. Expected 'product_offer' or 'demand_response'."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a new chat room
            chat_room = ChatRoom.objects.create(deal_type=deal_type, deal_id=deal_id)
            logger.info(f"Created new chat room: {chat_room.id}")
        
        if request.method == 'GET':
            # Mark messages as read when the user views the chat room
            Message.objects.filter(
                ~Q(sender=request.user),
                chat_room=chat_room,
                is_read=False
            ).update(is_read=True)
            
            serializer = ChatRoomSerializer(chat_room)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create a new message
            data = request.data.copy()
            data['chat_room'] = chat_room.id
            data['sender'] = request.user.id
            
            serializer = MessageSerializer(data=data)
            if serializer.is_valid():
                message = serializer.save(chat_room=chat_room, sender=request.user)
                
                # Create a notification for the recipient
                other_user = None
                if chat_room.deal_type == 'product_offer':
                    product_offer = ProductOffer.objects.get(id=chat_room.deal_id)
                    # If sender is buyer, notify farmer and vice versa
                    if request.user.id == product_offer.buyer.id:
                        other_user = product_offer.product.farmer
                    else:
                        other_user = product_offer.buyer
                elif chat_room.deal_type == 'demand_response':
                    demand_response = DemandResponse.objects.get(id=chat_room.deal_id)
                    # If sender is farmer, notify buyer and vice versa
                    if request.user.id == demand_response.farmer.id:
                        other_user = demand_response.demand.buyer
                    else:
                        other_user = demand_response.farmer
                
                if other_user:
                    # Determine the deal type for better notification message
                    deal_name = ""
                    if chat_room.deal_type == 'product_offer':
                        product_offer = ProductOffer.objects.get(id=chat_room.deal_id)
                        deal_name = product_offer.product.name
                    elif chat_room.deal_type == 'demand_response':
                        demand_response = DemandResponse.objects.get(id=chat_room.deal_id)
                        deal_name = demand_response.demand.category
                    
                    # Create notification
                    notification_message = f"New message from {request.user.first_name} {request.user.last_name} about {deal_name}"
                    
                    # Determine redirect URL based on user role and deal type
                    redirect_url = None
                    if chat_room.deal_type == 'product_offer':
                        redirect_url = f"/deals"
                    elif chat_room.deal_type == 'demand_response':
                        redirect_url = f"/deals"
                    
                    # Create the notification
                    create_notification(
                        recipient=other_user,
                        message=notification_message,
                        notification_type='message',
                        sender=request.user,
                        redirect_url=redirect_url,
                        chat_room_id=chat_room.id
                    )
                
                # Create response that includes sender information
                response_data = serializer.data
                response_data['sender_name'] = request.user.username
                response_data['sender_id'] = request.user.id
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error in chat_room_detail: {str(e)}")
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_messages_count(request):
    """
    Get the count of unread messages for the authenticated user
    """
    # Check if the user is a farmer
    is_farmer = request.user.role == 1
    user_id = request.user.id
    
    # Get all product offers and demand responses IDs where the user is involved
    if is_farmer:
        product_offers = ProductOffer.objects.filter(
            Q(product__farmer=user_id)
        ).values_list('id', flat=True)
        
        demand_responses = DemandResponse.objects.filter(
            Q(farmer=user_id)
        ).values_list('id', flat=True)
    else:
        # User is a buyer
        product_offers = ProductOffer.objects.filter(
            Q(buyer=user_id)
        ).values_list('id', flat=True)
        
        demand_responses = DemandResponse.objects.filter(
            Q(demand__buyer=user_id)
        ).values_list('id', flat=True)
    
    # Get chat rooms for these deals
    chat_rooms = ChatRoom.objects.filter(
        (Q(deal_type='product_offer') & Q(deal_id__in=product_offers)) |
        (Q(deal_type='demand_response') & Q(deal_id__in=demand_responses))
    ).values_list('id', flat=True)
    
    # Count unread messages where the sender is not the current user
    unread_count = Message.objects.filter(
        ~Q(sender=request.user),
        chat_room_id__in=chat_rooms,
        is_read=False
    ).count()
    
    return Response({"unread_count": unread_count})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_as_read(request, chat_room_id):
    """
    Mark all messages in a chat room as read for the authenticated user
    """
    try:
        chat_room = ChatRoom.objects.get(id=chat_room_id)
        
        # Check if the user is authorized to access this chat room
        if chat_room.deal_type == 'product_offer':
            deal = get_object_or_404(ProductOffer, id=chat_room.deal_id)
            # Check if the user is the buyer or the farmer who created the product
            if not (deal.buyer.id == request.user.id or deal.product.farmer.id == request.user.id):
                return Response(
                    {"detail": "You don't have permission to access this chat room."},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif chat_room.deal_type == 'demand_response':
            deal = get_object_or_404(DemandResponse, id=chat_room.deal_id)
            # Check if the user is the buyer who created the demand or the farmer who responded
            if not (deal.demand.buyer.id == request.user.id or deal.farmer.id == request.user.id):
                return Response(
                    {"detail": "You don't have permission to access this chat room."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Mark all messages as read where the sender is not the current user
        update_count = Message.objects.filter(
            ~Q(sender=request.user),
            chat_room=chat_room,
            is_read=False
        ).update(is_read=True)
        
        return Response({"detail": f"{update_count} messages marked as read."}, status=status.HTTP_200_OK)
        
    except ChatRoom.DoesNotExist:
        return Response(
            {"detail": "Chat room not found."},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def create_test_chat_room(request):
    """Debug view to create a test chat room for WebSocket testing"""
    try:
        data = {
            'deal_id': request.data.get('deal_id', 1),
            'deal_type': request.data.get('deal_type', 'product_offer')
        }
        
        # Check if a room with these parameters already exists
        existing_room = ChatRoom.objects.filter(
            deal_id=data['deal_id'], 
            deal_type=data['deal_type']
        ).first()
        
        if existing_room:
            logger.info(f"Chat room already exists with ID {existing_room.id}")
            serializer = ChatRoomSerializer(existing_room)
            return Response({
                'message': 'Chat room already exists',
                'chat_room': serializer.data
            })
        
        # Create a new chat room
        serializer = ChatRoomSerializer(data=data)
        if serializer.is_valid():
            chat_room = serializer.save()
            logger.info(f"Created test chat room with ID {chat_room.id}")
            return Response({
                'message': 'Test chat room created successfully',
                'chat_room': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error creating test chat room: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 