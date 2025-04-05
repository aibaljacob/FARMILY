import React, { useState } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Card, 
  Tabs, 
  Tooltip, 
  Badge, 
  Avatar,
  Rate,
  Empty,
  Divider
} from 'antd';
import { 
  PhoneOutlined, 
  MailOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  DollarOutlined,
  FileTextOutlined,
  FilterOutlined
} from '@ant-design/icons';
import './Demands.css';

const { TabPane } = Tabs;

const BuyerDemandsPage = () => {
  // Sample data - would be fetched from API in a real application
  const [demands, setDemands] = useState([
    {
      id: 1,
      title: "Organic Vegetables for Restaurant",
      buyer: {
        name: "Green Plate Restaurant",
        rating: 4.8,
        type: "Business",
        location: "Portland, OR",
        image: null
      },
      products: [
        { name: "Organic Carrots", quantity: 50, unit: "kg", frequency: "Weekly" },
        { name: "Kale", quantity: 25, unit: "kg", frequency: "Weekly" },
        { name: "Bell Peppers", quantity: 30, unit: "kg", frequency: "Weekly" }
      ],
      priceRange: "$2.50 - $4.00 per kg",
      requirements: "Must be certified organic. Looking for consistent weekly supply.",
      deadline: "March 15, 2025",
      status: "Open",
      postedAt: "4 days ago"
    },
    {
      id: 2,
      title: "Fresh Fruits for Local Market",
      buyer: {
        name: "Community Fresh Market",
        rating: 4.5,
        type: "Business",
        location: "Seattle, WA",
        image: null
      },
      products: [
        { name: "Apples", quantity: 200, unit: "kg", frequency: "Bi-weekly" },
        { name: "Berries", quantity: 100, unit: "kg", frequency: "Weekly" }
      ],
      priceRange: "Market price",
      requirements: "Locally grown preferred. Must be fresh and high quality.",
      deadline: "March 30, 2025",
      status: "Open",
      postedAt: "2 days ago"
    },
    {
      id: 3,
      title: "Bulk Grain Purchase",
      buyer: {
        name: "Sunrise Bakery",
        rating: 4.7,
        type: "Business",
        location: "San Francisco, CA",
        image: null
      },
      products: [
        { name: "Organic Wheat", quantity: 500, unit: "kg", frequency: "Monthly" },
        { name: "Rye", quantity: 200, unit: "kg", frequency: "Monthly" },
      ],
      priceRange: "$1.80 - $2.20 per kg",
      requirements: "Looking for consistent quality. Moisture content below 14%.",
      deadline: "April 10, 2025",
      status: "Open",
      postedAt: "1 week ago"
    },
    {
      id: 4,
      title: "Free-Range Eggs for Cafe Chain",
      buyer: {
        name: "Morning Brew Cafes",
        rating: 4.9,
        type: "Business",
        location: "Chicago, IL",
        image: null
      },
      products: [
        { name: "Free-Range Eggs", quantity: 300, unit: "dozen", frequency: "Weekly" }
      ],
      priceRange: "$4.00 - $5.00 per dozen",
      requirements: "Must be certified free-range. Looking for reliable weekly delivery.",
      deadline: "March 20, 2025",
      status: "Open",
      postedAt: "3 days ago"
    },
    {
      id: 5,
      title: "Specialty Honey Varieties",
      buyer: {
        name: "Artisan Food Co-op",
        rating: 4.6,
        type: "Co-op",
        location: "Austin, TX",
        image: null
      },
      products: [
        { name: "Wildflower Honey", quantity: 100, unit: "bottles", frequency: "Monthly" },
        { name: "Clover Honey", quantity: 100, unit: "bottles", frequency: "Monthly" }
      ],
      priceRange: "$8.00 - $12.00 per bottle",
      requirements: "Raw, unpasteurized honey. Looking for unique varieties with distinct flavors.",
      deadline: "May 1, 2025",
      status: "Open",
      postedAt: "5 days ago"
    }
  ]);

  const [activeTab, setActiveTab] = useState("1");

  // Columns for the product details table within each demand card
  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
    }
  ];

  // Render a single demand card
  const renderDemandCard = (demand) => {
    return (
      <Card 
        key={demand.id} 
        className="demand-card"
        bordered={true}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left side - Buyer info */}
          <div className="md:w-1/4 buyer-info-section">
            <div className="flex flex-col items-center text-center">
              <Badge.Ribbon text={demand.buyer.type} color="#52c41a">
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />} 
                  src={demand.buyer.image} 
                  className="buyer-avatar"
                />
              </Badge.Ribbon>
              <h3 className="buyer-name">{demand.buyer.name}</h3>
              <Rate disabled defaultValue={demand.buyer.rating} className="text-sm mb-1" />
              
              <div className="location-text">
                <EnvironmentOutlined className="mr-1" />
                {demand.buyer.location}
              </div>
              
              <Divider className="section-divider" />
              
              <Button 
                type="primary" 
                icon={<MessageOutlined />} 
                block
                className="contact-btn"
              >
                Contact Buyer
              </Button>
            </div>
          </div>

          {/* Right side - Demand details */}
          <div className="md:w-3/4 demand-details-section">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="demand-title">{demand.title}</h2>
                <div className="demand-meta">
                  <ClockCircleOutlined className="mr-1" />
                  <span>Posted {demand.postedAt}</span>
                  <Divider type="vertical" />
                  <span>Deadline: {demand.deadline}</span>
                </div>
              </div>
              <Tag 
                className={`status-tag ${demand.status === 'Open' ? 'status-open' : 'status-closed'}`}
              >
                {demand.status}
              </Tag>
            </div>

            <Divider className="section-divider" />
            
            <h3 className="section-title">
              <ShoppingCartOutlined style={{ marginRight: '8px' }} />
              Requested Products
            </h3>
            <Table 
              dataSource={demand.products} 
              columns={productColumns} 
              pagination={false}
              size="small"
              className="product-table"
              rowKey="name"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="detail-label">
                  <DollarOutlined style={{ marginRight: '8px' }} />
                  Price Range
                </h3>
                <p className="detail-value">{demand.priceRange}</p>
              </div>
              <div>
                <h3 className="detail-label">
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  Requirements
                </h3>
                <p className="detail-value">{demand.requirements}</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button 
                type="primary" 
                className="make-offer-btn"
              >
                Make Offer
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="demands-container">
      <div className="demands-header">
        <h2>
          <ShoppingCartOutlined style={{ marginRight: '8px' }} />
          Buyer Demands
        </h2>
        <Button icon={<FilterOutlined />}>Filter</Button>
      </div>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="tab-container"
      >
        <TabPane tab="All Demands" key="1">
          {demands.length > 0 ? (
            demands.map(demand => renderDemandCard(demand))
          ) : (
            <Empty description="No demands found" />
          )}
        </TabPane>
        <TabPane tab="My Responses" key="2">
          <Empty description="You haven't responded to any demands yet" />
        </TabPane>
        <TabPane tab="Saved" key="3">
          <Empty description="You haven't saved any demands yet" />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BuyerDemandsPage;