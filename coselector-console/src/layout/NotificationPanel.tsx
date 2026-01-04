import React, { useEffect, useState } from 'react';
import { Drawer, List, Badge, Button, Space, Typography, Tabs, Empty } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../types';
import { NotificationType } from '../types/enums';
import * as mockApi from '../services/mockApi';
import './NotificationPanel.css';

const { Text, Title } = Typography;

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Notification Panel Component
 * 
 * Per PRD §5.2: "Notifications Bell"
 * Displays system notifications with read/unread status
 */
const NotificationPanel: React.FC<NotificationPanelProps> = ({ visible, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await mockApi.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await mockApi.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const getNotificationIcon = (_type: NotificationType) => {
    // Return appropriate icon based on notification type
    return <BellOutlined />;
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Drawer
      title={
        <Space>
          <Badge count={unreadCount}>
            <BellOutlined style={{ fontSize: 20 }} />
          </Badge>
          <Title level={5} style={{ margin: 0 }}>Notifications</Title>
        </Space>
      }
      placement="right"
      width={400}
      open={visible}
      onClose={onClose}
      extra={
        unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )
      }
      className="notification-panel"
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'all',
            label: `All (${notifications.length})`,
          },
          {
            key: 'unread',
            label: `Unread (${unreadCount})`,
          },
        ]}
      />

      <List
        loading={loading}
        dataSource={filteredNotifications}
        locale={{
          emptyText: (
            <Empty
              description="No notifications"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        renderItem={(item) => (
          <List.Item
            className={`notification-item ${!item.read ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(item)}
            actions={[
              !item.read && (
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(item.id);
                  }}
                />
              ),
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={getNotificationIcon(item.type)}
              title={
                <Space>
                  <Text strong={!item.read}>{item.title}</Text>
                  {!item.read && <Badge status="processing" />}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{item.message}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined /> {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default NotificationPanel;
