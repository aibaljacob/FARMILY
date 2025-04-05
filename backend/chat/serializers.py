from rest_framework import serializers
from .models import ChatRoom, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender_id', 'sender_name', 'message', 'timestamp', 'is_read']
    
    def get_sender_name(self, obj):
        return obj.sender.username
    
    def get_sender_id(self, obj):
        return obj.sender.id

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    last_message_preview = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'deal_id', 'deal_type', 'created_at', 'updated_at', 'messages', 
                 'last_message_preview', 'unread_count', 'other_user']
    
    def get_last_message_preview(self, obj):
        """Get a preview of the last message in the chat room"""
        try:
            if hasattr(obj, 'last_message'):
                last_message = obj.last_message
            else:
                last_message = Message.objects.filter(chat_room=obj).order_by('-timestamp').first()
            
            if last_message:
                return {
                    'message': last_message.message[:50] + ('...' if len(last_message.message) > 50 else ''),
                    'sender_name': last_message.sender.username,
                    'timestamp': last_message.timestamp,
                    'is_read': last_message.is_read
                }
            return None
        except Exception as e:
            return None
    
    def get_unread_count(self, obj):
        """Get the count of unread messages for the current user"""
        try:
            if hasattr(obj, 'unread_count'):
                return obj.unread_count
            
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                user = request.user
                return Message.objects.filter(
                    chat_room=obj,
                    is_read=False
                ).exclude(sender=user).count()
            return 0
        except:
            return 0
    
    def get_other_user(self, obj):
        """Get information about the other user in the chat"""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return None
        
        current_user = request.user
        try:
            if obj.deal_type == 'product_offer':
                from users.models import ProductOffer
                deal = ProductOffer.objects.get(id=obj.deal_id)
                
                if deal.buyer == current_user:
                    other_user = deal.product.farmer
                else:
                    other_user = deal.buyer
            elif obj.deal_type == 'demand_response':
                from users.models import DemandResponse
                deal = DemandResponse.objects.get(id=obj.deal_id)
                
                if deal.farmer == current_user:
                    other_user = deal.demand.buyer
                else:
                    other_user = deal.farmer
            else:
                return None
            
            return {
                'id': other_user.id,
                'username': other_user.username,
                'full_name': f"{other_user.first_name} {other_user.last_name}".strip() or other_user.username
            }
        except Exception as e:
            return None 