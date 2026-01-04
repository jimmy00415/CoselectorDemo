import React from 'react';
import { Card, Statistic, Tooltip } from 'antd';
import type { StatisticProps } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';

export interface KPICardProps extends Omit<StatisticProps, 'title'> {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  loading?: boolean;
  className?: string;
}

/**
 * KPICard Component
 * 
 * A clickable card for displaying key performance indicators with:
 * - Main value display
 * - Change indicator (increase/decrease)
 * - Tooltip for additional info
 * - Click handler for drilldown
 * 
 * Meets PRD requirements:
 * - KPI cards that are clickable
 * - Routes to filtered table view on click
 * - Visual change indicators
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'increase',
  prefix,
  suffix,
  onClick,
  tooltip,
  loading = false,
  className = '',
  ...statisticProps
}) => {
  const renderTitle = () => (
    <div className="kpi-card-title-wrapper">
      <span>{title}</span>
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined style={{ marginLeft: 8, color: '#8c8c8c' }} />
        </Tooltip>
      )}
    </div>
  );

  const renderChange = () => {
    if (change === undefined || change === null) return null;

    const isPositive = change >= 0;
    const icon = isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    const colorClass = changeType === 'increase' 
      ? (isPositive ? 'increase' : 'decrease')
      : (isPositive ? 'decrease' : 'increase');

    return (
      <div className={`kpi-card-change ${colorClass}`}>
        {icon}
        <span style={{ marginLeft: 4 }}>
          {Math.abs(change).toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <Card
      className={`kpi-card ${onClick ? 'kpi-card-clickable' : ''} ${className}`}
      onClick={onClick}
      hoverable={!!onClick}
      loading={loading}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${title}: ${value}${change ? `, change ${change}%` : ''}`}
    >
      <Statistic
        title={renderTitle()}
        value={value}
        prefix={prefix}
        suffix={suffix}
        {...statisticProps}
      />
      {renderChange()}
    </Card>
  );
};

// CSS already included in global.css
