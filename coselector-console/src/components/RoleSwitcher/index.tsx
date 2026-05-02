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
    label: '协同遴选者',
    icon: <UserOutlined />,
    description: '默认角色，可使用协同遴选者功能',
    color: '#1890ff',
  },
  {
    value: UserRole.OPS_BD,
    label: '运营/BD',
    icon: <TeamOutlined />,
    description: '内部角色，用于线索审核和运营管理',
    color: '#52c41a',
  },
  {
    value: UserRole.FINANCE,
    label: '财务',
    icon: <DollarOutlined />,
    description: '内部角色，用于提现审批和财务操作',
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
      title: '切换角色？',
      content: (
        <Space direction="vertical" size="middle">
          <Text>你将切换到另一个角色，权限和可用功能会随之变化。</Text>
          <Alert
            message="原型功能"
            description="此角色切换器仅用于开发和测试。生产环境中的角色由系统分配。"
            type="info"
            showIcon
          />
        </Space>
      ),
      icon: <ExperimentOutlined />,
      okText: '切换角色',
      cancelText: '取消',
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
