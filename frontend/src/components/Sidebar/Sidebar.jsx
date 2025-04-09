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
  TeamOutlined,
  FileTextOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({onNavigate, isOpen, toggleSidebar, role, profileComplete }) => {
  // Function to handle navigation with profile check
  const handleNavigation = (page) => {
    onNavigate(page);
  };
  
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
            <Menu.Item 
              key="1" 
              icon={<DashboardOutlined style={{ color: '#2d6a4f' }} />} 
              onClick={() => handleNavigation('1')}
              disabled={!profileComplete}
            >
              <Link to="#">Overview</Link>
            </Menu.Item>
            <Menu.Item 
              key="2" 
              icon={<ShopOutlined style={{ color: '#2d6a4f' }} />} 
              onClick={() => handleNavigation('2')}
              disabled={!profileComplete}
            >
              <Link to="#">{role==1?"Products":"Demands"}</Link>
            </Menu.Item>
            
            <Menu.Item 
              key="4" 
              icon={<ProjectOutlined style={{ color: '#2d6a4f' }} />} 
              onClick={() => handleNavigation('4')}
              disabled={!profileComplete}
            >
              <Link to="#">Deals</Link>
            </Menu.Item>
            {role==1 && (
              <Menu.Item 
                key="6" 
                icon={<TeamOutlined style={{ color: '#2d6a4f' }} />} 
                onClick={() => handleNavigation('6')}
                disabled={!profileComplete}
              >
                <Link to="#">Buyers</Link>
              </Menu.Item>
            )}
            {role==1 && (
              <Menu.Item 
                key="7" 
                icon={<FileTextOutlined style={{ color: '#2d6a4f' }} />} 
                onClick={() => handleNavigation('7')}
                disabled={!profileComplete}
              >
                <Link to="#">Buyer Demands</Link>
              </Menu.Item>
            )}
            
            <Menu.Item key="5" icon={<UserOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('5')}>
              <Link to="#">Profile</Link>
            </Menu.Item>
            <Menu.Item key="9" icon={<LogoutOutlined style={{ color: '#e74c3c' }} />}  style={{ color: '#e74c3c', marginTop: 'auto' }}>
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
