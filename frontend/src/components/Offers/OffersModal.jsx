import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  List, 
  Button, 
  Tag, 
  Descriptions, 
  Empty, 
  Spin, 
  message, 
  Avatar,
  Divider,
  Typography,
  Space,
  Badge,
  notification,
  Input
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import DealInvoice from '../Deals/DealInvoice';
import './Offers.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

// Category options
const categoryOptions = [
  { value: 'rubber', label: 'Rubber' },
  { value: 'coconut', label: 'Coconut' },
  { value: 'jackfruit', label: 'Jackfruit' },
  { value: 'banana', label: 'Banana' },
  { value: 'pepper', label: 'Black Pepper' },
  { value: 'cardamom', label: 'Cardamom' },
  { value: 'tea', label: 'Tea' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'arecanut', label: 'Arecanut' },
  { value: 'cashew', label: 'Cashew' },
  { value: 'ginger', label: 'Ginger' },
  { value: 'turmeric', label: 'Turmeric' },
  { value: 'nutmeg', label: 'Nutmeg' },
  { value: 'clove', label: 'Clove' },
  { value: 'tapioca', label: 'Tapioca' },
  { value: 'mango', label: 'Mango' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'others', label: 'Others' }
];

const OffersModal = ({ visible, productId, onClose, productDetails, onDealCreated }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [buyersData, setBuyersData] = useState({});
  const [farmerMessage, setFarmerMessage] = useState("");
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (visible && productId) {
      fetchOffers();
    }
  }, [visible, productId]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error("Authentication required");
        onClose();
        return;
      }
      
      if (!productId) {
        message.error("Invalid product");
        onClose();
        return;
      }
      
      const response = await axios.get(`http://127.0.0.1:8000/api/products/${productId}/offers/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const filteredOffers = response.data.filter(offer => offer.product === productId);
      
      console.log(`Loaded ${filteredOffers.length} offers for product #${productId}`);
      setOffers(filteredOffers || []);
      
      // Fetch buyer details for all offers
      if (filteredOffers.length > 0) {
        await fetchBuyersData(filteredOffers, token);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      message.error("Failed to load offers. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch details for all buyers who made offers
  const fetchBuyersData = async (offers, token) => {
    try {
      // Get unique buyer IDs
      const buyerIds = [...new Set(offers.map(offer => offer.buyer))];
      
      // First, fetch all buyer profiles
      const allBuyersResponse = await axios.get('http://127.0.0.1:8000/api/all-buyer-profiles/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("Fetched all buyer profiles:", allBuyersResponse.data);
      
      // Create a map of buyer IDs to buyer details
      const buyersMap = {};
      
      if (allBuyersResponse.data && Array.isArray(allBuyersResponse.data)) {
        // Filter buyers to get only those who made offers for this product
        const relevantBuyers = allBuyersResponse.data.filter(buyer => 
          buyerIds.includes(buyer.user)
        );
        
        relevantBuyers.forEach(buyer => {
          buyersMap[buyer.user] = {
            id: buyer.id,
            name:  `${buyer.user_first_name} ${buyer.user_last_name}`,
            profileImage: buyer.profilepic || null,
            location: buyer.location || buyer.address || 'Location not available',
            phone: buyer.phoneno || 'No phone provided',
            email: buyer.user_email || 'No email provided'
          };
        });
      }
      
      console.log("Processed buyer data:", buyersMap);
      setBuyersData(buyersMap);
    } catch (error) {
      console.error("Error fetching buyers data:", error);
      // Create basic entries for buyers even if API call fails
      const basicBuyersMap = {};
      buyerIds.forEach(id => {
        basicBuyersMap[id] = {
          id: id,
          name: `Buyer #${id}`,
          profileImage: null,
          location: 'Location not available'
        };
      });
      setBuyersData(basicBuyersMap);
    }
  };

  // Get buyer details from the map
  const getBuyerDetails = (buyerId) => {
    return buyersData[buyerId] || {
      id: buyerId,
      name: `Buyer #${buyerId}`,
      profileImage: null
    };
  };

  const showAcceptConfirmation = (offerId) => {
    setCurrentOfferId(offerId);
    setFarmerMessage("");
    setAcceptModalVisible(true);
  };

  const handleAcceptOffer = async () => {
    if (!currentOfferId) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error("Authentication required");
        return;
      }
      
      // Prepare the request data
      const requestData = { 
        status: 'accepted',
        farmer_message: farmerMessage
      };
      
      console.log("Accepting offer with data:", requestData);
      console.log("currentOfferId:", currentOfferId);
      
      // First update the offer status to accepted
      const acceptOfferResponse = await axios.put(`http://127.0.0.1:8000/api/product-offers/${currentOfferId}/`, 
        requestData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log("Offer accepted successfully:", acceptOfferResponse.data);
      
      // Then update the product quantity and possibly mark as inactive if quantity is now 0
      if (productId && productDetails) {
        // Find the accepted offer to get its quantity
        const acceptedOffer = offers.find(o => o.id === currentOfferId);
        
        if (acceptedOffer) {
          const remainingQuantity = Math.max(0, productDetails.quantity - acceptedOffer.quantity);
          
          console.log("Updating product quantity. Current:", productDetails.quantity, 
                    "Offered:", acceptedOffer.quantity, "Remaining:", remainingQuantity);
          
          const productUpdateData = { 
            quantity: remainingQuantity
          };
          
          // If no quantity left, mark product as inactive
          if (remainingQuantity <= 0) {
            productUpdateData.is_active = false;
          }
          
          const productUpdateResponse = await axios.put(`http://127.0.0.1:8000/api/products/${productId}/`, 
            productUpdateData,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          console.log("Product updated successfully:", productUpdateResponse.data);
        }
      }
      
      // Get the accepted offer details for the success message
      const offerData = offers.find(o => o.id === currentOfferId);
      const buyerDetails = getBuyerDetails(offerData?.buyer);
      
      // Store the accepted offer for invoice generation
      setAcceptedOffer(offerData);
      
      // Close the confirmation modal
      setAcceptModalVisible(false);
      
      // Show success notification
      notification.success({
        message: 'Deal Created Successfully',
        description: (
          <div>
            <p>You've successfully accepted an offer from {buyerDetails.name}.</p>
            <p>A new deal has been created and the product quantity has been updated.</p>
            <Space>
              <Button 
                type="primary" 
                size="small"
                onClick={() => setShowInvoice(true)}
                icon={<FileTextOutlined />}
              >
                View Deal
              </Button>
              <Button
                size="small"
                onClick={() => navigate('/farmer/deals')}
              >
                Go to Deals
              </Button>
            </Space>
          </div>
        ),
        duration: 0
      });
      
      // Refresh the list
      fetchOffers();
      
      // Notify parent component that a deal was created
      if (onDealCreated) {
        onDealCreated(offerData, productDetails);
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      message.error("Failed to accept offer. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error("Authentication required");
        return;
      }
      
      // Update the offer status to rejected
      await axios.put(`http://127.0.0.1:8000/api/product-offers/${offerId}/`, 
        { status: 'rejected' },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      message.success("Offer rejected");
      fetchOffers(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting offer:", error);
      message.error("Failed to reject offer. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewBuyerDetails = (offer) => {
    setSelectedOffer(offer);
  };

  const handleCloseDetails = () => {
    setSelectedOffer(null);
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('MMM DD, YYYY - hh:mm A');
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'Accepted':
      case 'accepted':
        return <Tag color="green">Accepted</Tag>;
      case 'Rejected':
      case 'rejected':
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag color="blue">Pending</Tag>;
    }
  };

  // Render buyer details panel
  const renderBuyerDetails = () => {
    if (!selectedOffer) return null;
    
    const buyerDetails = getBuyerDetails(selectedOffer.buyer);
    
    return (
      <div className="buyer-details-panel">
        <div className="details-header">
          <Button 
            type="link" 
            onClick={handleCloseDetails} 
            style={{ margin: '-10px -10px 0 0', float: 'right' }}
          >
            Back to List
          </Button>
          <Title level={4}>
            <UserOutlined style={{ marginRight: '8px' }} />
            Buyer Details
          </Title>
        </div>
        
        <Divider />
        
        <div className="buyer-info">
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Avatar 
              size={80}
              src={`http://127.0.0.1:8000${buyerDetails.profileImage}`}
              icon={<UserOutlined />}
              style={{ backgroundColor: !buyerDetails.profileImage ? '#2d6a4f' : 'transparent' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text strong style={{ fontSize: '16px' }}>{buyerDetails.name}</Text>
            </div>
          </div>
          
          <Descriptions 
            title="Contact Information" 
            bordered 
            column={1} 
            size="small"
            style={{ marginBottom: '16px' }}
          >
            <Descriptions.Item label={<><MailOutlined /> Email</>}>
              {buyerDetails.email}
            </Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
              {buyerDetails.phone}
            </Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined /> Location</>}>
              {buyerDetails.location}
            </Descriptions.Item>
          </Descriptions>
          
          <Descriptions 
            title="Offer Details" 
            bordered 
            column={1}
            size="small"
          >
            <Descriptions.Item label={<><DollarOutlined /> Offered Price</>}>
              {formatPrice(selectedOffer.offered_price)} per {productDetails?.unit || 'unit'}
            </Descriptions.Item>
            <Descriptions.Item label={<><ShoppingOutlined /> Quantity</>}>
              {selectedOffer.quantity} {productDetails?.unit || 'units'}
            </Descriptions.Item>
            <Descriptions.Item label="Total Value">
              {formatPrice(selectedOffer.offered_price * selectedOffer.quantity)}
            </Descriptions.Item>
            <Descriptions.Item label="Submitted On">
              {formatDate(selectedOffer.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedOffer.status)}
            </Descriptions.Item>
            {selectedOffer.notes && (
              <Descriptions.Item label="Notes">
                {selectedOffer.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
          
          {selectedOffer.status === 'pending' && (
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <Button
                danger
                onClick={() => handleRejectOffer(selectedOffer.id)}
                loading={actionLoading}
                icon={<CloseCircleOutlined />}
              >
                Reject Offer
              </Button>
              <Button
                type="primary"
                onClick={() => showAcceptConfirmation(selectedOffer.id)}
                loading={actionLoading}
                icon={<CheckCircleOutlined />}
              >
                Accept Offer
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render acceptance confirmation modal
  const renderAcceptModal = () => {
    const currentOffer = offers.find(o => o.id === currentOfferId);
    if (!currentOffer) return null;
    
    const buyerDetails = getBuyerDetails(currentOffer.buyer);
    
    return (
      <Modal
        title={
          <div>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
            Accept Offer & Create Deal
          </div>
        }
        visible={acceptModalVisible}
        onCancel={() => setAcceptModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAcceptModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="accept" 
            type="primary" 
            loading={actionLoading}
            onClick={handleAcceptOffer}
          >
            Confirm & Create Deal
          </Button>
        ]}
      >
        <div>
          <p>You are about to accept the following offer:</p>
          
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Buyer">
              {buyerDetails.name}
            </Descriptions.Item>
            <Descriptions.Item label="Product">
              {productDetails?.name || 'Product'} ({productDetails?.category || 'Category'})
            </Descriptions.Item>
            <Descriptions.Item label="Offered Price">
              {formatPrice(currentOffer.offered_price)} per {productDetails?.unit || 'unit'}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              {currentOffer.quantity} {productDetails?.unit || 'units'}
            </Descriptions.Item>
            <Descriptions.Item label="Total Value">
              {formatPrice(currentOffer.offered_price * currentOffer.quantity)}
            </Descriptions.Item>
          </Descriptions>
          
          <div style={{ marginTop: '16px' }}>
            <p>Add a message to the buyer (optional):</p>
            <TextArea
              rows={4}
              value={farmerMessage}
              onChange={(e) => setFarmerMessage(e.target.value)}
              placeholder="Thank you for your offer! Details about delivery, payment, or any other information..."
            />
          </div>
          
          <div className="warning-note" style={{ marginTop: '16px', color: '#ff4d4f' }}>
            <ExclamationCircleOutlined /> Accepting this offer will create a new deal and 
            {currentOffer.quantity >= productDetails?.quantity ? 
              " mark this product as inactive (sold out)." : 
              ` reduce your product quantity by ${currentOffer.quantity} ${productDetails?.unit || 'units'}.`}
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#2d6a4f' }} />
            <span>Offers for Product #{productId}</span>
          </div>
        }
        visible={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ]}
        width={700}
        centered
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '15px' }}>Loading offers...</div>
          </div>
        ) : selectedOffer ? (
          renderBuyerDetails()
        ) : (
          <>
            {productDetails && (
              <div className="product-summary" style={{ marginBottom: '16px', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                <Title level={5} style={{ margin: '0 0 8px 0' }}>Product #{productDetails.id} Summary:</Title>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <Text strong>Product: </Text>
                    <Text>{productDetails.name || 
                      categoryOptions?.find(c => c.value === productDetails.category)?.label || 
                      productDetails.category || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong>Quantity: </Text>
                    <Text>{productDetails.quantity} {productDetails.unit}</Text>
                  </div>
                  <div>
                    <Text strong>Price: </Text>
                    <Text>{formatPrice(productDetails.price)} per {productDetails.unit}</Text>
                  </div>
                </div>
              </div>
            )}

            {offers.length === 0 ? (
              <Empty description="No offers received yet for this product" />
            ) : (
              <List
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>
                        Found {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        {offers.filter(o => o.status === 'pending').length} pending, {' '}
                        {offers.filter(o => o.status === 'accepted').length} accepted, {' '}
                        {offers.filter(o => o.status === 'rejected').length} rejected
                      </Text>
                    </div>
                  </div>
                }
                dataSource={offers}
                renderItem={offer => {
                  const buyerDetails = getBuyerDetails(offer.buyer);
                  return (
                    <List.Item
                      key={offer.id}
                      actions={[
                        <Button 
                          type="link" 
                          onClick={() => handleViewBuyerDetails(offer)}
                        >
                          View Details
                        </Button>,
                        offer.status === 'pending' && (
                          <Space>
                            <Button 
                              type="primary" 
                              size="small" 
                              icon={<CheckCircleOutlined />}
                              onClick={() => showAcceptConfirmation(offer.id)}
                              loading={actionLoading}
                              disabled={actionLoading || !productDetails?.is_active}
                            >
                              Accept
                            </Button>
                            <Button 
                              danger 
                              size="small" 
                              icon={<CloseCircleOutlined />}
                              onClick={() => handleRejectOffer(offer.id)}
                              loading={actionLoading}
                              disabled={actionLoading}
                            >
                              Reject
                            </Button>
                          </Space>
                        ),
                        offer.status === 'accepted' && (
                          <Badge 
                            status="success" 
                            text={<Text type="success">Deal Created</Text>} 
                          />
                        )
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            src={`http://127.0.0.1:8000${buyerDetails.profileImage}`}
                            icon={!buyerDetails.profileImage && <UserOutlined />} 
                            style={{ backgroundColor: !buyerDetails.profileImage ? '#2d6a4f' : 'transparent' }}
                            size="large"
                          />
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>{buyerDetails.name}</span>
                            <div style={{ marginLeft: 'auto' }}>
                              {getStatusTag(offer.status)}
                            </div>
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ marginBottom: '4px' }}>
                              <Text strong><DollarOutlined /> Offered Price: </Text>
                              <Text>{formatPrice(offer.offered_price)} per {productDetails?.unit || 'unit'}</Text>
                              {parseFloat(offer.offered_price) > parseFloat(productDetails?.price || 0) && (
                                <Tag color="green" style={{ marginLeft: '8px' }}>Higher price</Tag>
                              )}
                            </div>
                            <div>
                              <Text strong><ShoppingOutlined /> Quantity: </Text>
                              <Text>{offer.quantity} {productDetails?.unit || 'units'}</Text>
                            </div>
                            
                            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                              Submitted: {formatDate(offer.created_at)}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </>
        )}
      </Modal>
      
      {renderAcceptModal()}
      
      {showInvoice && acceptedOffer && (
        <DealInvoice
          visible={showInvoice}
          onClose={() => setShowInvoice(false)}
          dealData={{
            id: `PO-${acceptedOffer.id}`,
            product_name: productDetails?.name || 'Product',
            category: productDetails?.category || 'Category',
            unit: productDetails?.unit || 'unit',
            quantity: acceptedOffer.quantity,
            price: acceptedOffer.offered_price,
            buyer_name: getBuyerDetails(acceptedOffer.buyer).name,
            farmer_name: `${productDetails?.farmer_name || 'Farmer'}`,
            created_at: acceptedOffer.created_at,
            status: 'accepted',
            originalPrice: productDetails?.price || 0,
            type: 'product'  // To differentiate from demand deals
          }}
        />
      )}
    </>
  );
};

export default OffersModal; 