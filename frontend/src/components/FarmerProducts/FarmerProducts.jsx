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
  Badge,
  Empty,
  List,
  Spin,
  Rate,
  Divider,
  Row, 
  Col,
  Image,
  Statistic,
  Tooltip,
  Modal,
  message,
  Form,
  InputNumber,
  Slider,
  Table,
  Timeline
} from 'antd';
import { 
  ShoppingCartOutlined, 
  FilterOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  MessageOutlined,
  TagOutlined,
  SendOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import axios from 'axios';
import './FarmerProducts.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [selectedProductOffers, setSelectedProductOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Product category colors (matching the ones used in Products.jsx)
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
    { value: 'others', label: 'Others' }
  ];

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'count', label: 'Count/Pieces' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'quintal', label: 'Quintal' },
    { value: 'ton', label: 'Ton' },
    { value: 'bundle', label: 'Bundle' }
  ];

  // Function to format date
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

  // Function to safely format quantity
  const formatQuantity = (quantity, unit) => {
    const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    
    if (isNaN(numQuantity)) return '1.00';
    
    // Format based on unit type
    if (['count', 'dozen', 'bundle'].includes(unit)) {
      return Number.isInteger(numQuantity) ? numQuantity.toString() : numQuantity.toFixed(1);
    } else {
      return numQuantity.toFixed(2);
    }
  };

  // Get unit label
  const getUnitLabel = (unitValue) => {
    const unit = unitOptions.find(u => u.value === unitValue);
    return unit ? unit.label.split(' ')[0] : unitValue;
  };

  // Fetch products and farmer profiles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch all products
        const productsResponse = await axios.get('http://127.0.0.1:8000/api/products/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fetch all farmer profiles
        const farmersResponse = await axios.get('http://127.0.0.1:8000/api/all-farmer-profiles/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Create a map of farmer IDs to farmer data for easy lookup
        const farmerMap = {};
        farmersResponse.data.forEach(farmer => {
          farmerMap[farmer.user] = {
            id: farmer.id,
            name: `${farmer.user_first_name || ''} ${farmer.user_last_name || ''}`.trim() || 'Unknown Farmer',
            email: farmer.user_email || 'No email provided',
            phone: farmer.phoneno || 'Not provided',
            address: farmer.address || 'Not provided',
            city: farmer.city || 'Not provided',
            state: farmer.state || 'Not provided',
            country: farmer.country || 'Not provided',
            bio: farmer.bio || 'No bio provided',
            image: `http://127.0.0.1:8000${farmer.profilepic}` || null,
            isVerified: farmer.user_is_verified || false
          };
        });
        
        // Combine product data with farmer data
        const productsWithFarmerInfo = productsResponse.data.map(product => {
          const farmerInfo = farmerMap[product.farmer] || {
            name: 'Unknown Farmer',
            email: 'Not provided',
            phone: 'Not provided',
            location: 'Not provided',
            isVerified: false
          };
          
          return {
            ...product,
            farmerInfo,
          };
        });
        
        // Filter to only active products
        const activeProducts = productsWithFarmerInfo.filter(product => product.is_active);
        
        setProducts(activeProducts);
        setFarmers(Object.values(farmerMap));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load products and farmers. Please try again later.");
        setLoading(false);
        message.error("Failed to load products");
      }
    };

    fetchData();
  }, []);

  // Function to fetch user's favorite products
  const fetchFavoriteProducts = async () => {
    setLoadingFavorites(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found');
        setLoadingFavorites(false);
        return;
      }

      const response = await axios.get(
        'http://127.0.0.1:8000/api/favorites/products/',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setFavoriteProducts(response.data);
        
        // Update the isFavorite property of all products
        setProducts(prevProducts => 
          prevProducts.map(product => ({
            ...product,
            isFavorite: response.data.some(fav => 
              fav.product_details.id === product.id || 
              (fav.product_details.id === product.id)
            )
          }))
        );
        
        // Also update filtered products
        setFilteredProducts(prevProducts => 
          prevProducts.map(product => ({
            ...product,
            isFavorite: response.data.some(fav => 
              fav.product_details.id === product.id || 
              (fav.product_details.id === product.id)
            )
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching favorite products:', error);
      message.error('Failed to load favorite products');
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Function to toggle favorite status of a product
  const toggleFavorite = async (product) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Please log in to add favorites');
        return;
      }

      if (product.isFavorite) {
        // Remove from favorites
        await axios.delete(
          `http://127.0.0.1:8000/api/favorites/products/${product.id}/remove/`,
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
          'http://127.0.0.1:8000/api/favorites/products/',
          { product: product.id },
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
      const updatedProduct = { ...product, isFavorite: !product.isFavorite };
      
      // Update products list
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? updatedProduct : p)
      );
      
      // Update filtered products
      setFilteredProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? updatedProduct : p)
      );
      
      // Refresh favorites list
      fetchFavoriteProducts();
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Failed to update favorites');
    }
  };

  // Fetch products and favorites on component mount
  useEffect(() => {
    fetchFavoriteProducts();
  }, []);

  // Apply filters based on category and search term
  const applyFilters = () => {
    const filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmerInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
    
    setFilteredProducts(filtered);
  };

  // Filter products based on favorites toggle
  useEffect(() => {
    if (showFavorites) {
      const favoriteProductIds = favoriteProducts.map(fav => 
        fav.product_details.id
      );
      
      setFilteredProducts(
        products.filter(product => 
          favoriteProductIds.includes(product.id)
        )
      );
    } else {
      // Apply normal filters
      applyFilters();
    }
  }, [showFavorites, favoriteProducts, products, selectedCategory, searchTerm]);

  // Show farmer details
  const showFarmerDetails = (farmer) => {
    setSelectedFarmer(farmer);
    setIsModalVisible(true);
  };

  // Contact farmer
  const contactFarmer = (farmer) => {
    message.success(`Contact request sent to ${farmer.name}`);
    // In a real app, this would open a messaging interface or send a notification
  };

  // Show price offer modal
  const showPriceOfferModal = (product) => {
    if (!product) {
      message.error("Cannot make an offer. Invalid product data.");
      return;
    }
    
    setSelectedProduct(product);
    setIsOfferModalVisible(true);
    
    // Reset form with initial values
    setTimeout(() => {
      if (product) {
        form.setFieldsValue({
          price: product.price || 0,
          quantity: Math.min(product.quantity || 1, 100),
          notes: ''
        });
      }
    }, 100);
  };

  // Handle offer modal close
  const handleOfferModalClose = () => {
    setIsOfferModalVisible(false);
    // Reset selected product after modal animation completes
    setTimeout(() => {
      if (!isOfferModalVisible) {
        setSelectedProduct(null);
        form.resetFields();
      }
    }, 300);
  };

  // Handle form submission
  const handleOfferSubmit = async (values) => {
    if (!selectedProduct) {
      message.error("Error: No product selected. Please try again.");
      handleOfferModalClose();
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error("You must be logged in to make an offer");
        setSubmitting(false);
        return;
      }
      
      // Get the current user's ID (buyer ID)
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const buyerId = userData.id;
      
      if (!buyerId) {
        message.error("Your buyer profile information is missing. Please update your profile.");
        setSubmitting(false);
        return;
      }
      
      // Prepare request payload
      const requestData = {
        product: selectedProduct.id,
        buyer: buyerId,
        offered_price: values.price,
        quantity: values.quantity,
        notes: values.notes || ""
      };
      
      console.log("Sending product offer data:", requestData);
      
      // Make API call to create/update offer
      const response = await axios.post('http://127.0.0.1:8000/api/product-offers/', requestData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("Product offer success:", response.data);
      message.success(`Your price offer of ${formatPrice(values.price)} for ${values.quantity} ${selectedProduct.unit} of ${selectedProduct.name} has been sent to the farmer`);
      handleOfferModalClose();
    } catch (error) {
      console.error("Product offer error:", error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        
        if (error.response.status === 400) {
          if (error.response.data.non_field_errors?.includes('The fields product, buyer must make a unique set.')) {
            message.warning("You have already made an offer on this product. The farmer will review your offer.");
            handleOfferModalClose();
          } else {
            // Show specific validation errors if available
            const errorMessages = [];
            for (const field in error.response.data) {
              const fieldErrors = error.response.data[field];
              if (Array.isArray(fieldErrors)) {
                errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
              }
            }
            
            if (errorMessages.length > 0) {
              message.error(`Validation errors: ${errorMessages.join('; ')}`);
            } else {
              message.error("Failed to submit offer: " + JSON.stringify(error.response.data));
            }
          }
        } else {
          message.error("Failed to submit offer: " + (error.response.data.detail || "Unknown error"));
        }
      } else {
        message.error("Network error. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Function to fetch and show buyer's offers for a specific product
  const showUserOffersForProduct = async (productId) => {
    setLoadingOffers(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Fetch all offers made by the current buyer
      const response = await axios.get('http://127.0.0.1:8000/api/my-product-offers/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Filter offers for the selected product
      const offersForProduct = response.data.filter(offer => offer.product === productId);
      
      setSelectedProductOffers(offersForProduct);
      setIsResponseModalVisible(true);
    } catch (error) {
      console.error("Error fetching offers:", error);
      message.error("Failed to load your offers for this product");
    } finally {
      setLoadingOffers(false);
    }
  };
  
  // Handle response modal close
  const handleResponseModalClose = () => {
    setIsResponseModalVisible(false);
    setTimeout(() => {
      setSelectedProductOffers([]);
    }, 300);
  };
  
  // Render the offers modal
  const renderResponsesModal = () => {
    const productName = filteredProducts.find(p => 
      selectedProductOffers.length > 0 && p.id === selectedProductOffers[0].product
    )?.name || "Product";
    
    const product = filteredProducts.find(p => 
      selectedProductOffers.length > 0 && p.id === selectedProductOffers[0].product
    );
    
    const productCategory = product?.category || 'others';
    const categoryLabel = categoryOptions.find(opt => opt.value === productCategory)?.label || 'Product';
    
    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="modal-icon" style={{ 
              backgroundColor: categoryColors[productCategory] || '#2d6a4f',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px'
            }}>
              <EyeOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>Your Offers for {productName}</Title>
              <div style={{ fontSize: '14px', color: categoryColors[productCategory] || '#2d6a4f' }}>
                <ShoppingOutlined style={{ marginRight: '4px' }} />
                {categoryLabel}
                {product?.quantity && (
                  <span style={{ marginLeft: '12px', color: '#8c8c8c' }}>
                    Available: {product.quantity} {product.unit || 'units'}
                  </span>
                )}
              </div>
            </div>
          </div>
        }
        visible={isResponseModalVisible}
        onCancel={handleResponseModalClose}
        footer={[
          <Button key="close" onClick={handleResponseModalClose}>
            Close
          </Button>
        ]}
        width={800}
      >
        {loadingOffers ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '15px' }}>Loading your offers...</div>
          </div>
        ) : selectedProductOffers.length === 0 ? (
          <Empty description="You haven't made any offers for this product yet" />
        ) : (
          <>
            <Table 
              dataSource={selectedProductOffers.map(offer => {
                // Get the product for this offer
                const product = filteredProducts.find(p => p.id === offer.product);
                
                return {
                  ...offer,
                  key: offer.id,
                  product_details: product,
                  total_value: parseFloat(offer.offered_price) * parseFloat(offer.quantity)
                };
              })} 
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: (text) => (
                    <div>
                      <div>{formatDate(text)}</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{new Date(text).toLocaleTimeString()}</div>
                    </div>
                  )
                },
                {
                  title: 'Price',
                  key: 'price',
                  render: (_, record) => (
                    <div>
                      <div>
                        <Text style={{ 
                          color: record.offered_price < (record.product_details?.price || 0) ? '#52c41a' : 
                                record.offered_price > (record.product_details?.price || 0) ? '#1890ff' : 'inherit'
                        }}>
                          {formatPrice(record.offered_price)}
                        </Text>
                        <Text type="secondary"> / {record.product_details?.unit || 'unit'}</Text>
                      </div>
                      {record.product_details?.price && (
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          Original: {formatPrice(record.product_details.price)}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Quantity',
                  key: 'quantity',
                  render: (_, record) => (
                    <div>
                      <div>{record.quantity} {record.product_details?.unit || 'units'}</div>
                      {record.product_details?.quantity && (
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          Available: {record.product_details.quantity}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Total Value',
                  dataIndex: 'total_value',
                  key: 'total_value',
                  render: (value) => (
                    <Text strong style={{ color: '#2d6a4f' }}>{formatPrice(value)}</Text>
                  )
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    let color = 'default';
                    let icon = null;
                    
                    switch(status) {
                      case 'pending':
                        color = 'blue';
                        break;
                      case 'accepted':
                        color = 'green';
                        icon = <CheckOutlined />;
                        break;
                      case 'rejected':
                        color = 'red';
                        icon = <CloseOutlined />;
                        break;
                      default:
                        color = 'default';
                    }
                    
                    return (
                      <Tag color={color} icon={icon}>
                        {status}
                      </Tag>
                    );
                  }
                }
              ]}
              pagination={false}
              size="middle"
              bordered
              className="offers-table"
            />
            
            <Divider />
            
            <div className="offer-timeline">
              <Title level={5}>Offer Timeline</Title>
              <Timeline mode="left">
                {[...selectedProductOffers].sort((a, b) => 
                  new Date(a.created_at) - new Date(b.created_at)
                ).map((offer, index, array) => {
                  // Get the product for this offer
                  const product = filteredProducts.find(p => p.id === offer.product);
                  const productUnit = product?.unit || 'unit';
                  
                  return (
                    <Timeline.Item 
                      key={offer.id}
                      color={
                        offer.status === 'accepted' ? 'green' : 
                        offer.status === 'rejected' ? 'red' : 'blue'
                      }
                      label={
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold' }}>{formatDate(offer.created_at)}</div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {new Date(offer.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      }
                    >
                      <div className="timeline-content" style={{
                        borderLeft: `4px solid ${
                          offer.status === 'accepted' ? '#52c41a' : 
                          offer.status === 'rejected' ? '#ff4d4f' : '#1890ff'
                        }`,
                        padding: '12px 16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '16px' }}>
                            {offer.status === 'pending' ? 'Offer Submitted' :
                             offer.status === 'accepted' ? 'Offer Accepted' : 'Offer Rejected'}
                          </Text>
                          <Tag color={
                            offer.status === 'accepted' ? 'green' : 
                            offer.status === 'rejected' ? 'red' : 'blue'
                          }>
                            {offer.status}
                          </Tag>
                        </div>
                        
                        <Row gutter={[16, 8]}>
                          <Col span={12}>
                            <Text type="secondary">Original Price:</Text>
                            <br />
                            <Text strong>{formatPrice(product?.price || 0)} per {productUnit}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Your Offer:</Text>
                            <br />
                            <Text strong style={{ 
                              color: 
                                offer.offered_price < (product?.price || 0) ? '#52c41a' : 
                                offer.offered_price > (product?.price || 0) ? '#1890ff' : 'inherit' 
                            }}>
                              {formatPrice(offer.offered_price)} per {productUnit}
                              {offer.offered_price < (product?.price || 0) && ' (Lower)'}
                              {offer.offered_price > (product?.price || 0) && ' (Higher)'}
                            </Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Quantity Available:</Text>
                            <br />
                            <Text strong>{product?.quantity || 'N/A'} {productUnit}</Text>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Quantity Requested:</Text>
                            <br />
                            <Text strong>{offer.quantity} {productUnit}</Text>
                          </Col>
                          <Col span={24}>
                            <Text type="secondary">Total Value:</Text>
                            <br />
                            <Text strong style={{ fontSize: '16px', color: '#2d6a4f' }}>
                              {formatPrice(parseFloat(offer.offered_price) * parseFloat(offer.quantity))}
                            </Text>
                          </Col>
                        </Row>
                        
                        {offer.notes && (
                          <div style={{ 
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            borderLeft: '3px solid #d9d9d9' 
                          }}>
                            <Text type="secondary" style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                              Your Note:
                            </Text>
                            <Text>{offer.notes}</Text>
                          </div>
                        )}
                        
                        {offer.farmer_message && (
                          <div style={{ 
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#f6ffed',
                            borderRadius: '4px',
                            borderLeft: '3px solid #52c41a' 
                          }}>
                            <Text strong style={{ display: 'block', marginBottom: '4px', color: '#2d6a4f' }}>
                              Farmer's Response:
                            </Text>
                            <Text>{offer.farmer_message}</Text>
                          </div>
                        )}
                        
                        {(index < array.length - 1) && (
                          <Divider style={{ margin: '12px 0 0 0' }} />
                        )}
                      </div>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </div>
          </>
        )}
      </Modal>
    );
  };

  // Render modal with farmer details
  const renderFarmerModal = () => {
    if (!selectedFarmer) return null;
    
    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar 
              size={40} 
              src={selectedFarmer.image}
              icon={<UserOutlined />}
            />
            <span>
              {selectedFarmer.name}
              {selectedFarmer.isVerified && (
                <Tooltip title="Verified Farmer">
                  <Badge status="success" style={{ marginLeft: '8px' }} />
                </Tooltip>
              )}
            </span>
          </div>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="contact" 
            type="primary" 
            icon={<MessageOutlined />}
            onClick={() => contactFarmer(selectedFarmer)}
          >
            Contact Farmer
          </Button>,
        ]}
        width={700}
      >
        <div className="farmer-modal-content">
          <Divider orientation="left">About</Divider>
          <Paragraph>{selectedFarmer.bio}</Paragraph>
          
          <Divider orientation="left">Contact Information</Divider>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="contact-item">
                <MailOutlined className="contact-icon" />
                <Text>{selectedFarmer.email}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="contact-item">
                <PhoneOutlined className="contact-icon" />
                <Text>{selectedFarmer.phone}</Text>
              </div>
            </Col>
          </Row>
          
          <Divider orientation="left">Location</Divider>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="contact-item">
                <EnvironmentOutlined className="contact-icon" />
                <Text>{`${selectedFarmer.address}, ${selectedFarmer.city}, ${selectedFarmer.state}, ${selectedFarmer.country}`}</Text>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };

  // Render offer modal with product details
  const renderOfferModal = () => {
    if (!selectedProduct) return null;
    
    return (
      <Modal
        title="Make a Price Offer"
        visible={isOfferModalVisible}
        onCancel={handleOfferModalClose}
        footer={null}
        width={600}
        destroyOnClose={true}
        className="price-offer-modal"
      >
        <div className="price-offer-content">
          <div className="product-offer-summary">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={6}>
                <div className="placeholder-img">
                  <ShoppingOutlined style={{ fontSize: '48px', color: '#2d6a4f' }} />
                </div>
              </Col>
              <Col xs={24} sm={18}>
                <Title level={4}>{selectedProduct.name}</Title>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text><strong>Listed Price:</strong> {formatPrice(selectedProduct.price)} per {selectedProduct.unit}</Text>
                  <Text><strong>Available Quantity:</strong> {selectedProduct.quantity} {selectedProduct.unit}</Text>
                  <Text><strong>Farmer:</strong> {selectedProduct.farmerInfo?.name || 'Unknown'}</Text>
                  {selectedProduct.description && (
                    <Text type="secondary">{selectedProduct.description}</Text>
                  )}
                </Space>
              </Col>
            </Row>
          </div>
          
          <Divider />
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleOfferSubmit}
            initialValues={{
              price: selectedProduct.price || 0,
              quantity: Math.min(selectedProduct.quantity || 1, 100),
              notes: ''
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="price"
                  label="Your Offered Price"
                  rules={[{ required: true, message: 'Please enter your offered price' }]}
                >
                  <InputNumber
                    min={1}
                    max={selectedProduct.price * 2}
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₹\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <div className="price-slider">
                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) => (
                      <Slider
                        min={Math.max(1, (selectedProduct.price || 0) * 0.7)}
                        max={(selectedProduct.price || 0) * 1.3}
                        onChange={val => form.setFieldsValue({ price: val })}
                        value={getFieldValue('price')}
                        tipFormatter={value => `₹${value}`}
                      />
                    )}
                  </Form.Item>
                  <Row justify="space-between">
                    <Col>Lower</Col>
                    <Col>Original: {formatPrice(selectedProduct.price)}</Col>
                    <Col>Higher</Col>
                  </Row>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="quantity"
                  label={`Quantity (${selectedProduct.unit})`}
                  rules={[{ required: true, message: 'Please enter the quantity you want to buy' }]}
                >
                  <InputNumber
                    min={0.1}
                    max={selectedProduct.quantity}
                    step={0.1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <div className="quantity-slider">
                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) => (
                      <Slider
                        min={0.1}
                        max={selectedProduct.quantity}
                        step={0.1}
                        onChange={val => form.setFieldsValue({ quantity: val })}
                        value={getFieldValue('quantity')}
                        tipFormatter={value => `${value} ${selectedProduct.unit}`}
                      />
                    )}
                  </Form.Item>
                  <div style={{ marginTop: 5 }}>
                    <strong>Available: {selectedProduct.quantity} {selectedProduct.unit}</strong>
                  </div>
                </div>
              </Col>
            </Row>
            
            <Form.Item
              name="notes"
              label="Additional Notes (optional)"
            >
              <Input.TextArea
                rows={4}
                placeholder="Add any details about your offer, quality requirements, delivery preferences, etc."
              />
            </Form.Item>
            
            <div className="offer-note">
              <InfoCircleOutlined /> Your offer will be sent to {selectedProduct.farmerInfo?.name || 'the farmer'}. 
              They will review your offer and may contact you directly for negotiation.
            </div>
            
            <Form.Item className="offer-actions">
              <Button onClick={handleOfferModalClose} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SendOutlined />} 
                loading={submitting}
              >
                Send Offer
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };

  // Render the products in a grid layout
  const renderProducts = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Loading products...</Text>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <Text type="danger">{error}</Text>
          <Button type="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <Empty 
          description={
            showFavorites 
              ? "You don't have any favorite products yet" 
              : "No products match your filters"
          } 
        />
      );
    }

    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={filteredProducts}
        renderItem={(product) => (
          <List.Item>
            <Card 
              className="product-card"
              data-category={product.category}
              hoverable
              cover={
                <div className="product-img-container">
                  <Tag color={product.can_deliver ? "green" : "red"} className="delivery-tag">
                    {product.can_deliver ? "Delivery Available" : "No Delivery"}
                  </Tag>
                  <div className="product-img">
                    {/* In a real app, this would be a product image */}
                    <div className="placeholder-img">
                      <ShoppingOutlined style={{ fontSize: '32px', color: '#8c8c8c' }} />
                    </div>
                  </div>
                </div>
              }
              actions={[
                <Tooltip title="View Your Responses">
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      showUserOffersForProduct(product.id);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Contact Farmer">
                  <Button 
                    type="text" 
                    icon={<MessageOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      contactFarmer(product.farmerInfo);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Make a Price Offer">
                  <Button 
                    type="text" 
                    icon={<SendOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      showPriceOfferModal(product);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Toggle Favorite">
                  <Button 
                    type="text" 
                    icon={product.isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product);
                    }}
                  />
                </Tooltip>
              ]}
            >
              <div className="product-header">
                <Text className="product-category" style={{ color: categoryColors[product.category] || '#2d6a4f' }}>
                  {categoryOptions.find(cat => cat.value === product.category)?.label || product.category}
                </Text>
                <Text className="product-price">{formatPrice(product.price)}</Text>
              </div>
              
              <div className="product-quantity-container">
                <div className="quantity-badge">
                  <TagOutlined />
                  <Text>Available: <strong>{formatQuantity(product.quantity, product.unit)} {getUnitLabel(product.unit)}</strong></Text>
                </div>
                {product.can_deliver && (
                  <Tag color="green" className="delivery-tag">Delivery Available</Tag>
                )}
              </div>
              
              {product.description && (
                <Paragraph className="product-description" ellipsis={{ rows: 2 }}>
                  {product.description}
                </Paragraph>
              )}
              
              <div className="product-farmer" onClick={() => showFarmerDetails(product.farmerInfo)}>
                <Avatar 
                  size="small" 
                  src={product.farmerInfo.image}
                  icon={<UserOutlined />}
                />
                <Text className="farmer-name">
                  {product.farmerInfo.name}
                  {product.farmerInfo.isVerified && (
                    <Badge status="success" style={{ marginLeft: '5px' }} />
                  )}
                </Text>
              </div>
              
              <div className="product-footer">
                <Row align="middle" justify="space-between">
                  <Col>
                {product.updated_at && (
                  <Text type="secondary" className="product-date">
                    <CalendarOutlined style={{ marginRight: '5px' }} />
                    {formatDate(product.updated_at)}
                  </Text>
                )}
                  </Col>
                </Row>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="farmer-products-container">
      <div className="page-header">
        <div className="header-left">
          <Title level={3}>
            <ShoppingOutlined style={{ marginRight: '10px' }} />
            Farmers Market
          </Title>
          <Text type="secondary">Browse and purchase products directly from farmers</Text>
        </div>
        <div className="header-right">
          <Space>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: 180 }}
              placeholder="Filter by category"
            >
              {categoryOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Search
              placeholder="Search products or farmers"
              allowClear
              onSearch={setSearchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
            <Button 
              type={showFavorites ? "primary" : "default"}
              icon={<HeartFilled />}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              {showFavorites ? "All Products" : "My Favorites"}
            </Button>
          </Space>
        </div>
      </div>

      <div className="market-stats">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={products.length}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Categories"
                value={new Set(products.map(p => p.category)).size}
                prefix={<FilterOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Verified Farmers"
                value={farmers.filter(f => f.isVerified).length}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg Price"
                value={products.length > 0 ? (products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length).toFixed(2) : 0}
                prefix="₹"
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="products-container">
        {renderProducts()}
      </div>

      {/* Render modals */}
      {renderFarmerModal()}
      {renderOfferModal()}
      {renderResponsesModal()}
    </div>
  );
};

export default FarmerProducts; 