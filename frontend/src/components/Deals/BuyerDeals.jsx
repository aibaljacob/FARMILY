import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Tag, 
  Button, 
  Empty, 
  Spin, 
  message, 
  Divider,
  Avatar,
  Badge,
  Space,
  Statistic,
  Descriptions,
  Modal,
  Tooltip,
  Row,
  Col,
  Alert,
} from 'antd';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CarOutlined,
  CheckCircleFilled,
  CarFilled,
  InboxOutlined,
  DeliveredProcedureOutlined,
  CommentOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { showSuccessNotification, showErrorNotification } from '../../utils/notificationConfig';
import './Deals.css';
import DealInvoice from './DealInvoice';
import { ChatModal } from '../Chat';
import RazorpayPayment from '../Payment/RazorpayPayment';

const { Title, Text } = Typography;

const BuyerDeals = () => {
  const [deals, setDeals] = useState([]);
  const [canceledDeals, setCanceledDeals] = useState([]);
  const [completedDeals, setCompletedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [breakDealModalVisible, setBreakDealModalVisible] = useState(false);
  const [acceptBreakDealModalVisible, setAcceptBreakDealModalVisible] = useState(false);
  const [acceptCompleteDealModalVisible, setAcceptCompleteDealModalVisible] = useState(false);
  const [dealToBreak, setDealToBreak] = useState(null);
  const [dealToComplete, setDealToComplete] = useState(null);
  const [selectedChatDeal, setSelectedChatDeal] = useState(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [dealForInvoice, setDealForInvoice] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [farmersData, setFarmersData] = useState({});

  // Category options for mapping category values to display labels
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

  // Category colors for visual distinction
  const categoryColors = {
    rubber: '#f50',
    coconut: '#87d068',
    jackfruit: '#ffd700',
    banana: '#ffa940',
    pepper: '#ff4d4f',
    cardamom: '#722ed1',
    tea: '#13c2c2',
    coffee: '#964b00',
    arecanut: '#faad14',
    cashew: '#d48265',
    ginger: '#ff7a45',
    turmeric: '#ffc53d',
    nutmeg: '#cf1322',
    clove: '#531dab',
    tapioca: '#1890ff',
    mango: '#eb2f96',
    pineapple: '#fadb14',
    others: '#8c8c8c'
  };

  useEffect(() => {
    // Get buyer ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      const currentBuyerId = user.buyer_id || user.id;
      setBuyerId(currentBuyerId);
      
      // Initialize userDetails for invoice
      setUserDetails({
        name: `${user.first_name || ''} ${user.last_name || ''}`,
        location: user.location || '',
        phone: user.phone || '',
        email: user.email || '',
        company: user.company || ''
      });
      
      fetchDeals();
      
      // Set up an interval to refresh deals data every 30 seconds
      const refreshInterval = setInterval(() => {
        fetchDeals();
      }, 30000);
      
      // Clean up interval on component unmount
      return () => clearInterval(refreshInterval);
    } else {
      setLoading(false);
      setError('User information not found. Please log in again.');
    }
  }, []);

  // Format date
  const formatDate = (dateString) => {
    return moment(dateString).format('MMM DD, YYYY - hh:mm A');
  };

  // Format price
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // Format category name
  const getCategoryLabel = (category) => {
    return categoryOptions.find(cat => cat.value === category)?.label || category;
  };

  // Fetch deals (both accepted demand responses and accepted product offers)
  const fetchDeals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch all deals using the new endpoint
      const response = await axios.get('http://127.0.0.1:8000/api/all-deals/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        console.log('All deals data:', response.data);
        
        const { demand_deals, product_deals } = response.data;
        
        // Process demand deals (responses to buyer's demands)
        let formattedDemandDeals = [];
        if (demand_deals && demand_deals.length > 0) {
          // We need to fetch the demands to get full details
          const demandsMap = await fetchDemands(demand_deals.map(deal => deal.demand), token);
          
          // Combine responses with demand details
          formattedDemandDeals = processDeals(demand_deals).map(deal => ({
            ...deal,
            dealType: 'demand',
            demandDetails: demandsMap[deal.demand] || null,
            // Check if there's a completion request from the farmer
            completeRequested: deal.complete_requested || false,
            completeRequestedBy: deal.complete_requested_by || null,
            // Add break request properties
            breakRequested: deal.break_requested || false,
            breakRequestedBy: deal.break_requested_by || null
          })).filter(deal => deal.demandDetails !== null);
          
          // Fetch farmer details for all demand deals
          await fetchFarmersData(formattedDemandDeals.map(deal => deal.farmer), token);
        }
        
        // Process product deals (buyer's accepted offers on products)
        let formattedProductDeals = [];
        if (product_deals && product_deals.length > 0) {
          formattedProductDeals = processDeals(product_deals).map(deal => ({
            ...deal,
            dealType: 'product',
            // Ensure can_deliver is set based on the product's can_deliver field
            can_deliver: deal.product_details?.can_deliver || false,
            // Check if there's a completion request from the farmer
            completeRequested: deal.complete_requested || false,
            completeRequestedBy: deal.complete_requested_by || null,
            // Add break request properties
            breakRequested: deal.break_requested || false,
            breakRequestedBy: deal.break_requested_by || null
          }));
          console.log(formattedProductDeals);
          
          // Fetch additional product details if needed
          // For product deals, the product details are already in product_details
          
          // Make sure we have farmer details for product deals
          const farmerIds = formattedProductDeals.map(deal => 
            deal.product_details?.farmer_id || null
          ).filter(id => id !== null);
      
          if (farmerIds.length > 0) {
            await fetchFarmersData(farmerIds, token);
          }
        }
        
        // Combine both types of deals
        const allDeals = [...formattedDemandDeals, ...formattedProductDeals];
        
        // Sort by created_at date, newest first
        allDeals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        console.log('Formatted all deals:', allDeals);
        // Log break request status for debugging
        allDeals.forEach(deal => {
          console.log(`Deal ID: ${deal.id}, Type: ${deal.dealType}, Break Requested: ${deal.breakRequested}, By: ${deal.breakRequestedBy}`);
        });
        
        setDeals(allDeals);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setError('Failed to load deals. Please try again.');
      showErrorNotification('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  // Process API response to ensure all required properties are set
  const processDeals = (deals) => {
    return deals.map(deal => {
      // Convert snake_case properties to camelCase for consistency
      return {
        ...deal,
        breakRequested: deal.break_requested || false,
        breakRequestedBy: deal.break_requested_by || null,
        completeRequested: deal.complete_requested || false,
        completeRequestedBy: deal.complete_requested_by || null,
      };
    });
  };

  // Fetch all demands for the deals
  const fetchDemands = async (demandIds, token) => {
    try {
      const demandsResponse = await axios.get('http://127.0.0.1:8000/api/demands/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Create a map of demand ID to demand details
      const demandsMap = {};
      if (demandsResponse.data && Array.isArray(demandsResponse.data)) {
        demandsResponse.data.forEach(demand => {
          demandsMap[demand.id] = demand;
        });
      }
      
      return demandsMap;
    } catch (error) {
      console.error('Error fetching demands:', error);
      return {};
    }
  };

  // Fetch details for all farmers involved in deals
  const fetchFarmersData = async (farmerIds, token) => {
    try {
      // Get unique farmer IDs
      const uniqueFarmerIds = [...new Set(farmerIds)];
      
      // Fetch all farmer profiles
      const allFarmersResponse = await axios.get('http://127.0.0.1:8000/api/all-farmer-profiles/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Create a map of farmer IDs to farmer details
      const farmersMap = {};
      console.log(allFarmersResponse.data);
      
      if (allFarmersResponse.data && Array.isArray(allFarmersResponse.data)) {
        // Filter farmers to get only those involved in deals
        const relevantFarmers = allFarmersResponse.data.filter(farmer => 
          uniqueFarmerIds.includes(farmer.user)
        );
        
        relevantFarmers.forEach(farmer => {
          farmersMap[farmer.user] = {
            id: farmer.user,
            name:`${farmer.user_first_name} ${farmer.user_last_name}`,
            profileImage: farmer.profilepic || null,
            location: farmer.location || farmer.address || 'Location not available',
            phone: farmer.phoneno || 'No phone provided',
            email: farmer.email || 'No email provided'
          };
        });
      }
      
      setFarmersData(farmersMap);
      console.log(farmersMap);
    } catch (error) {
      console.error('Error fetching farmers data:', error);
    }
  };
  

  // Get farmer details from the map
  const getFarmerDetails = (farmerId) => {
    return farmersData[farmerId] || {
      id: farmerId,
      name: `Farmer #${farmerId}`,
      profileImage: null,
      location: 'Location not available',
      phone: 'No phone provided',
      email: 'No email provided'
    };
  };

  // Show deal details in modal
  const showDealDetails = (deal) => {
    setSelectedDeal(deal);
    setDetailsModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setDetailsModalVisible(false);
    setTimeout(() => {
      setSelectedDeal(null);
    }, 300);
  };

  // Calculate savings if the offered price is lower than demanded price
  const calculateSavings = (deal) => {
    if (!deal || !deal.demandDetails) return 0;
    
    const demandedPrice = parseFloat(deal.demandDetails.price_per_unit);
    const offeredPrice = parseFloat(deal.offered_price);
    const quantity = parseFloat(deal.offered_quantity);
    
    if (offeredPrice < demandedPrice) {
      return (demandedPrice - offeredPrice) * quantity;
    }
    
    return 0;
  };

  // Calculate the total value of a deal
  const calculateTotalValue = (deal) => {
    if (!deal) return 0;
    return parseFloat(deal.offered_price) * parseFloat(deal.offered_quantity);
  };

  // Handle print invoice button click
  const handlePrintInvoice = (deal) => {
    setDealForInvoice(deal);
    setInvoiceModalVisible(true);
  };

  // Open chat modal for a specific deal
  const handleOpenChat = (deal) => {
    setSelectedChatDeal(deal);
    setChatModalVisible(true);
  };

  // Close chat modal
  const handleCloseChat = () => {
    setChatModalVisible(false);
    setSelectedChatDeal(null);
  };

  // Get card actions for a deal
  const getCardActions = (deal) => {
    const actions = [
      <Button 
        key="viewDetails" 
        type="text"
        size="small"
        icon={<FileTextOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          showDealDetails(deal);
        }}
      >
        Details
      </Button>,
    ];

    // Add chat button
    actions.push(
      <Button 
        key="chat" 
        type="text"
        size="small"
        icon={<CommentOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenChat(deal);
        }}
      >
        Chat
      </Button>
    );
    
    // Add break deal button with red dot indicator for farmer's break requests
    actions.push(
      <Badge dot={deal.breakRequested && deal.breakRequestedBy === 'farmer'} key="breakDealBadge">
        <Button 
          key="breakDeal" 
          type="text"
          size="small"
          danger
          icon={<DisconnectOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            console.log("Break deal button clicked for deal:", deal);
            console.log("Break requested:", deal.breakRequested);
            console.log("Break requested by:", deal.breakRequestedBy);
            showBreakDealModal(deal);
          }}
        >
          {deal.breakRequested && deal.breakRequestedBy === 'farmer' ? 'Respond' : 'Break'}
        </Button>
      </Badge>
    );
    
    // Add complete deal button with red dot indicator for farmer's completion requests
    actions.push(
      <Badge dot={deal.completeRequested && deal.completeRequestedBy === 'farmer'} key="completeDealBadge">
        <Button 
          key="completeDeal" 
          type="text"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            console.log("Complete deal button clicked for deal:", deal);
            console.log("Complete requested:", deal.completeRequested);
            console.log("Complete requested by:", deal.completeRequestedBy);
            showCompleteDealModal(deal);
          }}
        >
          {deal.completeRequested && deal.completeRequestedBy === 'farmer' ? 'Review' : 'Complete'}
        </Button>
      </Badge>
    );

    return actions;
  };

  // Show break deal modal
  const showBreakDealModal = (deal) => {
    console.log("showBreakDealModal called with deal:", deal);
    
    // If there's a pending break request from the farmer, show the accept/decline modal instead
    if (deal.breakRequested && deal.breakRequestedBy === 'farmer') {
      console.log("Deal has break request from farmer, showing accept modal");
      setDealToBreak(deal);
      setAcceptBreakDealModalVisible(true);
    } else {
      // Otherwise show the regular break deal request modal
      console.log("No break request, showing request modal");
      setDealToBreak(deal);
      setBreakDealModalVisible(true);
    }
  };

  // Handle break deal modal close
  const handleBreakDealModalClose = () => {
    setBreakDealModalVisible(false);
    setTimeout(() => {
      setDealToBreak(null);
    }, 300);
  };
  
  // Handle accept break deal modal close
  const handleAcceptBreakDealModalClose = () => {
    setAcceptBreakDealModalVisible(false);
    setTimeout(() => {
      setDealToBreak(null);
    }, 300);
  };

  // Handle accept complete deal modal close
  const handleAcceptCompleteDealModalClose = () => {
    setAcceptCompleteDealModalVisible(false);
    setTimeout(() => {
      setDealToComplete(null);
    }, 300);
  };

  // Request to break a deal
  const requestBreakDeal = async () => {
    if (!dealToBreak) return;

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let endpoint = '';
      
      if (dealToBreak.dealType === 'product') {
        // Product deal
        endpoint = `http://127.0.0.1:8000/api/product-offers/${dealToBreak.id}/request-break/`;
      } else {
        // Demand deal
        endpoint = `http://127.0.0.1:8000/api/demand-responses/${dealToBreak.id}/request-break/`;
      }

      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        showSuccessNotification('Break Request Sent', 'Your request to break the deal has been sent to the farmer. The deal will be broken when they approve.');
        
        // Update the local state to show the deal is pending cancellation
        const updatedDeals = deals.map(d => {
          if (d.id === dealToBreak.id && d.dealType === dealToBreak.dealType) {
            return { ...d, breakRequested: true, breakRequestedBy: 'buyer' };
          }
          return d;
        });
        
        setDeals(updatedDeals);
        handleBreakDealModalClose();
      }
    } catch (error) {
      console.error('Error requesting to break deal:', error);
      showErrorNotification('Failed to send break deal request', 'Please try again.');
    }
  };

  // Handle accepting a break request from farmer
  const acceptBreakDeal = async (deal) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let endpoint = '';
      
      if (deal.dealType === 'product') {
        // Product deal
        endpoint = `http://127.0.0.1:8000/api/product-offers/${deal.id}/accept-break/`;
      } else {
        // Demand deal
        endpoint = `http://127.0.0.1:8000/api/demand-responses/${deal.id}/accept-break/`;
      }

      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        showSuccessNotification('Deal Broken', 'The deal has been successfully broken.');
        
        // Remove the deal from active deals and add to canceled deals
        const updatedDeals = deals.filter(d => !(d.id === deal.id && d.dealType === deal.dealType));
        setDeals(updatedDeals);
        
        // Add to canceled deals
        setCanceledDeals([...canceledDeals, {...deal, canceledAt: new Date().toISOString()}]);
      }
    } catch (error) {
      console.error('Error accepting break deal request:', error);
      showErrorNotification('Failed to accept break deal request', 'Please try again.');
    }
  };

  // Handle declining a break request from farmer
  const declineBreakDeal = async () => {
    if (!dealToBreak) return;
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let endpoint = '';
      
      if (dealToBreak.dealType === 'product') {
        // Product deal
        endpoint = `http://127.0.0.1:8000/api/product-offers/${dealToBreak.id}/`;
      } else {
        // Demand deal
        endpoint = `http://127.0.0.1:8000/api/demand-responses/${dealToBreak.id}/`;
      }

      // Update the deal in the database to remove the break request flag
      const response = await axios.put(endpoint, {
        break_requested: false,
        break_requested_by: null
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        showSuccessNotification('Break Request Declined', 'You have declined the request to break this deal. The deal remains active.');
        
        // Update the local state to remove the break request
        const updatedDeals = deals.map(d => {
          if (d.id === dealToBreak.id && d.dealType === dealToBreak.dealType) {
            return { ...d, breakRequested: false, breakRequestedBy: null };
          }
          return d;
        });
        
        setDeals(updatedDeals);
        handleAcceptBreakDealModalClose();
      }
    } catch (error) {
      console.error('Error declining break deal request:', error);
      showErrorNotification('Action Failed', 'Failed to decline break deal request. Please try again.');
    }
  };

  // Handle declining a completion request
  const declineCompleteDeal = async () => {
    if (!dealToComplete) return;
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let endpoint = '';
      
      if (dealToComplete.dealType === 'product') {
        // Product deal
        endpoint = `http://127.0.0.1:8000/api/product-offers/${dealToComplete.id}/`;
      } else {
        // Demand deal
        endpoint = `http://127.0.0.1:8000/api/demand-responses/${dealToComplete.id}/`;
      }

      // Update the deal in the database to remove the completion request flag
      const response = await axios.put(endpoint, {
        complete_requested: false,
        complete_requested_by: null
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        showSuccessNotification('Completion Request Declined', 'You have declined the request to mark this deal as complete. The deal remains in progress.');
        
        // Update the local state to remove the completion request
        const updatedDeals = deals.map(d => {
          if (d.id === dealToComplete.id && d.dealType === dealToComplete.dealType) {
            return { ...d, completeRequested: false, completeRequestedBy: null };
          }
          return d;
        });
        
        setDeals(updatedDeals);
        handleAcceptCompleteDealModalClose();
      }
    } catch (error) {
      console.error('Error declining completion request:', error);
      showErrorNotification('Action Failed', 'Failed to decline completion request. Please try again.');
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (dealId) => {
    console.log('Payment successful for deal ID:', dealId);
    // Refresh the deals data to show updated payment status
    fetchDeals();
    
    // Show success message
    showSuccessNotification('Payment Completed', 'Payment completed successfully!');
  };

  // Show complete deal modal
  const showCompleteDealModal = (deal) => {
    console.log("showCompleteDealModal called with deal:", deal);
    
    // If there's a pending completion request from the farmer, show the accept/decline modal instead
    if (deal.completeRequested && deal.completeRequestedBy === 'farmer') {
      console.log("Deal has completion request from farmer, showing accept modal");
      setDealToComplete(deal);
      setAcceptCompleteDealModalVisible(true);
    } else {
      // Otherwise show a message that only farmers can request completion
      showErrorNotification('Completion Requests', 'Only farmers can request to mark a deal as complete. Please wait for the farmer to initiate this action.');
    }
  };

  // Handle complete deal modal close
  const handleCompleteDealModalClose = () => {
    setCompleteDealModalVisible(false);
    // Clear the selected deal after a short delay to prevent UI flicker
    setTimeout(() => {
      setDealToComplete(null);
    }, 300);
  };

  // Accept completion request from farmer
  const acceptCompleteDeal = async (deal) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let endpoint = '';
      
      if (deal.dealType === 'product') {
        // Product deal
        endpoint = `http://127.0.0.1:8000/api/product-offers/${deal.id}/accept-complete/`;
      } else {
        // Demand deal
        endpoint = `http://127.0.0.1:8000/api/demand-responses/${deal.id}/accept-complete/`;
      }

      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        showSuccessNotification('Deal Completed', 'The deal has been successfully marked as complete.');
        
        // Remove the deal from active deals and add to completed deals
        const updatedDeals = deals.filter(d => !(d.id === deal.id && d.dealType === deal.dealType));
        setDeals(updatedDeals);
        
        // Add to completed deals
        setCompletedDeals([...completedDeals, {...deal, completedAt: new Date().toISOString()}]);
      }
    } catch (error) {
      console.error('Error accepting completion request:', error);
      showErrorNotification('Action Failed', 'Failed to accept completion request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="deals-page">
        <div className="page-header">
          <Title level={3}>
            <CheckCircleOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
            My Deals
          </Title>
          <Text type="secondary">View and manage the deals formed from your accepted demands</Text>
        </div>
        <div className="loading-container">
          <Spin size="large" />
          <Text style={{ marginTop: '16px' }}>Loading your deals...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="deals-page">
      <div className="page-header">
        <div>
          <Title level={3}>
            <CheckCircleOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
            My Deals
          </Title>
          <Text type="secondary">View and manage deals from your accepted demands and product offers</Text>
        </div>
      </div>

      {deals.length === 0 && canceledDeals.length === 0 && completedDeals.length === 0 ? (
        <Empty 
          description={
            <span>
              No deals found. Deals are created when farmers accept your product offers 
              or when you accept farmer responses to your demands.
            </span>
          } 
          className="empty-state"
        />
      ) : (
        <>
          {/* Hosted Deals Section - Deals where the buyer created the demand */}
          <div className="deals-section">
            <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
              <ShoppingOutlined style={{ marginRight: '8px' }} />
              Hosted Deals
              <Text type="secondary" style={{ fontSize: '16px', marginLeft: '12px', fontWeight: 'normal' }}>
                (Deals from your posted demands)
              </Text>
            </Title>
            
            {deals.filter(deal => deal.dealType === 'demand').length === 0 ? (
              <Empty 
                description="No hosted deals found. These are created when farmers accept your demands."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '24px 0' }}
              />
            ) : (
              <List
                grid={{ 
                  gutter: [24, 24], 
                  xs: 1, 
                  sm: 1, 
                  md: 2, 
                  lg: 3, 
                  xl: 3,
                  xxl: 4
                }}
                dataSource={deals.filter(deal => deal.dealType === 'demand')}
                renderItem={deal => {
                  // Get category and calculate values based on deal type
                  const category = deal.demandDetails?.category || 'others';
                  const savings = calculateSavings(deal);
                  const totalValue = calculateTotalValue(deal);
                  const quantity = deal.offered_quantity;
                  const unit = deal.demandDetails?.unit || 'kg';
                  const price = deal.offered_price;
                  const title = deal.demandDetails?.title || 'Untitled Demand';
                  const farmer = getFarmerDetails(deal.farmer);
                  console.log(deal);
                  return (
                    <List.Item 
                      key={`${deal.dealType}-${deal.id}`}
                    >
                      <Card 
                        className="deal-card"
                        hoverable
                        actions={getCardActions(deal)}
                      >
                        <div className="deal-card-header" style={{ 
                          backgroundColor: categoryColors[category] || '#2d6a4f',
                          padding: '12px 16px',
                          borderRadius: '4px 4px 0 0'
                        }}>
                          <Tag color="white" style={{ color: categoryColors[category] || '#2d6a4f' }} className="deal-category">
                            {getCategoryLabel(category)}
                          </Tag>
                        </div>
                        
                        <div className="deal-content" style={{ padding: '16px' }}>
                          <div className="deal-date" style={{ 
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <CalendarOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>{formatDate(deal.created_at)}</Text>
                          </div>
                          
                          <div className="deal-card-farmer" style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px',
                            backgroundColor: '#f9f9f9',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Avatar 
                              size={45} 
                              src={`http://127.0.0.1:8000/${farmer?.profileImage}`}
                              icon={<UserOutlined />}
                              style={{ 
                                backgroundColor: !farmer?.profileImage ? '#2d6a4f' : undefined,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <div className="farmer-info" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
                              <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {farmer?.name || 'Unknown Farmer'}
                              </Text>
                              {farmer?.location && (
                                <Text type="secondary" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <EnvironmentOutlined style={{marginRight: '4px', color: '#8c8c8c' }} />
                                  {farmer.location}
                                </Text>
                              )}
                            </div>
                          </div>
                          
                          <Divider style={{ margin: '12px 0', backgroundColor: '#f0f0f0' }} />
                          
                          <div className="deal-card-details" style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}>
                            <div className="deal-stat" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>
                                <DollarOutlined style={{ color: '#8c8c8c', marginRight: '5px' }} /> Price:
                              </Text>
                              <Text strong>{formatPrice(price)} per {unit}</Text>
                            </div>
                            
                            <div className="deal-stat" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>
                                <ShoppingOutlined style={{ color: '#8c8c8c', marginRight: '5px' }} /> Quantity:
                              </Text>
                              <Text strong>{quantity} {unit}</Text>
                            </div>
                            
                            <div className="deal-stat" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>
                                <DollarOutlined style={{ color: '#8c8c8c', marginRight: '5px' }} /> Payment:
                              </Text>
                              {deal.is_paid ? (
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                  Payment Completed
                                </Tag>
                              ) : (
                                <Tag icon={<CloseCircleOutlined />} color="warning">
                                  Payment Required
                                </Tag>
                              )}
                            </div>
                            
                            {/* Display delivery status */}
                            <div className="deal-stat" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>
                                <CarOutlined style={{ color: '#8c8c8c', marginRight: '5px' }} /> Delivery:
                              </Text>
                              {deal.can_deliver ? (
                                <div className="delivery-status-container">
                                  <Tag color="#2d6a4f" icon={<CarOutlined />} className="delivery-status-tag">
                                    Available
                                  </Tag>
                                  {deal.deliveryStatus && (
                                    <Tag 
                                      className="delivery-status-tag"
                                      color={
                                        deal.deliveryStatus === 'ready' ? 'blue' : 
                                        deal.deliveryStatus === 'out_for_delivery' ? 'orange' : 
                                        deal.deliveryStatus === 'delivered' ? 'green' : 'default'
                                      }
                                      icon={
                                        deal.deliveryStatus === 'ready' ? <CheckCircleFilled /> : 
                                        deal.deliveryStatus === 'out_for_delivery' ? <CarFilled /> : 
                                        deal.deliveryStatus === 'delivered' ? <DeliveredProcedureOutlined /> : <InboxOutlined />
                                      }
                                    >
                                      {deal.deliveryStatus.replace('_', ' ').toUpperCase()}
                                    </Tag>
                                  )}
                                </div>
                              ) : (
                                <Tag color="default">Pickup Only</Tag>
                              )}
                            </div>
                            
                            <div className="deal-total" style={{
                              marginTop: '8px',
                              padding: '10px',
                              backgroundColor: '#f6ffed',
                              borderRadius: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderLeft: '3px solid #52c41a'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>Deal Total:</Text>
                              <Text strong className="total-value" style={{ 
                                fontSize: '16px', 
                                color: '#2d6a4f'
                              }}>{formatPrice(totalValue)}</Text>
                            </div>
                            
                            {savings > 0 && (
                              <div className="deal-savings" style={{
                                marginTop: '8px',
                                padding: '8px 10px',
                                backgroundColor: '#e6f7ff',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: '3px solid #1890ff'
                              }}>
                                <Text type="secondary" style={{ fontSize: '14px' }}>Your Savings:</Text>
                                <Text type="success" strong style={{ fontSize: '15px' }}>{formatPrice(savings)}</Text>
                              </div>
                            )}
                          </div>
                          
                          {!deal.is_paid && (
                            <div className="deal-actions" style={{ marginTop: '16px' }}>
                              <RazorpayPayment 
                                dealAmount={deal.final_price || deal.offered_price}
                                dealId={deal.id}
                                farmerName={getFarmerDetails(deal.farmer).name}
                                onPaymentSuccess={() => handlePaymentSuccess(deal.id)}
                                dealType="demand"
                              />
                            </div>
                          )}

                          {deal.is_paid && (
                            <div className="payment-status" style={{ marginTop: '16px' }}>
                              <Tag icon={<CheckCircleOutlined />} color="success" style={{ padding: '5px 10px', fontSize: '14px' }}>
                                Payment Completed
                              </Tag>
                            </div>
                          )}
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            )}
          </div>

          {/* Other Deals Section - Deals where the buyer offered on products */}
          <div className="deals-section">
            <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>
              <ShoppingOutlined style={{ marginRight: '8px' }} />
              Other Deals
              <Text type="secondary" style={{ fontSize: '16px', marginLeft: '12px', fontWeight: 'normal' }}>
                (Deals from your offers on products)
              </Text>
            </Title>
            
            {deals.filter(deal => deal.dealType === 'product').length === 0 ? (
              <Empty 
                description="No other deals found. These are created when your offers on products are accepted."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '24px 0' }}
              />
            ) : (
              <List
                grid={{ 
                  gutter: [24, 24], 
                  xs: 1, 
                  sm: 1, 
                  md: 2, 
                  lg: 3, 
                  xl: 3,
                  xxl: 4
                }}
                dataSource={deals.filter(deal => deal.dealType === 'product')}
                renderItem={deal => {
                  // Get category and calculate values for product deals
                  const category = deal.product_details?.category || 'others';
                  const savings = 0; // No savings calculation for product offers
                  const totalValue = parseFloat(deal.offered_price) * parseFloat(deal.quantity);
                  const quantity = deal.quantity;
                  const unit = deal.product_details?.unit || 'kg';
                  const price = deal.offered_price;
                  const title = deal.product_details?.name || 'Untitled Product';
                  const farmer = getFarmerDetails(deal.product_details?.farmer_id);
                  console.log(farmer);

                  return (
                    <List.Item 
                      key={`${deal.dealType}-${deal.id}`}
                    >
                      <Card 
                        className="deal-card"
                        hoverable
                        actions={getCardActions(deal)}
                      >
                        <div className="deal-card-header" style={{ 
                          backgroundColor: categoryColors[category] || '#2d6a4f',
                          padding: '12px 16px',
                          borderRadius: '4px 4px 0 0'
                        }}>
                          <Tag color="white" style={{ color: categoryColors[category] || '#2d6a4f' }} className="deal-category">
                            {getCategoryLabel(category)}
                          </Tag>
                        </div>
                        
                        <div className="deal-content" style={{ padding: '16px' }}>
                          <div className="deal-date" style={{ 
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <CalendarOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>{formatDate(deal.created_at)}</Text>
                          </div>
                          
                          <div className="deal-card-farmer" style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px',
                            backgroundColor: '#f9f9f9',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Avatar 
                              size={45} 
                              src={`http://127.0.0.1:8000/${farmer?.profileImage}`}
                              icon={<UserOutlined />}
                              style={{ 
                                backgroundColor: !farmer?.profileImage ? '#2d6a4f' : undefined,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <div className="farmer-info" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
                              <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {farmer?.name || 'Unknown Farmer'}
                              </Text>
                              {farmer?.location && (
                                <Text type="secondary" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <EnvironmentOutlined style={{marginRight: '4px', color: '#8c8c8c' }} />
                                  {farmer.location}
                                </Text>
                              )}
                            </div>
                          </div>
                          
                          <Divider style={{ margin: '12px 0', backgroundColor: '#f0f0f0' }} />
                          
                          <div className="deal-card-details" style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}>
                            <div className="deal-stat" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>
                                <DollarOutlined style={{ color: '#8c8c8c', marginRight: '5px' }} /> Price:
                              </Text>
                              <Text strong>{formatPrice(price)} per {unit}</Text>
                            </div>
                            
                            <div className="deal-stat" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>
                                <ShoppingOutlined style={{ color: '#8c8c8c', marginRight: '5px' }} /> Quantity:
                              </Text>
                              <Text strong>{quantity} {unit}</Text>
                            </div>
                            
                            <div className="deal-stat" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>
                                <DollarOutlined style={{ color: '#8c8c8c', marginRight: '5px' }} /> Payment:
                              </Text>
                              {deal.is_paid ? (
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                  Payment Completed
                                </Tag>
                              ) : (
                                <Tag icon={<CloseCircleOutlined />} color="warning">
                                  Payment Required
                                </Tag>
                              )}
                            </div>
                            
                            {/* Display delivery status */}
                            <div className="deal-stat" style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>
                                <CarOutlined style={{ color: '#8c8c8c', marginRight: '5px' }} /> Delivery:
                              </Text>
                              {deal.can_deliver ? (
                                <div className="delivery-status-container">
                                  <Tag color="#2d6a4f" icon={<CarOutlined />} className="delivery-status-tag">
                                    Available
                                  </Tag>
                                  {deal.deliveryStatus && (
                                    <Tag 
                                      className="delivery-status-tag"
                                      color={
                                        deal.deliveryStatus === 'ready' ? 'blue' : 
                                        deal.deliveryStatus === 'out_for_delivery' ? 'orange' : 
                                        deal.deliveryStatus === 'delivered' ? 'green' : 'default'
                                      }
                                      icon={
                                        deal.deliveryStatus === 'ready' ? <CheckCircleFilled /> : 
                                        deal.deliveryStatus === 'out_for_delivery' ? <CarFilled /> : 
                                        deal.deliveryStatus === 'delivered' ? <DeliveredProcedureOutlined /> : <InboxOutlined />
                                      }
                                    >
                                      {deal.deliveryStatus.replace('_', ' ').toUpperCase()}
                                    </Tag>
                                  )}
                                </div>
                              ) : (
                                <Tag color="default">Pickup Only</Tag>
                              )}
                            </div>
                            
                            <div className="deal-total" style={{
                              marginTop: '8px',
                              padding: '10px',
                              backgroundColor: '#f6ffed',
                              borderRadius: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderLeft: '3px solid #52c41a'
                            }}>
                              <Text type="secondary" style={{ fontSize: '14px' }}>Deal Total:</Text>
                              <Text strong className="total-value" style={{ 
                                fontSize: '16px', 
                                color: '#2d6a4f'
                              }}>{formatPrice(totalValue)}</Text>
                            </div>
                          </div>
                          
                          {!deal.is_paid && (
                            <div className="deal-actions" style={{ marginTop: '16px' }}>
                              <RazorpayPayment 
                                dealAmount={deal.final_price || deal.offered_price}
                                dealId={deal.id}
                                farmerName={getFarmerDetails(deal.product_details?.farmer_id).name}
                                onPaymentSuccess={() => handlePaymentSuccess(deal.id)}
                                dealType="product"
                              />
                            </div>
                          )}

                          {deal.is_paid && (
                            <div className="payment-status" style={{ marginTop: '16px' }}>
                              <Tag icon={<CheckCircleOutlined />} color="success" style={{ padding: '5px 10px', fontSize: '14px' }}>
                                Payment Completed
                              </Tag>
                            </div>
                          )}
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            )}
          </div>

          {/* Canceled Deals Section */}
          {canceledDeals.length > 0 && (
            <div className="deals-section">
              <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>
                <CloseCircleOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                Canceled Deals
              </Title>
              
              <List
                grid={{ 
                  gutter: [24, 24], 
                  xs: 1, 
                  sm: 1, 
                  md: 2, 
                  lg: 3, 
                  xl: 3,
                  xxl: 4
                }}
                dataSource={canceledDeals}
                renderItem={deal => {
                  // Get category based on deal type
                  const category = deal.dealType === 'demand' 
                    ? deal.demandDetails?.category || 'others'
                    : deal.product_details?.category || 'others';
                  
                  // Get farmer info
                  const farmerInfo = getFarmerDetails(
                    deal.dealType === 'demand' 
                      ? deal.farmer
                      : deal.product_details?.farmer_id
                  );

                  return (
                    <List.Item key={`canceled-${deal.dealType}-${deal.id}`}>
                      <Card 
                        className="deal-card canceled-deal"
                        style={{ opacity: 0.7 }}
                      >
                        <div className="deal-card-header" style={{ 
                          backgroundColor: '#f5f5f5',
                          padding: '12px 16px',
                          borderRadius: '4px 4px 0 0'
                        }}>
                          <Tag color={categoryColors[category] || '#2d6a4f'} className="deal-category">
                            {getCategoryLabel(category)}
                          </Tag>
                          <Tag color="error" style={{ marginLeft: '8px' }}>
                            <CloseCircleOutlined /> Canceled
                          </Tag>
                        </div>
                        
                        <div className="deal-content" style={{ padding: '16px' }}>
                          <div className="deal-date" style={{ 
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <CalendarOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              Canceled on: {formatDate(deal.canceledAt)}
                            </Text>
                          </div>
                          
                          <div className="deal-card-farmer" style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px',
                            backgroundColor: '#f9f9f9',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Avatar 
                              size={45} 
                              src={`http://127.0.0.1:8000/${farmerInfo?.profileImage}`}
                              icon={<UserOutlined />}
                              style={{ 
                                backgroundColor: !farmerInfo?.profileImage ? '#2d6a4f' : undefined,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <div className="farmer-info" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
                              <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {farmerInfo?.name || 'Unknown Farmer'}
                              </Text>
                            </div>
                          </div>
                          
                          <Text type="secondary">
                            This deal has been canceled by mutual agreement.
                          </Text>
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </div>
          )}
          
          {/* Completed Deals Section */}
          {completedDeals.length > 0 && (
            <div className="deals-section">
              <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>
                <CheckCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                Completed Deals
              </Title>
              
              <List
                grid={{ 
                  gutter: [24, 24], 
                  xs: 1, 
                  sm: 1, 
                  md: 2, 
                  lg: 3, 
                  xl: 3,
                  xxl: 4
                }}
                dataSource={completedDeals}
                renderItem={deal => {
                  // Get category based on deal type
                  const category = deal.dealType === 'demand' 
                    ? deal.demandDetails?.category || 'others'
                    : deal.product_details?.category || 'others';
                  
                  // Get farmer info
                  const farmerInfo = getFarmerDetails(
                    deal.dealType === 'demand' 
                      ? deal.farmer
                      : deal.product_details?.farmer_id
                  );

                  return (
                    <List.Item key={`completed-${deal.dealType}-${deal.id}`}>
                      <Card 
                        className="deal-card completed-deal"
                        style={{ opacity: 0.7 }}
                      >
                        <div className="deal-card-header" style={{ 
                          backgroundColor: '#f5f5f5',
                          padding: '12px 16px',
                          borderRadius: '4px 4px 0 0'
                        }}>
                          <Tag color={categoryColors[category] || '#2d6a4f'} className="deal-category">
                            {getCategoryLabel(category)}
                          </Tag>
                          <Tag color="success" style={{ marginLeft: '8px' }}>
                            <CheckCircleOutlined /> Completed
                          </Tag>
                        </div>
                        
                        <div className="deal-content" style={{ padding: '16px' }}>
                          <div className="deal-date" style={{ 
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <CalendarOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              Completed on: {formatDate(deal.completedAt)}
                            </Text>
                          </div>
                          
                          <div className="deal-card-farmer" style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px',
                            backgroundColor: '#f9f9f9',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #f0f0f0'
                          }}>
                            <Avatar 
                              size={45} 
                              src={`http://127.0.0.1:8000/${farmerInfo?.profileImage}`}
                              icon={<UserOutlined />}
                              style={{ 
                                backgroundColor: !farmerInfo?.profileImage ? '#2d6a4f' : undefined,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <div className="farmer-info" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
                              <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {farmerInfo?.name || 'Unknown Farmer'}
                              </Text>
                            </div>
                          </div>
                          
                          <Text type="secondary">
                            This deal has been successfully completed.
                          </Text>
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </div>
          )}
        </>
      )}
      
      {/* Deal Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#1890ff' }} />
            <span>Deal Details</span>
          </div>
        }
        visible={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          selectedDeal && (
            <Button
              key="chat"
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => {
                setSelectedChatDeal(selectedDeal);
                setChatModalVisible(true);
                setDetailsModalVisible(false);
              }}
            >
              Chat with Farmer
            </Button>
          )
        ]}
        width={800}
      >
        {selectedDeal && (
          <div className="deal-details">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card title="Deal Information" className="details-card">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Deal Type">
                      <Tag color={selectedDeal.dealType === 'demand' ? '#722ed1' : '#1890ff'}>
                        {selectedDeal.dealType === 'demand' ? 'Demand Response' : 'Product Offer'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Category">
                      <Tag color={categoryColors[selectedDeal.dealType === 'demand' ? selectedDeal.demandDetails?.category || 'others' : selectedDeal.product_details?.category || 'others']}>
                        {getCategoryLabel(selectedDeal.dealType === 'demand' ? selectedDeal.demandDetails?.category || 'others' : selectedDeal.product_details?.category || 'others')}
                      </Tag>
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="Status">
                      <Tag color={
                        selectedDeal.status === 'accepted' ? 'green' :
                        selectedDeal.status === 'pending' ? 'orange' :
                        selectedDeal.status === 'completed' ? 'blue' :
                        selectedDeal.status === 'rejected' ? 'red' :
                        'default'
                      }>
                        {selectedDeal.status.charAt(0).toUpperCase() + selectedDeal.status.slice(1)}
                      </Tag>
                    </Descriptions.Item> */}
                    <Descriptions.Item label="Date Created">
                      {formatDate(selectedDeal.created_at)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Quantity">
                      {selectedDeal.dealType === 'demand' ? selectedDeal.offered_quantity : selectedDeal.quantity} {selectedDeal.dealType === 'demand' ? selectedDeal.demandDetails?.unit : selectedDeal.product_details?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Price">
                      ₹{selectedDeal.dealType === 'demand' ? selectedDeal.offered_price : selectedDeal.price} per {selectedDeal.dealType === 'demand' ? selectedDeal.demandDetails?.unit : selectedDeal.product_details?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Value">
                      <Text strong style={{ color: '#2d6a4f' }}>
                        ₹{(selectedDeal.dealType === 'demand' 
                          ? (parseFloat(selectedDeal.offered_price) * parseFloat(selectedDeal.offered_quantity))
                          : (parseFloat(selectedDeal.price) * parseFloat(selectedDeal.quantity))
                        ).toFixed(2)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Status">
                      {selectedDeal.is_paid ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          Payment Completed
                        </Tag>
                      ) : (
                        <Tag icon={<CloseCircleOutlined />} color="warning">
                          Payment Required
                        </Tag>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Farmer Information" className="details-card">
                  <div className="farmer-profile">
                    <Avatar 
                      size={64} 
                      src={getFarmerDetails(selectedDeal.dealType === 'demand' ? selectedDeal.farmer : selectedDeal.product_details?.farmer_id).profileImage ? `http://127.0.0.1:8000/${getFarmerDetails(selectedDeal.dealType === 'demand' ? selectedDeal.farmer : selectedDeal.product_details?.farmer_id).profileImage}` : null}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#2d6a4f' }}
                    />
                    <div className="farmer-info">
                      <Text strong style={{ fontSize: '16px' }}>
                        {getFarmerDetails(selectedDeal.dealType === 'demand' ? selectedDeal.farmer : selectedDeal.product_details?.farmer_id).name}
                      </Text>
                      <Space>
                        <PhoneOutlined />
                        <Text>{getFarmerDetails(selectedDeal.dealType === 'demand' ? selectedDeal.farmer : selectedDeal.product_details?.farmer_id).phone}</Text>
                      </Space>
                      <Space>
                        <MailOutlined />
                        <Text>{getFarmerDetails(selectedDeal.dealType === 'demand' ? selectedDeal.farmer : selectedDeal.product_details?.farmer_id).email}</Text>
                      </Space>
                      <Space>
                        <EnvironmentOutlined />
                        <Text>{getFarmerDetails(selectedDeal.dealType === 'demand' ? selectedDeal.farmer : selectedDeal.product_details?.farmer_id).location}</Text>
                      </Space>
                    </div>
                  </div>
                </Card>
                
                {selectedDeal.status === 'accepted' && (
                  <Card title="Actions" className="details-card" style={{ marginTop: '16px' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        type="primary" 
                        icon={<PrinterOutlined />} 
                        block
                        onClick={() => {
                          setDealForInvoice(selectedDeal);
                          setInvoiceModalVisible(true);
                          setDetailsModalVisible(false);
                        }}
                      >
                        Generate Invoice
                      </Button>
                      
                      {selectedDeal && !selectedDeal.breakRequested && (
                        <Button 
                          type="danger" 
                          icon={<DisconnectOutlined />} 
                          block
                          onClick={() => {
                            console.log("Request to break deal button clicked");
                            setDealToBreak(selectedDeal);
                            setBreakDealModalVisible(true);
                            setDetailsModalVisible(false);
                          }}
                        >
                          Request to Break Deal
                        </Button>
                      )}
                      
                      {selectedDeal && selectedDeal.breakRequested && selectedDeal.breakRequestedBy === 'farmer' && (
                        <Button 
                          type="danger" 
                          icon={<DisconnectOutlined />} 
                          block
                          onClick={() => {
                            console.log("Respond to break request button clicked");
                            console.log("Selected deal:", selectedDeal);
                            setDealToBreak(selectedDeal);
                            setAcceptBreakDealModalVisible(true);
                            setDetailsModalVisible(false);
                          }}
                        >
                          Respond to Break Request
                        </Button>
                      )}
                      
                      {selectedDeal && selectedDeal.breakRequested && selectedDeal.breakRequestedBy === 'buyer' && (
                        <Button 
                          disabled 
                          block
                          icon={<ClockCircleOutlined />}
                        >
                          Break Request Pending
                        </Button>
                      )}
                      
                      {selectedDeal.completeRequested && selectedDeal.completeRequestedBy === 'farmer' && (
                        <Button 
                          type="primary" 
                          icon={<CheckCircleOutlined />} 
                          block
                          onClick={() => {
                            acceptCompleteDeal(selectedDeal);
                            setDetailsModalVisible(false);
                          }}
                        >
                          Accept Completion Request
                        </Button>
                      )}
                    </Space>
                  </Card>
                )}
              </Col>
            </Row>
            
            <Divider orientation="left">Deal Details</Divider>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card title="Product Information" className="details-card">
                  <Descriptions column={1} bordered size="small">
                    {selectedDeal.dealType === 'demand' ? (
                      <>
                        <Descriptions.Item label="Demand Title">
                          {selectedDeal.demandDetails?.title || 'Untitled Demand'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Description">
                          {selectedDeal.demandDetails?.description || 'No description provided'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Quantity Needed">
                          {selectedDeal.demandDetails?.quantity} {selectedDeal.demandDetails?.unit}
                        </Descriptions.Item>
                        <Descriptions.Item label="Budget">
                          ₹{selectedDeal.demandDetails?.price_per_unit || selectedDeal.demandDetails?.budget} per {selectedDeal.demandDetails?.unit}
                        </Descriptions.Item>
                      </>
                    ) : (
                      <>
                        <Descriptions.Item label="Product Name">
                          {selectedDeal.product_details?.name || 'Unnamed Product'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Description">
                          {selectedDeal.product_details?.description || 'No description provided'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Available Quantity">
                          {selectedDeal.product_details?.quantity} {selectedDeal.product_details?.unit}
                        </Descriptions.Item>
                        <Descriptions.Item label="Price">
                          ₹{selectedDeal.product_details?.price} per {selectedDeal.product_details?.unit}
                        </Descriptions.Item>
                      </>
                    )}
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Delivery Information" className="details-card">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Delivery Status">
                      <Tag color={
                        selectedDeal.delivery_status === 'pending' ? 'orange' :
                        selectedDeal.delivery_status === 'in_transit' ? 'blue' :
                        selectedDeal.delivery_status === 'delivered' ? 'green' :
                        'default'
                      }>
                        {selectedDeal.delivery_status ? selectedDeal.delivery_status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Not Started'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Delivery Address">
                      {userDetails?.address || (userDetails?.city && userDetails?.state ? `${userDetails.city}, ${userDetails.state}` : 'Address not provided')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Expected Delivery">
                      {selectedDeal.expected_delivery ? formatDate(selectedDeal.expected_delivery) : 'To be confirmed'}
                    </Descriptions.Item>
                    {selectedDeal.delivery_notes && (
                      <Descriptions.Item label="Delivery Notes">
                        {selectedDeal.delivery_notes}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            </Row>
            
            {(selectedDeal.notes || selectedDeal.farmer_message || selectedDeal.buyer_message) && (
              <>
                <Divider orientation="left">Messages</Divider>
                <Card className="details-card">
                  {selectedDeal.notes && (
                    <div className="message-item">
                      <Text strong>Notes:</Text>
                      <div className="message-content">
                        {selectedDeal.notes}
                      </div>
                    </div>
                  )}
                  
                  {selectedDeal.farmer_message && (
                    <div className="message-item">
                      <Text strong>Message from Farmer:</Text>
                      <div className="message-content">
                        {selectedDeal.farmer_message}
                      </div>
                    </div>
                  )}
                  
                  {selectedDeal.buyer_message && (
                    <div className="message-item">
                      <Text strong>Your Message:</Text>
                      <div className="message-content">
                        {selectedDeal.buyer_message}
                      </div>
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        )}
      </Modal>
      
      {/* Chat Modal */}
      {selectedChatDeal && (
        <ChatModal
          visible={chatModalVisible}
          onClose={() => setChatModalVisible(false)}
          recipientId={selectedChatDeal.dealType === 'demand' ? selectedChatDeal.farmer : selectedChatDeal.product_details?.farmer_id}
          recipientName={getFarmerDetails(selectedChatDeal.dealType === 'demand' ? selectedChatDeal.farmer : selectedChatDeal.product_details?.farmer_id).name}
          dealId={selectedChatDeal.id}
          dealType={selectedChatDeal.dealType}
        />
      )}
      
      {/* Break Deal Modal */}
      <Modal
        title={
          <Space>
            <DisconnectOutlined style={{ color: '#ff4d4f' }} />
            <span>Break Deal</span>
          </Space>
        }
        visible={breakDealModalVisible}
        onCancel={handleBreakDealModalClose}
        footer={[
          <Button key="back" onClick={handleBreakDealModalClose}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger
            onClick={requestBreakDeal}
          >
            Request to Break Deal
          </Button>
        ]}
        width={500}
      >
        {dealToBreak && (
          <div className="break-deal-modal">
            <div className="warning-icon" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            </div>
            
            <Alert
              message="Warning: Breaking a Deal"
              description="Breaking a deal should only be done in exceptional circumstances. This action requires approval from the farmer and may affect your reputation on the platform."
              type="warning"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            
            <div className="deal-summary" style={{ marginBottom: '20px' }}>
              <Title level={5}>Deal Summary</Title>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Deal Type">
                  {dealToBreak.dealType === 'demand' ? 'Demand Response' : 'Product Offer'}
                </Descriptions.Item>
                <Descriptions.Item label="Product">
                  <Tag color={categoryColors[dealToBreak.dealType === 'demand' ? dealToBreak.demandDetails?.category || 'others' : dealToBreak.product_details?.category || 'others']}>
                    {getCategoryLabel(dealToBreak.dealType === 'demand' ? dealToBreak.demandDetails?.category || 'others' : dealToBreak.product_details?.category || 'others')}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Farmer">
                  {getFarmerDetails(dealToBreak.dealType === 'demand' ? dealToBreak.farmer : dealToBreak.product_details?.farmer_id).name}
                </Descriptions.Item>
                <Descriptions.Item label="Deal Date">
                  {formatDate(dealToBreak.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>
            
            <Text>
              Are you sure you want to request to break this deal? This will send a notification to the farmer. The deal will only be broken if they approve.
            </Text>
          </div>
        )}
      </Modal>
      
      {/* Accept Break Deal Modal */}
      <Modal
        title={
          <Space>
            <DisconnectOutlined style={{ color: '#ff4d4f' }} />
            <span>Break Deal Request</span>
          </Space>
        }
        visible={acceptBreakDealModalVisible}
        onCancel={handleAcceptBreakDealModalClose}
        footer={[
          <Button 
            key="decline" 
            onClick={declineBreakDeal}
          >
            Decline Request
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger
            onClick={() => {
              if (dealToBreak) {
                acceptBreakDeal(dealToBreak);
                handleAcceptBreakDealModalClose();
              }
            }}
          >
            Accept Break Request
          </Button>
        ]}
        width={500}
      >
        {dealToBreak && (
          <div className="break-deal-modal">
            <div className="warning-icon" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            </div>
            
            <Alert
              message="Farmer Requested to Break Deal"
              description="The farmer has requested to break this deal. If you accept, the deal will be canceled and moved to your canceled deals section."
              type="warning"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            
            <div className="deal-summary" style={{ marginBottom: '20px' }}>
              <Title level={5}>Deal Summary</Title>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Deal Type">
                  {dealToBreak.dealType === 'demand' ? 'Demand Response' : 'Product Offer'}
                </Descriptions.Item>
                <Descriptions.Item label="Product">
                  <Tag color={categoryColors[dealToBreak.dealType === 'demand' ? dealToBreak.demandDetails?.category || 'others' : dealToBreak.product_details?.category || 'others']}>
                    {getCategoryLabel(dealToBreak.dealType === 'demand' ? dealToBreak.demandDetails?.category || 'others' : dealToBreak.product_details?.category || 'others')}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Farmer">
                  {getFarmerDetails(dealToBreak.dealType === 'demand' ? dealToBreak.farmer : dealToBreak.product_details?.farmer_id).name}
                </Descriptions.Item>
                <Descriptions.Item label="Deal Date">
                  {formatDate(dealToBreak.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>
            
            <Text>
              Are you sure you want to accept the break request for this deal?
            </Text>
          </div>
        )}
      </Modal>
      
      {/* Accept Complete Deal Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Complete Deal Request</span>
          </Space>
        }
        visible={acceptCompleteDealModalVisible}
        onCancel={handleAcceptCompleteDealModalClose}
        footer={[
          <Button 
            key="decline" 
            onClick={declineCompleteDeal}
          >
            Decline Request
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => {
              if (dealToComplete) {
                acceptCompleteDeal(dealToComplete);
                handleAcceptCompleteDealModalClose();
              }
            }}
          >
            Accept Completion Request
          </Button>
        ]}
        width={500}
      >
        {dealToComplete && (
          <div className="complete-deal-modal">
            <div className="success-icon" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            </div>
            
            <Alert
              message="Farmer Requested to Complete Deal"
              description="The farmer has requested to mark this deal as complete. If you accept, the deal will be moved to your completed deals section."
              type="success"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            
            <div className="deal-summary" style={{ marginBottom: '20px' }}>
              <Title level={5}>Deal Summary</Title>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Deal Type">
                  {dealToComplete.dealType === 'demand' ? 'Demand Response' : 'Product Offer'}
                </Descriptions.Item>
                <Descriptions.Item label="Product">
                  <Tag color={categoryColors[dealToComplete.dealType === 'demand' ? dealToComplete.demandDetails?.category || 'others' : dealToComplete.product_details?.category || 'others']}>
                    {getCategoryLabel(dealToComplete.dealType === 'demand' ? dealToComplete.demandDetails?.category || 'others' : dealToComplete.product_details?.category || 'others')}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Farmer">
                  {getFarmerDetails(dealToComplete.dealType === 'demand' ? dealToComplete.farmer : dealToComplete.product_details?.farmer_id).name}
                </Descriptions.Item>
                <Descriptions.Item label="Deal Date">
                  {formatDate(dealToComplete.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>
            
            <Text>
              Are you satisfied with this deal and ready to mark it as complete?
            </Text>
          </div>
        )}
      </Modal>
      
      {/* Invoice Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PrinterOutlined style={{ fontSize: '18px', marginRight: '8px', color: '#1890ff' }} />
            <span>Deal Invoice</span>
          </div>
        }
        visible={invoiceModalVisible}
        onCancel={() => setInvoiceModalVisible(false)}
        footer={null}
        width={800}
        centered
      >
        <DealInvoice 
          dealData={dealForInvoice || {}} 
          buyerDetails={{
            name: userDetails?.name || 'You (Buyer)',
            location: userDetails?.location || '',
            phone: userDetails?.phone || '',
            email: userDetails?.email || '',
            company: userDetails?.company || ''
          }}
          demandDetails={dealForInvoice?.dealType === 'demand' 
            ? dealForInvoice?.demandDetails || {} 
            : dealForInvoice?.product_details || {}
          }
          isDemandDeal={dealForInvoice?.dealType === 'demand'}
          visible={invoiceModalVisible}
        />
      </Modal>
      
      {/* Chat Modal */}
      {selectedChatDeal && (
        <ChatModal
          visible={chatModalVisible}
          onClose={handleCloseChat}
          dealId={selectedChatDeal.id}
          dealType={selectedChatDeal.dealType === 'product' ? 'product_offer' : 'demand_response'}
          dealTitle={
            selectedChatDeal.dealType === 'product'
              ? `${selectedChatDeal.product_details?.name || 'Product'}`
              : `${getCategoryLabel(selectedChatDeal.demandDetails?.category || 'Unknown')}`
          }
        />
      )}
    </div>
  );
};

export default BuyerDeals;