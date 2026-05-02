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
import { translateText } from '../../utils/i18n';

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
        author: '品牌支持团队',
        role: 'support',
        content: '感谢你提交争议案件。我们已收到你的提交并会审核详情。请提供所有必填证据，以帮助我们调查。',
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
      message.warning('请输入消息');
      return;
    }

    if (messageContent.length > 1000) {
      message.error('消息过长，请控制在 1000 个字符以内。');
      return;
    }

    setIsSubmitting(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        author: '你',
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
      message.success('消息已发送');

      // Simulate support response after 5 seconds
      setTimeout(() => {
        const supportMessage: Message = {
          id: (Date.now() + 1).toString(),
          author: '品牌支持团队',
          role: 'support',
          content: generateAutoResponse(messageContent),
          timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...newMessages, supportMessage];
        setMessages(updatedMessages);
        localStorage.setItem(`dispute_messages_${disputeCase.id}`, JSON.stringify(updatedMessages));
      }, 5000);
    } catch (error) {
      message.error('消息发送失败，请重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAutoResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('evidence') || lowerMessage.includes('upload')) {
      return '感谢你的消息。我们已记录你的证据提交，团队正在审核所有文件。我们会在 2-3 个工作日内更新进展。';
    } else if (lowerMessage.includes('urgent') || lowerMessage.includes('deadline')) {
      return '我们理解此案件的紧急程度。团队会优先处理你的争议并尽快回复。请确保所有必填证据已上传。';
    } else if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
      return '你的案件目前正在由运营团队审核。我们正在调查详情并会尽快提供更新。你可以在时间线标签页查看最新状态。';
    } else {
      return '感谢你的消息。我们已收到咨询并会尽快回复。如有补充证据或信息，请通过证据标签页上传。';
    }
  };

  const handleRefresh = () => {
    setLastRefreshedAt(new Date().toISOString());
    message.success('消息已刷新');
  };

  return (
    <Card
      title={
        <Space>
          <MessageOutlined />
          <span>消息线程</span>
          <Tag color="blue">{messages.length} 条消息</Tag>
        </Space>
      }
      extra={
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          刷新
        </Button>
      }
    >
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        最近刷新：{formatDate(lastRefreshedAt)} · 消息会自动保存
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
          <Empty description="暂无消息" />
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
                      <Text>{translateText(msg.content)}</Text>
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
            placeholder="在此输入消息...（最多 1000 个字符）"
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
            发送
          </Button>
        </Space.Compact>
      ) : (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          此争议案件已解决，消息功能已停用。
        </Text>
      )}

      {canSendMessage && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
          按 Ctrl+Enter（Mac 为 Cmd+Enter）发送
        </Text>
      )}
    </Card>
  );
};
