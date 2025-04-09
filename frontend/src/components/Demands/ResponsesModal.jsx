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
  Input,
  Form
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
  PrinterOutlined,
  CarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import DealInvoice from '../Deals/DealInvoice';

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

const ResponsesModal = ({ visible, demandId, onClose, demandDetails, onDealCreated }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [farmersData, setFarmersData] = useState({});
  const [buyerMessage, setBuyerMessage] = useState("");
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [currentResponseId, setCurrentResponseId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [acceptedResponse, setAcceptedResponse] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (visible && demandId) {
      fetchResponses();
    }
  }, [visible, demandId]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error("Authentication required");
        onClose();
        return;
      }
      
      if (!demandId) {
        message.error("Invalid demand");
        onClose();
        return;
      }
      
      const response = await axios.get(`http://127.0.0.1:8000/api/demand-responses/?demand=${demandId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const filteredResponses = response.data.filter(resp => resp.demand === demandId);
      
      console.log(`Loaded ${filteredResponses.length} responses for demand #${demandId}`);
      setResponses(filteredResponses || []);
      
      // Fetch farmer details for all responses
      if (filteredResponses.length > 0) {
        await fetchFarmersData(filteredResponses, token);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
      message.error("Failed to load responses. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch details for all farmers who responded
  const fetchFarmersData = async (responses, token) => {
    try {
      // Get unique farmer IDs
      const farmerIds = [...new Set(responses.map(resp => resp.farmer))];
      
      // First, fetch all farmer profiles
      const allFarmersResponse = await axios.get('http://127.0.0.1:8000/api/all-farmer-profiles/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("Fetched all farmer profiles:", allFarmersResponse.data);
      
      // Create a map of farmer IDs to farmer details
      const farmersMap = {};
      
      if (allFarmersResponse.data && Array.isArray(allFarmersResponse.data)) {
        // Filter farmers to get only those who responded to this demand
        const relevantFarmers = allFarmersResponse.data.filter(farmer => 
          farmerIds.includes(farmer.user)
        );
        
        relevantFarmers.forEach(farmer => {
          farmersMap[farmer.user] = {
            id: farmer.id,
            name:  `${farmer.user_first_name} ${farmer.user_last_name}`,
            profileImage: farmer.profilepic || null,
            location: farmer.location || farmer.address || 'Location not available',
            phone: farmer.phoneno || 'No phone provided',
            email: farmer.user_email || 'No email provided'
          };
        });
      }
      
      console.log("Processed farmer data:", farmersMap);
      setFarmersData(farmersMap);
    } catch (error) {
      console.error("Error fetching farmers data:", error);
      // Create basic entries for farmers even if API call fails
      const basicFarmersMap = {};
      farmerIds.forEach(id => {
        basicFarmersMap[id] = {
          id: id,
          name: `Farmer #${id}`,
          profileImage: null,
          location: 'Location not available'
        };
      });
      setFarmersData(basicFarmersMap);
    }
  };

  // Get farmer details from the map
  const getFarmerDetails = (farmerId) => {
    return farmersData[farmerId] || {
      id: farmerId,
      name: `Farmer #${farmerId}`,
      profileImage: null
    };
  };

  const showAcceptConfirmation = (responseId) => {
    setCurrentResponseId(responseId);
    setBuyerMessage("");
    setAcceptModalVisible(true);
  };

  const handleAcceptResponse = async () => {
    if (!currentResponseId) return;
    
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
        buyer_message: buyerMessage
      };
      
      console.log("Accepting response with data:", requestData);
      console.log("currentResponseId:", currentResponseId);
      
      // First update the response status to accepted
      const acceptResponse = await axios.put(`http://127.0.0.1:8000/api/demand-responses/${currentResponseId}/`, 
        requestData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log("Response accepted successfully:", acceptResponse.data);
      
      // Then update the demand status to fulfilled
      if (demandId) {
        console.log("Updating demand status for demand ID:", demandId);
        
        const demandUpdateResponse = await axios.put(`http://127.0.0.1:8000/api/demands/${demandId}/`, 
          { status: 'fulfilled' },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        console.log("Demand updated successfully:", demandUpdateResponse.data);
      }
      
      // Get the accepted response details for the success message
      const responseData = responses.find(r => r.id === currentResponseId);
      const farmerDetails = getFarmerDetails(responseData?.farmer);
      
      // Store the accepted response for invoice generation
      setAcceptedResponse(responseData);
      
      // Close the confirmation modal
      setAcceptModalVisible(false);
      
      // Show success notification
      notification.success({
        message: 'Deal Created Successfully',
        description: (
          <div>
            <p>You've successfully accepted an offer from {farmerDetails.name}.</p>
            <p>A new deal has been created and the demand is now fulfilled.</p>
          </div>
        ),
        duration: 5, // Make notification stay until user closes it
      });
      
      // Callback to parent component if provided
      if (typeof onDealCreated === 'function') {
        onDealCreated(demandId, currentResponseId);
      }
      
      message.success("Response accepted and deal created successfully");
      fetchResponses(); // Refresh the list
    } catch (error) {
      console.error("Error accepting response:", error);
      console.error("Error details:", error.response?.data || "No detailed error information");
      message.error(`Failed to accept response: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectResponse = async (responseId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error("Authentication required");
        return;
      }
      
      await axios.put(`http://127.0.0.1:8000/api/demand-responses/${responseId}/`, 
        { status: 'rejected' },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      message.success("Response rejected");
      fetchResponses(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting response:", error);
      message.error("Failed to reject response. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewFarmerDetails = (response) => {
    setSelectedResponse(response);
  };

  const handleCloseDetails = () => {
    setSelectedResponse(null);
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

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#2d6a4f' }} />
            <span>Responses for Demand #{demandId}</span>
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
            <div style={{ marginTop: '15px' }}>Loading responses...</div>
          </div>
        ) : (
          <>
            {demandDetails && (
              <div className="demand-summary" style={{ marginBottom: '16px', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                <Title level={5} style={{ margin: '0 0 8px 0' }}>Demand #{demandDetails.id} Summary:</Title>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <Text strong>Product: </Text>
                    <Text>{demandDetails.product_name || 
                      categoryOptions?.find(c => c.value === demandDetails.category)?.label || 
                      demandDetails.category || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong>Quantity: </Text>
                    <Text>{demandDetails.quantity} {demandDetails.unit}</Text>
                  </div>
                  <div>
                    <Text strong>Price: </Text>
                    <Text>{formatPrice(demandDetails.price_per_unit)} per {demandDetails.unit}</Text>
                  </div>
                  <div>
                    <Text strong>Valid Until: </Text>
                    <Text>{formatDate(demandDetails.valid_until)}</Text>
                  </div>
                </div>
              </div>
            )}

            {!selectedResponse ? (
              responses.length === 0 ? (
                <Empty description="No responses received yet for this demand" />
              ) : (
                <List
                  header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>
                          Found {responses.length} {responses.length === 1 ? 'response' : 'responses'}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          {responses.filter(r => r.status === 'pending').length} pending, {' '}
                          {responses.filter(r => r.status === 'accepted').length} accepted, {' '}
                          {responses.filter(r => r.status === 'rejected').length} rejected
                        </Text>
                      </div>
                    </div>
                  }
                  dataSource={responses}
                  renderItem={response => {
                    const farmerDetails = getFarmerDetails(response.farmer);
                    return (
                      <List.Item
                        key={response.id}
                        actions={[
                          <Button 
                            type="link" 
                            onClick={() => handleViewFarmerDetails(response)}
                          >
                            View Details
                          </Button>,
                          response.status === 'pending' && (
                            <Space>
                              <Button 
                                type="primary" 
                                size="small" 
                                icon={<CheckCircleOutlined />}
                                onClick={() => showAcceptConfirmation(response.id)}
                                loading={actionLoading}
                                disabled={actionLoading || demandDetails?.status === 'fulfilled'}
                              >
                                Accept
                              </Button>
                              <Button 
                                danger 
                                size="small" 
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleRejectResponse(response.id)}
                                loading={actionLoading}
                                disabled={actionLoading}
                              >
                                Reject
                              </Button>
                            </Space>
                          ),
                          response.status === 'accepted' && (
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
                              src={`http://127.0.0.1:8000${farmerDetails.profileImage}`}
                              icon={!farmerDetails.profileImage && <UserOutlined />} 
                              style={{ backgroundColor: !farmerDetails.profileImage ? '#2d6a4f' : 'transparent' }}
                              size="large"
                            />
                          }
                          title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold' }}>{farmerDetails.name}</span>
                              <div style={{ marginLeft: 'auto' }}>
                                {getStatusTag(response.status)}
                              </div>
                            </div>
                          }
                          description={
                            <div>
                              <div style={{ marginBottom: '4px' }}>
                                <Text strong><DollarOutlined /> Offered Price: </Text>
                                <Text>{formatPrice(response.offered_price)} per {demandDetails?.unit || 'unit'}</Text>
                                {parseFloat(response.offered_price) < parseFloat(demandDetails?.price_per_unit || 0) && (
                                  <Tag color="green" style={{ marginLeft: '8px' }}>Lower price</Tag>
                                )}
                              </div>
                              <div>
                                <Text strong><ShoppingOutlined /> Offered Quantity: </Text>
                                <Text>{response.offered_quantity} {demandDetails?.unit || 'units'}</Text>
                              </div>
                              
                              {/* Display delivery badge */}
                              {response.can_deliver && (
                                <div style={{ marginTop: '4px' }}>
                                  <Tag color="#2d6a4f" icon={<CarOutlined />} style={{ marginRight: '0' }}>
                                    Can Deliver
                                  </Tag>
                                </div>
                              )}
                              
                              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                Submitted: {formatDate(response.created_at)}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )
            ) : (
              <div className="response-details">
                <Button 
                  type="link" 
                  onClick={handleCloseDetails} 
                  style={{ padding: 0, marginBottom: '16px' }}
                >
                  ← Back to responses list
                </Button>
                
                <Descriptions 
                  title="Farmer Response Details" 
                  bordered 
                  column={1}
                  style={{ marginBottom: '16px' }}
                >
                  <Descriptions.Item label="Status">
                    {getStatusTag(selectedResponse.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Farmer">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={getFarmerDetails(selectedResponse.farmer).profileImage}
                        icon={!getFarmerDetails(selectedResponse.farmer).profileImage && <UserOutlined />}
                        style={{ backgroundColor: !getFarmerDetails(selectedResponse.farmer).profileImage ? '#2d6a4f' : 'transparent', marginRight: '8px' }}
                        size="large"
                      />
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{getFarmerDetails(selectedResponse.farmer).name}</span>
                    </div>
                  </Descriptions.Item>
                  {getFarmerDetails(selectedResponse.farmer).location && (
                    <Descriptions.Item label="Location">
                      <span><EnvironmentOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />{getFarmerDetails(selectedResponse.farmer).location}</span>
                    </Descriptions.Item>
                  )}
                  {getFarmerDetails(selectedResponse.farmer).phone && getFarmerDetails(selectedResponse.farmer).phone !== 'No phone provided' && (
                    <Descriptions.Item label="Phone">
                      <a href={`tel:${getFarmerDetails(selectedResponse.farmer).phone}`}>
                        <PhoneOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
                        {getFarmerDetails(selectedResponse.farmer).phone}
                      </a>
                    </Descriptions.Item>
                  )}
                  {getFarmerDetails(selectedResponse.farmer).email && getFarmerDetails(selectedResponse.farmer).email !== 'No email provided' && (
                    <Descriptions.Item label="Email">
                      <a href={`mailto:${getFarmerDetails(selectedResponse.farmer).email}`}>
                        <MailOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
                        {getFarmerDetails(selectedResponse.farmer).email}
                      </a>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Offered Price">
                    {formatPrice(selectedResponse.offered_price)} per {demandDetails?.unit || 'unit'}
                    {parseFloat(selectedResponse.offered_price) < parseFloat(demandDetails?.price_per_unit || 0) && (
                      <Tag color="green" style={{ marginLeft: '8px' }}>Lower than your price</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Offered Quantity">
                    {selectedResponse.offered_quantity} {demandDetails?.unit || 'units'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Delivery">
                    {selectedResponse.can_deliver ? (
                      <Tag color="#2d6a4f" icon={<CarOutlined />}>
                        Farmer Can Deliver This Product
                      </Tag>
                    ) : (
                      <Tag color="default" icon={<InfoCircleOutlined />}>
                        No Delivery Available
                      </Tag>
                    )}
                  </Descriptions.Item>
                  {selectedResponse.notes && (
                    <Descriptions.Item label="Notes from Farmer">
                      {selectedResponse.notes}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Submitted On">
                    {formatDate(selectedResponse.created_at)}
                  </Descriptions.Item>
                </Descriptions>
                
                {selectedResponse.status === 'pending' && (
                  <div style={{ textAlign: 'right' }}>
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        onClick={() => showAcceptConfirmation(selectedResponse.id)}
                        loading={actionLoading}
                        disabled={actionLoading || demandDetails?.status === 'fulfilled'}
                      >
                        Accept This Offer
                      </Button>
                      <Button 
                        danger 
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleRejectResponse(selectedResponse.id)}
                        loading={actionLoading}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </Space>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
      
      {/* Accept Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#52c41a' }} />
            <span>Confirm Deal Creation</span>
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
            onClick={handleAcceptResponse}
            loading={actionLoading}
          >
            Confirm and Create Deal
          </Button>
        ]}
        centered
      >
        <p>You are about to accept this response and create a deal. This will mark the demand as fulfilled and notify the farmer.</p>
        
        {currentResponseId && responses && (
          <div className="response-summary" style={{ 
            backgroundColor: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: '4px', 
            padding: '12px', 
            marginBottom: '16px' 
          }}>
            {(() => {
              const response = responses.find(r => r.id === currentResponseId);
              if (!response) return null;
              
              return (
                <>
                  <div><strong>Price:</strong> {formatPrice(response.offered_price)} per {demandDetails?.unit || 'unit'}</div>
                  <div><strong>Quantity:</strong> {response.offered_quantity} {demandDetails?.unit || 'units'}</div>
                  <div style={{ marginTop: '8px' }}>
                    <strong>Delivery:</strong>{' '}
                    {response.can_deliver ? (
                      <Tag color="#2d6a4f" icon={<CarOutlined />}>
                        Farmer Will Deliver This Product
                      </Tag>
                    ) : (
                      <Tag color="default" icon={<InfoCircleOutlined />}>
                        No Delivery Available - Pickup Required
                      </Tag>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
        
        <p style={{ marginTop: '16px', marginBottom: '8px' }}><strong>Add a message to the farmer (optional):</strong></p>
        <TextArea
          rows={4}
          placeholder="Add any specific instructions, logistics details, or feedback for the farmer..."
          value={buyerMessage}
          onChange={e => setBuyerMessage(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>
      
      {/* Invoice Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PrinterOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#1890ff' }} />
            <span>Deal Invoice</span>
          </div>
        }
        visible={showInvoice}
        onCancel={() => setShowInvoice(false)}
        footer={null}
        width={800}
        centered
      >
        <DealInvoice 
          dealData={acceptedResponse || {}} 
          farmerDetails={acceptedResponse ? getFarmerDetails(acceptedResponse.farmer) : {}}
          demandDetails={demandDetails || {}}
          visible={true}
        />
      </Modal>
    </>
  );
};

export default ResponsesModal; 