import { Card, Space, Tag, Typography } from 'antd';
import { LeadStatus } from '../../types/enums';
import { translateStatus } from '../../utils';

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
        return '此线索已保存为草稿，尚未提交。';
      case LeadStatus.SUBMITTED:
        return '正在等待运营团队审核。';
      case LeadStatus.UNDER_REVIEW:
        return assignedOwner 
          ? `已分配给运营/BD（${assignedOwner}）进行详细审核。`
          : '已分配给运营/BD 进行详细审核。';
      case LeadStatus.INFO_REQUESTED:
        return '需要补充更多信息。请上传所需材料。';
      case LeadStatus.APPROVED:
        return '已做出决定：线索已通过，入驻流程将开始。';
      case LeadStatus.REJECTED:
        return '已做出决定：线索未通过。请查看时间线了解详情。';
      case LeadStatus.RESUBMITTED:
        return '线索已根据此前反馈补充后重新提交审核。';
      default:
        return '暂无状态信息。';
    }
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space>
          <Text strong>当前状态：</Text>
          <Tag color={statusColors[status]} style={{ fontSize: 14 }}>
            {translateStatus(status)}
          </Tag>
        </Space>
        <Text type="secondary">{getExplanation()}</Text>
      </Space>
    </Card>
  );
};
