import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Tag, Space, Typography, Empty } from 'antd';
import {
  SearchOutlined,
  LinkOutlined,
  FileTextOutlined,
  TeamOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FEATURE_FLAGS } from '../constants';
import './GlobalSearch.css';

const { Text } = Typography;

interface SearchResult {
  id: string;
  type: 'asset' | 'content' | 'lead' | 'transaction' | 'payout';
  title: string;
  description: string;
  url: string;
}

interface GlobalSearchProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Global Search Component
 * 
 * Per PRD §5.2:
 * "Global Search: searches across asset_id, content_id, order_ref, lead_id, payout_id"
 */
const GlobalSearch: React.FC<GlobalSearchProps> = ({ visible, onClose }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }

    // Simulate search with delay
    setLoading(true);
    const timer = setTimeout(() => {
      performSearch(searchText);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!visible) {
          onClose(); // This will trigger parent to open
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  const performSearch = (query: string) => {
    // In prototype, this would call the mock API
    // For now, return mock results
    const mockResults = [
      {
        id: 'asset_001',
        type: 'asset' as const,
        title: '短链接 #001',
        description: '活动 A 的启用链接',
        url: '/assets/asset_001',
      },
      {
        id: 'content_123',
        type: 'content' as const,
        title: '抖音视频 - 产品演示',
        description: '1 万次观看，500 次转化',
        url: '/content/content_123',
      },
      ...(FEATURE_FLAGS.CO_SELECTION ? [{
        id: 'lead_456',
        type: 'lead' as const,
        title: '连锁餐饮线索',
        description: '审核中 - 上海',
        url: '/leads/lead_456',
      }] : []),
      {
        id: 'tx_789',
        type: 'transaction' as const,
        title: '交易 #789',
        description: '¥150.00 - 可提现',
        url: '/earnings/tx_789',
      },
      {
        id: 'payout_012',
        type: 'payout' as const,
        title: '提现申请 #012',
        description: '¥5,000.00 - 已通过',
        url: '/payouts/payout_012',
      },
    ].filter(item =>
      item.id.toLowerCase().includes(query.toLowerCase()) ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    setResults(mockResults);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <LinkOutlined />;
      case 'content':
        return <FileTextOutlined />;
      case 'lead':
        return <TeamOutlined />;
      case 'transaction':
        return <DollarOutlined />;
      case 'payout':
        return <ShoppingOutlined />;
      default:
        return <SearchOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'blue';
      case 'content':
        return 'green';
      case 'lead':
        return 'orange';
      case 'transaction':
        return 'purple';
      case 'payout':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    const labels: Record<SearchResult['type'], string> = {
      asset: '资产',
      content: '内容',
      lead: '线索',
      transaction: '交易',
      payout: '提现',
    };
    return labels[type];
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onClose();
    setSearchText('');
  };

  return (
    <Modal
      title={
        <Space>
          <SearchOutlined />
          <span>全局搜索</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="global-search-modal"
    >
      <Input
        size="large"
        placeholder="搜索商品链接、内容、交易、提现..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        autoFocus
        className="global-search-input"
      />

      <div className="search-results">
        {searchText && (
          <List
            loading={loading}
            dataSource={results}
            locale={{
              emptyText: (
                <Empty
                  description="未找到结果"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            renderItem={(item) => (
              <List.Item
                className="search-result-item"
                onClick={() => handleResultClick(item)}
              >
                <List.Item.Meta
                  avatar={getIcon(item.type)}
                  title={
                    <Space>
                      <Text strong>{item.title}</Text>
                      <Tag color={getTypeColor(item.type)}>{getTypeLabel(item.type)}</Tag>
                    </Space>
                  }
                  description={
                    <Space orientation="vertical" size={0}>
                      <Text type="secondary">{item.description}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ID: {item.id}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {!searchText && (
          <div className="search-tips">
            <Text type="secondary">
              可按以下内容搜索：
              <ul>
                <li>商品链接 / 订单链接 ID（例如 link_001）</li>
                <li>内容 ID（例如 content_123）</li>
                <li>交易 ID（例如 tx_789）</li>
                <li>提现 ID（例如 payout_012）</li>
              </ul>
            </Text>
          </div>
        )}
      </div>

      <div className="search-footer">
        <Text type="secondary" style={{ fontSize: 12 }}>
          在任意位置按 <kbd>Ctrl</kbd> + <kbd>K</kbd> 打开搜索
        </Text>
      </div>
    </Modal>
  );
};

export default GlobalSearch;
