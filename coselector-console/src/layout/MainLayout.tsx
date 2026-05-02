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
import { RoleSwitcher } from '../components';
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
      label: '首页',
    },
    {
      key: '/assets',
      icon: <LinkOutlined />,
      label: '链接管理',
    },
    {
      key: '/content',
      icon: <FileTextOutlined />,
      label: '内容',
    },
    {
      key: '/leads',
      icon: <TeamOutlined />,
      label: '共选',
    },
    // Admin menu item - only visible to OPS_BD role (Sprint 1 §8.1)
    can(Permission.LEAD_CHANGE_STATUS) ? {
      key: '/admin/review-queue',
      icon: <ControlOutlined />,
      label: '管理',
    } : null,
    {
      key: '/earnings',
      icon: <DollarOutlined />,
      label: '浏览与收益',
    },
    {
      key: '/inbox',
      icon: <InboxOutlined />,
      label: '收件箱',
      children: [
        {
          key: '/inbox/notifications',
          label: '通知',
        },
        {
          key: '/inbox/disputes',
          label: '争议',
        },
      ],
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '资料与合规',
    },
  ].filter(Boolean);

  // User menu dropdown
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '我的资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/profile/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
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
          <span className="logo-text">{collapsed ? 'CS' : '共选者后台'}</span>
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

          <div className="header-right">
            <Space size="middle">
              {/* Global Search */}
              <Tooltip title="全局搜索（Ctrl+K）">
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  onClick={() => setSearchVisible(true)}
                />
              </Tooltip>

              {/* Help / Glossary */}
              <Tooltip title="帮助与术语表">
                <Button
                  type="text"
                  icon={<QuestionCircleOutlined />}
                  onClick={() => navigate('/help')}
                />
              </Tooltip>

              {/* Notifications Bell */}
              <Tooltip title="通知">
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
                  <span className="user-name">{user?.displayName || '用户'}</span>
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
