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
  MessageOutlined
} from '@ant-design/icons';

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
        className="mb-6 overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
        bordered={false}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left side - Buyer info */}
          <div className="md:w-1/4 p-4 bg-gray-50 border-r border-gray-200">
            <div className="flex flex-col items-center text-center">
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                src={demand.buyer.image} 
                className="mb-2"
              />
              <h3 className="text-lg font-medium">{demand.buyer.name}</h3>
              <Rate disabled defaultValue={demand.buyer.rating} className="text-sm mb-1" />
              <p className="text-gray-500 text-sm">{demand.buyer.type}</p>
              <p className="flex items-center justify-center text-sm text-gray-600 mt-2">
                <EnvironmentOutlined className="mr-1" />
                {demand.buyer.location}
              </p>
              <Divider className="my-3" />
              <div className="mt-2 w-full">
                <Button 
                  type="primary" 
                  icon={<MessageOutlined />} 
                  block
                  className="bg-green-600 hover:bg-green-700 mb-2"
                >
                  Contact Buyer
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Demand details */}
          <div className="md:w-3/4 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{demand.title}</h2>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <ClockCircleOutlined className="mr-1" />
                  <span>Posted {demand.postedAt}</span>
                  <Divider type="vertical" />
                  <span>Deadline: {demand.deadline}</span>
                </div>
              </div>
              <Tag color={demand.status === 'Open' ? 'green' : 'default'}>
                {demand.status}
              </Tag>
            </div>

            <Divider className="my-3" />
            
            <h3 className="font-medium mb-2">Requested Products</h3>
            <Table 
              dataSource={demand.products} 
              columns={productColumns} 
              pagination={false}
              size="small"
              className="mb-4"
              rowKey="name"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-medium mb-1">Price Range</h3>
                <p className="text-gray-700">{demand.priceRange}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Requirements</h3>
                <p className="text-gray-700">{demand.requirements}</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button 
                type="primary" 
                className="bg-blue-600 hover:bg-blue-700"
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Buyer Demands</h1>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {demands.filter(d => d.status === 'Open').length} Open Demands
        </span>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <Tabs 
          defaultActiveKey="1" 
          onChange={setActiveTab}
          className="px-4 pt-4"
        >
          <TabPane tab="All Demands" key="1" />
          <TabPane tab="Matching My Products" key="2" />
          <TabPane tab="New Today" key="3" />
          <TabPane tab="Nearby Buyers" key="4" />
        </Tabs>
      </div>

      <div className="flex flex-wrap -mx-2 mb-4">
        <div className="px-2 mb-3 w-full md:w-1/4">
          <Button 
            icon={<ShoppingCartOutlined />} 
            className="mr-2"
          >
            Filter by Product
          </Button>
        </div>
        <div className="px-2 mb-3 w-full md:w-1/4">
          <Button 
            icon={<EnvironmentOutlined />} 
            className="mr-2"
          >
            Filter by Location
          </Button>
        </div>
      </div>

      {activeTab === "1" && demands.map(demand => renderDemandCard(demand))}
      
      {activeTab === "2" && (
        <Card className="text-center p-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No matching demands found for your current products."
          >
            <Button type="primary" className="bg-green-600 hover:bg-green-700 mt-4">
              Update My Product Catalog
            </Button>
          </Empty>
        </Card>
      )}
      
      {activeTab === "3" && <div className="text-center p-8">No new demands posted today.</div>}
      
      {activeTab === "4" && demands.filter(d => d.buyer.location.includes("WA")).map(demand => renderDemandCard(demand))}
    </div>
  );
};

export default BuyerDemandsPage;