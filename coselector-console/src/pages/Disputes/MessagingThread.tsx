import React, { useState, useRef, useEffect } from 'react';
import { Card, List, Avatar, Input, Button, Space, Typography, Divider, Empty, Tag, message } from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { formatDate } from '../../utils/format';
import type { DisputeCase } from '../../types';

const { TextArea } = Input;
const { Text } = Typography;

interface Message {
  id: string;
  author: string;
  role: 'user' | 'support';
  content: string;
  timestamp: string;
}

interface MessagingThreadProps {
  disputeCase: DisputeCase;
  onSendMessage: (content: string) => void;
  canSendMessage: boolean;
}

export const MessagingThread: React.FC<MessagingThreadProps> = ({
  disputeCase,
  onSendMessage,
  canSendMessage,
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date().toISOString());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages from localStorage or mock data
  useEffect(() => {
    const savedMessages = localStorage.getItem(`dispute_messages_${disputeCase.id}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initial message from system
      const initialMessage: Message = {
        id: '1',
        author: 'Brand Support Team',
        role: 'support',
        content: 'Thank you for opening this dispute case. We have received your submission and will review the details. Please provide all required evidence to help us investigate.',
        timestamp: disputeCase.openedAt,
      };
      setMessages([initialMessage]);
      localStorage.setItem(`dispute_messages_${disputeCase.id}`, JSON.stringify([initialMessage]));
    }
  }, [disputeCase.id, disputeCase.openedAt]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      message.warning('Please enter a message');
      return;
    }

    if (messageContent.length > 1000) {
      message.error('Message too long. Please keep it under 1000 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        author: 'You',
        role: 'user',
        content: messageContent,
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      localStorage.setItem(`dispute_messages_${disputeCase.id}`, JSON.stringify(newMessages));

      // Trigger parent callback
      onSendMessage(messageContent);

      setMessageContent('');
      message.success('Message sent');

      // Simulate support response after 5 seconds
      setTimeout(() => {
        const supportMessage: Message = {
          id: (Date.now() + 1).toString(),
          author: 'Brand Support Team',
          role: 'support',
          content: generateAutoResponse(messageContent),
          timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...newMessages, supportMessage];
        setMessages(updatedMessages);
        localStorage.setItem(`dispute_messages_${disputeCase.id}`, JSON.stringify(updatedMessages));
      }, 5000);
    } catch (error) {
      message.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAutoResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('evidence') || lowerMessage.includes('upload')) {
      return "Thank you for your message. We've noted your evidence submission. Our team is reviewing all provided documentation. We'll update you within 2-3 business days.";
    } else if (lowerMessage.includes('urgent') || lowerMessage.includes('deadline')) {
      return "We understand the urgency of your case. Our team is prioritizing your dispute and will respond as soon as possible. Please ensure all required evidence is uploaded.";
    } else if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
      return "Your case is currently under review by our operations team. We're investigating the details and will provide an update shortly. You can check the timeline tab for the latest status.";
    } else {
      return "Thank you for your message. We've received your inquiry and will respond soon. If you have additional evidence or information, please upload it using the Evidence tab.";
    }
  };

  const handleRefresh = () => {
    setLastRefreshedAt(new Date().toISOString());
    message.success('Messages refreshed');
  };

  return (
    <Card
      title={
        <Space>
          <MessageOutlined />
          <span>Messaging Thread</span>
          <Tag color="blue">{messages.length} message{messages.length !== 1 ? 's' : ''}</Tag>
        </Space>
      }
      extra={
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      }
    >
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        Last refreshed: {formatDate(lastRefreshedAt)} • Messages are saved automatically
      </Text>

      <div
        style={{
          maxHeight: 400,
          overflowY: 'auto',
          marginBottom: 16,
          padding: 8,
          backgroundColor: '#fafafa',
          borderRadius: 4,
        }}
      >
        {messages.length === 0 ? (
          <Empty description="No messages yet" />
        ) : (
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item
                style={{
                  border: 'none',
                  padding: '12px 0',
                  alignItems: 'flex-start',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={msg.role === 'support' ? <CustomerServiceOutlined /> : <UserOutlined />}
                      style={{
                        backgroundColor: msg.role === 'support' ? '#1890ff' : '#52c41a',
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{msg.author}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatDate(msg.timestamp)}
                      </Text>
                    </Space>
                  }
                  description={
                    <div
                      style={{
                        backgroundColor: msg.role === 'support' ? '#e6f7ff' : '#f6ffed',
                        padding: 12,
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <Text>{msg.content}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {canSendMessage ? (
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here... (max 1000 characters)"
            maxLength={1000}
            rows={3}
            disabled={isSubmitting}
            onPressEnter={(e) => {
              if (e.ctrlKey || e.metaKey) {
                handleSendMessage();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={isSubmitting}
            disabled={!messageContent.trim()}
            style={{ height: 'auto' }}
          >
            Send
          </Button>
        </Space.Compact>
      ) : (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          This dispute case is resolved. Messaging is disabled.
        </Text>
      )}

      {canSendMessage && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
          Press Ctrl+Enter (Cmd+Enter on Mac) to send
        </Text>
      )}
    </Card>
  );
};
