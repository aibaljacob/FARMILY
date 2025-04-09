import React from 'react';
import axios from 'axios';
import { Button, message } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const RazorpayPayment = ({ dealAmount, dealId, farmerName, onPaymentSuccess, dealType = 'demand' }) => {
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay();
    if (!res) {
      message.error('Razorpay SDK failed to load');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const orderResponse = await axios.post(
        'http://127.0.0.1:8000/api/payment/create-order/',  // Updated endpoint
        { 
          amount: dealAmount, // Backend will convert to paise
          deal_id: dealId,
          deal_type: dealType
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const options = {
        key: 'rzp_test_QWzUeBlDdGFSH0',
        amount: dealAmount * 100,
        currency: 'INR',
        name: 'Farmily',
        description: `Payment for deal with ${farmerName}`,
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              'http://127.0.0.1:8000/api/payment/verify-payment/',  // Updated endpoint
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                deal_id: dealId,
                deal_type: dealType
              },
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );
            
            console.log('Payment verification response:', verifyResponse.data);
            message.success('Payment successful!');
            if (onPaymentSuccess) onPaymentSuccess();
          } catch (error) {
            console.error('Payment verification error:', error);
            message.error('Payment verification failed');
          }
        },
        prefill: {
          name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).first_name : '',
          email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : '',
        },
        theme: {
          color: '#2d6a4f'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Failed to initialize payment');
    }
  };

  return (
    <Button 
      type="primary" 
      icon={<DollarOutlined />} 
      onClick={handlePayment}
      style={{ 
        backgroundColor: '#2d6a4f',
        borderColor: '#2d6a4f',
        width: '100%'
      }}
    >
      Pay Now
    </Button>
  );
};

export default RazorpayPayment;