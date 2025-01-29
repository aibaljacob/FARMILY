import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Dropdown, Menu, Space, Badge } from 'antd';
import { BellOutlined, UserOutlined, DownOutlined } from '@ant-design/icons';
import './Header.css';

const Header = ({ userName }) => {
  const menu = (
    <Menu className="pmenu" style={{ width:"200px",display:"flex",flexDirection:"column",alignItems:"center",borderRadius:"30px",marginTop:"30px" }}>
      <Menu.Item key="profile" >
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <Link to="/logout">Logout</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="dashboard-header">
      <Link to="/farmer">
        <div className="farmily-logo"></div>
      </Link>
      <div className="header-actions">
        <Dropdown overlay={menu} trigger={['click']}>
          <Space>
            <Avatar
              size="large"
              icon={<UserOutlined />}
              src="https://via.placeholder.com/40" // Replace with actual profile picture URL
            />
            <span className="user-name">{userName || 'User'}</span>
            <DownOutlined />
          </Space>
        </Dropdown>
        <Badge count={5} offset={[10, 0]}>
          <BellOutlined style={{ fontSize: '20px', color: '#2c3e50', cursor: 'pointer' }} />
        </Badge>
      </div>
    </header>
  );
};

export default Header;
