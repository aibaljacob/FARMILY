import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  Space,
  Tag,
  Typography,
  Avatar,
  Empty,
  Spin,
  Divider,
  Table,
  Row, 
  Col,
  Tooltip,
  message,
  Modal,
  Descriptions,
  Alert,
  List
} from 'antd';
import { 
  UserOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  DeleteOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import axios from 'axios';
import './BuyerDemands.css';
import BuyerDetailsModal from './BuyerDetailsModal';
import RespondToDemandModal from './RespondToDemandModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const BuyerDemands = () => {
  const [demands, setDemands] = useState([]);
  const [filteredDemands, setFilteredDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteDemands, setFavoriteDemands] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRespondModalVisible, setIsRespondModalVisible] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [respondedDemands, setRespondedDemands] = useState([]);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [farmerResponses, setFarmerResponses] = useState({});
  const [loadingResponse, setLoadingResponse] = useState(false);
  
  // Product category colors
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
    others: '#8c8c8c',
    vegetables: '#52c41a',
    fruits: '#eb2f96',
    grains: '#faad14',
    eggs: '#1890ff'
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
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
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'others', label: 'Others' }
  ];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format price with ₹ symbol
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // Function to fetch demands
  const fetchDemands = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch all demands
      const demandsResponse = await axios.get('http://127.0.0.1:8000/api/demands/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!demandsResponse.data || demandsResponse.data.length === 0) {
        message.info("Using sample demand data for demonstration");
        const demoData = createDemoDemandsFromLocalData();
        setDemands(demoData);
        setLoading(false);
        return;
      }
      
      // Fetch all buyer profiles in one request
      const buyersResponse = await axios.get('http://127.0.0.1:8000/api/all-buyer-profiles/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Create a map of buyer IDs to buyer data
      const buyerMap = {};
      
      if (buyersResponse.data && Array.isArray(buyersResponse.data)) {
        // Process each buyer profile
        for (const buyer of buyersResponse.data) {
          // Get the user_id from the buyer profile
          const userId = buyer.user;
          
          // Create normalized buyer data
          buyerMap[userId] = {
            id: buyer.id,
            user_id: userId,
            name: `${buyer.user_first_name || ''} ${buyer.user_last_name || ''}`.trim() || 'Unknown Buyer',
            email: buyer.user_email || 'No email provided',
            phone: buyer.phoneno || 'Not provided',
            address: buyer.address || 'Not provided',
            city: buyer.city || 'Not provided',
            state: buyer.state || 'Not provided',
            country: buyer.country || 'Not provided',
            bio: buyer.bio || 'No bio provided',
            image: buyer.profilepic || null,
            isVerified: buyer.user_is_verified || false,
            type: buyer.business_type || 'Individual'
          };
        }
      }
      
      // Process demands with buyer info using our new function
      const demandsWithBuyerInfo = processDemandsWithBuyerInfo(demandsResponse.data, buyerMap);
      
      // Filter to only active demands
      const activeDemands = demandsWithBuyerInfo.filter(demand => demand.is_active !== false);
      
      setDemands(activeDemands);
      
      // Fetch the farmer's previous responses to check which demands they've already responded to
      fetchFarmerResponses(token);
      
      setLoading(false);
    } catch (error) {
      console.error("API Error:", error);
      
      // Use data that matches what we see in the UI instead of generic sample data
      const demoData = createDemoDemandsFromLocalData();
      setDemands(demoData);
      setLoading(false);
    }
  };

  // Add effect to ensure selectedDemand is reset when modal is closed
  useEffect(() => {
    if (!isRespondModalVisible) {
      setTimeout(() => {
        if (!isRespondModalVisible) {
          setSelectedDemand(null);
        }
      }, 300);
    }
  }, [isRespondModalVisible]);

  // Fetch demands and buyer profiles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('access_token');
        
        // Fetch all demands
        const demandsResponse = await axios.get('http://127.0.0.1:8000/api/demands/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!demandsResponse.data || demandsResponse.data.length === 0) {
          message.info("Using sample demand data for demonstration");
          const demoData = createDemoDemandsFromLocalData();
          setDemands(demoData);
          setLoading(false);
          return;
        }
        
        // Fetch all buyer profiles in one request
        const buyersResponse = await axios.get('http://127.0.0.1:8000/api/all-buyer-profiles/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Create a map of buyer IDs to buyer data
        const buyerMap = {};
        
        if (buyersResponse.data && Array.isArray(buyersResponse.data)) {
          // Process each buyer profile
          for (const buyer of buyersResponse.data) {
            // Get the user_id from the buyer profile
            const userId = buyer.user;
            
            // Create normalized buyer data
            buyerMap[userId] = {
              id: buyer.id,
              user_id: userId,
              name: `${buyer.user_first_name || ''} ${buyer.user_last_name || ''}`.trim() || 'Unknown Buyer',
              email: buyer.user_email || 'No email provided',
              phone: buyer.phoneno || 'Not provided',
              address: buyer.address || 'Not provided',
              city: buyer.city || 'Not provided',
              state: buyer.state || 'Not provided',
              country: buyer.country || 'Not provided',
              bio: buyer.bio || 'No bio provided',
              image: buyer.profilepic || null,
              isVerified: buyer.user_is_verified || false,
              type: buyer.business_type || 'Individual'
            };
          }
        }
        
        // Process demands with buyer info using our new function
        const demandsWithBuyerInfo = processDemandsWithBuyerInfo(demandsResponse.data, buyerMap);
        
        // Filter to only active demands
        const activeDemands = demandsWithBuyerInfo.filter(demand => demand.is_active !== false);
        
        setDemands(activeDemands);
        
        // Fetch the farmer's previous responses to check which demands they've already responded to
        fetchFarmerResponses(token);
        
        setLoading(false);
      } catch (error) {
        console.error("API Error:", error);
        
        // Use data that matches what we see in the UI instead of generic sample data
        const demoData = createDemoDemandsFromLocalData();
        setDemands(demoData);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch farmer's previous responses
  const fetchFarmerResponses = async (token) => {
    try {
      // Get the current user's data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const farmerId = userData.id;
      
      if (!farmerId) {
        console.warn("Farmer ID not found in user data");
        return;
      }
      
      // Fetch the farmer's responses
      const responsesResponse = await axios.get('http://127.0.0.1:8000/api/demand-responses/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (responsesResponse.data && Array.isArray(responsesResponse.data)) {
        // Extract the demand IDs the farmer has already responded to
        const farmerResponsesData = responsesResponse.data.filter(response => response.farmer === farmerId);
        
        // Create a map of demand IDs to responses for easy lookup
        const responsesMap = {};
        farmerResponsesData.forEach(response => {
          responsesMap[response.demand] = response;
        });
        
        const respondedDemandIds = farmerResponsesData.map(response => response.demand);
        
        console.log("Demands already responded to:", respondedDemandIds);
        setRespondedDemands(respondedDemandIds);
        setFarmerResponses(responsesMap);
      }
    } catch (error) {
      console.error("Error fetching farmer responses:", error);
    }
  };

  // Check if farmer has already responded to this demand
  const hasRespondedToDemand = (demandId) => {
    return respondedDemands.includes(demandId);
  };

  // Calculate time since posting
  const getTimeSincePosting = (dateString) => {
    if (!dateString) return 'Recently';
    
    const postedDate = new Date(dateString);
    const now = new Date();
    const differenceMs = now - postedDate;
    const daysAgo = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    
    if (daysAgo < 1) {
      const hoursAgo = Math.floor(differenceMs / (1000 * 60 * 60));
      if (hoursAgo < 1) {
        const minutesAgo = Math.floor(differenceMs / (1000 * 60));
        return minutesAgo <= 1 ? 'Just now' : `${minutesAgo} minutes ago`;
      }
      return hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;
    } else if (daysAgo === 1) {
      return 'Yesterday';
    } else if (daysAgo < 7) {
      return `${daysAgo} days ago`;
    } else if (daysAgo < 30) {
      const weeksAgo = Math.floor(daysAgo / 7);
      return weeksAgo === 1 ? '1 week ago' : `${weeksAgo} weeks ago`;
    } else {
      return formatDate(dateString);
    }
  };

  // Filter demands based on category and search term
  const applyFilters = () => {
    const filtered = demands.filter(demand => {
      // Filter out inactive demands and closed demands
      if (demand.is_active === false || demand.status === 'Closed') return false;
      
      const matchesCategory = selectedCategory === 'all' || demand.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        demand.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demand.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (demand.buyer_name && demand.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
    
    setFilteredDemands(filtered);
  };

  // Filter demands based on favorites toggle
  useEffect(() => {
    if (showFavorites) {
      const favoriteDemandIds = favoriteDemands.map(fav => 
        fav.demand_details.id
      );
      
      setFilteredDemands(
        demands.filter(demand => 
          favoriteDemandIds.includes(demand.id)
        )
      );
    } else {
      // Apply normal filters
      applyFilters();
    }
  }, [showFavorites, favoriteDemands, demands, selectedCategory, searchTerm]);

  // Show buyer details modal
  const showBuyerDetails = (buyer) => {
    if (!buyer) {
      message.error("Buyer information is not available");
      return;
    }
    setSelectedBuyer(buyer);
    setIsModalVisible(true);
  };

  // Show respond modal
  const showRespondModal = (demand) => {
    if (!demand) {
      message.error("Cannot respond to this demand. Invalid demand data.");
      return;
    }
    
    // Check if the farmer has already responded to this demand
    if (hasRespondedToDemand(demand.id)) {
      message.info("You have already responded to this demand. The buyer will review your offer.");
      return;
    }
    
    setSelectedDemand(demand);
    setIsRespondModalVisible(true);
  };

  // Handle modal closures
  const handleBuyerModalClose = () => {
    setIsModalVisible(false);
    // Reset buyer after modal animation completes
    setTimeout(() => {
      if (!isModalVisible) {
        setSelectedBuyer(null);
      }
    }, 300);
  };

  const handleRespondModalClose = () => {
    setIsRespondModalVisible(false);
    // Reset demand after modal animation completes
    setTimeout(() => {
      if (!isRespondModalVisible) {
        setSelectedDemand(null);
      }
    }, 300);
  };

  // Show response details modal
  const showResponseDetails = async (demandId) => {
    setLoadingResponse(true);
    
    try {
      // Check if we already have the response in state
      if (farmerResponses[demandId]) {
        setSelectedResponse(farmerResponses[demandId]);
        setResponseModalVisible(true);
        setLoadingResponse(false);
        return;
      }
      
      // If not, fetch it from the API
      const token = localStorage.getItem('access_token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const farmerId = userData.id;
      
      if (!farmerId || !token) {
        message.error("Authentication information missing");
        setLoadingResponse(false);
        return;
      }
      
      const response = await axios.get(`http://127.0.0.1:8000/api/demand-responses/?demand=${demandId}&farmer=${farmerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const responseData = response.data[0];
        
        // Update our responses map
        const updatedResponses = {...farmerResponses};
        updatedResponses[demandId] = responseData;
        setFarmerResponses(updatedResponses);
        
        setSelectedResponse(responseData);
        setResponseModalVisible(true);
      } else {
        message.error("Could not find your response details");
      }
    } catch (error) {
      console.error("Error fetching response details:", error);
      message.error("Failed to load your response details");
    } finally {
      setLoadingResponse(false);
    }
  };
  
  // Close response details modal
  const handleResponseModalClose = () => {
    setResponseModalVisible(false);
    setTimeout(() => {
      if (!responseModalVisible) {
        setSelectedResponse(null);
      }
    }, 300);
  };

  // Update the demand actions section to include the respond button
  const renderDemandActions = (demand) => {
    const alreadyResponded = hasRespondedToDemand(demand.id);
    const respondButtonTooltip = alreadyResponded 
      ? "You have already responded to this demand" 
      : "Respond to this demand";
    
    return (
      <div className="demand-actions">
        <Tooltip title={respondButtonTooltip}>
          {alreadyResponded ? null : <Button 
            type="primary" 
            icon={<SendOutlined />} 
            className="respond-btn"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              if (!demand) {
                return;
              }
              showRespondModal(demand);
            }}
            disabled={!demand.isAvailable || alreadyResponded}
          >
            {alreadyResponded ? "Already Responded" : "Respond to Demand"}
          </Button>}
        </Tooltip>
        
        {/* My Response button - only show for demands the farmer has responded to */}
        {alreadyResponded && (
          <Button 
            icon={<FileTextOutlined />} 
            className="view-response-btn"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              showResponseDetails(demand.id);
            }}
            loading={loadingResponse && selectedResponse?.demand === demand.id}
          >
            View My Response
          </Button>
        )}
        
        <Button 
          icon={<MessageOutlined />} 
          className="contact-btn"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            showBuyerDetails(demand.buyerInfo);
          }}
        >
          Contact Buyer
        </Button>
        
        <Button 
          icon={demand.isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
          onClick={() => toggleFavorite(demand)}
        >
          {demand.isFavorite ? 'Favorited' : 'Favorite'}
        </Button>
      </div>
    );
  };

  // Function to fetch user's favorite demands
  const fetchFavoriteDemands = async () => {
    setLoadingFavorites(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found');
        setLoadingFavorites(false);
        return;
      }

      const response = await axios.get(
        'http://127.0.0.1:8000/api/favorites/demands/',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setFavoriteDemands(response.data);
        
        // Update the isFavorite property of all demands
        setDemands(prevDemands => 
          prevDemands.map(demand => ({
            ...demand,
            isFavorite: response.data.some(fav => 
              fav.demand_details.id === demand.id || 
              (fav.demand_details.id === demand.id)
            )
          }))
        );
        
        // Also update filtered demands
        setFilteredDemands(prevDemands => 
          prevDemands.map(demand => ({
            ...demand,
            isFavorite: response.data.some(fav => 
              fav.demand_details.id === demand.id || 
              (fav.demand_details.id === demand.id)
            )
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching favorite demands:', error);
      message.error('Failed to load favorite demands');
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Function to toggle favorite status of a demand
  const toggleFavorite = async (demand) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Please log in to add favorites');
        return;
      }

      if (demand.isFavorite) {
        // Remove from favorites
        await axios.delete(
          `http://127.0.0.1:8000/api/favorites/demands/${demand.id}/remove/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        message.success('Removed from favorites');
      } else {
        // Add to favorites
        await axios.post(
          'http://127.0.0.1:8000/api/favorites/demands/',
          { demand: demand.id },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        message.success('Added to favorites');
      }

      // Update local state
      const updatedDemand = { ...demand, isFavorite: !demand.isFavorite };
      
      // Update demands list
      setDemands(prevDemands => 
        prevDemands.map(d => d.id === demand.id ? updatedDemand : d)
      );
      
      // Update filtered demands
      setFilteredDemands(prevDemands => 
        prevDemands.map(d => d.id === demand.id ? updatedDemand : d)
      );
      
      // Refresh favorites list
      fetchFavoriteDemands();
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Failed to update favorites');
    }
  };

  // Fetch demands and favorites on component mount
  useEffect(() => {
    fetchDemands();
    fetchFavoriteDemands();
  }, []);

  // Add a function to create demo demands using local data when API fails
  const createDemoDemandsFromLocalData = () => {
    // Sample buyer profiles
    const localBuyers = [
      {
        id: 1,
        name: "Aibal Jacob",
        email: "aibal@farmily.com",
        phone: "+91 98765 43210",
        address: "123 Market Road",
        city: "Kottayam",
        state: "Kerala",
        country: "India",
        image: null,
        isVerified: true,
        type: "Business"
      }
    ];
    
    // Map buyers to a format the processor can use
    const buyerMap = {};
    localBuyers.forEach(buyer => {
      buyerMap[buyer.id] = buyer;
    });
    
    // Local demand data based on what we're seeing in the UI
    const localDemands = [
      {
        id: 101,
        title: "Rubber for Manufacturing",
        category: "rubber",
        product_name: "Rubber",
        quantity: 6.00,
        unit: "kg",
        price_per_unit: 7.00,
        valid_until: "2025-03-21",
        requirements: "High quality natural rubber",
        is_active: false,
        created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
        buyer: 1,
        status: "Closed",
        isAvailable: false
      },
      {
        id: 102,
        title: "Black Pepper for Food Processing",
        category: "pepper",
        product_name: "Black Pepper",
        quantity: 1.00,
        unit: "kg",
        price_per_unit: 100.00,
        valid_until: "2025-03-23",
        requirements: "Premium quality black pepper",
        is_active: true,
        created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
        buyer: 1,
        status: "Open",
        isAvailable: true
      },
      {
        id: 103,
        title: "Tea Leaves (Premium Quality)",
        category: "tea",
        product_name: "Tea",
        quantity: 10.00,
        unit: "kg",
        price_per_unit: 67.00,
        valid_until: "2025-03-24",
        requirements: "Premium quality tea leaves",
        is_active: true,
        created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
        buyer: 1,
        status: "Open",
        isAvailable: true
      }
    ];
    
    // Use our processing function to normalize the data
    const processedDemands = processDemandsWithBuyerInfo(localDemands, buyerMap);
    
    // Return only active demands
    return processedDemands.filter(demand => demand.is_active !== false);
  };

  // Process API response to handle buyer information properly
  const processDemandsWithBuyerInfo = (demandsData, buyersMap) => {
    return demandsData.map(demand => {
      // Try to get buyer_id from various possible fields
      const buyerId = demand.buyer || demand.buyer_id || demand.user_id || demand.id || null;
      
      // Get buyer info from the map or use demo data
      let buyerInfo = null;
      if (buyerId && buyersMap[buyerId]) {
        buyerInfo = buyersMap[buyerId];
      } else {
        buyerInfo = {
          id: buyerId || demand.id || Math.floor(Math.random() * 1000 + 1),
          name: 'Aibal Jacob',
          email: 'aibal@farmily.com',
          phone: '+91 98765 43210',
          address: 'Demo Address',
          city: 'Kottayam',
          state: 'Kerala',
          country: 'India',
          image: null,
          isVerified: true,
          type: 'Business',
          bio: 'Farmer and agricultural products buyer.'
        };
      }
      
      // Fix the image path if needed
      if (buyerInfo.image && !buyerInfo.image.startsWith('http') && !buyerInfo.image.startsWith('/')) {
        buyerInfo.image = `/${buyerInfo.image}`;
      }
      
      // Calculate time-related fields
      const timeSincePosting = getTimeSincePosting(demand.created_at);
      const availableTill = formatDate(demand.valid_until || demand.validity_date);
      const postedOn = formatDate(demand.created_at);
      
      // Check if demand is expired based on validity date
      const validityDate = demand.valid_until || demand.validity_date;
      const isExpired = validityDate ? new Date(validityDate) < new Date() : false;
      const status = isExpired ? 'Closed' : 'Open';
      
      // Create the final demand object with all needed fields
      return {
        ...demand,
        buyerInfo,
        postedAt: timeSincePosting,
        postedOn: postedOn,
        availableTill: availableTill,
        status: status,
        isAvailable: demand.is_active !== false && !isExpired,
        // Ensure these fields exist
        title: demand.title || `${demand.product_name || 'Product'} Request`,
        product_name: demand.product_name || 'Product',
        category: demand.category || 'others',
        quantity: demand.quantity || 0,
        unit: demand.unit || 'kg',
        price_per_unit: demand.price_per_unit || 0,
        requirements: demand.requirements || ''
      };
    });
  };

  // Handle successful response submission
  const handleResponseSubmit = (demandId) => {
    if (!respondedDemands.includes(demandId)) {
      setRespondedDemands([...respondedDemands, demandId]);
    }
  };
  
  // Handle revoking a demand response
  const handleRevokeResponse = async (demandId, responseId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error("You must be logged in to revoke a response");
        return;
      }
      
      // Show confirmation message to the user
      Modal.confirm({
        title: 'Revoke Response',
        content: 'Are you sure you want to revoke your response to this demand? This action cannot be undone.',
        okText: 'Yes, Revoke',
        okType: 'danger',
        cancelText: 'No, Keep My Response',
        onOk: async () => {
          try {
            setLoadingResponse(true);
            
            // Delete the response from the API
            await axios.delete(`http://127.0.0.1:8000/api/demand-responses/${responseId}/`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Update state to reflect the deleted response
            const updatedResponses = { ...farmerResponses };
            delete updatedResponses[demandId];
            setFarmerResponses(updatedResponses);
            
            // Remove the demand ID from the responded demands list
            const updatedRespondedDemands = respondedDemands.filter(id => id !== demandId);
            setRespondedDemands(updatedRespondedDemands);
            
            // Close the modal if it's open
            if (responseModalVisible && selectedResponse?.demand === demandId) {
              setResponseModalVisible(false);
              setSelectedResponse(null);
            }
            
            message.success('Your response has been successfully revoked');
          } catch (error) {
            console.error("Error revoking response:", error);
            
            if (error.response && error.response.status === 403) {
              message.error("You don't have permission to revoke this response");
            } else if (error.response && error.response.data) {
              message.error(`Failed to revoke: ${error.response.data.detail || 'Unknown error'}`);
            } else {
              message.error("Network error. Please try again later.");
            }
          } finally {
            setLoadingResponse(false);
          }
        }
      });
    } catch (error) {
      console.error("Error preparing to revoke response:", error);
      message.error("Could not process your request. Please try again.");
    }
  };

  // Render response details modal
  const renderResponseDetailsModal = () => {
    return (
      <Modal
        title="My Response Details"
        visible={responseModalVisible}
        onCancel={handleResponseModalClose}
        footer={[
          <Button 
            key="revoke" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRevokeResponse(selectedResponse.demand, selectedResponse.id)}
            disabled={selectedResponse?.status === 'Accepted'}
          >
            Revoke Response
          </Button>,
          <Button key="close" onClick={handleResponseModalClose}>
            Close
          </Button>
        ]}
        width={600}
      >
        {loadingResponse ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p>Loading your response details...</p>
          </div>
        ) : selectedResponse ? (
          <div className="response-details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Status">
                <Tag color={selectedResponse.status === 'Accepted' ? 'green' : 
                           selectedResponse.status === 'Rejected' ? 'red' : 'blue'}>
                  {selectedResponse.status || 'Pending'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Offered Price">
                {formatPrice(selectedResponse.offered_price)} per {
                  demands.find(d => d.id === selectedResponse.demand)?.unit || 'unit'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Offered Quantity">
                {selectedResponse.offered_quantity} {
                  demands.find(d => d.id === selectedResponse.demand)?.unit || 'units'
                }
              </Descriptions.Item>
              {selectedResponse.notes && (
                <Descriptions.Item label="Your Notes">
                  {selectedResponse.notes}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Submitted On">
                {formatDate(selectedResponse.created_at)}
              </Descriptions.Item>
              {selectedResponse.buyer_message && (
                <Descriptions.Item label="Buyer Message">
                  {selectedResponse.buyer_message}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedResponse.status === 'Accepted' && (
              <div className="response-acceptance-note">
                <Alert
                  message="Response Accepted"
                  description="The buyer has accepted your offer. You cannot revoke an accepted response."
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              </div>
            )}
          </div>
        ) : (
          <Empty description="Response details not available" />
        )}
      </Modal>
    );
  };

  // Render demands list
  const renderDemands = () => {
    // Check for loading state
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading demands...</p>
        </div>
      );
    }
    
    // Check for empty state
    if (filteredDemands.length === 0) {
      return (
        <Empty 
          description={
            showFavorites 
              ? "You don't have any favorite demands yet" 
              : "No demands match your filters"
          } 
        />
      );
    }
    
    return (
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: page => {
            window.scrollTo(0, 0);
          },
          pageSize: 5,
        }}
        dataSource={filteredDemands}
        renderItem={demand => (
          <List.Item
            key={demand.id}
            actions={[
              renderDemandActions(demand)
            ]}
            style={{ 
              borderLeft: `4px solid ${categoryColors[demand.category] || '#8c8c8c'}`,
              padding: '16px',
              marginBottom: '16px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
              background: `linear-gradient(to right, ${categoryColors[demand.category] || '#8c8c8c'}15, white)`
            }}
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{demand.title}</span>
                  <Tag color={categoryColors[demand.category] || '#8c8c8c'} style={{ marginLeft: '8px', fontSize: '12px' }}>
                    {categoryOptions.find(opt => opt.value === demand.category)?.label || 'Other'}
                  </Tag>
                  {demand.isFavorite && (
                    <HeartFilled style={{ color: '#ff4d4f', marginLeft: '8px', fontSize: '16px' }} />
                  )}
                </div>
              }
              description={
                <div style={{ marginTop: '4px' }}>
                  <Tag icon={<ShoppingOutlined />} color="processing">{demand.product_name}</Tag>
                </div>
              }
            />
            <div className="demand-spec">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="spec-item">
                    <span className="spec-label"><ShoppingOutlined /> Product:</span>
                    <span className="spec-value">{demand.product_name}</span>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="spec-item">
                    <span className="spec-label"><DollarOutlined /> Price:</span>
                    <span className="spec-value">{formatPrice(demand.price_per_unit)} per {demand.unit}</span>
                  </div>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="spec-item">
                    <span className="spec-label"><CalendarOutlined /> Valid Until:</span>
                    <span className="spec-value">{demand.availableTill || 'N/A'}</span>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="spec-item">
                    <span className="spec-label"><InfoCircleOutlined /> Quantity:</span>
                    <span className="spec-value">{demand.quantity} {demand.unit}</span>
                  </div>
                </Col>
              </Row>
              
              <div className="spec-item">
                <span className="spec-label"><ClockCircleOutlined /> Posted On:</span>
                <span className="spec-value">{demand.postedOn || 'N/A'}</span>
              </div>
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="buyer-demands-page">
      <div className="page-header">
        <Title level={2}>Buyer Demands</Title>
        <div className="filters-section">
          <Space wrap>
            <Search
              placeholder="Search demands"
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
              className="search-input"
            />
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={setSelectedCategory}
              placeholder="Category"
              className="category-select"
            >
              {categoryOptions.map(category => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
            <Button 
              type={showFavorites ? "primary" : "default"}
              icon={<HeartFilled />}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              {showFavorites ? "All Demands" : "My Favorites"}
            </Button>
          </Space>
        </div>
      </div>
      
      <div className="demands-container">
        {renderDemands()}
      </div>
      
      {/* Import and use separate modal components */}
      <BuyerDetailsModal 
        isVisible={isModalVisible}
        buyer={selectedBuyer}
        onClose={handleBuyerModalClose}
      />
      
      <RespondToDemandModal 
        isVisible={isRespondModalVisible}
        demand={selectedDemand}
        onClose={handleRespondModalClose}
        formatPrice={formatPrice}
        onResponseSubmit={handleResponseSubmit}
      />
      
      {/* Response details modal */}
      {renderResponseDetailsModal()}
    </div>
  );
};

export default BuyerDemands;