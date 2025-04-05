import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Tooltip, 
  Empty, 
  Spin, 
  Badge, 
  message,
  Card,
  Typography,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  ShoppingOutlined, 
  CommentOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TagOutlined,
  DollarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import OffersModal from './OffersModal';
import './Offers.css';

const { Title, Text } = Typography;

// Category colors (matching other components)
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

const ProductOffers = () => {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersCountByProduct, setOffersCountByProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);
  
  useEffect(() => {
    fetchProductsAndOffers();
  }, []);
  
  const fetchProductsAndOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error("Authentication required");
        return;
      }
      
      // Fetch my products
      const productsResponse = await axios.get('http://127.0.0.1:8000/api/products/my-products/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("Fetched products:", productsResponse.data);
      setProducts(productsResponse.data || []);
      
      // Fetch offers for my products
      const offersResponse = await axios.get('http://127.0.0.1:8000/api/my-product-offers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log("Fetched offers:", offersResponse.data);
      setOffers(offersResponse.data || []);
      
      // Count offers by product
      const countMap = {};
      offersResponse.data.forEach(offer => {
        if (!countMap[offer.product]) {
          countMap[offer.product] = {
            total: 0,
            pending: 0,
            accepted: 0,
            rejected: 0
          };
        }
        
        countMap[offer.product].total += 1;
        
        if (offer.status === 'pending') {
          countMap[offer.product].pending += 1;
        } else if (offer.status === 'accepted') {
          countMap[offer.product].accepted += 1;
        } else if (offer.status === 'rejected') {
          countMap[offer.product].rejected += 1;
        }
      });
      
      setOffersCountByProduct(countMap);
    } catch (error) {
      console.error("Error fetching products and offers:", error);
      message.error("Failed to load products and offers");
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewOffers = (product) => {
    setSelectedProduct(product);
    setIsOffersModalVisible(true);
  };
  
  const handleCloseOffersModal = () => {
    setIsOffersModalVisible(false);
    setSelectedProduct(null);
  };
  
  const handleDealCreated = () => {
    // Refresh the data after a deal is created
    fetchProductsAndOffers();
  };
  
  const formatPrice = (price) => {
    if (!price) return '₹0.00';
    return `₹${parseFloat(price).toFixed(2)}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('MMMM DD, YYYY');
  };
  
  const getCategoryTag = (category) => {
    return (
      <Tag color={categoryColors[category] || '#2d6a4f'} key={category}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Tag>
    );
  };
  
  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>{text}</span>
          {getCategoryTag(record.category)}
          {record.is_active ? (
            <Badge status="success" text="" style={{ marginLeft: '8px' }} />
          ) : (
            <Badge status="default" text="" style={{ marginLeft: '8px' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Price & Quantity',
      key: 'price_quantity',
      render: (_, record) => (
        <div>
          <div>{formatPrice(record.price)} per {record.unit}</div>
          <div>{record.quantity} {record.unit} available</div>
        </div>
      ),
    },
    {
      title: 'Offers',
      key: 'offers',
      render: (_, record) => {
        const counts = offersCountByProduct[record.id] || { total: 0, pending: 0, accepted: 0, rejected: 0 };
        
        if (counts.total === 0) {
          return <Text type="secondary">No offers yet</Text>;
        }
        
        return (
          <Space>
            <Tooltip title="Total Offers">
              <Badge count={counts.total} style={{ backgroundColor: '#108ee9' }} />
            </Tooltip>
            {counts.pending > 0 && (
              <Tooltip title="Pending">
                <Badge count={counts.pending} style={{ backgroundColor: '#faad14' }} />
              </Tooltip>
            )}
            {counts.accepted > 0 && (
              <Tooltip title="Accepted">
                <Badge count={counts.accepted} style={{ backgroundColor: '#52c41a' }} />
              </Tooltip>
            )}
            {counts.rejected > 0 && (
              <Tooltip title="Rejected">
                <Badge count={counts.rejected} style={{ backgroundColor: '#f5222d' }} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.is_active ? 'green' : 'default'}>
          {record.is_active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => formatDate(text),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            onClick={() => handleViewOffers(record)}
            icon={<CommentOutlined />}
            disabled={!offersCountByProduct[record.id]?.total}
          >
            View Offers {offersCountByProduct[record.id]?.pending > 0 && `(${offersCountByProduct[record.id].pending})`}
          </Button>
        </Space>
      ),
    },
  ];
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Loading products and offers...</div>
      </div>
    );
  }
  
  return (
    <div className="product-offers-container">
      <div className="page-header">
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3}>
              <ShoppingOutlined style={{ marginRight: '10px' }} />
              Product Offers
            </Title>
            <Text type="secondary">View and manage offers made on your products</Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              onClick={fetchProductsAndOffers}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </div>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
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
              title="Total Offers"
              value={offers.length}
              prefix={<CommentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Offers"
              value={offers.filter(o => o.status === 'pending').length}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Deals Created"
              value={offers.filter(o => o.status === 'accepted').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>
      
      {products.length === 0 ? (
        <Empty 
          description="You don't have any products. Add products to receive offers from buyers."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : offers.length === 0 ? (
        <Empty 
          description="No offers have been made on your products yet."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table 
          columns={columns} 
          dataSource={products} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
      
      {selectedProduct && (
        <OffersModal
          visible={isOffersModalVisible}
          productId={selectedProduct.id}
          productDetails={selectedProduct}
          onClose={handleCloseOffersModal}
          onDealCreated={handleDealCreated}
        />
      )}
    </div>
  );
};

export default ProductOffers; 