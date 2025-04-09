import razorpay
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
from django.utils import timezone
from deals.models import Deal
from users.models import DemandResponse, ProductOffer

# Initialize Razorpay client with keys from settings
try:
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception as e:
    # This will help identify if there's an issue with the Razorpay client initialization
    print(f"Error initializing Razorpay client: {str(e)}")
    razorpay_client = None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        # Check if Razorpay client is properly initialized
        if not razorpay_client:
            return Response({'error': 'Razorpay client not initialized. Check API keys in settings.'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        amount = request.data.get('amount')
        deal_id = request.data.get('deal_id')
        deal_type = request.data.get('deal_type', 'demand')  # Default to demand if not specified
        
        if not amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        payment = razorpay_client.order.create({
            'amount': int(float(amount) * 100),  # Convert to paise
            'currency': 'INR',
            'payment_capture': '1'
        })
        
        return Response(payment)
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    try:
        # Check if Razorpay client is properly initialized
        if not razorpay_client:
            return Response({'error': 'Razorpay client not initialized. Check API keys in settings.'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                           
        params_dict = {
            'razorpay_payment_id': request.data.get('razorpay_payment_id'),
            'razorpay_order_id': request.data.get('razorpay_order_id'),
            'razorpay_signature': request.data.get('razorpay_signature')
        }
        
        print(f"Payment verification request: {request.data}")
        
        # Verify the payment signature
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Get the deal ID and type from the request
        deal_id = request.data.get('deal_id')
        deal_type = request.data.get('deal_type', 'demand')  # Default to demand if not specified
        
        if not deal_id:
            print("Error: Deal ID is missing in the request")
            return Response({'error': 'Deal ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the deal payment status based on the deal type
        try:
            # First try to find it as a demand response
            try:
                deal = DemandResponse.objects.get(id=deal_id)
                model_type = 'demand'
                print(f"Found demand response deal: {deal.id}, current is_paid status: {deal.is_paid}")
            except DemandResponse.DoesNotExist:
                # If not found, try as a product offer
                try:
                    deal = ProductOffer.objects.get(id=deal_id)
                    model_type = 'product'
                    print(f"Found product offer deal: {deal.id}, current is_paid status: {deal.is_paid}")
                except ProductOffer.DoesNotExist:
                    # If not found in either model, try as a deal
                    try:
                        deal = Deal.objects.get(id=deal_id)
                        model_type = 'deal'
                        print(f"Found deal: {deal.id}, current is_paid status: {deal.is_paid}")
                    except Deal.DoesNotExist:
                        print(f"Error: Deal with ID {deal_id} not found in any model")
                        return Response({'error': f'Deal with ID {deal_id} not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Update the payment fields
            deal.is_paid = True
            deal.payment_id = request.data.get('razorpay_payment_id')
            deal.payment_date = timezone.now()
            deal.save()
            
            print(f"Updated {model_type} deal: {deal.id}, new is_paid status: {deal.is_paid}")
            
            # Return success response with updated deal info
            return Response({
                'status': 'Payment verified successfully',
                'deal_id': deal_id,
                'deal_type': model_type,
                'is_paid': True,
                'payment_id': request.data.get('razorpay_payment_id'),
                'payment_date': deal.payment_date
            })
        except Exception as e:
            print(f"Error updating deal: {str(e)}")
            return Response({'error': f'Error updating deal: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        print(f"Payment verification failed: {str(e)}")
        return Response({'error': f'Payment verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)