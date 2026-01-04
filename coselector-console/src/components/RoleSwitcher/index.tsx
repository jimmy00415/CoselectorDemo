import React from 'react';
import { Select, Space, Typography, Badge, Modal, Alert } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { UserRole } from '../../types/enums';
import { useAuth } from '../../contexts/AuthContext';
import './styles.css';

const { Text } = Typography;

const ROLE_OPTIONS = [
  {
    value: UserRole.CO_SELECTOR,
    label: 'Co-Selector',
    icon: <UserOutlined />,
    description: 'Default role with full access to co-selector features',
    color: '#1890ff',
  },
  {
    value: UserRole.OPS_BD,
    label: 'Operations BD',
    icon: <TeamOutlined />,
    description: 'Internal role for lead review and operational management',
    color: '#52c41a',
  },
  {
    value: UserRole.FINANCE,
    label: 'Finance',
    icon: <DollarOutlined />,
    description: 'Internal role for payout approval and financial operations',
    color: '#faad14',
  },
];

/**
 * RoleSwitcher Component (Prototype/Dev Only)
 * 
 * Allows switching between different roles for testing permission behaviors
 * This should be gated behind a "Dev Tools" toggle in production
 * 
 * According to PRD §4.2:
 * "Simulate Ops Update control (prototype-only, gated behind a 'Dev Tools' toggle)"
 */
export const RoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuth();


  const currentRoleOption = ROLE_OPTIONS.find(opt => opt.value === role);

  const handleRoleChange = (newRole: UserRole) => {
    Modal.confirm({
      title: 'Switch Role?',
      content: (
        <Space direction="vertical" size="middle">
          <Text>You are about to switch to a different role. This will change your permissions and available features.</Text>
          <Alert
            message="Prototype Feature"
            description="This role switcher is for development and testing purposes only. In production, roles are assigned by the system."
            type="info"
            showIcon
          />
        </Space>
      ),
      icon: <ExperimentOutlined />,
      okText: 'Switch Role',
      cancelText: 'Cancel',
      onOk: () => {
        switchRole(newRole);
      },
    });
  };

  return (
    <div className="role-switcher">
      <Badge
        count={
          <ExperimentOutlined
            style={{
              color: '#722ed1',
              fontSize: 12,
            }}
          />
        }
        offset={[-4, 4]}
      >
        <Select
          value={role}
          onChange={handleRoleChange}
          style={{ width: 180 }}
          className="role-switcher-select"
          popupClassName="role-switcher-dropdown"
        >
          {ROLE_OPTIONS.map(option => (
            <Select.Option key={option.value} value={option.value}>
              <Space>
                <span style={{ color: option.color }}>{option.icon}</span>
                <span>{option.label}</span>
              </Space>
            </Select.Option>
          ))}
        </Select>
      </Badge>

      <div className="role-switcher-info">
        <Text type="secondary" style={{ fontSize: 12 }}>
          {currentRoleOption?.description}
        </Text>
      </div>
    </div>
  );
};

export default RoleSwitcher;
