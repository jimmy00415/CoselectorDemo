import React from 'react';
import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import {
  DashboardOutlined,
  ToolOutlined,
  LineChartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useAuth, ViewPreset } from '../../contexts/AuthContext';
import './styles.css';

const VIEW_PRESET_OPTIONS = [
  {
    value: ViewPreset.OWNER,
    label: 'Owner',
    icon: <DashboardOutlined />,
    description: 'Asset ownership & performance',
  },
  {
    value: ViewPreset.OPERATOR,
    label: 'Operator',
    icon: <ToolOutlined />,
    description: 'Operations & conversions',
  },
  {
    value: ViewPreset.ANALYST,
    label: 'Analyst',
    icon: <LineChartOutlined />,
    description: 'Analytics & trends',
  },
  {
    value: ViewPreset.FINANCE,
    label: 'Finance',
    icon: <DollarOutlined />,
    description: 'Financial flows & payouts',
  },
];

interface ViewPresetSwitcherProps {
  size?: 'small' | 'middle' | 'large';
  buttonStyle?: 'outline' | 'solid';
  className?: string;
}

/**
 * View Preset Switcher Component
 * 
 * Allows users to switch between different UI lenses (Owner/Operator/Analyst/Finance)
 * This is a UI-only filter and does NOT affect permissions
 * 
 * According to PRD §5.2:
 * "View Preset Switcher: Owner / Operator / Analyst / Finance (UI lens only; not permission)"
 */
export const ViewPresetSwitcher: React.FC<ViewPresetSwitcherProps> = ({
  size = 'middle',
  buttonStyle = 'outline',
  className = '',
}) => {
  const { viewPreset, setViewPreset } = useAuth();

  const handleChange = (e: RadioChangeEvent) => {
    setViewPreset(e.target.value as ViewPreset);
  };

  return (
    <div className={`view-preset-switcher ${className}`}>
      <Radio.Group
        value={viewPreset}
        onChange={handleChange}
        size={size}
        buttonStyle={buttonStyle}
        className="view-preset-radio-group"
      >
        {VIEW_PRESET_OPTIONS.map(option => (
          <Radio.Button
            key={option.value}
            value={option.value}
            className="view-preset-button"
            title={option.description}
          >
            <span className="view-preset-icon">{option.icon}</span>
            <span className="view-preset-label">{option.label}</span>
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
};

export default ViewPresetSwitcher;
