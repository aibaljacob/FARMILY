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
import './Farmers.css';
import filterCouCity from './filtercoucity.json';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Sample farmers data as fallback
const sampleFarmers = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+94 77 123 4567',
    location: 'Colombo, Sri Lanka',
    profile_picture: null,
    rating: '4.8',
    products_count: 12,
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
    products_count: 8,
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
    products_count: 15,
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
    products_count: 20,
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
    products_count: 10,
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
    products_count: 14,
    verified: true
  },
  {
    id: 7,
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david.w@example.com',
    phone: '+94 77 789 0123',
    location: 'Anuradhapura, Sri Lanka',
    profile_picture: null,
    rating: '4.3',
    products_count: 7,
    verified: false
  },
  {
    id: 8,
    first_name: 'Emily',
    last_name: 'Taylor',
    email: 'emily.t@example.com',
    phone: '+94 76 890 1234',
    location: 'Trincomalee, Sri Lanka',
    profile_picture: null,
    rating: '4.5',
    products_count: 9,
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

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
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
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [currentFarmer, setCurrentFarmer] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [farmerReviews, setFarmerReviews] = useState({});
  const [activeTab, setActiveTab] = useState('rating');
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [userCountry, setUserCountry] = useState("India");
  const [userState, setUserState] = useState(null);
  const [sortOption, setSortOption] = useState('distance');
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [currentFarmerProducts, setCurrentFarmerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [currentFarmerForProducts, setCurrentFarmerForProducts] = useState(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportForm] = Form.useForm();

  // Function to fetch buyer profile to get location
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      // Fetch the buyer profile to get location
      const response = await axios.get('http://127.0.0.1:8000/api/buyer-profile/', {
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

  // Function to handle sorting change
  const handleSortChange = (value) => {
    setSortOption(value);
  };

  // Function to fetch farmers from backend
  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error('You must be logged in to view farmers');
        return;
      }

      // Try to fetch from the FarmerProfile endpoint
      const response = await axios.get('http://127.0.0.1:8000/api/all-farmer-profiles/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Debug the API response structure
      
      if (response.data && Array.isArray(response.data)) {
        // Function to normalize farmer data regardless of structure
        const normalizeFarmerData = (rawFarmer) => {
          // Extract user data if nested
          const userData = rawFarmer.user || {};
          // Get basic fields, checking all possible property names
          const firstName = rawFarmer.user_first_name || rawFarmer.first_name || userData.first_name || '';
          const lastName = rawFarmer.user_last_name || rawFarmer.last_name || userData.last_name || '';
          const email = rawFarmer.email || rawFarmer.user_email || userData.email || '';
          const phone = rawFarmer.phoneno || rawFarmer.phone_number || '';
          const profilePic = rawFarmer.profilepic || rawFarmer.profile_picture || 
                            rawFarmer.profile_pic || rawFarmer.profile_image || '';
          const location = rawFarmer.location || rawFarmer.address || rawFarmer.city || 'Unknown';
          const verified = rawFarmer.verified !== undefined ? rawFarmer.verified : 
                          (rawFarmer.is_verified !== undefined ? rawFarmer.is_verified : true);
          
          // Create normalized farmer object
          return {
            ...rawFarmer, // Keep original data
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
        
        // Process farmers to add proximity calculation and normalize data
        const processedFarmers = response.data.map(farmer => {
          // First normalize the data
          const normalizedFarmer = normalizeFarmerData(farmer);
          
          // Get location from farmer profile
          const farmerLocation = normalizedFarmer.normalized_location;
          
          // Calculate proximity score
          let proximity = 0;
          if (farmerLocation === userLocation) {
            proximity = 100; // Exact match
          } else if (userLocation && farmerLocation !== 'Unknown') {
            // Check for partial matches
            if (farmerLocation.toLowerCase().includes(userLocation.toLowerCase()) || 
                userLocation.toLowerCase().includes(farmerLocation.toLowerCase())) {
              proximity = 70;
            } else {
              proximity = 30;
            }
          }

          return {
            ...normalizedFarmer,
            proximity: proximity,
            location: farmerLocation,
            products_count: 0, // Initialize products_count to 0, will be updated when product data is fetched
            reviews: [] // Initialize reviews to empty array
          };
        });

        setFarmers(processedFarmers);
        setFilteredFarmers(processedFarmers);
        setUsingSampleData(false);
        
        // Fetch product counts and reviews for each farmer
        processedFarmers.forEach(async (farmer) => {
          try {
            const farmerId = farmer.user || farmer.id;
            if (!farmerId) return;
            
            // Fetch products count
            const productResponse = await axios.get(
              `http://127.0.0.1:8000/api/farmers/${farmerId}/products/`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            // Fetch reviews for the farmer
            const reviewsResponse = await axios.get(
              `http://127.0.0.1:8000/api/farmers/${farmerId}/ratings`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            // Update the farmer with product count and reviews
            setFarmers(prevFarmers => 
              prevFarmers.map(f => 
                (f.id === farmer.id || f.user === farmer.user) ? 
                { 
                  ...f, 
                  products_count: productResponse.data?.length || 0,
                  reviews: reviewsResponse.data?.ratings || []
                } : f
              )
            );
            
            // Also update filtered farmers
            setFilteredFarmers(prevFarmers => 
              prevFarmers.map(f => 
                (f.id === farmer.id || f.user === farmer.user) ? 
                { 
                  ...f, 
                  products_count: productResponse.data?.length || 0,
                  reviews: reviewsResponse.data?.ratings || []
                } : f
              )
            );
          } catch (error) {
            console.error(`Error fetching products and reviews for farmer ${farmer.id}:`, error);
          }
        });
      } else {
        // If response is not as expected, use sample data
        console.warn("API response format unexpected, using sample data");
        setFarmers(sampleFarmers);
        setFilteredFarmers(sampleFarmers);
        setUsingSampleData(true);
      }
      
      setError(null);
    } catch (error) {
      console.error("Error fetching farmers:", error);
      
      // Fall back to sample data
      console.warn("Using sample data due to API error");
      setFarmers(sampleFarmers);
      setFilteredFarmers(sampleFarmers);
      setUsingSampleData(true);
      
      // Show a message but don't set error state to avoid error screen
      message.warning("Using sample data: Couldn't connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Initialize by fetching user profile first
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch farmers when component mounts or user location changes
  useEffect(() => {
    if (userLocation) {
      fetchFarmers();
    }
  }, [userLocation]);

  // Apply filters when any filter criteria changes
  useEffect(() => {
    applyFilters();
  }, [showNearbyOnly, searchTerm, filterLocation, distanceFilter, selectedState, selectedCity, ratingFilter, sortOption, farmers]);

  // Function to filter farmers based on current criteria
  const applyFilters = () => {
    let result = [...farmers];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(farmer => 
        (farmer.first_name + ' ' + farmer.last_name).toLowerCase().includes(searchLower) ||
        farmer.email.toLowerCase().includes(searchLower) ||
        (farmer.city && farmer.city.toLowerCase().includes(searchLower))
      );
    }

    // Apply state filter
    if (selectedState) {
      result = result.filter(farmer => 
        farmer.state && farmer.state.toLowerCase() === selectedState.toLowerCase()
      );
    }

    // Apply city filter
    if (selectedCity) {
      result = result.filter(farmer => 
        farmer.city && farmer.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      result = result.filter(farmer => 
        farmer.rating >= ratingFilter
      );
    }
    
    // Apply sorting
    if (sortOption === 'distance') {
      result.sort((a, b) => b.proximity - a.proximity);
    } else if (sortOption === 'alphabetical') {
      result.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortOption === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'products') {
      result.sort((a, b) => b.products_count - a.products_count);
    }
    
    setFilteredFarmers(result);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleLocationChange = (value) => {
    setFilterLocation(value);
  };

  const handleDistanceChange = (e) => {
    setDistanceFilter(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
  };

  const handleRatingFilterChange = (value) => {
    setRatingFilter(value);
  };

  const handleUseMyLocation = () => {
    setSelectedCountry(userCountry);
    setSelectedState(userState);
    setSelectedCity(userLocation);
    message.success('Using your location for filtering');
  };

  const paginatedFarmers = filteredFarmers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Function to handle opening the rating modal
  const showRatingModal = (farmer) => {
    setCurrentFarmer(farmer);
    // Try to fetch existing reviews for this farmer
    fetchFarmerReviews(currentFarmer.user);
    setIsRatingModalVisible(true);
  };

  // Function to close the rating modal
  const handleRatingCancel = () => {
    setIsRatingModalVisible(false);
    setUserRating(0);
    setUserReview('');
    setCurrentFarmer(null);
  };

  // Function to submit a rating and review
  const handleRatingSubmit = async () => {
    console.log('Submitting rating for farmer:', currentFarmer)
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
      await axios.post(`http://127.0.0.1:8000/api/farmers/${currentFarmer.user}/ratings/`, {
        farmer_id: currentFarmer.user,
        rating: userRating,
        review: userReview
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('Rating submitted successfully');
      
      // Refresh the farmer reviews
      fetchFarmerReviews(currentFarmer.user);
      console.log("bahahahahah",currentFarmer.user)
      
      // Refresh the farmers list to update the ratings
      fetchFarmers();
      
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
        
        setFarmerReviews({
          ...farmerReviews,
          [currentFarmer.id]: [
            ...(farmerReviews[currentFarmer.id] || []),
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

  // Function to fetch reviews for a specific farmer
  const fetchFarmerReviews = async (farmerId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch reviews from the backend
      // Updated endpoint to match the backend structure
      const response = await axios.get(`http://127.0.0.1:8000/api/farmers/${farmerId}/ratings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setFarmerReviews({
          ...farmerReviews,
          [farmerId]: response.data.ratings
        });console.log("asdfhbafhsdf",farmerReviews);
      }
    } catch (error) {
      console.error("Error fetching farmer reviews:", error);
      
      // If in sample data mode, generate sample reviews
      if (usingSampleData) {
        const sampleReviews = [
          {
            id: 1,
            user_name: 'Sample User 1',
            rating: 4.5,
            review: 'Great farmer! Very reliable and high-quality products.',
            created_at: '2023-01-15T10:30:00Z'
          },
          {
            id: 2,
            user_name: 'Sample User 2',
            rating: 5,
            review: 'Excellent service and communication. Highly recommended!',
            created_at: '2023-02-20T14:45:00Z'
          },
          {
            id: 3,
            user_name: 'Sample User 3',
            rating: 4,
            review: 'Good products, delivery was a bit delayed but overall satisfied.',
            created_at: '2023-03-10T09:15:00Z'
          }
        ];
        
        setFarmerReviews({
          ...farmerReviews,
          [farmerId]: sampleReviews
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

  // Function to show product modal
  const showProductModal = async (farmer) => {
    setCurrentFarmerForProducts(farmer);
    setLoadingProducts(true);
    setIsProductModalVisible(true);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('You must be logged in to view products');
        return;
      }
      
      // Get the farmer's user ID
      const farmerId = farmer.user || farmer.id || farmer.user_id;
      
      const response = await axios.get(
        `http://127.0.0.1:8000/api/farmers/${farmerId}/products/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setCurrentFarmerProducts(response.data);
    } catch (error) {
      console.error('Error fetching farmer products:', error);
      message.error('Failed to load products. Please try again.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Function to close product modal
  const handleProductCancel = () => {
    setIsProductModalVisible(false);
    setCurrentFarmerProducts([]);
    setCurrentFarmerForProducts(null);
  };

  // Function to handle reporting a farmer
  const handleReportFarmer = (farmer) => {
    setCurrentFarmer(farmer);
    setIsReportModalVisible(true);
  };

  // Function to submit a report
  const handleSubmitReport = async () => {
    try {
      await reportForm.validateFields();
      setSubmittingReport(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Please log in to report a farmer');
        setIsReportModalVisible(false);
        return;
      }
      
      const values = reportForm.getFieldsValue();
      
      const response = await axios.post(
        'http://127.0.0.1:8000/api/reports/',
        {
          reported_user: currentFarmer.user,  // Use user ID instead of farmer ID
          reason: values.reason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
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

  if (loading) {
    return (
      <div className="farmers-page">
        <div className="page-header">
          <div>
            <Title level={3}>
              <UserOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
              Farmers
            </Title>
            <Text type="secondary">Browse our network of trusted farmers</Text>
          </div>
        </div>
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="farmers-page">
        <div className="page-header">
          <div>
            <Title level={3}>
              <UserOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
              Farmers
            </Title>
            <Text type="secondary">Browse our network of trusted farmers</Text>
          </div>
        </div>
        <div className="error-container">
          <Text type="danger">{error}</Text>
          <Button type="primary" onClick={fetchFarmers}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="farmers-page">
      <div className="page-header">
        <div>
          <Title level={3}>
            <UserOutlined style={{ marginRight: '8px', color: '#2d6a4f' }} />
            Farmers
          </Title>
          <Text type="secondary">Browse our network of trusted farmers</Text>
        </div>
        {usingSampleData && (
          <Button type="primary" onClick={fetchFarmers}>
            Refresh Data
          </Button>
        )}
      </div>

      {usingSampleData && (
        <div className="sample-data-notice">
          <Text type="warning">Displaying sample data. Some features may be limited.</Text>
        </div>
      )}

      <div className="farmers-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6} lg={5}>
            <Input 
              placeholder="Search farmers..." 
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
              <Option value="products">Products Count</Option>
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

      {filteredFarmers.length === 0 ? (
        <Empty 
          description="No farmers found matching your criteria." 
          className="empty-state"
        />
      ) : (
        <>
          <div className="results-summary">
            <Text>
              Found {filteredFarmers.length} farmers
              {showNearbyOnly ? ` near ${userLocation}` : ''}
              {filterLocation !== 'all' ? ` in ${filterLocation}` : ''}
              {searchTerm ? ` matching "${searchTerm}"` : ''}
            </Text>
          </div>

          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
            dataSource={paginatedFarmers}
            renderItem={(farmer) => {
              // Log the entire farmer object for debugging
              
              
              return (
                <List.Item>
                  <Card className="farmer-card">
                    {/* Add a debug feature for development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div style={{ position: 'absolute', right: 10, top: 10, fontSize: 10, color: '#999' }}>
                        ID: {farmer.id}
                      </div>
                    )}
                    
                    {showNearbyOnly && farmer.proximity > 0 && (
                      <div className={`proximity-indicator proximity-${farmer.proximity >= 90 ? 'high' : farmer.proximity >= 70 ? 'medium' : 'low'}`}>
                        <Tooltip title={`${farmer.proximity >= 90 ? 'Very close to' : farmer.proximity >= 70 ? 'Close to' : 'Some distance from'} your location`}>
                          <EnvironmentOutlined /> {farmer.proximity >= 90 ? 'Very Close' : farmer.proximity >= 70 ? 'Close' : 'Nearby'}
                        </Tooltip>
                      </div>
                    )}
                    <div className="farmer-header">
                      {(() => {
                        // Log available profile picture fields for debugging
                        
                        
                        const profilePicSrc = farmer.profilepic || 
                                             farmer.normalized_profile_pic || 
                                             farmer.profile_picture || 
                                             farmer.profile_pic || 
                                             farmer.profile_image;
                        
                        return (
                          <Avatar 
                            size={64} 
                            src={`http://127.0.0.1:8000${profilePicSrc}`}
                            icon={<UserOutlined />}
                            className="farmer-avatar"
                          />
                        );
                      })()}
                      <div className="farmer-info">
                        <Title level={4} className="farmer-name">
                          {(() => {
                            // Log available name fields for debugging
                            
                            
                            const firstName = farmer.normalized_first_name || 
                                              farmer.user_first_name || 
                                              farmer.first_name || 
                                              (farmer.user && farmer.user.first_name) || 
                                              'Unknown';
                                              
                            const lastName = farmer.normalized_last_name || 
                                              farmer.user_last_name || 
                                              farmer.last_name || 
                                              (farmer.user && farmer.user.last_name) || 
                                              '';

                            console.log("farmer",farmer)
                            
                            return `${firstName} ${lastName}`;
                          })()}
                        </Title>
                        <Space>
                          {(farmer.normalized_verified !== undefined ? 
                            farmer.normalized_verified : 
                            farmer.verified !== undefined ? 
                              farmer.verified : 
                              farmer.is_verified || true) ? (
                            <Badge status="success" text="Verified" />
                          ) : (
                            <Badge status="default" text="Unverified" />
                          )}
                          <Tag color="green">
                            <StarOutlined /> {farmer.rating || '4.5'}
                          </Tag>
                        </Space>
                      </div>
                    </div>

                    <div className="farmer-details">
                      {(() => {
                        // Log available location fields for debugging
                        
                        
                        const locationText = farmer.location || farmer.address || farmer.city || 'Location not specified';
                        
                        return (
                          <div className="detail-item">
                            <EnvironmentOutlined className="detail-icon" />
                            <Text>{locationText}</Text>
                          </div>
                        );
                      })()}
                      
                      <div className="detail-item">
                        <PhoneOutlined className="detail-icon" />
                        <Text>{farmer.phoneno || farmer.phone_number || 'Phone not available'}</Text>
                      </div>
                      
                      {(() => {
                        // Log available email fields for debugging
                        
                        const emailText = farmer.email || farmer.user_email || (farmer.user && farmer.user.email) || 'Email not available';
                        
                        return (
                          <div className="detail-item">
                            <MailOutlined className="detail-icon" />
                            <Text>{emailText}</Text>
                          </div>
                        );
                      })()}
                      
                      <div className="detail-item">
                        <ShoppingOutlined className="detail-icon" />
                        <Text>{farmer.products_count || 0} Products</Text>
                      </div>
                    </div>

                    <div className="farmer-actions">
                      <Button 
                        type="primary" 
                        block
                        onClick={() => showProductModal(farmer)}
                      >
                        View Products
                      </Button>
                      <Button 
                        type="default" 
                        block 
                        style={{ marginTop: '8px' }}
                        icon={<StarOutlined />}
                        onClick={() => showRatingModal(farmer)}
                      >
                        Ratings & Reviews
                      </Button>
                      <Button 
                        type="default" 
                        block 
                        style={{ marginTop: '8px' }}
                        icon={<FlagOutlined />}
                        onClick={() => handleReportFarmer(farmer)}
                        danger
                      >
                        Report
                      </Button>
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
          
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredFarmers.length}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['6', '12', '24']}
              showTotal={(total) => `Total ${total} farmers`}
            />
          </div>
        </>
      )}

      {/* Ratings and Reviews Modal */}
      <Modal
        title={currentFarmer ? `Ratings & Reviews for ${currentFarmer.normalized_first_name || currentFarmer.first_name} ${currentFarmer.normalized_last_name || currentFarmer.last_name}` : 'Ratings & Reviews'}
        visible={isRatingModalVisible}
        onCancel={handleRatingCancel}
        footer={null}
        width={600}
      >
        {currentFarmer && (
          <div className="rating-modal-content">
            <div className="rating-tabs">
              <Radio.Group 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value)}
                buttonStyle="solid"
                style={{ marginBottom: '20px' }}
              >
                <Radio.Button value="rating">Rate Farmer</Radio.Button>
                <Radio.Button value="reviews">View Reviews</Radio.Button>
              </Radio.Group>
            </div>

            {activeTab === 'rating' ? (
              <div className="rating-form">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3>Rate this farmer</h3>
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
                      placeholder="Share your experience with this farmer..."
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
                  <h3>Farmer Reviews</h3>
                  {farmerReviews[currentFarmer.user] && farmerReviews[currentFarmer.user].length > 0 ? (
                    <div className="average-rating">
                      <Rate 
                        disabled 
                        allowHalf 
                        value={parseFloat(calculateAverageRating(farmerReviews[currentFarmer.user]))} 
                        style={{ fontSize: '24px' }}
                      />
                      <div className="rating-text">
                        {calculateAverageRating(farmerReviews[currentFarmer.user])} out of 5
                        <div className="review-count">
                          Based on {farmerReviews[currentFarmer.user].length} reviews
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Empty description="No reviews yet. Be the first to review!" />
                  )}
                </div>
                
                <List
                  itemLayout="horizontal"
                  dataSource={farmerReviews[currentFarmer.user] || []}
                  renderItem={review => (
                    <List.Item>
                      <Comment
                        author={<Text strong>{review.rated_by_name}</Text>}
                        avatar={<Avatar icon={<UserOutlined />} />}
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
      
      {/* Products Modal */}
      <Modal
        title={currentFarmerForProducts ? `Products from ${currentFarmerForProducts.normalized_first_name || currentFarmerForProducts.first_name} ${currentFarmerForProducts.normalized_last_name || currentFarmerForProducts.last_name}` : 'Products'}
        visible={isProductModalVisible}
        onCancel={handleProductCancel}
        footer={null}
        width={800}
      >
        {loadingProducts ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="products-modal-content">
            {currentFarmerProducts.length === 0 ? (
              <Empty description="No products available from this farmer" />
            ) : (
              <Table
                dataSource={currentFarmerProducts}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                columns={[
                  {
                    title: 'Product',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {record.image && (
                          <img 
                            src={`http://127.0.0.1:8000${record.image}`} 
                            alt={text} 
                            style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }} 
                          />
                        )}
                        <span>{text}</span>
                      </div>
                    ),
                  },
                  {
                    title: 'Category',
                    dataIndex: 'category',
                    key: 'category',
                  },
                  {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `₹${price}`,
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    render: (quantity, record) => `${quantity} ${record.unit || 'units'}`,
                  },
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true,
                  },
                ]}
                expandable={{
                  expandedRowRender: (record) => (
                    <div>
                      <p style={{ margin: 0 }}><strong>Description:</strong> {record.description}</p>
                      <p style={{ margin: 0 }}><strong>Available Quantity:</strong> {record.quantity} {record.unit || 'units'}</p>
                      <p style={{ margin: 0 }}><strong>Price per {record.unit || 'unit'}:</strong> ₹{record.price}</p>
                      <p style={{ margin: 0 }}><strong>Posted on:</strong> {new Date(record.created_at).toLocaleDateString()}</p>
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
        title={`Report ${currentFarmer ? `${currentFarmer.first_name} ${currentFarmer.last_name}` : 'Farmer'}`}
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
              placeholder="Please explain why you are reporting this farmer"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
          </Form.Item>
          <div className="report-guidelines">
            <p>Please only report farmers for legitimate reasons such as:</p>
            <ul>
              <li>Fraudulent behavior</li>
              <li>Inappropriate content</li>
              <li>Harassment or abusive behavior</li>
              <li>Misrepresentation of products or services</li>
            </ul>
            <p>False reports may result in action against your account.</p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Farmers;