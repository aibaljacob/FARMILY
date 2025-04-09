import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Button, 
  List, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Row, 
  Col, 
  Radio, 
  Pagination, 
  Empty, 
  Badge, 
  Tooltip, 
  Modal,
  Form,
  Rate,
  Comment,
  Spin,
  Table,
  Divider,
  message
} from 'antd';
import { 
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ShoppingOutlined,
  StarOutlined,
  FilterOutlined,
  SearchOutlined,
  CommentOutlined,
  FlagOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './BuyersView.css';
import filterCouCity from '../Farmers/filtercoucity.json';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Sample buyers data as fallback
const sampleBuyers = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+94 77 123 4567',
    location: 'Colombo, Sri Lanka',
    profile_picture: null,
    rating: '4.8',
    demands_count: 5,
    verified: true
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+94 76 234 5678',
    location: 'Kandy, Sri Lanka',
    profile_picture: null,
    rating: '4.6',
    demands_count: 3,
    verified: true
  },
  {
    id: 3,
    first_name: 'Robert',
    last_name: 'Johnson',
    email: 'robert.j@example.com',
    phone: '+94 75 345 6789',
    location: 'Galle, Sri Lanka',
    profile_picture: null,
    rating: '4.2',
    demands_count: 7,
    verified: true
  },
  {
    id: 4,
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.w@example.com',
    phone: '+94 71 456 7890',
    location: 'Jaffna, Sri Lanka',
    profile_picture: null,
    rating: '4.9',
    demands_count: 9,
    verified: true
  },
  {
    id: 5,
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.b@example.com',
    phone: '+94 78 567 8901',
    location: 'Negombo, Sri Lanka',
    profile_picture: null,
    rating: '4.4',
    demands_count: 2,
    verified: true
  },
  {
    id: 6,
    first_name: 'Lisa',
    last_name: 'Anderson',
    email: 'lisa.a@example.com',
    phone: '+94 72 678 9012',
    location: 'Matara, Sri Lanka',
    profile_picture: null,
    rating: '4.7',
    demands_count: 4,
    verified: true
  }
];

// Sample locations in Sri Lanka
const sriLankaLocations = [
  'Colombo',
  'Kandy',
  'Galle',
  'Jaffna',
  'Negombo',
  'Matara',
  'Anuradhapura',
  'Trincomalee',
  'Batticaloa',
  'Kurunegala',
  'Ratnapura',
  'Badulla'
];

const BuyersView = () => {
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  // New state variables for ratings modal
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [currentBuyer, setCurrentBuyer] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [buyerReviews, setBuyerReviews] = useState({});
  const [activeTab, setActiveTab] = useState('rating');
  // New state variables for sorting and filtering
  const [sortOption, setSortOption] = useState('distance');
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [userCountry, setUserCountry] = useState("India");
  const [userState, setUserState] = useState(null);
  const [userCoordinates, setUserCoordinates] = useState(null);
  // State for demands modal
  const [isDemandModalVisible, setIsDemandModalVisible] = useState(false);
  const [currentBuyerDemands, setCurrentBuyerDemands] = useState([]);
  const [loadingDemands, setLoadingDemands] = useState(false);
  const [currentBuyerForDemands, setCurrentBuyerForDemands] = useState(null);
  // Add state for report modal
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportForm] = Form.useForm();

  // Function to fetch farmer profile to get location
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      // Fetch the farmer profile to get location
      const response = await axios.get('http://127.0.0.1:8000/api/farmer-profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.city) {
        setUserLocation(response.data.city);
        setUserState(response.data.state);
        setUserCountry("India"); // Default to India for the demo
      } else {
        // Default if location is not available
        setUserLocation('Delhi'); 
        setUserState('Delhi');
        setUserCountry("India");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      message.error('Failed to fetch user profile. Please try again.');
      // Default location if profile fetch fails
      setUserLocation('Delhi');
      setUserState('Delhi');
      setUserCountry("India");
    }
  };

  // Initialize states from the filterCouCity data when component mounts
  useEffect(() => {
    // Set states from the India data in filterCouCity
    if (filterCouCity && filterCouCity.states) {
      setStates(filterCouCity.states);
    }
  }, []);

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      // Find the state in the data
      const state = states.find(s => s.name === selectedState);
      if (state && state.cities) {
        setCities(state.cities);
        setSelectedCity(null);
      }
    } else {
      setCities([]);
      setSelectedCity(null);
    }
  }, [selectedState, states]);

  // Process the data to ensure consistent field names
  const normalizeBuyerData = (rawBuyer) => {
    // Extract user data if nested
    const userData = rawBuyer.user || {};
    
    // Get basic fields, checking all possible property names
    const firstName = rawBuyer.user_first_name || rawBuyer.first_name || userData.first_name || '';
    const lastName = rawBuyer.user_last_name || rawBuyer.last_name || userData.last_name || '';
    const email = rawBuyer.email || rawBuyer.user_email || userData.email || '';
    const phone = rawBuyer.phone || rawBuyer.phone_number || rawBuyer.phoneno || '';
    const profilePic = rawBuyer.profilepic || rawBuyer.profile_picture || 
                      rawBuyer.profile_pic || rawBuyer.profile_image || '';
    const location = rawBuyer.location || rawBuyer.address || rawBuyer.city || 'Unknown';
    const verified = rawBuyer.normalized_verified !== undefined ? 
                    rawBuyer.normalized_verified : 
                    rawBuyer.verified !== undefined ? 
                    rawBuyer.verified : 
                    rawBuyer.is_verified || true;
    
    // Create normalized buyer object
    return {
      ...rawBuyer, // Keep original data
      // Add normalized fields
      normalized_first_name: firstName,
      normalized_last_name: lastName,
      normalized_email: email,
      normalized_phone: phone,
      normalized_profile_pic: profilePic,
      normalized_location: location,
      normalized_verified: verified
    };
  };

  // Function to fetch buyers from backend
  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('You must be logged in to view buyers');
        return;
      }
      
      const response = await axios.get(
        'http://127.0.0.1:8000/api/all-buyer-profiles/',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Process buyers to add proximity calculation and normalize data
      const processedBuyers = response.data.map(buyer => {
        // First normalize the data
        const normalizedBuyer = normalizeBuyerData(buyer);
        
        // Calculate proximity if user location is available
        let proximityScore = 0;
        if (userLocation) {
          // Simple proximity calculation (can be enhanced for real-world use)
          const buyerLocation = normalizedBuyer.normalized_location.toLowerCase();
          if (buyerLocation.includes(userLocation.toLowerCase())) {
            proximityScore = 100; // Perfect match
          } else {
            // Lower score for partial match or known location
            proximityScore = sriLankaLocations.some(loc => 
              buyerLocation.includes(loc.toLowerCase())) ? 50 : 25;
          }
        }
        
        return {
          ...normalizedBuyer,
          proximity: proximityScore,
          demands_count: 0, // Initialize demands_count to 0, will be updated when demand data is fetched
          reviews: [] // Initialize reviews to empty array
        };
      });
      
      setBuyers(processedBuyers);
      setFilteredBuyers(processedBuyers);
      setUsingSampleData(false);
      
      // Get user location if enabled
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            
            // Reverse geocode to get location name
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
              .then(response => response.json())
              .then(data => {
                const locationName = data.address.city || data.address.town || data.address.village || data.address.county;
                setUserLocation(locationName);
              })
              .catch(error => console.error('Error getting location name:', error));
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      }
      
      // Fetch demand counts and reviews for each buyer
      processedBuyers.forEach(async (buyer) => {
        try {
          const buyerId = buyer.user || buyer.id;
          if (!buyerId) return;
          
          // Fetch demands count
          const demandResponse = await axios.get(
            `http://127.0.0.1:8000/api/buyers/${buyerId}/demands/`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          // Fetch reviews for the buyer
          const reviewsResponse = await axios.get(
            `http://127.0.0.1:8000/api/buyer-ratings/${buyerId}/`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          // Update the buyer with demand count and reviews
          setBuyers(prevBuyers => 
            prevBuyers.map(b => 
              (b.id === buyer.id || b.user === buyer.user) ? 
              { 
                ...b, 
                demands_count: demandResponse.data?.length || 0,
                reviews: reviewsResponse.data?.ratings || []
              } : b
            )
          );
          
          // Also update filtered buyers
          setFilteredBuyers(prevBuyers => 
            prevBuyers.map(b => 
              (b.id === buyer.id || b.user === buyer.user) ? 
              { 
                ...b, 
                demands_count: demandResponse.data?.length || 0,
                reviews: reviewsResponse.data?.ratings || []
              } : b
            )
          );
        } catch (error) {
          console.error(`Error fetching demands and reviews for buyer ${buyer.id}:`, error);
        }
      });
    } catch (error) {
      console.error('Error fetching buyers:', error);
      message.error('Failed to load buyers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters to buyers list
  const applyFilters = () => {
    let result = [...buyers];
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(buyer => 
        (buyer.normalized_first_name + ' ' + buyer.normalized_last_name).toLowerCase().includes(searchLower) ||
        buyer.normalized_email.toLowerCase().includes(searchLower) ||
        buyer.normalized_location.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by location
    if (filterLocation !== 'all') {
      result = result.filter(buyer => 
        buyer.normalized_location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    // Apply state filter
    if (selectedState) {
      result = result.filter(buyer => 
        buyer.state && buyer.state.toLowerCase() === selectedState.toLowerCase()
      );
    }

    // Apply city filter
    if (selectedCity) {
      result = result.filter(buyer => 
        buyer.city && buyer.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      result = result.filter(buyer => 
        buyer.rating >= ratingFilter
      );
    }
    
    // Apply sorting
    if (sortOption === 'distance') {
      result.sort((a, b) => b.proximity - a.proximity);
    } else if (sortOption === 'alphabetical') {
      result.sort((a, b) => {
        const nameA = `${a.normalized_first_name} ${a.normalized_last_name}`.toLowerCase();
        const nameB = `${b.normalized_first_name} ${b.normalized_last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'demands') {
      result.sort((a, b) => b.demands_count - a.demands_count);
    }
    
    setFilteredBuyers(result);
  };

  // Apply filters when filter criteria changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterLocation, distanceFilter, showNearbyOnly, buyers, selectedState, selectedCity, ratingFilter, sortOption]);

  // Handle page change in pagination
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };
  

  
  // Location dropdown change
  const handleLocationChange = (value) => {
    setFilterLocation(value);
  };
  
  // Distance radio button change
  const handleDistanceChange = (e) => {
    setDistanceFilter(e.target.value);
  };
  
  // Search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortOption(value);
  };

  // Handle state change
  const handleStateChange = (value) => {
    setSelectedState(value);
  };

  // Handle city change
  const handleCityChange = (value) => {
    setSelectedCity(value);
  };

  // Handle rating filter change
  const handleRatingFilterChange = (value) => {
    setRatingFilter(value);
  };

  // Function to handle using current user's location
  const handleUseMyLocation = () => {
    setSelectedCountry(userCountry);
    setSelectedState(userState);
    setSelectedCity(userLocation);
    message.success('Using your location for filtering');
  };

  // Load data when component mounts
  useEffect(() => {
    fetchUserProfile();
    fetchBuyers();
  }, []);
  
  // Calculate pagination
  const paginatedBuyers = filteredBuyers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Show sample data notification if using fallback data
  useEffect(() => {
    if (usingSampleData) {
      message.warning('Using sample data as API request failed', 5);
    }
  }, [usingSampleData]);

  // Function to handle opening the rating modal
  const showRatingModal = (buyer) => {
    setCurrentBuyer(buyer);
    // Try to fetch existing reviews for this buyer
    fetchBuyerReviews(buyer.user);
    setIsRatingModalVisible(true);
  };

  // Function to close the rating modal
  const handleRatingCancel = () => {
    setIsRatingModalVisible(false);
    setUserRating(0);
    setUserReview('');
    setCurrentBuyer(null);
  };

  // Function to submit a rating and review
  const handleRatingSubmit = async () => {
    if (!userRating) {
      message.error('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Submit the rating and review to the backend
      await axios.post('http://127.0.0.1:8000/api/buyer-ratings/', {
        buyer_id: currentBuyer.user,
        rating: userRating,
        review: userReview
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('Rating submitted successfully');
      
      // Refresh the buyer reviews
      fetchBuyerReviews(currentBuyer.user);
      
      // Refresh the buyers list to update the ratings
      fetchBuyers();
      
      // Clear the form
      setUserRating(0);
      setUserReview('');
      setActiveTab('reviews');
    } catch (error) {
      console.error("Error submitting rating:", error);
      message.error('Failed to submit rating. Please try again.');
      
      // If in sample data mode, simulate a successful submission
      if (usingSampleData) {
        // Add the review to the local state
        const newReview = {
          id: Date.now(),
          user_name: 'You',
          rating: userRating,
          review: userReview,
          created_at: new Date().toISOString()
        };
        
        setBuyerReviews({
          ...buyerReviews,
          [currentBuyer.user]: [
            ...(buyerReviews[currentBuyer.user] || []),
            newReview
          ]
        });
        
        message.success('Rating submitted successfully (Sample Mode)');
        setUserRating(0);
        setUserReview('');
        setActiveTab('reviews');
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  // Function to fetch reviews for a specific buyer
  const fetchBuyerReviews = async (buyerId) => {
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch reviews from the backend
      const response = await axios.get(`http://127.0.0.1:8000/api/buyer-ratings/${buyerId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setBuyerReviews({
          ...buyerReviews,
          [buyerId]: response.data.ratings
        });
        console.log("buyerReviews",buyerReviews);
      }
    } catch (error) {
      console.error("Error fetching buyer reviews:", error);
      
      // If in sample data mode, generate sample reviews
      if (usingSampleData) {
        const sampleReviews = [
          {
            id: 1,
            user_name: 'Sample Farmer 1',
            rating: 4.5,
            review: 'Great buyer! Very reliable and prompt payments.',
            created_at: '2023-01-15T10:30:00Z'
          },
          {
            id: 2,
            user_name: 'Sample Farmer 2',
            rating: 5,
            review: 'Excellent communication and fair negotiations. Highly recommended!',
            created_at: '2023-02-20T14:45:00Z'
          },
          {
            id: 3,
            user_name: 'Sample Farmer 3',
            rating: 4,
            review: 'Good business partner, always clear about requirements.',
            created_at: '2023-03-10T09:15:00Z'
          }
        ];
        
        setBuyerReviews({
          ...buyerReviews,
          [buyerId]: sampleReviews
        });
        
      }
    }
  };

  // Function to calculate average rating from reviews
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Function to show demands modal
  const showDemandModal = async (buyer) => {
    setCurrentBuyerForDemands(buyer);
    setLoadingDemands(true);
    setIsDemandModalVisible(true);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('You must be logged in to view demands');
        return;
      }
      
      // Get the buyer's user ID
      const buyerId = buyer.user || buyer.id || buyer.user_id;
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/buyers/${buyerId}/demands/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setCurrentBuyerDemands(response.data);
    } catch (error) {
      console.error('Error fetching buyer demands:', error);
      message.error('Failed to load demands. Please try again.');
    } finally {
      setLoadingDemands(false);
    }
  };
  
  // Function to close demands modal
  const handleDemandCancel = () => {
    setIsDemandModalVisible(false);
    setCurrentBuyerDemands([]);
    setCurrentBuyerForDemands(null);
  };

  // Function to handle reporting a buyer
  const handleReportBuyer = (buyer) => {
    setCurrentBuyer(buyer);
    setIsReportModalVisible(true);
  };

  // Function to submit a report
  const handleSubmitReport = async () => {
    try {
      await reportForm.validateFields();
      setSubmittingReport(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Please log in to report a buyer');
        setIsReportModalVisible(false);
        return;
      }
      
      const values = reportForm.getFieldsValue();
      
      console.log('Submitting report for buyer:', currentBuyer);
      console.log('Report data:', {
        reported_user: currentBuyer.user,
        reason: values.reason
      });
      
      const response = await axios.post(
        'http://127.0.0.1:8000/api/reports/',
        {
          reported_user: currentBuyer.user,  // Use user ID instead of buyer ID
          reason: values.reason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Report submission response:', response.data);
      
      if (response.status === 201) {
        message.success('Report submitted successfully');
        setIsReportModalVisible(false);
        reportForm.resetFields();
      }
    } catch (error) {
      if (error.response) {
        message.error(`Failed to submit report: ${error.response.data.detail || 'Unknown error'}`);
      } else if (error.request) {
        message.error('Network error. Please check your connection.');
      } else {
        message.error('An error occurred. Please try again.');
      }
    } finally {
      setSubmittingReport(false);
    }
  };

  // Function to cancel report
  const handleCancelReport = () => {
    setIsReportModalVisible(false);
    reportForm.resetFields();
  };

  return (
    <div className="buyers-view-container">
      <div className="buyers-header">
        <Title level={2}>Buyers</Title>
        <Text type="secondary">
          {usingSampleData ? 'Showing sample data' : `Found ${filteredBuyers.length} buyers`}
        </Text>
      </div>

      <div className="buyers-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6} lg={5}>
            <Input 
              placeholder="Search buyers..." 
              prefix={<SearchOutlined />} 
              onChange={handleSearch}
              value={searchTerm}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Sort by"
              style={{ width: '100%' }}
              onChange={handleSortChange}
              value={sortOption}
            >
              <Option value="distance">Distance</Option>
              <Option value="alphabetical">Alphabetical</Option>
              <Option value="rating">Rating (High to Low)</Option>
              <Option value="demands">Demands Count</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Filter by State"
              style={{ width: '100%' }}
              onChange={handleStateChange}
              value={selectedState}
              allowClear
              dropdownRender={menu => (
                <>
                  {menu}
                  {userState && (
                    <Button 
                      type="link" 
                      block 
                      icon={<EnvironmentOutlined />}
                      onClick={() => handleStateChange(userState)}
                    >
                      Your State: {userState}
                    </Button>
                  )}
                </>
              )}
            >
              {states.map(state => (
                <Option key={state.id} value={state.name}>{state.name}</Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Filter by City"
              style={{ width: '100%' }}
              onChange={handleCityChange}
              value={selectedCity}
              disabled={!selectedState}
              allowClear
              dropdownRender={menu => (
                <>
                  {menu}
                  {userLocation && selectedState === userState && (
                    <Button 
                      type="link" 
                      block 
                      icon={<EnvironmentOutlined />}
                      onClick={() => handleCityChange(userLocation)}
                    >
                      Your City: {userLocation}
                    </Button>
                  )}
                </>
              )}
            >
              {cities.map(city => (
                <Option key={city.id} value={city.name}>{city.name}</Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Rating"
              style={{ width: '100%' }}
              onChange={handleRatingFilterChange}
              value={ratingFilter}
              allowClear
            >
              <Option value={0}>Any Rating</Option>
              <Option value={4.5}>4.5 & Above</Option>
              <Option value={4}>4.0 & Above</Option>
              <Option value={3.5}>3.5 & Above</Option>
              <Option value={3}>3.0 & Above</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button 
              type="primary" 
              icon={<EnvironmentOutlined />}
              onClick={handleUseMyLocation}
              disabled={!userCountry && !userState && !userLocation}
            >
              Use My Location
            </Button>
          </Col>
          
          {showNearbyOnly && (
            <Col xs={24} sm={24} md={12} lg={8}>
              <Radio.Group 
                onChange={handleDistanceChange} 
                value={distanceFilter}
              >
                <Radio.Button value="all">Any Distance</Radio.Button>
                <Radio.Button value="very-close">Very Close</Radio.Button>
                <Radio.Button value="close">Close</Radio.Button>
                <Radio.Button value="medium">Medium</Radio.Button>
              </Radio.Group>
            </Col>
          )}
        </Row>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Loading buyers...</Text>
        </div>
      ) : error ? (
        <div className="error-container">
          <Text type="danger">{error}</Text>
        </div>
      ) : filteredBuyers.length === 0 ? (
        <Empty description="No buyers found matching your criteria" />
      ) : (
        <>
          <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            dataSource={paginatedBuyers}
            renderItem={(buyer) => (
              <List.Item>
                <Card 
                  className="buyer-card"
                  actions={[
                    <Tooltip title="View Demands">
                      <Button 
                        type="text" 
                        icon={<ShoppingOutlined />} 
                        onClick={() => showDemandModal(buyer)}
                      >
                        Demands ({buyer.demands_count || 0})
                      </Button>
                    </Tooltip>,
                    <Tooltip title="Rate Buyer">
                      <Button 
                        type="text" 
                        icon={<StarOutlined />} 
                        onClick={() => showRatingModal(buyer)}
                      >
                        Rate
                      </Button>
                    </Tooltip>,
                    <Tooltip title="Report Buyer">
                      <Button 
                        type="text" 
                        icon={<FlagOutlined />} 
                        onClick={() => handleReportBuyer(buyer)}
                        danger
                      >
                        Report
                      </Button>
                    </Tooltip>
                  ]}
                >
                  <div className="buyer-header">
                    <div className="buyer-avatar">
                      <Badge
                        count={
                          (buyer.normalized_verified !== undefined ? 
                            buyer.normalized_verified : 
                            buyer.verified !== undefined ? 
                              buyer.verified : 
                              buyer.is_verified || true) ? (
                            <Tooltip title="Verified Buyer">
                              <div className="verified-badge">✓</div>
                            </Tooltip>
                          ) : null
                        }
                      >
                        <Avatar 
                          size={80} 
                          src={`http://127.0.0.1:8000${buyer.profilepic || buyer.normalized_profile_pic || buyer.profile_picture || buyer.profile_pic || buyer.profile_image}`} 
                          icon={<UserOutlined />} 
                        />
                      </Badge>
                    </div>
                    <div className="buyer-info">
                      <Title level={4}>
                        {buyer.normalized_first_name || buyer.first_name} {buyer.normalized_last_name || buyer.last_name}
                      </Title>
                      <Text className="buyer-location">
                        <EnvironmentOutlined /> {buyer.normalized_location || buyer.location || buyer.address || buyer.city || 'Location unavailable'}
                      </Text>
                    </div>
                  </div>
                  
                  <div className="buyer-details">
                    <div className="contact-info">
                      <p><MailOutlined /> {buyer.normalized_email || buyer.email}</p>
                      <p><PhoneOutlined /> {buyer.normalized_phone || buyer.phoneno || buyer.mobile || 'Phone unavailable'}</p>
                    </div>
                    
                    <div className="buyer-stats">
                      <div className="stat-item">
                        <Text><ShoppingOutlined /> {buyer.demands_count || 0} Demands</Text>
                      </div>
                      
                      <div className="stat-item">
                        <Text>
                          <StarOutlined /> Rating: {buyer.rating || '4.5'}
                        </Text>
                      </div>
                    </div>
                    
                    <div className="buyer-actions">
                      <Button 
                        type="primary" 
                        className="mt-0"
                        icon={<StarOutlined />}
                        onClick={() => showRatingModal(buyer)}
                      >
                        Ratings & Reviews
                      </Button>
                      <Button 
                        className="view-demands-btn"
                        onClick={() => showDemandModal(buyer)}
                      >
                        View Demands
                      </Button>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
          
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredBuyers.length}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['6', '12', '24']}
            />
          </div>
        </>
      )}
      
      {/* Ratings and Reviews Modal */}
      <Modal
        title={currentBuyer ? `Ratings & Reviews for ${currentBuyer.normalized_first_name || currentBuyer.first_name} ${currentBuyer.normalized_last_name || currentBuyer.last_name}` : 'Ratings & Reviews'}
        visible={isRatingModalVisible}
        onCancel={handleRatingCancel}
        footer={null}
        width={600}
      >
        {currentBuyer && (
          <div className="rating-modal-content">
            <div className="rating-tabs">
              <Radio.Group 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value)}
                buttonStyle="solid"
                style={{ marginBottom: '20px' }}
              >
                <Radio.Button value="rating">Rate Buyer</Radio.Button>
                <Radio.Button value="reviews">View Reviews</Radio.Button>
              </Radio.Group>
            </div>

            {activeTab === 'rating' ? (
              <div className="rating-form">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3>Rate this buyer</h3>
                  <Rate 
                    allowHalf 
                    value={userRating} 
                    onChange={setUserRating} 
                    style={{ fontSize: '32px' }}
                  />
                </div>
                
                <Form layout="vertical">
                  <Form.Item label="Write a review (optional)">
                    <Input.TextArea 
                      rows={4} 
                      value={userReview} 
                      onChange={(e) => setUserReview(e.target.value)} 
                      placeholder="Share your experience with this buyer..."
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      onClick={handleRatingSubmit} 
                      loading={submittingRating}
                      block
                    >
                      Submit Rating
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <div className="reviews-list">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3>Buyer Reviews</h3>
                  {buyerReviews[currentBuyer.user] && buyerReviews[currentBuyer.user].length > 0 ? (
                    <div className="average-rating">
                      <Rate 
                        disabled 
                        allowHalf 
                        value={parseFloat(calculateAverageRating(buyerReviews[currentBuyer.user]))} 
                        style={{ fontSize: '24px' }}
                      />
                      <div className="rating-text">
                        {calculateAverageRating(buyerReviews[currentBuyer.user])} out of 5
                        <div className="review-count">
                          Based on {buyerReviews[currentBuyer.user].length} reviews
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Empty description="No reviews yet. Be the first to review!" />
                  )}
                </div>
                
                <List
                  itemLayout="horizontal"
                  dataSource={buyerReviews[currentBuyer.user] || []}
                  renderItem={review => (
                    <List.Item>
                      <Comment
                        author={<Text strong>{review.rated_by_name}</Text>}
                        avatar={<Avatar src={`http://127.0.0.1:8000/${review.profile_picture}`} icon={<UserOutlined />} />}
                        content={
                          <>
                            <Rate disabled allowHalf value={review.rating} style={{ fontSize: '14px' }} />
                            <p style={{ marginTop: '8px' }}>{review.review}</p>
                          </>
                        }
                        datetime={new Date(review.created_at).toLocaleDateString()}
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
      
      {/* Demands Modal */}
      <Modal
        title={currentBuyerForDemands ? `Demands from ${currentBuyerForDemands.normalized_first_name || currentBuyerForDemands.first_name} ${currentBuyerForDemands.normalized_last_name || currentBuyerForDemands.last_name}` : 'Demands'}
        visible={isDemandModalVisible}
        onCancel={handleDemandCancel}
        footer={null}
        width={800}
      >
        {loadingDemands ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p>Loading demands...</p>
          </div>
        ) : (
          <div className="demands-modal-content">
            {currentBuyerDemands.length === 0 ? (
              <Empty description="No demands available from this buyer" />
            ) : (
              <Table
                dataSource={currentBuyerDemands}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'product_name',
                    key: 'product_name',
                    render: (text, record) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {record.image && (
                          <img 
                            src={`http://127.0.0.1:8000${record.image}`} 
                            alt={text} 
                            style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }} 
                          />
                        )}
                        <span>{text || record.title || 'Unnamed Product'}</span>
                      </div>
                    ),
                  },
                  {
                    title: 'Category',
                    dataIndex: 'category',
                    key: 'category',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    render: (quantity, record) => `${quantity} ${record.unit || 'units'}`,
                  },
                  {
                    title: 'Budget',
                    dataIndex: 'budget',
                    key: 'budget',
                    render: (budget) => budget ? `₹${budget}` : 'Not specified',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color={
                        status === 'open' ? 'green' : 
                        status === 'closed' ? 'red' : 
                        status === 'fulfilled' ? 'blue' : 
                        'default'
                      }>
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Open'}
                      </Tag>
                    ),
                  },
                ]}
                expandable={{
                  expandedRowRender: (record) => (
                    <div>
                      <p style={{ margin: 0 }}><strong>Description:</strong> {record.description}</p>
                      <p style={{ margin: 0 }}><strong>Quantity Needed:</strong> {record.quantity} {record.unit || 'units'}</p>
                      <p style={{ margin: 0 }}><strong>Budget:</strong> {record.budget ? `₹${record.budget}` : 'Not specified'}</p>
                      <p style={{ margin: 0 }}><strong>Posted on:</strong> {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'Unknown'}</p>
                      <p style={{ margin: 0 }}><strong>Delivery Location:</strong> {record.delivery_location || 'Not specified'}</p>
                      <p style={{ margin: 0 }}><strong>Delivery Date:</strong> {record.delivery_date ? new Date(record.delivery_date).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                  ),
                }}
              />
            )}
          </div>
        )}
      </Modal>
      
      {/* Report Modal */}
      <Modal
        title={`Report ${currentBuyer ? `${currentBuyer.first_name} ${currentBuyer.last_name}` : 'Buyer'}`}
        visible={isReportModalVisible}
        onCancel={handleCancelReport}
        footer={[
          <Button key="cancel" onClick={handleCancelReport}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger
            loading={submittingReport} 
            onClick={handleSubmitReport}
          >
            Submit Report
          </Button>
        ]}
      >
        <Form
          form={reportForm}
          layout="vertical"
        >
          <Form.Item
            name="reason"
            label="Reason for reporting"
            rules={[{ required: true, message: 'Please provide a reason for your report' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Please explain why you are reporting this buyer"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
          </Form.Item>
          <div className="report-guidelines">
            <p>Please only report buyers for legitimate reasons such as:</p>
            <ul>
              <li>Fraudulent behavior</li>
              <li>Inappropriate content</li>
              <li>Harassment or abusive behavior</li>
              <li>Misrepresentation or false claims</li>
            </ul>
            <p>False reports may result in action against your account.</p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BuyersView;