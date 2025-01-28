import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  ProjectOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import './Sidebar.css';
import { red } from '@mui/material/colors';

const { Sider } = Layout;

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sider
          className="sidebar"
          width={280}
          theme="light" // Changed to light for Ant Design's internal theme matching
          collapsed={!isOpen}
          trigger={null}
          style={{
            background: 'linear-gradient(to bottom, #d4edda, #b5dfb8)', // Light green gradient
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
            style={{ position: 'absolute', bottom: 20, left: 20,backgroundColor: '#2d6a4f',border:'none',borderRadius:'15px' }}
          >
            {isOpen ? 'Close' : 'Open'} Menu
          </Button>

          {/* Sidebar Menu */}
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{
              background: 'transparent', // Transparent to keep the gradient
              color: '#2d6a4f', // Dark green text
              fontWeight: '500',
              border: 'none',
              marginTop:'100px'
            }}
          >
            <Menu.Item key="1" icon={<DashboardOutlined style={{ color: '#2d6a4f' }} />}>
              <Link to="/dashboard">Overview</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<ShopOutlined style={{ color: '#2d6a4f' }} />}>
              <Link to="/dashboard/products">Products</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<UsergroupAddOutlined style={{ color: '#2d6a4f' }} />}>
              <Link to="/dashboard/buyers">Buyers</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<ProjectOutlined style={{ color: '#2d6a4f' }} />}>
              <Link to="/dashboard/deals">Deals</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<UserOutlined style={{ color: '#2d6a4f' }} />}>
              <Link to="/dashboard/profile">Profile</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<LogoutOutlined style={{ color: '#e74c3c' }} />}  style={{ color: '#e74c3c', marginTop: 'auto' }}>
              <Link to="/logout" className='logx'>Logout</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Main Content */}
        <Layout style={{ marginLeft: isOpen ? 280 : 0, transition: 'margin-left 0.3s' }}>
          {/* Content goes here */}
        </Layout>
      </Layout>
    </>
  );
};

export default Sidebar;
