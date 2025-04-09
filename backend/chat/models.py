from django.db import models
from django.conf import settings

class ChatRoom(models.Model):
    """
    ChatRoom model represents a chat room for a specific deal.
    A deal can be either a product offer or a demand response.
    """
    # We store the deal_id for both product offers and demand responses
    deal_id = models.IntegerField()
    # We'll determine the deal type with a field to know if it's a product offer or demand response
    deal_type = models.CharField(max_length=20, choices=[
        ('product_offer', 'Product Offer'),
        ('demand_response', 'Demand Response')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Make deal_id and deal_type unique together
        unique_together = ('deal_id', 'deal_type')
    
    def __str__(self):
        return f"Chat for {self.deal_type} #{self.deal_id}"

class Message(models.Model):
    """
    Message model represents a message in a chat room.
    """
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}" 