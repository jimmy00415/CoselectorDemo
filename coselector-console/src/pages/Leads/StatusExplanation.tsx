import { Card, Space, Tag, Typography } from 'antd';
import { LeadStatus } from '../../types/enums';

/**
 * StatusExplanation Component
 * Per Sprint 1 §7.3 Q1: "What is the current status?"
 * 
 * Shows status chip + short explanation:
 * - Submitted: "Waiting for review"
 * - Under Review: "Assigned to Ops/BD"
 * - Info Requested: "More information needed"
 * - Approved/Rejected: "Decision made"
 */

const { Text } = Typography;

interface StatusExplanationProps {
  status: LeadStatus;
  assignedOwner?: string;
}

export const StatusExplanation: React.FC<StatusExplanationProps> = ({
  status,
  assignedOwner,
}) => {
  const statusColors: Record<LeadStatus, string> = {
    [LeadStatus.DRAFT]: 'default',
    [LeadStatus.SUBMITTED]: 'blue',
    [LeadStatus.UNDER_REVIEW]: 'orange',
    [LeadStatus.INFO_REQUESTED]: 'purple',
    [LeadStatus.APPROVED]: 'green',
    [LeadStatus.REJECTED]: 'red',
    [LeadStatus.RESUBMITTED]: 'cyan',
  };

  const getExplanation = (): string => {
    switch (status) {
      case LeadStatus.DRAFT:
        return 'This lead is saved as a draft and has not been submitted yet.';
      case LeadStatus.SUBMITTED:
        return 'Waiting for review by the operations team.';
      case LeadStatus.UNDER_REVIEW:
        return assignedOwner 
          ? `Assigned to Ops/BD (${assignedOwner}) for detailed review.`
          : 'Assigned to Ops/BD for detailed review.';
      case LeadStatus.INFO_REQUESTED:
        return 'More information needed. Please upload requested documents.';
      case LeadStatus.APPROVED:
        return 'Decision made: Lead has been approved. Onboarding process will begin.';
      case LeadStatus.REJECTED:
        return 'Decision made: Lead was not approved. Review timeline for details.';
      case LeadStatus.RESUBMITTED:
        return 'Lead has been resubmitted for review after addressing previous feedback.';
      default:
        return 'Status information not available.';
    }
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space>
          <Text strong>Current Status:</Text>
          <Tag color={statusColors[status]} style={{ fontSize: 14 }}>
            {status.replace(/_/g, ' ')}
          </Tag>
        </Space>
        <Text type="secondary">{getExplanation()}</Text>
      </Space>
    </Card>
  );
};
