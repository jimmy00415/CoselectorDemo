import React from 'react';
import { Timeline as AntTimeline, Tag, Typography, Space } from 'antd';
import type { TimelineItemProps } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TimelineEvent } from '../../types';
import { ActorType } from '../../types/enums';

dayjs.extend(relativeTime);

const { Text } = Typography;

export interface TimelineComponentProps {
  events: TimelineEvent[];
  mode?: 'left' | 'alternate' | 'right';
  pending?: React.ReactNode;
  reverse?: boolean;
  showRelativeTime?: boolean;
  emptyText?: string;
}

/**
 * Timeline Component
 * 
 * A vertical timeline for displaying audit trails with:
 * - Actor information (who)
 * - Timestamp (when)
 * - Event description (what)
 * - Reason code (why)
 * - Visual indicators for different event types
 * 
 * Meets PRD requirements:
 * - Timeline component for auditability
 * - Status changes, notes, system events
 * - "who/when/why" for every change
 * - Clear visual hierarchy
 */
export const Timeline: React.FC<TimelineComponentProps> = ({
  events,
  mode = 'left',
  pending,
  reverse = false,
  showRelativeTime = true,
  emptyText = 'No timeline events',
}) => {
  // Get icon based on actor type
  const getActorIcon = (actorType: ActorType) => {
    switch (actorType) {
      case ActorType.CO_SELECTOR:
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case ActorType.OPS:
        return <UserOutlined style={{ color: '#52c41a' }} />;
      case ActorType.FINANCE:
        return <UserOutlined style={{ color: '#faad14' }} />;
      case ActorType.SYSTEM:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
      default:
        return <UserOutlined />;
    }
  };

  // Get color based on event type
  const getEventColor = (eventType: string): string => {
    const lowerType = eventType.toLowerCase();
    
    if (lowerType.includes('approved') || lowerType.includes('success') || lowerType.includes('completed')) {
      return 'green';
    }
    if (lowerType.includes('rejected') || lowerType.includes('failed') || lowerType.includes('error')) {
      return 'red';
    }
    if (lowerType.includes('pending') || lowerType.includes('waiting') || lowerType.includes('review')) {
      return 'blue';
    }
    if (lowerType.includes('warning') || lowerType.includes('info_requested')) {
      return 'orange';
    }
    
    return 'gray';
  };

  // Get status icon based on event type
  const getStatusIcon = (eventType: string) => {
    const lowerType = eventType.toLowerCase();
    
    if (lowerType.includes('approved') || lowerType.includes('success') || lowerType.includes('completed')) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
    if (lowerType.includes('rejected') || lowerType.includes('failed') || lowerType.includes('error')) {
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
    if (lowerType.includes('warning') || lowerType.includes('info_requested')) {
      return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    }
    
    return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = dayjs(timestamp);
    const absolute = date.format('YYYY-MM-DD HH:mm:ss');
    const relative = date.fromNow();
    
    return showRelativeTime ? (
      <span title={absolute}>{relative}</span>
    ) : (
      absolute
    );
  };

  // Render actor tag
  const renderActorTag = (actorType: ActorType, actorName: string) => {
    const colors: Record<ActorType, string> = {
      [ActorType.CO_SELECTOR]: 'blue',
      [ActorType.OPS]: 'green',
      [ActorType.OPS_BD]: 'cyan',
      [ActorType.FINANCE]: 'orange',
      [ActorType.SYSTEM]: 'default',
      [ActorType.ADMIN]: 'red',
    };

    return (
      <Tag color={colors[actorType]} icon={getActorIcon(actorType)}>
        {actorName}
      </Tag>
    );
  };

  // Render reason code if exists
  const renderReasonCode = (reasonCode?: string) => {
    if (!reasonCode) return null;
    
    return (
      <Tag color="default" style={{ marginLeft: 8 }}>
        {reasonCode}
      </Tag>
    );
  };

  // Convert timeline events to Ant Design timeline items
  const timelineItems: TimelineItemProps[] = events.map((event) => ({
    key: event.id,
    color: getEventColor(event.eventType),
    dot: getStatusIcon(event.eventType),
    children: (
      <div className="timeline-item-content">
        <div className="timeline-item-header">
          <Space size="small" wrap>
            {renderActorTag(event.actorType, event.actorName)}
            <Text className="timeline-timestamp" type="secondary">
              {formatTimestamp(event.occurredAt)}
            </Text>
          </Space>
        </div>
        <div className="timeline-item-body">
          <Text strong>{event.eventType}</Text>
          <Text className="timeline-item-description">{event.description}</Text>
          {renderReasonCode(event.reasonCode)}
        </div>
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="timeline-item-metadata">
            {Object.entries(event.metadata).map(([key, value]) => (
              <Text key={key} type="secondary" style={{ fontSize: 12 }}>
                {key}: {String(value)}
              </Text>
            ))}
          </div>
        )}
      </div>
    ),
  }));

  if (events.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '40px 20px' }}>
        <Text type="secondary">{emptyText}</Text>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <AntTimeline
        mode={mode}
        pending={pending}
        reverse={reverse}
        items={timelineItems}
      />
    </div>
  );
};

// CSS for the timeline (to be added to global.css)
export const timelineStyles = `
.timeline-container {
  padding: var(--spacing-md);
}

.timeline-item-content {
  padding-bottom: var(--spacing-md);
}

.timeline-item-header {
  margin-bottom: var(--spacing-xs);
}

.timeline-timestamp {
  font-size: 12px;
}

.timeline-item-body {
  margin-top: var(--spacing-xs);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.timeline-item-description {
  color: var(--text-secondary);
  line-height: 1.5;
}

.timeline-item-metadata {
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  border-top: 1px dashed var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Ensure proper spacing in timeline */
.ant-timeline-item {
  padding-bottom: var(--spacing-md);
}

.ant-timeline-item:last-child {
  padding-bottom: 0;
}
`;
