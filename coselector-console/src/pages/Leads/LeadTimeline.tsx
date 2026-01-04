import { Timeline as AntTimeline, Card, Typography, Tag, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { TimelineEvent } from '../../types';
import { ActorType } from '../../types/enums';
import { formatDate } from '../../utils';

/**
 * LeadTimeline Component
 * Per PRD §7.4.3: Vertical timeline showing audit trail with actor/timestamp/reason
 * 
 * Displays all state transitions and important events with:
 * - Actor (CO_SELECTOR / OPS_BD / SYSTEM)
 * - Timestamp
 * - Event description
 * - Reason code and notes
 */

const { Title, Text } = Typography;

interface LeadTimelineProps {
  events: TimelineEvent[];
  title?: string;
}

const getActorIcon = (actorType: ActorType) => {
  switch (actorType) {
    case ActorType.CO_SELECTOR:
      return <UserOutlined style={{ color: '#1890ff' }} />;
    case ActorType.OPS_BD:
      return <UserOutlined style={{ color: '#52c41a' }} />;
    case ActorType.SYSTEM:
      return <RobotOutlined style={{ color: '#8c8c8c' }} />;
    case ActorType.ADMIN:
      return <UserOutlined style={{ color: '#f5222d' }} />;
    default:
      return <UserOutlined />;
  }
};

const getActorColor = (actorType: ActorType): string => {
  switch (actorType) {
    case ActorType.CO_SELECTOR:
      return 'blue';
    case ActorType.OPS_BD:
      return 'green';
    case ActorType.SYSTEM:
      return 'default';
    case ActorType.ADMIN:
      return 'red';
    default:
      return 'default';
  }
};

const getEventIcon = (eventType: string) => {
  if (eventType.includes('Approved')) {
    return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
  }
  if (eventType.includes('Rejected')) {
    return <CloseCircleOutlined style={{ color: '#f5222d', fontSize: 16 }} />;
  }
  if (eventType.includes('Info Requested') || eventType.includes('INFO_REQUESTED')) {
    return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />;
  }
  return <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />;
};

export const LeadTimeline: React.FC<LeadTimelineProps> = ({ 
  events, 
  title = 'Timeline & Audit Trail' 
}) => {
  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  if (events.length === 0) {
    return (
      <Card>
        <Title level={4}>{title}</Title>
        <Text type="secondary">No timeline events yet</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4}>{title}</Title>
      <AntTimeline
        mode="left"
        style={{ marginTop: 24 }}
        items={sortedEvents.map((event) => ({
          dot: getEventIcon(event.eventType),
          children: (
            <div style={{ paddingBottom: 16 }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                {/* Event Type & Timestamp */}
                <Space>
                  <Text strong>{event.eventType}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(event.occurredAt)}
                  </Text>
                </Space>

                {/* Actor Information */}
                <Space>
                  {getActorIcon(event.actorType)}
                  <Tag color={getActorColor(event.actorType)}>
                    {event.actorType}
                  </Tag>
                  <Text type="secondary">{event.actorName}</Text>
                </Space>

                {/* Event Description */}
                <Text>{event.description}</Text>

                {/* Reason Code (if present) */}
                {event.reasonCode && (
                  <Tag color="orange" style={{ marginTop: 4 }}>
                    Reason: {event.reasonCode}
                  </Tag>
                )}

                {/* Additional Metadata */}
                {event.metadata?.reasonNote && (
                  <Card 
                    size="small" 
                    style={{ 
                      backgroundColor: '#f5f5f5', 
                      marginTop: 8,
                      borderLeft: '3px solid #1890ff' 
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Note: {event.metadata.reasonNote}
                    </Text>
                  </Card>
                )}

                {/* Status Transition Details */}
                {event.metadata?.previousStatus && event.metadata?.newStatus && (
                  <Space size={4} style={{ marginTop: 4 }}>
                    <Tag color="default">{event.metadata.previousStatus}</Tag>
                    <Text type="secondary">→</Text>
                    <Tag color="blue">{event.metadata.newStatus}</Tag>
                  </Space>
                )}
              </Space>
            </div>
          ),
        }))}
      />
    </Card>
  );
};
