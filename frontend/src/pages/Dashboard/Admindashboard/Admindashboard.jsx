import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Layout, Menu } from 'antd';

// Import components similar to other dashboards
import Header from '../../../components/Header/Header';

// Import Ant Design components
import { 
  Table, 
  Card, 
  Statistic, 
  Button, 
  Tabs, 
  Input, 
  Space, 
  Tag, 
  Tooltip, 
  Spin, 
  Empty, 
  Badge,
  Avatar,
  Typography,
  Modal,
  message,
  Select,
  Divider
} from 'antd';

// Import icons
import { 
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  ProjectOutlined,
  LogoutOutlined,
  MenuOutlined,
  BarChartOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  MessageOutlined,
  WarningOutlined,
  SwapOutlined,
  FlagOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search: SearchInput } = Input;
const { Sider } = Layout;

const AdminDashboard = () => {
  // State variables
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    activeFarmers: 0,
    activeBuyers: 0,
    pendingApprovals: 0,
    recentTransactions: []
  });
  const [users, setUsers] = useState([]);
  const [deals, setDeals] = useState({ productDeals: [], demandDeals: [] });
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealDetailsVisible, setDealDetailsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dealSearchTerm, setDealSearchTerm] = useState('');
  const [dealTypeFilter, setDealTypeFilter] = useState('all');
  const [dealStatusFilter, setDealStatusFilter] = useState('all');
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loadingInactiveUsers, setLoadingInactiveUsers] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportDetailsVisible, setReportDetailsVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [submittingWarning, setSubmittingWarning] = useState(false);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');

  // Modal state
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [deactivationDays, setDeactivationDays] = useState(7);
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [reactivateModalVisible, setReactivateModalVisible] = useState(false);
  const [reactivatingUser, setReactivatingUser] = useState(null);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Fetch data when component mounts
    fetchUserDetails();
    fetchDashboardData();
    fetchDeals();
    fetchReports();
    fetchInactiveUsers();
  }, []);
  
  // Refresh inactive users data when main users data changes
  useEffect(() => {
    if (users && users.length > 0) {
      fetchInactiveUsers();
    }
  }, [users]);

  // Fetch user details similar to other dashboards
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('No authentication token found. Please log in.');
        return;
      }
      
      const response = await axios.get('http://127.0.0.1:8000/dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setUserDetails(response.data);
    } catch (error) {
      console.error(error);
      // Don't show error toast, just log it
      if (error.response && error.response.status === 401) {
        console.log("Authentication error. Token may be invalid or expired.");
      }
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Fetch all buyer profiles
      let buyersData = [];
      try {
        const buyersResponse = await axios.get('http://127.0.0.1:8000/api/all-buyer-profiles/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Format buyer data with fields from both User and BuyerProfile tables
        buyersData = buyersResponse.data.map(buyer => {
          return {
            id: buyer.id,
            userId: buyer.user,
            name: `${buyer.user_first_name || ''} ${buyer.user_last_name || ''}`.trim() || 'Anonymous Buyer',
            email: buyer.user_email || 'No email provided',
            type: 'Buyer',
            status: buyer.user_is_verified ? 'verified' : 'pending',
            is_active: buyer.user_is_active !== false,
            phone: buyer.phoneno || 'Not provided',
            address: buyer.address || 'Not provided',
            city: buyer.city || 'Not provided',
            state: buyer.state || 'Not provided',
            country: buyer.country || 'Not provided',
            pincode: buyer.pincode || 'Not provided',
            businessType: buyer.business_type || 'Not specified',
            bio: buyer.bio || 'No bio provided',
            dob: buyer.dob || 'Not provided',
            joinDate: buyer.created_at || 'Unknown',
            image: buyer.profilepic || null,
            location: buyer.lat && buyer.lng ? { lat: buyer.lat, lng: buyer.lng } : null
          };
        });
        
        setBuyers(buyersData);
      } catch (buyerError) {
        console.error("Error fetching buyer profiles:", buyerError);
        // Continue with what we have even if this fails
      }
      
      // Fetch all farmer profiles
      let farmersData = [];
      try {
        const farmerResponse = await axios.get('http://127.0.0.1:8000/api/all-farmer-profiles/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Format farmer data with fields from both User and FarmerProfile tables
        farmersData = farmerResponse.data.map(farmer => {
          return {
            id: farmer.id,
            userId: farmer.user,
            name: `${farmer.user_first_name || ''} ${farmer.user_last_name || ''}`.trim() || 'Sample Farmer',
            email: farmer.user_email || 'No email provided',
            type: 'Farmer',
            status: farmer.user_is_verified ? 'verified' : 'pending',
            is_active: farmer.user_is_active !== false,
            phone: farmer.phoneno || 'Not provided',
            address: farmer.address || 'Not provided',
            city: farmer.city || 'Not provided',
            state: farmer.state || 'Not provided',
            country: farmer.country || 'Not provided',
            pincode: farmer.pincode || 'Not provided',
            farmType: farmer.farm_type || 'Not specified',
            bio: farmer.bio || 'No bio provided',
            dob: farmer.dob || 'Not provided',
            joinDate: farmer.created_at || 'Unknown',
            image: farmer.profilepic || null,
            location: farmer.lat && farmer.lng ? { lat: farmer.lat, lng: farmer.lng } : null
          };
        });
        
        setFarmers(farmersData);
      } catch (farmerError) {
        console.error("Error fetching farmer profiles:", farmerError);
        // Continue with what we have even if this fails
      }
      
      // Combine both lists for the "All Users" view
      const combinedUsers = [...farmersData, ...buyersData];
      setUsers(combinedUsers);
      
      // Calculate dashboard statistics
      setDashboardStats({
        activeFarmers: farmersData.filter(f => f.status === 'verified').length,
        activeBuyers: buyersData.filter(b => b.status === 'verified').length,
        pendingApprovals: combinedUsers.filter(u => u.status === 'pending').length,
        recentTransactions: [
          { id: 1, farmer: 'John Smith', buyer: 'Green Grocers', category: 'Rubber', amount: 1250, status: 'completed' },
          { id: 2, farmer: 'Maria Garcia', buyer: 'Fresh Markets', category: 'Coconut', amount: 880, status: 'pending' },
        ]
      });
      
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
      setLoading(false);
      toast.error("Failed to load dashboard data");
    }
  };

  // Fetch all deals from the API
  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/all-deals/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDeals({
        demandDeals: response.data.demand_deals || [],
        productDeals: response.data.product_deals || []
      });
      
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error("Failed to load deals data");
    }
  };

  // Fetch reports from the API
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      console.log("Fetching reports...");
      setReports([]); // Clear existing reports to avoid stale data
      
      const response = await axios.get('http://127.0.0.1:8000/api/admin-reports/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Reports response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setReports(response.data);
        console.log(`Loaded ${response.data.length} reports successfully`);
      } else {
        console.error("Invalid reports data format:", response.data);
        toast.error("Received invalid report data format from server");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response error status:", error.response.status);
        
        if (error.response.status === 403) {
          toast.error("You don't have permission to view reports. Admin access required.");
        } else {
          toast.error(`Failed to load reports: ${error.response.data.detail || 'Unknown error'}`);
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to load reports data");
      }
    }
  };

  const fetchInactiveUsers = async () => {
    setLoadingInactiveUsers(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoadingInactiveUsers(false);
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/inactive-users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Get the basic inactive users data
      const inactiveUsersBasic = response.data;
      
      // If we have both inactive users data and the full users data
      if (inactiveUsersBasic.length > 0 && users && users.length > 0) {
        // Enhance inactive users with full profile data
        const enhancedInactiveUsers = inactiveUsersBasic.map(inactiveUser => {
          // Find the corresponding full user profile
          const fullUserProfile = users.find(user => user.userId === inactiveUser.id);
          
          if (fullUserProfile) {
            // Return enhanced user with data from both sources
            return {
              ...inactiveUser,
              // Keep the original ID which is the User model ID
              profileId: fullUserProfile.id,
              name: `${inactiveUser.first_name} ${inactiveUser.last_name}`,
              type: inactiveUser.role === 'Farmer' ? 'Farmer' : 'Buyer',
              phone: fullUserProfile.phone || 'Not provided',
              address: fullUserProfile.address || 'Not provided',
              city: fullUserProfile.city || 'Not provided',
              state: fullUserProfile.state || 'Not provided',
              country: fullUserProfile.country || 'Not provided',
              pincode: fullUserProfile.pincode || 'Not provided',
              bio: fullUserProfile.bio || 'No bio provided',
              dob: fullUserProfile.dob || 'Not provided',
              image: fullUserProfile.image || null,
              status: 'inactive'
            };
          } else {
            // If no matching profile found, return basic data
            return {
              ...inactiveUser,
              name: `${inactiveUser.first_name} ${inactiveUser.last_name}`,
              type: inactiveUser.role === 'Farmer' ? 'Farmer' : 'Buyer',
              phone: 'Not available',
              address: 'Not available',
              city: 'Not available',
              state: 'Not available',
              country: 'Not available',
              status: 'inactive'
            };
          }
        });
        
        setInactiveUsers(enhancedInactiveUsers);
      } else {
        // If we don't have full users data yet, just use the basic data
        const formattedInactiveUsers = inactiveUsersBasic.map(user => ({
          ...user,
          name: `${user.first_name} ${user.last_name}`,
          type: user.role === 'Farmer' ? 'Farmer' : 'Buyer',
          status: 'inactive'
        }));
        
        setInactiveUsers(formattedInactiveUsers);
      }
      
    } catch (error) {
      console.error("Error fetching inactive users:", error);
      toast.error("Failed to load inactive users data");
    } finally {
      setLoadingInactiveUsers(false);
    }
  };

  const filterUsers = (users) => {
    if (!searchTerm) return users;
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercasedSearch) ||
      user.email.toLowerCase().includes(lowercasedSearch) ||
      user.city.toLowerCase().includes(lowercasedSearch) ||
      user.status.toLowerCase().includes(lowercasedSearch)
    );
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const approveUser = async (user) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('No authentication token found. Please log in.');
        return;
      }
      
      // Make API call to approve user using the user's ID from the User table (not the profile ID)
      const response = await axios.post(`http://127.0.0.1:8000/api/approve-user/${user.userId}/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success message
      message.success(`${user.name} has been approved successfully`);
      
      // Refresh data
      fetchDashboardData();
      
      // Close the modal if it's open
      if (selectedUser && selectedUser.id === user.id) {
        setDetailsVisible(false);
      }
    } catch (error) {
      console.error("Error approving user:", error);
      message.error(`Failed to approve user. ${error.response?.data?.message || error.message}`);
    }
  };

  const showDeactivateModal = (user) => {
    setDeactivatingUser({
      id: user.id,
      userId: user.user || user.id, // Handle both profile objects and direct user objects
      name: `${user.first_name} ${user.last_name}`
    });
    setDeactivationDays(7); // Reset to default
    setDeactivateModalVisible(true);
  };

  const handleDeactivateUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('No authentication token found. Please log in.');
        return;
      }
      
      // Show loading message
      const loadingMessage = message.loading('Deactivating user...', 0);
      
      console.log("Deactivating user:", deactivatingUser);
      
      // Make API call to deactivate user
      const response = await axios.post(
        `http://127.0.0.1:8000/api/deactivate-user/${deactivatingUser.userId}/`, 
        { deactivation_days: deactivationDays }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Close loading message
      loadingMessage();
      
      // Show success message
      message.success(response.data.detail);
      
      // Close the modal
      setDeactivateModalVisible(false);
      
      // Refresh data
      fetchDashboardData();
      fetchInactiveUsers();
      
      // Close the user details modal if it's open
      if (selectedUser && selectedUser.id === deactivatingUser.id) {
        setDetailsVisible(false);
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        message.error(`Failed to deactivate user: ${error.response.data.detail || 'Unknown error'}`);
      } else {
        message.error(`Failed to deactivate user. ${error.message}`);
      }
    }
  };

  const showReactivateModal = (user) => {
    setReactivatingUser(user);
    setReactivateModalVisible(true);
  };

  const handleReactivateUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('No authentication token found. Please log in.');
        return;
      }
      
      // Make API call to reactivate user
      const response = await axios.post(
        `http://127.0.0.1:8000/api/reactivate-user/${reactivatingUser.userId}/`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Show success message
      message.success(response.data.detail);
      
      // Close the modal
      setReactivateModalVisible(false);
      
      // Refresh data
      fetchDashboardData();
      fetchInactiveUsers();
      
      // Close the user details modal if it's open
      if (selectedUser && selectedUser.id === reactivatingUser.id) {
        setDetailsVisible(false);
      }
    } catch (error) {
      console.error("Error reactivating user:", error);
      message.error(`Failed to reactivate user. ${error.response?.data?.detail || error.message}`);
    }
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setDetailsVisible(true);
  };

  const getUsersTable = (users) => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar 
              src={record.image} 
              style={{ backgroundColor: record.type === 'Farmer' ? '#52c41a' : '#1890ff' }}
            >
              {record.name && record.name.length > 0 ? record.name[0] : '?'}
            </Avatar>
            <span>{text}</span>
          </div>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: type => (
          <Tag color={type === 'Farmer' ? 'green' : 'blue'}>
            {type}
          </Tag>
        ),
      },
      {
        title: 'Phone',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: 'Location',
        dataIndex: 'city',
        key: 'city',
        render: (_, record) => `${record.city}, ${record.state}`,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => (
          <Tag color={status === 'verified' ? 'success' : 'warning'}>
            {status === 'verified' ? 'Verified' : 'Pending'}
          </Tag>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space size="middle">
            <Tooltip title="View Details">
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => showUserDetails(record)}
              />
            </Tooltip>
            {record.status !== 'verified' && (
              <Tooltip title="Approve">
                <Button 
                  type="text" 
                  icon={<CheckCircleOutlined style={{ color: 'green' }} />} 
                  onClick={() => approveUser(record)}
                />
              </Tooltip>
            )}
            {/* Check if this user is in the inactive users list by comparing user ID */}
            {!inactiveUsers.some(inactiveUser => inactiveUser.id === record.userId) ? (
              <Tooltip title="Deactivate">
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => showDeactivateModal(record)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Reactivate">
                <Button 
                  type="text" 
                  icon={<CheckCircleOutlined style={{ color: 'green' }} />} 
                  onClick={() => showReactivateModal(record)}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    return (
      <Table 
        columns={columns} 
        dataSource={filterUsers(users)} 
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50']
        }}
        loading={loading}
      />
    );
  };

  const getInactiveUsersTable = (users) => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar 
              src={record.image} 
              style={{ backgroundColor: record.type === 'Farmer' ? '#52c41a' : '#1890ff' }}
            >
              {record.name && record.name.length > 0 ? record.name[0] : '?'}
            </Avatar>
            <span>{text}</span>
          </div>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: type => (
          <Tag color={type === 'Farmer' ? 'green' : 'blue'}>
            {type}
          </Tag>
        ),
      },
      {
        title: 'Phone',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: 'Location',
        dataIndex: 'city',
        key: 'city',
        render: (_, record) => `${record.city}, ${record.state}`,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => (
          <Tag color="error">
            Inactive
          </Tag>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space size="middle">
            <Tooltip title="View Details">
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => showUserDetails(record)}
              />
            </Tooltip>
            <Tooltip title="Reactivate">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined style={{ color: 'green' }} />} 
                onClick={() => showReactivateModal(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ];

    return (
      <Table 
        columns={columns} 
        dataSource={filterUsers(users)} 
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50']
        }}
        loading={loadingInactiveUsers}
      />
    );
  };

  const showDealDetails = (deal, type) => {
    setSelectedDeal({
      ...deal,
      dealType: type
    });
    setDealDetailsVisible(true);
  };

  // Handle navigation
  const handleNavigation = (page) => {
    switch(page) {
      case '1':
        setActiveSection('dashboard');
        break;
      case '2':
        setActiveSection('users');
        break;
      case '3':
        setActiveSection('deals');
        break;
      case '4':
        setActiveSection('reports');
        break;
      case '5':
        setActiveSection('messages');
        break;
      case '6':
        setActiveSection('settings');
        break;
      default:
        setActiveSection('dashboard');
    }
  };

  // Filter reports based on search term and status filter
  const filterReports = () => {
    if (!reports) return [];
    
    return reports.filter(report => {
      // Filter by search term
      const matchesSearch = !reportSearchTerm || 
        report.reporter_name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
        report.reported_user_name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
        report.reason.toLowerCase().includes(reportSearchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = reportStatusFilter === 'all' || report.status === reportStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Show report details
  const showReportDetails = (report) => {
    setSelectedReport(report);
    setWarningMessage('');
    setReportDetailsVisible(true);
  };

  // Handle sending warning
  const handleSendWarning = async () => {
    if (!warningMessage.trim()) {
      message.error('Please enter a warning message');
      return;
    }

    setSubmittingWarning(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        setSubmittingWarning(false);
        return;
      }

      const response = await axios.put(
        `http://127.0.0.1:8000/api/reports/${selectedReport.id}/`,
        {
          warning_message: warningMessage,
          status: 'reviewed'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      message.success('Warning sent successfully');
      setReportDetailsVisible(false);
      fetchReports(); // Refresh reports list
    } catch (error) {
      console.error("Error sending warning:", error);
      message.error('Failed to send warning');
    } finally {
      setSubmittingWarning(false);
    }
  };

  // Handle resolving report
  const handleResolveReport = async (status) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      // Show loading message
      const loadingMessage = message.loading(`Updating report status to ${status}...`, 0);
      
      console.log(`Updating report ${selectedReport.id} status to ${status}`);
      
      const response = await axios.put(
        `http://127.0.0.1:8000/api/reports/${selectedReport.id}/`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Close loading message
      loadingMessage();
      
      console.log('Report update response:', response.data);
      
      if (response.status === 200) {
        message.success(`Report marked as ${status}`);
        setReportDetailsVisible(false);
        
        // Update the local state to reflect the change immediately
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === selectedReport.id ? { ...report, status } : report
          )
        );
        
        // Refresh the reports list from the server
        fetchReports();
      } else {
        message.error(`Failed to update report status: Unexpected response status ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response error status:", error.response.status);
        message.error(`Failed to update report status: ${error.response.data.detail || 'Server error'}`);
      } else if (error.request) {
        message.error('Network error. Please check your connection.');
      } else {
        message.error('Failed to update report status');
      }
    }
  };

  // Handle deactivating reported user
  const handleDeactivateReportedUser = () => {
    if (selectedReport && selectedReport.reported_user) {
      const reportedUser = {
        userId: selectedReport.reported_user,
        name: selectedReport.reported_user_name
      };
      setDeactivatingUser(reportedUser);
      setDeactivationDays(7); // Reset to default
      setReportDetailsVisible(false);
      setDeactivateModalVisible(true);
    }
  };

  // Render different content based on activeSection
  const renderContent = () => {
    if (loading && activeSection !== 'dashboard') {
      return (
        <div className="farmily-admin-loading">
          <Spin size="large" />
          <p>Loading data...</p>
        </div>
      );
    }

    if (error && activeSection !== 'dashboard') {
      return (
        <div className="farmily-admin-error">
          <WarningOutlined style={{ fontSize: '32px', color: '#f5222d' }} />
          <p>{error}</p>
          <Button type="primary" onClick={fetchDashboardData}>Try Again</Button>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Stats Cards */}
            <div className="farmily-admin-stats">
              <Card className="farmily-admin-stat-card">
                <Statistic 
                  title="Total Users"
                  value={dashboardStats.activeFarmers + dashboardStats.activeBuyers}
                  prefix={<UsergroupAddOutlined />}
                />
              </Card>
              <Card className="farmily-admin-stat-card">
                <Statistic 
                  title="Active Farmers"
                  value={dashboardStats.activeFarmers}
                  prefix={<UserOutlined />}
                />
              </Card>
              <Card className="farmily-admin-stat-card">
                <Statistic 
                  title="Active Buyers"
                  value={dashboardStats.activeBuyers}
                  prefix={<ShopOutlined />}
                />
              </Card>
              <Card className="farmily-admin-stat-card">
                <Statistic 
                  title="Pending Approvals"
                  value={dashboardStats.pendingApprovals}
                  prefix={<MessageOutlined />}
                />
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="farmily-admin-card" title="Recent Transactions">
              <Table 
                dataSource={dashboardStats.recentTransactions} 
                rowKey="id"
                pagination={false}
                columns={[
                  { title: 'Farmer', dataIndex: 'farmer' },
                  { title: 'Buyer', dataIndex: 'buyer' },
                  { title: 'Category', dataIndex: 'category' },
                  { 
                    title: 'Amount', 
                    dataIndex: 'amount',
                    render: amount => `₹${amount}`
                  },
                  { 
                    title: 'Status', 
                    dataIndex: 'status',
                    render: status => (
                      <Tag color={status === 'completed' ? 'success' : 'processing'}>
                        {status}
                      </Tag>
                    )
                  },
                ]}
              />
            </Card>

            {/* Recent Users */}
            <Card className="farmily-admin-card" title="Recent Users">
              {getUsersTable(users.slice(0, 5))}
              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button 
                  type="primary" 
                  onClick={() => setActiveSection('users')}
                >
                  View All Users
                </Button>
              </div>
            </Card>
          </>
        );
      
      case 'users':
        return (
          <Card 
            title="All Users" 
            className="farmily-admin-card"
            extra={
              <Space>
                <SearchInput 
                  placeholder="Search users..." 
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 250 }}
                />
              </Space>
            }
          >
            <Tabs defaultActiveKey="all">
              <TabPane tab="All Users" key="all">
                {getUsersTable(users)}
              </TabPane>
              <TabPane tab="Farmers" key="farmers">
                {getUsersTable(users.filter(user => user.type === 'Farmer'))}
              </TabPane>
              <TabPane tab="Buyers" key="buyers">
                {getUsersTable(users.filter(user => user.type === 'Buyer'))}
              </TabPane>
              <TabPane tab="Pending Approval" key="pending">
                {getUsersTable(users.filter(user => user.status === 'pending'))}
              </TabPane>
              <TabPane tab="Inactive Users" key="inactive">
                {getInactiveUsersTable(inactiveUsers)}
              </TabPane>
            </Tabs>
          </Card>
        );
      
      case 'deals':
        return (
          <Card 
            title="Deals" 
            className="farmily-admin-card"
            extra={
              <Space>
                <SearchInput 
                  placeholder="Search deals..." 
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 250 }}
                />
              </Space>
            }
          >
            <Tabs defaultActiveKey="product">
              <TabPane tab="Product Deals" key="product">
                <Table 
                  columns={[
                    { 
                      title: 'Deal ID', 
                      dataIndex: 'id',
                      key: 'id',
                      sorter: (a, b) => a.id - b.id
                    },
                    { 
                      title: 'Farmer', 
                      dataIndex: 'product_details',
                      key: 'farmer_name',
                      render: (details) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar style={{ backgroundColor: '#52c41a' }}>
                            {details?.farmer_name ? details.farmer_name[0] : 'F'}
                          </Avatar>
                          <span>{details?.farmer_name}</span>
                        </div>
                      )
                    },
                    { 
                      title: 'Buyer', 
                      dataIndex: 'buyer_name',
                      key: 'buyer_name',
                      render: (text) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar style={{ backgroundColor: '#1890ff' }}>
                            {text ? text[0] : 'B'}
                          </Avatar>
                          <span>{text}</span>
                        </div>
                      )
                    },
                    { 
                      title: 'Category', 
                      dataIndex: 'product_details',
                      key: 'category',
                      render: (details) => details?.category || 'N/A'
                    },
                    { 
                      title: 'Quantity', 
                      dataIndex: 'quantity',
                      key: 'quantity',
                      render: (text, record) => `${text} ${record.product_details?.unit || ''}`
                    },
                    { 
                      title: 'Price', 
                      dataIndex: 'offered_price',
                      key: 'price',
                      render: (price) => `₹${price}`
                    },
                    { 
                      title: 'Status', 
                      dataIndex: 'status',
                      key: 'status',
                      render: status => (
                        <Tag color={
                          status === 'accepted' ? 'success' : 
                          status === 'pending' ? 'warning' :
                          status === 'completed' ? 'blue' :
                          status === 'rejected' ? 'error' :
                          'processing'
                        }>
                          {status}
                        </Tag>
                      )
                    },
                    {
                      title: 'Created', 
                      dataIndex: 'created_at',
                      key: 'created_at',
                      render: (date) => new Date(date).toLocaleDateString()
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space size="middle">
                          <Tooltip title="View Details">
                            <Button 
                              type="text" 
                              icon={<EyeOutlined />} 
                              onClick={() => showDealDetails(record, 'product')}
                            />
                          </Tooltip>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={deals.productDeals}
                  rowKey="id"
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50']
                  }}
                />
              </TabPane>
              <TabPane tab="Demand Deals" key="demand">
                <Table 
                  columns={[
                    { 
                      title: 'Deal ID', 
                      dataIndex: 'id',
                      key: 'id',
                      sorter: (a, b) => a.id - b.id
                    },
                    { 
                      title: 'Farmer', 
                      dataIndex: 'farmer_name',
                      key: 'farmer_name',
                      render: (text, record) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar style={{ backgroundColor: '#52c41a' }}>
                            {text ? text[0] : 'F'}
                          </Avatar>
                          <span>{text}</span>
                        </div>
                      )
                    },
                    { 
                      title: 'Buyer', 
                      dataIndex: 'demand_details',
                      key: 'buyer_name',
                      render: (details) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar style={{ backgroundColor: '#1890ff' }}>
                            {details?.buyer_name ? details.buyer_name[0] : 'B'}
                          </Avatar>
                          <span>{details?.buyer_name}</span>
                        </div>
                      )
                    },
                    { 
                      title: 'Category', 
                      dataIndex: 'demand_details',
                      key: 'category',
                      render: (details) => details?.category || 'N/A'
                    },
                    { 
                      title: 'Quantity', 
                      dataIndex: 'offered_quantity',
                      key: 'quantity',
                      render: (text, record) => `${text} ${record.demand_details?.unit || ''}`
                    },
                    { 
                      title: 'Price', 
                      dataIndex: 'offered_price',
                      key: 'price',
                      render: (price) => `₹${price}`
                    },
                    { 
                      title: 'Status', 
                      dataIndex: 'status',
                      key: 'status',
                      render: status => (
                        <Tag color={
                          status === 'Accepted' ? 'success' : 
                          status === 'pending' ? 'warning' :
                          status === 'completed' ? 'blue' :
                          status === 'rejected' ? 'error' :
                          'processing'
                        }>
                          {status}
                        </Tag>
                      )
                    },
                    {
                      title: 'Created', 
                      dataIndex: 'created_at',
                      key: 'created_at',
                      render: (date) => new Date(date).toLocaleDateString()
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space size="middle">
                          <Tooltip title="View Details">
                            <Button 
                              type="text" 
                              icon={<EyeOutlined />} 
                              onClick={() => showDealDetails(record, 'demand')}
                            />
                          </Tooltip>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={deals.demandDeals}
                  rowKey="id"
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50']
                  }}
                />
              </TabPane>
            </Tabs>
          </Card>
        );
      
      case 'reports':
        return (
          <Card title="User Reports" className="farmily-admin-card">
            <div className="reports-filters">
              <Space style={{ marginBottom: 16 }}>
                <SearchInput
                  placeholder="Search reports"
                  value={reportSearchTerm}
                  onChange={e => setReportSearchTerm(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  defaultValue="all"
                  style={{ width: 150 }}
                  onChange={value => setReportStatusFilter(value)}
                >
                  <Select.Option value="all">All Statuses</Select.Option>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="reviewed">Reviewed</Select.Option>
                  <Select.Option value="resolved">Resolved</Select.Option>
                  <Select.Option value="dismissed">Dismissed</Select.Option>
                </Select>
                <Button 
                  type="primary" 
                  onClick={fetchReports}
                  icon={<SearchOutlined />}
                >
                  Refresh
                </Button>
              </Space>
            </div>
            
            <Table
              columns={[
                {
                  title: 'Reporter',
                  dataIndex: 'reporter_name',
                  key: 'reporter_name',
                  render: (text, record) => (
                    <div>
                      <div>{text}</div>
                      <Tag color={record.reporter_role === 'Farmer' ? 'green' : 'blue'}>
                        {record.reporter_role}
                      </Tag>
                    </div>
                  )
                },
                {
                  title: 'Reported User',
                  dataIndex: 'reported_user_name',
                  key: 'reported_user_name',
                  render: (text, record) => (
                    <div>
                      <div>{text}</div>
                      <Tag color={record.reported_user_role === 'Farmer' ? 'green' : 'blue'}>
                        {record.reported_user_role}
                      </Tag>
                    </div>
                  )
                },
                {
                  title: 'Reason',
                  dataIndex: 'reason',
                  key: 'reason',
                  ellipsis: true,
                  render: text => (
                    <Tooltip title={text}>
                      <span>{text.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
                    </Tooltip>
                  )
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: status => {
                    let color;
                    switch (status) {
                      case 'pending':
                        color = 'orange';
                        break;
                      case 'reviewed':
                        color = 'blue';
                        break;
                      case 'resolved':
                        color = 'green';
                        break;
                      case 'dismissed':
                        color = 'red';
                        break;
                      default:
                        color = 'default';
                    }
                    return (
                      <Tag color={color}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Tag>
                    );
                  }
                },
                {
                  title: 'Warning Sent',
                  dataIndex: 'warning_sent',
                  key: 'warning_sent',
                  render: sent => (
                    <Tag color={sent ? 'green' : 'default'}>
                      {sent ? 'Yes' : 'No'}
                    </Tag>
                  )
                },
                {
                  title: 'Date',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: date => new Date(date).toLocaleDateString()
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Space size="middle">
                      <Tooltip title="View Details">
                        <Button 
                          type="text" 
                          icon={<EyeOutlined />} 
                          onClick={() => showReportDetails(record)}
                        />
                      </Tooltip>
                    </Space>
                  )
                }
              ]}
              dataSource={filterReports()}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50']
              }}
              loading={loading}
            />
          </Card>
        );
      
      case 'messages':
        return (
          <Card title="Messages" className="farmily-admin-card">
            <Empty description="No messages available" />
          </Card>
        );
      
      case 'settings':
        return (
          <Card title="System Settings" className="farmily-admin-card">
            <Empty description="Settings panel coming soon" />
          </Card>
        );
      
      default:
        return null;
    }
  };

  // Placeholder for user data
  const username = "Admin";
  // Use admin image as avatar
  const adminAvatar = "/assets/images/admin/5856.jpg";

  return (
    <div className="dashboard-layout">
      {/* Header similar to other dashboards */}
      <Header userName={username} onNavigate={handleNavigation} admin={true} />
      
      {/* Sidebar similar to other dashboards */}
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          className="sidebar"
          width={280}
          theme="light"
          collapsed={!isSidebarOpen}
          trigger={null}
          style={{
            background: 'linear-gradient(to bottom, #d4edda, #b5dfb8)',
            position: 'fixed',
            top: 0,
            height: '100vh',
            width: 280,
            zIndex: 1000,
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Toggle Button */}
          <Button
            className="sidebar-toggle"
            type="primary"
            onClick={toggleSidebar}
            style={{ position: 'absolute', bottom: 20, left: 20, backgroundColor: '#2d6a4f', border: 'none', borderRadius: '15px' }}
          >
            {isSidebarOpen ? 'Close' : 'Open'} Menu
          </Button>

          {/* Sidebar Menu */}
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{
              background: 'transparent',
              color: '#2d6a4f',
              fontWeight: '500',
              border: 'none',
              marginTop: '100px'
            }}
          >
            <Menu.Item key="1" icon={<DashboardOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('1')}>
              <Link to="#">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<UsergroupAddOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('2')}>
              <Link to="#">Users</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<SwapOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('3')}>
              <Link to="#">Deals</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<FlagOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('4')}>
              <Link to="#">Reports</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<MessageOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('5')}>
              <Link to="#">Messages</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<SettingOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('6')}>
              <Link to="#">Settings</Link>
            </Menu.Item>
            <Menu.Item key="7" icon={<LogoutOutlined style={{ color: '#e74c3c' }} />} style={{ color: '#e74c3c', marginTop: 'auto' }}>
              <Link to="/logout" className='logx'>Logout</Link>
            </Menu.Item>
          </Menu>
        </Sider>

      {/* Main Content */}
        <Layout style={{ marginLeft: isSidebarOpen ? 280 : 0, transition: 'margin-left 0.3s' }}>
          <div className="dashboard-content">
            <div className="filler"></div>
            {renderContent()}
          </div>
        </Layout>
      </Layout>

      {/* User Details Modal */}
      <Modal
        title="User Details"
        visible={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedUser && (
          <div className="user-details-container">
            <div className="user-details-header">
              <Avatar 
                size={64} 
                src={selectedUser.image}
                style={{ backgroundColor: selectedUser.type === 'Farmer' ? '#52c41a' : '#1890ff' }}
              >
                {selectedUser.name[0]}
              </Avatar>
              <div className="user-details-info">
                <Title level={4}>{selectedUser.name}</Title>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Tag color={selectedUser.type === 'Farmer' ? 'green' : 'blue'}>
                    {selectedUser.type}
                  </Tag>
                  <Tag color={selectedUser.status === 'verified' ? 'success' : 'warning'}>
                    {selectedUser.status === 'verified' ? 'Verified' : 'Pending Verification'}
                  </Tag>
              </div>
              </div>
            </div>
            
            <Tabs defaultActiveKey="basic">
              <TabPane tab="Basic Info" key="basic">
                <div className="user-details-body">
                  <div className="detail-item">
                    <Text strong>Email:</Text>
                    <Text>{selectedUser.email}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Phone:</Text>
                    <Text>{selectedUser.phone}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Date of Birth:</Text>
                    <Text>{selectedUser.dob}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Bio:</Text>
                    <Text>{selectedUser.bio}</Text>
              </div>
                  <div className="detail-item">
                    <Text strong>Joined:</Text>
                    <Text>{selectedUser.joinDate}</Text>
              </div>
            </div>
              </TabPane>
              
              <TabPane tab="Location" key="location">
                <div className="user-details-body">
                  <div className="detail-item">
                    <Text strong>Address:</Text>
                    <Text>{selectedUser.address}</Text>
              </div>
                  <div className="detail-item">
                    <Text strong>City:</Text>
                    <Text>{selectedUser.city}</Text>
              </div>
                  <div className="detail-item">
                    <Text strong>State:</Text>
                    <Text>{selectedUser.state}</Text>
            </div>
                  <div className="detail-item">
                    <Text strong>Country:</Text>
                    <Text>{selectedUser.country}</Text>
              </div>
                  <div className="detail-item">
                    <Text strong>Pincode:</Text>
                    <Text>{selectedUser.pincode}</Text>
              </div>
                  {selectedUser.location && (
                    <div className="detail-item">
                      <Text strong>Coordinates:</Text>
                      <Text>Lat: {selectedUser.location.lat}, Lng: {selectedUser.location.lng}</Text>
            </div>
                  )}
          </div>
              </TabPane>
              
              <TabPane tab="Business Info" key="business">
                <div className="user-details-body">
                  <div className="detail-item">
                    <Text strong>{selectedUser.type === 'Farmer' ? 'Farm Type:' : 'Business Type:'}</Text>
                    <Text>{selectedUser.type === 'Farmer' ? selectedUser.farmType : selectedUser.businessType}</Text>
            </div>
                  {/* If needed, add more business-specific fields here */}
          </div>
              </TabPane>
            </Tabs>
            
            {selectedUser.status !== 'verified' && (
              <div className="user-details-actions">
                <Button 
                  type="primary" 
                  onClick={() => approveUser(selectedUser)}
                  icon={<CheckCircleOutlined />}
                >
                  Approve User
                </Button>
                        </div>
            )}
          </div>
        )}
      </Modal>

      {/* Deal Details Modal */}
      <Modal
        title="Deal Details"
        visible={dealDetailsVisible}
        onCancel={() => setDealDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDealDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedDeal && (
          <div className="deal-details-container">
            <div className="deal-details-header">
              <Title level={4}>
                {selectedDeal.dealType === 'demand' ? 'Demand Response' : 'Product Offer'} ID: {selectedDeal.id}
              </Title>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Tag color={
                  (selectedDeal.status === 'accepted' || selectedDeal.status === 'Accepted') ? 'success' : 
                  (selectedDeal.status === 'pending' || selectedDeal.status === 'Pending Review') ? 'warning' :
                  selectedDeal.status === 'completed' ? 'blue' :
                  selectedDeal.status === 'rejected' ? 'error' :
                  'processing'
                }>
                  {selectedDeal.status}
                </Tag>
              </div>
            </div>
            
            <Tabs defaultActiveKey="basic">
              <TabPane tab="Basic Info" key="basic">
                <div className="deal-details-body">
                  {selectedDeal.dealType === 'demand' ? (
                    <>
                      <div className="detail-item">
                        <Text strong>Farmer:</Text>
                        <Text>{selectedDeal.farmer_name}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Buyer:</Text>
                        <Text>{selectedDeal.demand_details?.buyer_name}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Category:</Text>
                        <Text>{selectedDeal.demand_details?.category}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Quantity:</Text>
                        <Text>{selectedDeal.offered_quantity} {selectedDeal.demand_details?.unit}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Price:</Text>
                        <Text>₹{selectedDeal.offered_price}</Text>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-item">
                        <Text strong>Farmer:</Text>
                        <Text>{selectedDeal.product_details?.farmer_name}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Buyer:</Text>
                        <Text>{selectedDeal.buyer_name}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Product:</Text>
                        <Text>{selectedDeal.product_details?.name}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Category:</Text>
                        <Text>{selectedDeal.product_details?.category}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Quantity:</Text>
                        <Text>{selectedDeal.quantity} {selectedDeal.product_details?.unit}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Offered Price:</Text>
                        <Text>₹{selectedDeal.offered_price}</Text>
                      </div>
                      <div className="detail-item">
                        <Text strong>Original Price:</Text>
                        <Text>₹{selectedDeal.product_details?.price}</Text>
                      </div>
                    </>
                  )}
                </div>
              </TabPane>
              
              <TabPane tab="Additional Info" key="additional">
                <div className="deal-details-body">
                  <div className="detail-item">
                    <Text strong>Created:</Text>
                    <Text>{new Date(selectedDeal.created_at).toLocaleDateString()}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Last Updated:</Text>
                    <Text>{new Date(selectedDeal.updated_at).toLocaleDateString()}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Status:</Text>
                    <Text>{selectedDeal.status}</Text>
                  </div>
                  {selectedDeal.dealType === 'demand' ? (
                    <>
                      <div className="detail-item">
                        <Text strong>Can Deliver:</Text>
                        <Text>{selectedDeal.can_deliver ? 'Yes' : 'No'}</Text>
                      </div>
                      {selectedDeal.can_deliver && (
                        <div className="detail-item">
                          <Text strong>Delivery Status:</Text>
                          <Text>{selectedDeal.delivery_status || 'Not started'}</Text>
                        </div>
                      )}
                      {selectedDeal.notes && (
                        <div className="detail-item">
                          <Text strong>Farmer Notes:</Text>
                          <Text>{selectedDeal.notes}</Text>
                        </div>
                      )}
                      {selectedDeal.buyer_message && (
                        <div className="detail-item">
                          <Text strong>Buyer Message:</Text>
                          <Text>{selectedDeal.buyer_message}</Text>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedDeal.delivery_status && (
                        <div className="detail-item">
                          <Text strong>Delivery Status:</Text>
                          <Text>{selectedDeal.delivery_status}</Text>
                        </div>
                      )}
                      {selectedDeal.notes && (
                        <div className="detail-item">
                          <Text strong>Buyer Notes:</Text>
                          <Text>{selectedDeal.notes}</Text>
                        </div>
                      )}
                      {selectedDeal.farmer_message && (
                        <div className="detail-item">
                          <Text strong>Farmer Message:</Text>
                          <Text>{selectedDeal.farmer_message}</Text>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Deactivate User Modal */}
      <Modal
        title="Deactivate User"
        visible={deactivateModalVisible}
        onCancel={() => setDeactivateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeactivateModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="deactivate" type="primary" danger onClick={handleDeactivateUser}>
            Deactivate
          </Button>
        ]}
      >
        {deactivatingUser && (
          <div>
            <p>You are about to temporarily deactivate {deactivatingUser.name}.</p>
            <p>The user will not be able to log in during the deactivation period.</p>
            <div style={{ marginTop: 16 }}>
              <Text strong>Deactivation Period (days):</Text>
              <Input
                type="number"
                min={1}
                max={365}
                value={deactivationDays}
                onChange={(e) => setDeactivationDays(e.target.value)}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Reactivate User Modal */}
      <Modal
        title="Reactivate User"
        visible={reactivateModalVisible}
        onCancel={() => setReactivateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReactivateModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="reactivate" type="primary" onClick={handleReactivateUser}>
            Reactivate
          </Button>
        ]}
      >
        {reactivatingUser && (
          <div>
            <p>You are about to reactivate {reactivatingUser.name}.</p>
            <p>The user will be able to log in again after reactivation.</p>
          </div>
        )}
      </Modal>

      {/* Report Details Modal */}
      <Modal
        title="Report Details"
        visible={reportDetailsVisible}
        onCancel={() => setReportDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReportDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedReport && (
          <div className="report-details-container">
            <div className="report-details-header">
              <Title level={4}>
                Report from {selectedReport.reporter_name} ({selectedReport.reporter_role})
              </Title>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Tag color={
                  selectedReport.status === 'pending' ? 'orange' : 
                  selectedReport.status === 'reviewed' ? 'blue' :
                  selectedReport.status === 'resolved' ? 'green' :
                  selectedReport.status === 'dismissed' ? 'red' :
                  'default'
                }>
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                </Tag>
                {selectedReport.warning_sent && (
                  <Tag color="green">Warning Sent</Tag>
                )}
              </div>
            </div>
            
            <Tabs defaultActiveKey="basic">
              <TabPane tab="Report Details" key="basic">
                <div className="report-details-body">
                  <div className="detail-item">
                    <Text strong>Reported User:</Text>
                    <Text>{selectedReport.reported_user_name} ({selectedReport.reported_user_role})</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Reason:</Text>
                    <Text>{selectedReport.reason}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Date Reported:</Text>
                    <Text>{new Date(selectedReport.created_at).toLocaleString()}</Text>
                  </div>
                  <div className="detail-item">
                    <Text strong>Last Updated:</Text>
                    <Text>{new Date(selectedReport.updated_at).toLocaleString()}</Text>
                  </div>
                  {selectedReport.admin_notes && (
                    <div className="detail-item">
                      <Text strong>Admin Notes:</Text>
                      <Text>{selectedReport.admin_notes}</Text>
                    </div>
                  )}
                  {selectedReport.warning_sent && (
                    <div className="detail-item">
                      <Text strong>Warning Message:</Text>
                      <Text>{selectedReport.warning_message}</Text>
                    </div>
                  )}
                  {selectedReport.warning_sent && (
                    <div className="detail-item">
                      <Text strong>Warning Read:</Text>
                      <Text>{selectedReport.warning_read ? 'Yes' : 'No'}</Text>
                    </div>
                  )}
                </div>
              </TabPane>
              
              <TabPane tab="Actions" key="actions">
                <div className="report-actions-body">
                  {!selectedReport.warning_sent && (
                    <div className="action-section">
                      <Title level={5}>Send Warning</Title>
                      <Input.TextArea
                        rows={4}
                        placeholder="Enter warning message to send to the reported user"
                        value={warningMessage}
                        onChange={e => setWarningMessage(e.target.value)}
                      />
                      <Button
                        type="primary"
                        danger
                        icon={<WarningOutlined />}
                        onClick={handleSendWarning}
                        loading={submittingWarning}
                        style={{ marginTop: 16 }}
                      >
                        Send Warning
                      </Button>
                    </div>
                  )}
                  
                  <Divider />
                  
                  <div className="action-section">
                    <Title level={5}>Resolve Report</Title>
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => handleResolveReport('resolved')}
                        disabled={selectedReport.status === 'resolved'}
                      >
                        Mark as Resolved
                      </Button>
                      <Button
                        danger
                        onClick={() => handleResolveReport('dismissed')}
                        disabled={selectedReport.status === 'dismissed'}
                      >
                        Dismiss Report
                      </Button>
                    </Space>
                  </div>
                  
                  <Divider />
                  
                  <div className="action-section">
                    <Title level={5}>Take Action on User</Title>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDeactivateReportedUser}
                    >
                      Deactivate User
                    </Button>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;