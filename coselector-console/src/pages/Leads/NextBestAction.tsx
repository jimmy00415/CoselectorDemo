import { Card, Alert, Button, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  UploadOutlined 
} from '@ant-design/icons';
import { Lead } from '../../types';
import { LeadStatus } from '../../types/enums';
import { translateReasonCode, translateText } from '../../utils';

/**
 * NextBestAction Component
 * Per Sprint 1 §7.3 Q3: "What should I do next?"
 * 
 * Rule-based text with CTAs based on lead status:
 * - Submitted: "No action needed. You will be notified."
 * - Under Review: "No action needed. Owner assigned: X."
 * - Info Requested: "Upload requested documents" + CTA jump to attachments
 * - Rejected: show reason category + CTA "Resubmit" (creates new revision draft)
 * - Approved: "Lead approved. Next steps will be communicated."
 */

interface NextBestActionProps {
  lead: Lead;
  onResubmit?: () => void;
  onUploadDocs?: () => void;
}

export const NextBestAction: React.FC<NextBestActionProps> = ({
  lead,
  onResubmit,
  onUploadDocs,
}) => {
  const getActionContent = () => {
    switch (lead.status) {
      case LeadStatus.DRAFT:
        return {
          type: 'info' as const,
          icon: <ExclamationCircleOutlined />,
          message: '补全并提交',
          description: '此线索已保存为草稿。请补全所有必填字段并提交审核。',
          action: null,
        };

      case LeadStatus.SUBMITTED:
        return {
          type: 'info' as const,
          icon: <CheckCircleOutlined />,
          message: '暂无需操作',
          description: '线索已提交，正在等待审核。有更新时你会收到通知。',
          action: null,
        };

      case LeadStatus.UNDER_REVIEW:
        return {
          type: 'info' as const,
          icon: <CheckCircleOutlined />,
          message: '暂无需操作',
          description: lead.assignedOwner 
            ? `线索正在审核中。分配负责人：${lead.assignedOwner}。有更新时你会收到通知。`
            : '线索正在由运营团队审核。有更新时你会收到通知。',
          action: null,
        };

      case LeadStatus.INFO_REQUESTED:
        // Extract most recent INFO_REQUESTED event for specific requirements
        const infoRequestEvent = [...lead.timeline]
          .reverse()
          .find(e => e.eventType.includes('INFO_REQUESTED'));
        
        return {
          type: 'warning' as const,
          icon: <ExclamationCircleOutlined />,
          message: '需要操作：上传所需材料',
          description: translateText(infoRequestEvent?.description) || '需要补充信息。请上传所需材料并更新线索。',
          action: onUploadDocs ? (
            <Button type="primary" icon={<UploadOutlined />} onClick={onUploadDocs}>
              上传材料
            </Button>
          ) : null,
        };

      case LeadStatus.APPROVED:
        return {
          type: 'success' as const,
          icon: <CheckCircleOutlined />,
          message: '线索已通过',
          description: '恭喜！你的线索已通过审核。运营团队会与你沟通后续步骤。',
          action: null,
        };

      case LeadStatus.REJECTED:
        // Extract rejection reason from timeline
        const rejectEvent = [...lead.timeline]
          .reverse()
          .find(e => e.eventType.includes('REJECTED'));
        const rejectionReason = rejectEvent?.reasonCode 
          ? `原因：${translateReasonCode(rejectEvent.reasonCode)}`
          : '';

        return {
          type: 'error' as const,
          icon: <CloseCircleOutlined />,
          message: '线索已拒绝',
          description: `你的线索未通过审核。${rejectionReason}。你可以在时间线中查看反馈，并更新信息后重新提交。`,
          action: onResubmit ? (
            <Button type="primary" danger onClick={onResubmit}>
              重新提交线索
            </Button>
          ) : null,
        };

      case LeadStatus.RESUBMITTED:
        return {
          type: 'info' as const,
          icon: <CheckCircleOutlined />,
          message: '已重新提交审核',
          description: '你的线索已重新提交，正在等待审核。有更新时你会收到通知。',
          action: null,
        };

      default:
        return {
          type: 'info' as const,
          icon: <CheckCircleOutlined />,
          message: '暂无需操作',
          description: '线索正在处理中。有更新时你会收到通知。',
          action: null,
        };
    }
  };

  const content = getActionContent();

  return (
    <Card 
      title="下一步建议" 
      style={{ marginBottom: 24 }}
      styles={{ body: { padding: 0 } }}
    >
      <Alert
        type={content.type}
        icon={content.icon}
        message={content.message}
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            {content.description}
            {content.action && <div style={{ marginTop: 8 }}>{content.action}</div>}
          </Space>
        }
        showIcon
        style={{ border: 'none', borderRadius: 0 }}
      />
    </Card>
  );
};
