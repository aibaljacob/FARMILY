from django.urls import path
from . import views

urlpatterns = [
    path('api/chat/rooms/', views.chat_room_list, name='chat-room-list'),
    path('api/chat/rooms/<str:deal_type>/<int:deal_id>/', views.chat_room_detail, name='chat-room-detail'),
    path('api/chat/unread/', views.get_unread_messages_count, name='unread-messages-count'),
    path('api/chat/rooms/<int:chat_room_id>/mark-read/', views.mark_messages_as_read, name='mark-messages-read'),
    # Debug endpoints - only keep the list endpoint for admin debugging
    path('api/chat/debug/rooms/', views.list_all_chat_rooms, name='debug-chat-rooms'),
] 