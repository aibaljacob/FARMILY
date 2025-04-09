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
  Row,
  Col,
  Dropdown,
  Menu,
  Alert,
  notification,
  Tooltip,
  Steps
} from 'antd';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  CarOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  FileTextOutlined, 
  CommentOutlined, 
  PrinterOutlined, 
  DisconnectOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  DollarOutlined, 
  PhoneOutlined, 
  MailOutlined,
  DeliveredProcedureOutlined,
  DownOutlined,
  InfoCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { showSuccessNotification, showErrorNotification } from '../../utils/notificationConfig';
import './Deals.css';
import DealInvoice from './DealInvoice';
import { ChatModal } from '../Chat';

const { Title, Text, Paragraph } = Typography;

const FarmerDeals = () => {
  const [deals, setDeals] = useState([]);
  const [canceledDeals, setCanceledDeals] = useState([]);
  const [completedDeals, setCompletedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [breakDealModalVisible, setBreakDealModalVisible] = useState(false);
  const [acceptBreakDealModalVisible, setAcceptBreakDealModalVisible] = useState(false);
  const [completeDealModalVisible, setCompleteDealModalVisible] = useState(false);
  const [dealToBreak, setDealToBreak] = useState(null);
  const [dealToComplete, setDealToComplete] = useState(null);
  const [buyersData, setBuyersData] = useState({});
  const [farmerId, setFarmerId] = useState(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [dealForInvoice, setDealForInvoice] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedChatDeal, setSelectedChatDeal] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [dealForStatusUpdate, setDealForStatusUpdate] = useState(null);

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
    // Get farmer ID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      const currentFarmerId = user.farmer_id || user.id;
      setFarmerId(currentFarmerId);
      
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
        
        // Process demand deals (farmer's accepted responses to demands)
        let formattedDemandDeals = [];
        if (demand_deals && demand_deals.length > 0) {
          // We need to fetch the demands to get full details
          const demandsMap = await fetchDemands(demand_deals.map(deal => deal.demand), token);
          
          // Combine responses with demand details
          formattedDemandDeals = processDeals(demand_deals).map(deal => ({
            ...deal,
            dealType: 'demand',
            demandDetails: demandsMap[deal.demand] || null,
            deliveryStatus: deal.delivery_status || 'ready', // Set default delivery status if not provided
            can_deliver: deal.can_deliver || false // Use the can_deliver field from the demand response
          })).filter(deal => deal.demandDetails !== null);
          
          // Fetch buyer details for demand deals
          await fetchBuyersData(formattedDemandDeals.map(deal => deal.demandDetails?.buyer), token);
        }
        
        // Process product deals (accepted offers on farmer's products)
        let formattedProductDeals = [];
        if (product_deals && product_deals.length > 0) {
          formattedProductDeals = processDeals(product_deals).map(deal => ({
            ...deal,
            dealType: 'product',
            deliveryStatus: deal.delivery_status || 'ready', // Set default delivery status if not provided
            can_deliver: deal.product_details?.can_deliver || false // Use the can_deliver field from the product
          }));
          
          // Additional product details are already in product_details
          
          // Make sure we have buyer details for product deals
          const buyerIds = formattedProductDeals.map(deal => deal.buyer);
          
          if (buyerIds.length > 0) {
            await fetchBuyersData(buyerIds, token);
          }
        }
        
        // Combine both types of deals
        const allDeals = [...formattedDemandDeals, ...formattedProductDeals];
        
        // Sort by created_at date, newest first
        allDeals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        console.log('Formatted all deals for farmer:', allDeals);
        setDeals(allDeals);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setError('Failed to load deals. Please try again.');
      showErrorNotification('Failed to load deals', 'Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Fetch details for all buyers involved in deals
  const fetchBuyersData = async (buyerIds, token) => {
    try {
      // Remove null or undefined values and get unique buyer IDs
      const uniqueBuyerIds = [...new Set(buyerIds.filter(id => id))];
      
      if (uniqueBuyerIds.length === 0) return;
      
      // Fetch all buyer profiles
      const allBuyersResponse = await axios.get('http://127.0.0.1:8000/api/all-buyer-profiles/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Create a map of buyer IDs to buyer details
      const buyersMap = {};
      
      if (allBuyersResponse.data && Array.isArray(allBuyersResponse.data)) {
        // Filter buyers to get only those involved in deals
        const relevantBuyers = allBuyersResponse.data.filter(buyer => 
          uniqueBuyerIds.includes(buyer.user)
        );
        
        relevantBuyers.forEach(buyer => {
          buyersMap[buyer.user] = {
            id: buyer.id,
            name: `${buyer.user_first_name} ${buyer.user_last_name}`,
            profileImage: buyer.profilepic,
            location: buyer.location || buyer.address || 'Location not available',
            phone: buyer.phoneno || 'No phone provided',
            email: buyer.email || 'No email provided',
            company: buyer.company_name || 'Not specified'
          };
        });
      }
      
      setBuyersData(buyersMap);
    } catch (error) {
      console.error('Error fetching buyers data:', error);
    }
  };

  // Get buyer details from the map
  const getBuyerDetails = (buyerId) => {
    return buyersData[buyerId] || {
      id: buyerId,
      name: `Buyer #${buyerId}`,
      profileImage: null,
      location: 'Location not available',
      phone: 'No phone provided',
      email: 'No email provided',
      company: 'Not specified'
    };
  };

  // Show deal details
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
    
    // Add break deal button with red dot indicator for buyer's break requests
    actions.push(
      <Badge dot={deal.breakRequested && deal.breakRequestedBy === 'buyer'} key="breakDealBadge">
        <Button 
          key="breakDeal" 
          type="text"
          size="small"
          danger
          icon={<DisconnectOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            showBreakDealModal(deal);
          }}
        >
          {deal.breakRequested && deal.breakRequestedBy === 'buyer' ? 'Respond' : 'Break'}
        </Button>
      </Badge>
    );
    
    // Add complete deal button
    actions.push(
      <Badge dot={false} key="completeDealBadge">
        <Button 
          key="completeDeal" 
          type="text"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            showCompleteDealModal(deal);
          }}
          disabled={deal.completeRequested && deal.completeRequestedBy === 'farmer'}
        >
          {deal.completeRequested && deal.completeRequestedBy === 'farmer' ? 'Pending' : 'Complete'}
        </Button>
      </Badge>
    );
    
    // Add status update button
    actions.push(
      <Button 
        key="statusUpdate" 
        type="text"
        size="small"
        icon={<CarOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          showStatusModal(deal);
        }}
      >
        Status
      </Button>
    );

    return actions;
  };

  // Show break deal modal
  const showBreakDealModal = (deal) => {
    console.log("showBreakDealModal called with deal:", deal);
    
    // If there's a pending break request from the buyer, show the accept/decline modal instead
    if (deal.breakRequested && deal.breakRequestedBy === 'buyer') {
      console.log("Deal has break request from buyer, showing accept modal");
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
        showSuccessNotification(
          'Break Request Sent',
          'Your request to break the deal has been sent to the buyer. The deal will be broken when they approve.'
        );
        
        // Update the local state to show the deal is pending cancellation
        const updatedDeals = deals.map(d => {
          if (d.id === dealToBreak.id && d.dealType === dealToBreak.dealType) {
            return { ...d, breakRequested: true, breakRequestedBy: 'farmer' };
          }
          return d;
        });
        
        setDeals(updatedDeals);
        handleBreakDealModalClose();
      }
    } catch (error) {
      console.error('Error requesting to break deal:', error);
      showErrorNotification('Request Failed', 'Failed to send break deal request. Please try again.');
    }
  };

  // Handle accepting a break request from buyer
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
        showSuccessNotification(
          'Deal Broken',
          'The deal has been successfully broken.'
        );
        
        // Remove the deal from active deals and add to canceled deals
        const updatedDeals = deals.filter(d => !(d.id === deal.id && d.dealType === deal.dealType));
        setDeals(updatedDeals);
        
        // Add to canceled deals
        setCanceledDeals([...canceledDeals, {...deal, canceledAt: new Date().toISOString()}]);
      }
    } catch (error) {
      console.error('Error accepting break deal request:', error);
      showErrorNotification('Action Failed', 'Failed to accept break deal request. Please try again.');
    }
  };

  // Handle declining a break request from buyer
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
        handleCompleteDealModalClose();
      }
    } catch (error) {
      console.error('Error declining completion request:', error);
      showErrorNotification('Action Failed', 'Failed to decline completion request. Please try again.');
    }
  };

  // Show status modal
  const showStatusModal = (deal) => {
    setDealForStatusUpdate(deal);
    setStatusModalVisible(true);
  };

  // Handle status modal close
  const handleStatusModalClose = () => {
    setStatusModalVisible(false);
    setTimeout(() => {
      setDealForStatusUpdate(null);
    }, 300);
  };

  // Update deal delivery status
  const updateDeliveryStatus = async (deal, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let endpoint = '';
      let payload = {};

      if (deal.dealType === 'product') {
        // Product deal
        endpoint = `http://127.0.0.1:8000/api/product-offers/${deal.id}/update-delivery/`;
        payload = { delivery_status: newStatus };
      } else {
        // Demand deal
        endpoint = `http://127.0.0.1:8000/api/demand-responses/${deal.id}/update-delivery/`;
        payload = { delivery_status: newStatus };
      }

      const response = await axios.put(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Update the local state
        const updatedDeals = deals.map(d => {
          if (d.id === deal.id && d.dealType === deal.dealType) {
            return { ...d, deliveryStatus: newStatus };
          }
          return d;
        });
        
        setDeals(updatedDeals);
        
        // Update the dealForStatusUpdate if it's currently being viewed
        if (dealForStatusUpdate && dealForStatusUpdate.id === deal.id && dealForStatusUpdate.dealType === deal.dealType) {
          setDealForStatusUpdate({...dealForStatusUpdate, deliveryStatus: newStatus});
        }
        
        showSuccessNotification(
          'Status Updated',
          `Delivery status updated to ${newStatus}`
        );
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      showErrorNotification('Update Failed', 'Failed to update delivery status. Please try again.');
    }
  };

  // Open chat modal for a specific deal
  const handleOpenChat = (deal) => {
    // Map internal deal types to API-expected deal types
    let apiDealType;
    if (deal.dealType === 'demand') {
      apiDealType = 'demand_response';
    } else if (deal.dealType === 'product') {
      apiDealType = 'product_offer';
    } else {
      apiDealType = deal.dealType;
    }
    
    // Set the deal with the corrected API deal type
    const dealWithCorrectType = {
      ...deal,
      apiDealType: apiDealType
    };
    
    setSelectedChatDeal(dealWithCorrectType);
    setChatModalVisible(true);
  };

  // Close chat modal
  const handleCloseChat = () => {
    setChatModalVisible(false);
    setSelectedChatDeal(null);
  };

  // Show complete deal modal
  const showCompleteDealModal = (deal) => {
    setDealToComplete(deal);
    setCompleteDealModalVisible(true);
  };

  // Handle complete deal modal close
  const handleCompleteDealModalClose = () => {
    setCompleteDealModalVisible(false);
    // Clear the selected deal after a short delay to prevent UI flicker
    setTimeout(() => {
      setDealToComplete(null);
    }, 300);
  };

  // Request to mark a deal as complete
  const requestCompleteDeal = async () => {
    if (!dealToComplete) return;

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let endpoint = '';
      
      if (dealToComplete.dealType === 'product') {
        // Product deal
        endpoint = `http://127.0.0.1:8000/api/product-offers/${dealToComplete.id}/request-complete/`;
      } else {
        // Demand deal
        endpoint = `http://127.0.0.1:8000/api/demand-responses/${dealToComplete.id}/request-complete/`;
      }

      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        showSuccessNotification(
          'Completion Request Sent',
          'Your request to mark the deal as complete has been sent to the buyer. The deal will be marked as complete when they approve.'
        );
        
        // Update the local state to show the deal is pending completion
        const updatedDeals = deals.map(d => {
          if (d.id === dealToComplete.id && d.dealType === dealToComplete.dealType) {
            return { ...d, completeRequested: true, completeRequestedBy: 'farmer' };
          }
          return d;
        });
        
        setDeals(updatedDeals);
        handleCompleteDealModalClose();
      }
    } catch (error) {
      console.error('Error requesting to complete deal:', error);
      showErrorNotification('Request Failed', 'Failed to send deal completion request. Please try again.');
    }
  };

  // Handle accepting a completion request from buyer
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
        showSuccessNotification(
          'Deal Completed',
          'The deal has been marked as complete.'
        );
        
        // Update the local state
        const updatedDeals = deals.map(d => {
          if (d.id === deal.id && d.dealType === deal.dealType) {
            return { ...d, status: 'completed', completeRequested: false };
          }
          return d;
        });
        
        setDeals(updatedDeals);
      }
    } catch (error) {
      console.error('Error accepting deal completion:', error);
      showErrorNotification('Request Failed', 'Failed to complete the deal. Please try again.');
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
          <Text type="secondary">View and manage deals from accepted demand responses and product offers</Text>
        </div>
        <div className="loading-container">
          <Spin size="large" />
          <Text style={{ marginTop: '16px' }}>Loading your deals...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deals-page">
        <div className="page-header">
          <Title level={3}>
            <CheckCircleOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
            My Deals
          </Title>
          <Text type="secondary">View and manage deals from accepted demand responses and product offers</Text>
        </div>
        <div className="error-container">
          <Text type="danger" style={{ fontSize: '16px', marginBottom: '16px' }}>{error}</Text>
          <Button type="primary" onClick={() => fetchDeals()}>Try Again</Button>
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
          <Text type="secondary">View and manage deals from accepted demand responses and product offers</Text>
        </div>
      </div>

      {deals.length === 0 && canceledDeals.length === 0 && completedDeals.length === 0 ? (
        <Empty 
          description={
            <span>
              No deals found. Deals are created when you accept buyer demands
              or when buyers accept your product offers.
            </span>
          } 
          className="empty-state"
        />
      ) : (
        <>
          {/* Hosted Deals Section - Deals where the farmer created the product */}
          <div className="deals-section">
            <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
              <ShoppingOutlined style={{ marginRight: '8px' }} />
              Hosted Deals
              <Text type="secondary" style={{ fontSize: '16px', marginLeft: '12px', fontWeight: 'normal' }}>
                (Deals from your posted products)
              </Text>
            </Title>
            
            {deals.filter(deal => deal.dealType === 'product').length === 0 ? (
              <Empty 
                description="No hosted deals found. These are created when buyers accept your product offers."
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
                  const totalValue = parseFloat(deal.offered_price) * parseFloat(deal.quantity);
                  const quantity = deal.quantity;
                  const unit = deal.product_details?.unit || 'kg';
                  const price = deal.offered_price;
                  const title = deal.product_details?.name || 'Untitled Product';
                  const buyerInfo = getBuyerDetails(deal.buyer);

                  return (
                    <List.Item 
                      key={`${deal.dealType}-${deal.id}`} 
                      onClick={() => showDealDetails(deal)}
                    >
                      <Card 
                        className="deal-card"
                        hoverable
                        actions={getCardActions(deal)}
                      >
                        {deal.can_deliver && (
                          <Badge.Ribbon
                            text={
                              <Space>
                                {deal.deliveryStatus === 'ready' ? <CheckCircleOutlined /> : 
                                 deal.deliveryStatus === 'out_for_delivery' ? <CarOutlined /> : 
                                 <DeliveredProcedureOutlined />}
                                {deal.deliveryStatus.replace('_', ' ').toUpperCase()}
                              </Space>
                            }
                            color={
                              deal.deliveryStatus === 'ready' ? 'blue' : 
                              deal.deliveryStatus === 'out_for_delivery' ? 'orange' : 
                              'green'
                            }
                          />
                        )}
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
                          
                          <div className="deal-card-buyer" style={{
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
                              src={`http://127.0.0.1:8000/${buyerInfo?.profileImage}`} 
                              icon={<UserOutlined />}
                              style={{ 
                                backgroundColor: !buyerInfo?.profileImage ? '#2d6a4f' : undefined,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <div className="buyer-info" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
                              <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {buyerInfo?.name || 'Unknown Buyer'}
                              </Text>
                              {buyerInfo?.location && (
                                <Text type="secondary" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <EnvironmentOutlined style={{marginRight: '4px', color: '#8c8c8c' }} />
                                  {buyerInfo.location}
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
                                  Payment Received
                                </Tag>
                              ) : (
                                <Tag icon={<CloseCircleOutlined />} color="default">
                                  Awaiting Payment
                                </Tag>
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
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            )}
          </div>

          {/* Other Deals Section - Deals where the farmer responded to demands */}
          <div className="deals-section">
            <Title level={4} style={{ marginTop: 32, marginBottom: 16 }}>
              <ShoppingOutlined style={{ marginRight: '8px' }} />
              Other Deals
              <Text type="secondary" style={{ fontSize: '16px', marginLeft: '12px', fontWeight: 'normal' }}>
                (Deals from your responses to buyer demands)
              </Text>
            </Title>
            
            {deals.filter(deal => deal.dealType === 'demand').length === 0 ? (
              <Empty 
                description="No other deals found. These are created when buyers accept your responses to their demands."
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
                  // Get category and calculate values for demand deals
                  const category = deal.demandDetails?.category || 'others';
                  const totalValue = parseFloat(deal.offered_price) * parseFloat(deal.offered_quantity);
                  const quantity = deal.offered_quantity;
                  const unit = deal.demandDetails?.unit || 'kg';
                  const price = deal.offered_price;
                  const title = deal.demandDetails?.title || 'Untitled Demand';
                  const buyerInfo = getBuyerDetails(deal.demandDetails?.buyer);

                  return (
                    <List.Item 
                      key={`${deal.dealType}-${deal.id}`} 
                      onClick={() => showDealDetails(deal)}
                    >
                      <Card 
                        className="deal-card"
                        hoverable
                        actions={getCardActions(deal)}
                      >
                        {deal.can_deliver && (
                          <Badge.Ribbon
                            text={
                              <Space>
                                {deal.deliveryStatus === 'ready' ? <CheckCircleOutlined /> : 
                                 deal.deliveryStatus === 'out_for_delivery' ? <CarOutlined /> : 
                                 <DeliveredProcedureOutlined />}
                                {deal.deliveryStatus.replace('_', ' ').toUpperCase()}
                              </Space>
                            }
                            color={
                              deal.deliveryStatus === 'ready' ? 'blue' : 
                              deal.deliveryStatus === 'out_for_delivery' ? 'orange' : 
                              'green'
                            }
                          />
                        )}
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
                          
                          <div className="deal-card-buyer" style={{
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
                              src={`http://127.0.0.1:8000/${buyerInfo?.profileImage}`} 
                              icon={<UserOutlined />}
                              style={{ 
                                backgroundColor: !buyerInfo?.profileImage ? '#2d6a4f' : undefined,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <div className="buyer-info" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
                              <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {buyerInfo?.name || 'Unknown Buyer'}
                              </Text>
                              {buyerInfo?.location && (
                                <Text type="secondary" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <EnvironmentOutlined style={{marginRight: '4px', color: '#8c8c8c' }} />
                                  {buyerInfo.location}
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
                                  Payment Received
                                </Tag>
                              ) : (
                                <Tag icon={<CloseCircleOutlined />} color="default">
                                  Awaiting Payment
                                </Tag>
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
                  
                  // Get buyer info
                  const buyerInfo = getBuyerDetails(
                    deal.dealType === 'demand' 
                      ? deal.demandDetails?.buyer
                      : deal.buyer
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
                          
                          <div className="deal-card-buyer" style={{
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
                              src={`http://127.0.0.1:8000/${buyerInfo?.profileImage}`} 
                              icon={<UserOutlined />}
                              style={{ 
                                backgroundColor: !buyerInfo?.profileImage ? '#2d6a4f' : undefined,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <div className="buyer-info" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
                              <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {buyerInfo?.name || 'Unknown Buyer'}
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
                  
                  // Get buyer info
                  const buyerInfo = getBuyerDetails(
                    deal.dealType === 'demand' 
                      ? deal.demandDetails?.buyer
                      : deal.buyer
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
                          
                          <div className="deal-card-buyer" style={{
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
                              src={`http://127.0.0.1:8000/${buyerInfo?.profileImage}`} 
                              icon={<UserOutlined />}
                              style={{ 
                                backgroundColor: !buyerInfo?.profileImage ? '#2d6a4f' : undefined,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <div className="buyer-info" style={{ marginLeft: '12px', flex: 1, overflow: 'hidden' }}>
                              <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {buyerInfo?.name || 'Unknown Buyer'}
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
          <Space>
            <CheckCircleOutlined style={{ color: '#2d6a4f' }} />
            <span>Deal Details</span>
          </Space>
        }
        visible={detailsModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>
            Close
          </Button>,
          selectedDeal && !selectedDeal.breakRequested && (
            <Button 
              key="breakDeal"
              type="danger" 
              icon={<DisconnectOutlined />}
              onClick={() => {
                console.log("Request to break deal button clicked");
                setDealToBreak(selectedDeal);
                setBreakDealModalVisible(true);
                handleModalClose();
              }}
            >
              Request to Break Deal
            </Button>
          ),
          selectedDeal && selectedDeal.breakRequested && selectedDeal.breakRequestedBy === 'buyer' && (
            <Button 
              key="respondToBreak"
              type="danger" 
              icon={<DisconnectOutlined />}
              onClick={() => {
                console.log("Respond to break request button clicked");
                setDealToBreak(selectedDeal);
                setAcceptBreakDealModalVisible(true);
                handleModalClose();
              }}
            >
              Respond to Break Request
            </Button>
          ),
          selectedDeal && !selectedDeal.completeRequested && (
            <Button 
              key="completeDeal"
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setDealToComplete(selectedDeal);
                setCompleteDealModalVisible(true);
                handleModalClose();
              }}
            >
              Mark as Complete
            </Button>
          ),
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => {
              handlePrintInvoice(selectedDeal);
              handleModalClose();
            }}
          >
            Generate Invoice
          </Button>
        ]}
        width={700}
      >
        {selectedDeal && (
          <div className="deal-details">
            <div className="deal-summary">
              {selectedDeal.dealType === 'demand' ? (
                <>
                  <Title level={5}>Demand Summary</Title>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Product">
                      <Tag color={categoryColors[selectedDeal.demandDetails?.category || 'others']}>
                        {getCategoryLabel(selectedDeal.demandDetails?.category || 'others')}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Buyer's Price">
                      {formatPrice(selectedDeal.demandDetails?.price_per_unit)} per {selectedDeal.demandDetails?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Requested Quantity">
                      {selectedDeal.demandDetails?.quantity} {selectedDeal.demandDetails?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Posted On">
                      {formatDate(selectedDeal.demandDetails?.created_at)}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <Divider />
                  
                  <Title level={5}>Deal Terms</Title>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Your Offered Price">
                      {formatPrice(selectedDeal.offered_price)} per {selectedDeal.demandDetails?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Your Offered Quantity">
                      {selectedDeal.offered_quantity} {selectedDeal.demandDetails?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Deal Value">
                      {formatPrice(parseFloat(selectedDeal.offered_price) * parseFloat(selectedDeal.offered_quantity))}
                    </Descriptions.Item>
                    <Descriptions.Item label="Deal Formed On">
                      {formatDate(selectedDeal.updated_at)}
                    </Descriptions.Item>
                    {selectedDeal.notes && (
                      <Descriptions.Item label="Your Notes">
                        {selectedDeal.notes}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                  
                  <Divider />
                  
                  <Title level={5}>Buyer Information</Title>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Buyer">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={`http://127.0.0.1:8000/${getBuyerDetails(selectedDeal.demandDetails?.buyer).profileImage}`} 
                          icon={<UserOutlined />}
                          style={{ 
                            backgroundColor: !getBuyerDetails(selectedDeal.demandDetails?.buyer).profileImage ? '#2d6a4f' : undefined,
                            marginRight: '8px'
                          }}
                        />
                        <span>{getBuyerDetails(selectedDeal.demandDetails?.buyer).name}</span>
                      </div>
                    </Descriptions.Item>
                    {getBuyerDetails(selectedDeal.demandDetails?.buyer).company && 
                      getBuyerDetails(selectedDeal.demandDetails?.buyer).company !== 'Not specified' && (
                      <Descriptions.Item label="Company">
                        <ShoppingOutlined style={{ color: '#2d6a4f', marginRight: '8px' }} />
                        {getBuyerDetails(selectedDeal.demandDetails?.buyer).company}
                      </Descriptions.Item>
                    )}
                    {getBuyerDetails(selectedDeal.demandDetails?.buyer).location !== 'Location not available' && (
                      <Descriptions.Item label="Location">
                        <EnvironmentOutlined style={{ color: '#2d6a4f', marginRight: '8px' }} />
                        {getBuyerDetails(selectedDeal.demandDetails?.buyer).location}
                      </Descriptions.Item>
                    )}
                    {getBuyerDetails(selectedDeal.demandDetails?.buyer).phone !== 'No phone provided' && (
                      <Descriptions.Item label="Phone">
                        <a href={`tel:${getBuyerDetails(selectedDeal.demandDetails?.buyer).phone}`}>
                          <PhoneOutlined style={{ color: '#2d6a4f', marginRight: '8px' }} />
                          {getBuyerDetails(selectedDeal.demandDetails?.buyer).phone}
                        </a>
                      </Descriptions.Item>
                    )}
                    {getBuyerDetails(selectedDeal.demandDetails?.buyer).email !== 'No email provided' && (
                      <Descriptions.Item label="Email">
                        <a href={`mailto:${getBuyerDetails(selectedDeal.demandDetails?.buyer).email}`}>
                          <MailOutlined style={{ color: '#2d6a4f', marginRight: '8px' }} />
                          {getBuyerDetails(selectedDeal.demandDetails?.buyer).email}
                        </a>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                  
                  {/* Display status without change functionality */}
                  {selectedDeal.can_deliver && (
                    <>
                      <Divider />
                      <Title level={5}>Delivery Status</Title>
                      <div className="delivery-status-section">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Tag 
                            color={
                              selectedDeal.deliveryStatus === 'ready' ? 'blue' : 
                              selectedDeal.deliveryStatus === 'out_for_delivery' ? 'orange' : 
                              selectedDeal.deliveryStatus === 'delivered' ? 'green' : 'default'
                            }
                            className="delivery-status-tag"
                          >
                            {selectedDeal.deliveryStatus === 'ready' && <CheckCircleOutlined style={{ marginRight: '5px' }} />}
                            {selectedDeal.deliveryStatus === 'out_for_delivery' && <CarOutlined style={{ marginRight: '5px' }} />}
                            {selectedDeal.deliveryStatus === 'delivered' && <DeliveredProcedureOutlined style={{ marginRight: '5px' }} />}
                            {selectedDeal.deliveryStatus.replace('_', ' ').toUpperCase()}
                          </Tag>
                          <Text type="secondary" style={{ marginLeft: '10px' }}>
                            Last Updated: {formatDate(selectedDeal.updated_at)}
                          </Text>
                        </div>
                        
                        <div className="delivery-status-tracker" style={{ marginTop: '20px' }}>
                          <Steps 
                            size="small" 
                            current={
                              selectedDeal.deliveryStatus === 'ready' ? 0 :
                              selectedDeal.deliveryStatus === 'out_for_delivery' ? 1 : 2
                            }
                          >
                            <Steps.Step title="Ready" description="Item prepared" />
                            <Steps.Step title="Out for Delivery" description="Item in transit" />
                            <Steps.Step title="Delivered" description="Item received" />
                          </Steps>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Title level={5}>Product Deal Summary</Title>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Product">
                      <Tag color={categoryColors[selectedDeal.product_details?.category || 'others']}>
                        {getCategoryLabel(selectedDeal.product_details?.category || 'others')}
                      </Tag>
                      {" "}{selectedDeal.product_details?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Original Price">
                      {formatPrice(selectedDeal.product_details?.price)} per {selectedDeal.product_details?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Deal Price">
                      {formatPrice(selectedDeal.offered_price)} per {selectedDeal.product_details?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Quantity">
                      {selectedDeal.quantity} {selectedDeal.product_details?.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Value">
                      {formatPrice(parseFloat(selectedDeal.offered_price) * parseFloat(selectedDeal.quantity))}
                    </Descriptions.Item>
                    <Descriptions.Item label="Deal Formed On">
                      {formatDate(selectedDeal.updated_at)}
                    </Descriptions.Item>
                    {selectedDeal.notes && (
                      <Descriptions.Item label="Buyer's Notes">
                        {selectedDeal.notes}
                      </Descriptions.Item>
                    )}
                    {selectedDeal.farmer_message && (
                      <Descriptions.Item label="Your Message">
                        {selectedDeal.farmer_message}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                  
                  <Divider />
                  
                  <Title level={5}>Buyer Information</Title>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Buyer">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={`http://127.0.0.1:8000/${getBuyerDetails(selectedDeal.buyer).profileImage}`} 
                          icon={!getBuyerDetails(selectedDeal.buyer).profileImage && <UserOutlined />}
                          style={{ 
                            backgroundColor: !getBuyerDetails(selectedDeal.buyer).profileImage ? '#2d6a4f' : undefined,
                            marginRight: '8px'
                          }}
                        />
                        <span>{getBuyerDetails(selectedDeal.buyer).name}</span>
                      </div>
                    </Descriptions.Item>
                    {getBuyerDetails(selectedDeal.buyer).company && 
                      getBuyerDetails(selectedDeal.buyer).company !== 'Not specified' && (
                      <Descriptions.Item label="Company">
                        <ShoppingOutlined style={{ color: '#2d6a4f', marginRight: '8px' }} />
                        {getBuyerDetails(selectedDeal.buyer).company}
                      </Descriptions.Item>
                    )}
                    {getBuyerDetails(selectedDeal.buyer).location !== 'Location not available' && (
                      <Descriptions.Item label="Location">
                        <EnvironmentOutlined style={{ color: '#2d6a4f', marginRight: '8px' }} />
                        {getBuyerDetails(selectedDeal.buyer).location}
                      </Descriptions.Item>
                    )}
                    {getBuyerDetails(selectedDeal.buyer).phone !== 'No phone provided' && (
                      <Descriptions.Item label="Phone">
                        <a href={`tel:${getBuyerDetails(selectedDeal.buyer).phone}`}>
                          <PhoneOutlined style={{ color: '#2d6a4f', marginRight: '8px' }} />
                          {getBuyerDetails(selectedDeal.buyer).phone}
                        </a>
                      </Descriptions.Item>
                    )}
                    {getBuyerDetails(selectedDeal.buyer).email !== 'No email provided' && (
                      <Descriptions.Item label="Email">
                        <a href={`mailto:${getBuyerDetails(selectedDeal.buyer).email}`}>
                          <MailOutlined style={{ color: '#2d6a4f', marginRight: '8px' }} />
                          {getBuyerDetails(selectedDeal.buyer).email}
                        </a>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                  
                  {/* Display status without change functionality */}
                  {selectedDeal.can_deliver && (
                    <>
                      <Divider />
                      <Title level={5}>Delivery Status</Title>
                      <div className="delivery-status-section">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Tag 
                            color={
                              selectedDeal.deliveryStatus === 'ready' ? 'blue' : 
                              selectedDeal.deliveryStatus === 'out_for_delivery' ? 'orange' : 
                              selectedDeal.deliveryStatus === 'delivered' ? 'green' : 'default'
                            }
                            className="delivery-status-tag"
                          >
                            {selectedDeal.deliveryStatus === 'ready' && <CheckCircleOutlined style={{ marginRight: '5px' }} />}
                            {selectedDeal.deliveryStatus === 'out_for_delivery' && <CarOutlined style={{ marginRight: '5px' }} />}
                            {selectedDeal.deliveryStatus === 'delivered' && <DeliveredProcedureOutlined style={{ marginRight: '5px' }} />}
                            {selectedDeal.deliveryStatus.replace('_', ' ').toUpperCase()}
                          </Tag>
                          <Text type="secondary" style={{ marginLeft: '10px' }}>
                            Last Updated: {formatDate(selectedDeal.updated_at)}
                          </Text>
                        </div>
                        
                        <div className="delivery-status-tracker" style={{ marginTop: '20px' }}>
                          <Steps 
                            size="small" 
                            current={
                              selectedDeal.deliveryStatus === 'ready' ? 0 :
                              selectedDeal.deliveryStatus === 'out_for_delivery' ? 1 : 2
                            }
                          >
                            <Steps.Step title="Ready" description="Item prepared" />
                            <Steps.Step title="Out for Delivery" description="Item in transit" />
                            <Steps.Step title="Delivered" description="Item received" />
                          </Steps>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* Status Update Modal */}
      <Modal
        title={
          <Space>
            <CarOutlined style={{ color: '#1890ff' }} />
            <span>Delivery Status</span>
          </Space>
        }
        visible={statusModalVisible}
        onCancel={handleStatusModalClose}
        footer={[
          <Button key="back" onClick={handleStatusModalClose}>
            Close
          </Button>
        ]}
        width={500}
      >
        {dealForStatusUpdate && (
          <div className="status-update-modal">
            <div className="current-status-display" style={{ marginBottom: '20px', textAlign: 'center' }}>
              <Tag 
                color={
                  dealForStatusUpdate.deliveryStatus === 'ready' ? 'blue' : 
                  dealForStatusUpdate.deliveryStatus === 'out_for_delivery' ? 'orange' : 
                  dealForStatusUpdate.deliveryStatus === 'delivered' ? 'green' : 'default'
                }
                style={{ padding: '8px 15px', fontSize: '16px' }}
              >
                {dealForStatusUpdate.deliveryStatus === 'ready' && <CheckCircleOutlined style={{ marginRight: '8px' }} />}
                {dealForStatusUpdate.deliveryStatus === 'out_for_delivery' && <CarOutlined style={{ marginRight: '8px' }} />}
                {dealForStatusUpdate.deliveryStatus === 'delivered' && <DeliveredProcedureOutlined style={{ marginRight: '8px' }} />}
                {dealForStatusUpdate.deliveryStatus.replace('_', ' ').toUpperCase()}
              </Tag>
              <div style={{ marginTop: '10px' }}>
                <Text type="secondary">Last Updated: {formatDate(dealForStatusUpdate.updated_at)}</Text>
              </div>
            </div>
            
            <div className="delivery-status-tracker" style={{ marginBottom: '30px' }}>
              <Steps 
                size="small" 
                current={
                  dealForStatusUpdate.deliveryStatus === 'ready' ? 0 :
                  dealForStatusUpdate.deliveryStatus === 'out_for_delivery' ? 1 : 2
                }
              >
                <Steps.Step title="Ready" description="Item prepared" />
                <Steps.Step title="Out for Delivery" description="Item in transit" />
                <Steps.Step title="Delivered" description="Item received" />
              </Steps>
            </div>
            
            <div className="delivery-status-info" style={{ marginBottom: '20px' }}>
              <Text style={{ display: 'block', marginBottom: '15px' }}>
                <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {dealForStatusUpdate.deliveryStatus === 'ready' 
                  ? 'This item is ready to be shipped. Update the status when you send it out for delivery.' 
                  : dealForStatusUpdate.deliveryStatus === 'out_for_delivery' 
                    ? 'This item is currently out for delivery. Update the status once it has been delivered.' 
                    : 'This item has been successfully delivered to the buyer.'}
              </Text>
            </div>
            
            <Divider style={{ margin: '20px 0' }} />
            
            <div className="status-update-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                disabled={dealForStatusUpdate.deliveryStatus === 'ready'}
                onClick={() => updateDeliveryStatus(dealForStatusUpdate, 'ready')}
                style={{ flex: 1, margin: '0 5px' }}
              >
                Mark as Ready
              </Button>
              <Button 
                type="primary" 
                danger
                icon={<CarOutlined />}
                disabled={dealForStatusUpdate.deliveryStatus === 'out_for_delivery'}
                onClick={() => updateDeliveryStatus(dealForStatusUpdate, 'out_for_delivery')}
                style={{ flex: 1, margin: '0 5px' }}
              >
                Out for Delivery
              </Button>
              <Button 
                type="primary" 
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', flex: 1, margin: '0 5px' }}
                icon={<DeliveredProcedureOutlined />}
                disabled={dealForStatusUpdate.deliveryStatus === 'delivered'}
                onClick={() => updateDeliveryStatus(dealForStatusUpdate, 'delivered')}
              >
                Delivered
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
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
              description="Breaking a deal should only be done in exceptional circumstances. This action requires approval from the buyer and may affect your reputation on the platform."
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
                <Descriptions.Item label="Buyer">
                  {getBuyerDetails(dealToBreak.dealType === 'demand' ? dealToBreak.demandDetails?.buyer : dealToBreak.buyer).name}
                </Descriptions.Item>
                <Descriptions.Item label="Deal Date">
                  {formatDate(dealToBreak.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>
            
            <Paragraph>
              Are you sure you want to request to break this deal? This will send a notification to the buyer. The deal will only be broken if they approve.
            </Paragraph>
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
          <Button key="back" onClick={() => {
            declineBreakDeal();
          }}>
            Decline
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
              message="Buyer Requested to Break Deal"
              description="The buyer has requested to break this deal. If you accept, the deal will be canceled and moved to your canceled deals section."
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
                <Descriptions.Item label="Buyer">
                  {getBuyerDetails(dealToBreak.dealType === 'demand' ? dealToBreak.demandDetails?.buyer : dealToBreak.buyer).name}
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
      
      {/* Complete Deal Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Complete Deal</span>
          </Space>
        }
        visible={completeDealModalVisible}
        onCancel={handleCompleteDealModalClose}
        footer={[
          <Button key="back" onClick={handleCompleteDealModalClose}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={requestCompleteDeal}
          >
            Request to Complete Deal
          </Button>
        ]}
        width={500}
      >
        {dealToComplete && (
          <div className="complete-deal-modal">
            <div className="info-icon" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <InfoCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            </div>
            
            <Alert
              message="Completing a Deal"
              description="Requesting to complete a deal indicates that you have fulfilled all obligations. The buyer will need to confirm this request to mark the deal as complete."
              type="info"
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
                <Descriptions.Item label="Buyer">
                  {getBuyerDetails(dealToComplete.dealType === 'demand' ? dealToComplete.demandDetails?.buyer : dealToComplete.buyer).name}
                </Descriptions.Item>
                <Descriptions.Item label="Deal Date">
                  {formatDate(dealToComplete.created_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>
            
            <Paragraph>
              Are you sure you want to request to complete this deal? This will send a notification to the buyer. The deal will only be marked as complete if they approve.
            </Paragraph>
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
          buyerDetails={dealForInvoice ? (
            dealForInvoice.dealType === 'demand' 
              ? getBuyerDetails(dealForInvoice.demandDetails?.buyer)
              : getBuyerDetails(dealForInvoice.buyer)
          ) : {}}
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
          dealType={selectedChatDeal.apiDealType}
          otherUserId={
            selectedChatDeal.dealType === 'demand' 
              ? selectedChatDeal.demandDetails?.buyer
              : selectedChatDeal.buyer
          }
          productName={
            selectedChatDeal.dealType === 'demand'
              ? `Demand for ${getCategoryLabel(selectedChatDeal.demandDetails?.category)}`
              : selectedChatDeal.product_details?.name
          }
        />
      )}
    </div>
  );
};

export default FarmerDeals;