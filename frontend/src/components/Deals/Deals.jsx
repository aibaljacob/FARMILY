import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Tabs, 
  Badge, 
  Tag, 
  Button, 
  Progress, 
  DatePicker, 
  Space,
  Statistic,
  Typography,
  Tooltip,
  Dropdown,
  Menu,
  Divider,
  Timeline
} from 'antd';
import { 
  CheckCircleOutlined, 
  DollarCircleOutlined, 
  CalendarOutlined, 
  DownloadOutlined,
  FileDoneOutlined,
  ShoppingOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SortAscendingOutlined,
  FilterOutlined,
  MoreOutlined,
  StarOutlined,
  StarFilled,
  MessageOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const DealsHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("1");
  
  // Sample data for completed deals
  const [deals, setDeals] = useState([
    {
      id: "D-2025-001",
      date: "Feb 15, 2025",
      buyer: {
        name: "Green Plate Restaurant",
        location: "Portland, OR",
        type: "Business",
        image: null
      },
      products: [
        { name: "Organic Carrots", quantity: "50 kg", price: "$3.75/kg" },
        { name: "Kale", quantity: "25 kg", price: "$4.50/kg" }
      ],
      totalValue: 375.00,
      status: "Completed",
      paymentStatus: "Paid",
      deliveryDate: "Feb 18, 2025",
      rating: 5,
      notes: "Buyer requested delivery before 10 AM",
      recurring: true,
      nextDelivery: "Feb 25, 2025"
    },
    {
      id: "D-2025-002",
      date: "Feb 10, 2025",
      buyer: {
        name: "Community Fresh Market",
        location: "Seattle, WA",
        type: "Business",
        image: null
      },
      products: [
        { name: "Apples", quantity: "200 kg", price: "$2.25/kg" }
      ],
      totalValue: 450.00,
      status: "Completed",
      paymentStatus: "Paid",
      deliveryDate: "Feb 12, 2025",
      rating: 4,
      notes: "Quality was good, slightly late delivery",
      recurring: true,
      nextDelivery: "Feb 24, 2025"
    },
    {
      id: "D-2025-003",
      date: "Jan 30, 2025",
      buyer: {
        name: "Sunrise Bakery",
        location: "San Francisco, CA",
        type: "Business",
        image: null
      },
      products: [
        { name: "Organic Wheat", quantity: "500 kg", price: "$1.90/kg" },
        { name: "Rye", quantity: "200 kg", price: "$2.15/kg" }
      ],
      totalValue: 1380.00,
      status: "Completed",
      paymentStatus: "Paid",
      deliveryDate: "Feb 5, 2025",
      rating: 5,
      notes: "Excellent quality grain, on-time delivery",
      recurring: true,
      nextDelivery: "Mar 5, 2025"
    },
    {
      id: "D-2025-004",
      date: "Feb 5, 2025",
      buyer: {
        name: "Morning Brew Cafes",
        location: "Chicago, IL",
        type: "Business",
        image: null
      },
      products: [
        { name: "Free-Range Eggs", quantity: "300 dozen", price: "$4.50/dozen" }
      ],
      totalValue: 1350.00,
      status: "Completed",
      paymentStatus: "Paid",
      deliveryDate: "Feb 8, 2025",
      rating: 5,
      notes: "Perfect quality and packaging",
      recurring: true,
      nextDelivery: "Feb 15, 2025"
    },
    {
      id: "D-2025-005",
      date: "Jan 25, 2025",
      buyer: {
        name: "Local Family",
        location: "Portland, OR",
        type: "Individual",
        image: null
      },
      products: [
        { name: "Honey", quantity: "10 bottles", price: "$10.00/bottle" },
        { name: "Seasonal Vegetables", quantity: "15 kg", price: "$4.00/kg" }
      ],
      totalValue: 160.00,
      status: "Completed",
      paymentStatus: "Paid",
      deliveryDate: "Jan 26, 2025",
      rating: 5,
      notes: "Customer picked up at farm",
      recurring: false,
      nextDelivery: null
    }
  ]);

  // Calculate some summary statistics
  const totalDeals = deals.length;
  const totalRevenue = deals.reduce((sum, deal) => sum + deal.totalValue, 0);
  const averageRating = deals.reduce((sum, deal) => sum + deal.rating, 0) / totalDeals;
  const recurringDeals = deals.filter(deal => deal.recurring).length;

  // Function to render the details of a deal
  const renderDealCard = (deal) => {
    return (
      <Card 
        key={deal.id} 
        className="mb-6 shadow-sm hover:shadow transition-shadow duration-300"
        bordered={false}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Deal summary */}
          <div className="lg:w-2/3 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center">
                  <Title level={4} className="mb-0 mr-2">{deal.id}</Title>
                  {deal.recurring && (
                    <Tooltip title="Recurring Deal">
                      <Tag color="blue">Recurring</Tag>
                    </Tooltip>
                  )}
                </div>
                <Text type="secondary" className="flex items-center">
                  <CalendarOutlined className="mr-1" /> {deal.date}
                  <Divider type="vertical" />
                  <UserOutlined className="mr-1" /> {deal.buyer.name}
                  <Divider type="vertical" />
                  <EnvironmentOutlined className="mr-1" /> {deal.buyer.location}
                </Text>
              </div>
              <div className="flex">
                <Dropdown overlay={
                  <Menu>
                    <Menu.Item key="1" icon={<DownloadOutlined />}>Download Invoice</Menu.Item>
                    <Menu.Item key="2" icon={<FileTextOutlined />}>View Contract</Menu.Item>
                    <Menu.Item key="3" icon={<MessageOutlined />}>Message Buyer</Menu.Item>
                  </Menu>
                } placement="bottomRight">
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </div>
            </div>
            
            <Divider className="my-3" />
            
            <h3 className="font-medium mb-2">Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deal.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{product.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              {deal.notes && (
                <div className="mt-2">
                  <strong>Notes:</strong> {deal.notes}
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Deal status */}
          <div className="lg:w-1/3 p-4 bg-gray-50 lg:border-l border-gray-200">
            <div className="flex flex-col h-full justify-between">
              <div>
                <Statistic
                  title="Total Value"
                  value={deal.totalValue}
                  precision={2}
                  prefix="$"
                  className="mb-4"
                />
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Status</span>
                    <Tag color="green">{deal.status}</Tag>
                  </div>
                  
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Payment</span>
                    <Tag color={deal.paymentStatus === "Paid" ? "green" : "orange"}>{deal.paymentStatus}</Tag>
                  </div>
                  
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Delivery Date</span>
                    <span className="text-sm">{deal.deliveryDate}</span>
                  </div>
                  
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Rating</span>
                    <span className="text-sm text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        i < deal.rating ? 
                          <StarFilled key={i} className="text-yellow-500" /> : 
                          <StarOutlined key={i} className="text-gray-300" />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
              
              {deal.recurring && deal.nextDelivery && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Next Scheduled Delivery</h4>
                  <div className="flex items-center text-green-600">
                    <CalendarOutlined className="mr-2" />
                    <span>{deal.nextDelivery}</span>
                  </div>
                  
                  <Button 
                    type="primary" 
                    className="mt-3 bg-green-600 hover:bg-green-700 w-full"
                  >
                    Prepare Next Delivery
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Deals History</h1>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          className="bg-green-600 hover:bg-green-700"
        >
          Export Report
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="Total Deals"
            value={totalDeals}
            prefix={<FileDoneOutlined />}
          />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="Total Revenue"
            value={totalRevenue}
            precision={2}
            prefix="$"
            suffix=""
          />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="Average Rating"
            value={averageRating.toFixed(1)}
            prefix={<StarFilled className="text-yellow-500" />}
            suffix="/5"
          />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title="Recurring Deals"
            value={recurringDeals}
            suffix={`/${totalDeals}`}
          />
        </Card>
      </div>
      
      {/* Filter Controls */}
      <Card bordered={false} className="mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-4">
            <RangePicker className="w-52" placeholder={["Start Date", "End Date"]} />
            
            <Dropdown overlay={
              <Menu>
                <Menu.Item key="1">All Buyers</Menu.Item>
                <Menu.Item key="2">Green Plate Restaurant</Menu.Item>
                <Menu.Item key="3">Community Fresh Market</Menu.Item>
                <Menu.Item key="4">Sunrise Bakery</Menu.Item>
                <Menu.Item key="5">Morning Brew Cafes</Menu.Item>
              </Menu>
            }>
              <Button icon={<FilterOutlined />}>
                Filter by Buyer
              </Button>
            </Dropdown>
            
            <Dropdown overlay={
              <Menu>
                <Menu.Item key="1">All Products</Menu.Item>
                <Menu.Item key="2">Organic Carrots</Menu.Item>
                <Menu.Item key="3">Apples</Menu.Item>
                <Menu.Item key="4">Organic Wheat</Menu.Item>
                <Menu.Item key="5">Free-Range Eggs</Menu.Item>
              </Menu>
            }>
              <Button icon={<ShoppingOutlined />}>
                Filter by Product
              </Button>
            </Dropdown>
          </div>
          
          <div>
            <Dropdown overlay={
              <Menu>
                <Menu.Item key="1">Date (Newest First)</Menu.Item>
                <Menu.Item key="2">Date (Oldest First)</Menu.Item>
                <Menu.Item key="3">Value (Highest First)</Menu.Item>
                <Menu.Item key="4">Value (Lowest First)</Menu.Item>
              </Menu>
            }>
              <Button icon={<SortAscendingOutlined />}>
                Sort By
              </Button>
            </Dropdown>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <Tabs 
          defaultActiveKey="1" 
          onChange={setActiveTab} 
          className="px-4 pt-2"
        >
          <TabPane tab="All Deals" key="1" />
          <TabPane tab="Recurring Deals" key="2" />
          <TabPane tab="One-time Deals" key="3" />
          <TabPane tab="By Month" key="4" />
        </Tabs>
      </div>
      
      {/* Deals List */}
      {activeTab === "1" && deals.map(deal => renderDealCard(deal))}
      
      {activeTab === "2" && deals.filter(deal => deal.recurring).map(deal => renderDealCard(deal))}
      
      {activeTab === "3" && deals.filter(deal => !deal.recurring).map(deal => renderDealCard(deal))}
      
      {activeTab === "4" && (
        <div>
          <Timeline mode="left" className="p-4">
            <Timeline.Item label="February 2025">
              <Card title="February 2025" bordered={false} className="mb-4">
                <Statistic 
                  title="Monthly Revenue" 
                  value={2335.00} 
                  precision={2} 
                  prefix="$" 
                  className="mb-4"
                />
                <div>4 deals completed</div>
                <Progress percent={80} status="active" />
              </Card>
            </Timeline.Item>
            <Timeline.Item label="January 2025">
              <Card title="January 2025" bordered={false} className="mb-4">
                <Statistic 
                  title="Monthly Revenue" 
                  value={1540.00} 
                  precision={2} 
                  prefix="$" 
                  className="mb-4"
                />
                <div>2 deals completed</div>
                <Progress percent={40} status="active" />
              </Card>
            </Timeline.Item>
          </Timeline>
        </div>
      )}
    </div>
  );
};

export default DealsHistoryPage;