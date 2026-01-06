import React, { useState } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, Space, Button, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  LinkOutlined,
  FileTextOutlined,
  TeamOutlined,
  DollarOutlined,
  InboxOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  LogoutOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ViewPresetSwitcher, RoleSwitcher } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../services/permissions';
import { usePermission } from '../hooks/usePermission';
import GlobalSearch from './GlobalSearch';
import NotificationPanel from './NotificationPanel';
import './styles.css';

const { Header, Sider, Content } = Layout;

/**
 * Main Application Layout
 * 
 * Implements the layout structure per PRD §5:
 * - Left sidebar navigation
 * - Top bar with global controls
 * - Content area with breadcrumbs
 * - Responsive design with collapsible sidebar
 */
export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { can } = usePermission();
  const [collapsed, setCollapsed] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);

  // Navigation menu items per PRD §5.1
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/assets',
      icon: <LinkOutlined />,
      label: 'Links',
    },
    {
      key: '/content',
      icon: <FileTextOutlined />,
      label: 'Content',
    },
    {
      key: '/leads',
      icon: <TeamOutlined />,
      label: 'Co-selection',
    },
    // Admin menu item - only visible to OPS_BD role (Sprint 1 §8.1)
    can(Permission.LEAD_CHANGE_STATUS) ? {
      key: '/admin/review-queue',
      icon: <ControlOutlined />,
      label: 'Admin',
    } : null,
    {
      key: '/earnings',
      icon: <DollarOutlined />,
      label: 'Earnings',
    },
    {
      key: '/inbox',
      icon: <InboxOutlined />,
      label: 'Inbox',
      children: [
        {
          key: '/inbox/notifications',
          label: 'Notifications',
        },
        {
          key: '/inbox/disputes',
          label: 'Disputes',
        },
      ],
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile & Compliance',
    },
  ].filter(Boolean);

  // User menu dropdown
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/profile/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout className="main-layout">
      {/* Left Sidebar Navigation */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="main-layout-sider"
        width={220}
        theme="light"
      >
        <div className="logo">
          <span className="logo-text">{collapsed ? 'CS' : 'Co-Selector'}</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/inbox']}
          items={menuItems}
          onClick={handleMenuClick}
          className="main-layout-menu"
        />
      </Sider>

      <Layout className="main-layout-content-wrapper">
        {/* Top Bar with Global Controls per PRD §5.2 */}
        <Header className="main-layout-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger-button"
            />
          </div>

          <div className="header-center">
            {/* View Preset Switcher */}
            <ViewPresetSwitcher size="small" />
          </div>

          <div className="header-right">
            <Space size="middle">
              {/* Global Search */}
              <Tooltip title="Global Search (Ctrl+K)">
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  onClick={() => setSearchVisible(true)}
                />
              </Tooltip>

              {/* Help / Glossary */}
              <Tooltip title="Help & Glossary">
                <Button
                  type="text"
                  icon={<QuestionCircleOutlined />}
                  onClick={() => navigate('/help')}
                />
              </Tooltip>

              {/* Notifications Bell */}
              <Tooltip title="Notifications">
                <Badge count={5} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => setNotificationVisible(true)}
                  />
                </Badge>
              </Tooltip>

              {/* Dev Tools: Role Switcher (gated) */}
              {can(Permission.DEV_TOOLS_ACCESS) && (
                <div className="dev-tools-section">
                  <RoleSwitcher />
                </div>
              )}

              {/* User Menu */}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-menu">
                  <Avatar icon={<UserOutlined />} size="small" />
                  <span className="user-name">{user?.displayName || 'User'}</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Content Area */}
        <Content className="main-layout-content">
          <Outlet />
        </Content>
      </Layout>

      {/* Global Search Modal */}
      <GlobalSearch
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />

      {/* Notification Panel Drawer */}
      <NotificationPanel
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </Layout>
  );
};

export default MainLayout;
