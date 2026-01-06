import { Card, Alert, Button, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  UploadOutlined 
} from '@ant-design/icons';
import { Lead } from '../../types';
import { LeadStatus } from '../../types/enums';

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
          message: 'Complete and Submit',
          description: 'Your lead is saved as a draft. Complete all required fields and submit for review.',
          action: null,
        };

      case LeadStatus.SUBMITTED:
        return {
          type: 'info' as const,
          icon: <CheckCircleOutlined />,
          message: 'No action needed',
          description: 'Your lead has been submitted and is awaiting review. You will be notified when there are updates.',
          action: null,
        };

      case LeadStatus.UNDER_REVIEW:
        return {
          type: 'info' as const,
          icon: <CheckCircleOutlined />,
          message: 'No action needed',
          description: lead.assignedOwner 
            ? `Your lead is under review. Assigned owner: ${lead.assignedOwner}. You will be notified of any updates.`
            : 'Your lead is under review by the operations team. You will be notified of any updates.',
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
          message: 'Action Required: Upload Requested Documents',
          description: infoRequestEvent?.description || 'Additional information has been requested. Please upload the required documents and update your lead.',
          action: onUploadDocs ? (
            <Button type="primary" icon={<UploadOutlined />} onClick={onUploadDocs}>
              Upload Documents
            </Button>
          ) : null,
        };

      case LeadStatus.APPROVED:
        return {
          type: 'success' as const,
          icon: <CheckCircleOutlined />,
          message: 'Lead Approved',
          description: 'Congratulations! Your lead has been approved. The operations team will contact you with next steps.',
          action: null,
        };

      case LeadStatus.REJECTED:
        // Extract rejection reason from timeline
        const rejectEvent = [...lead.timeline]
          .reverse()
          .find(e => e.eventType.includes('REJECTED'));
        const rejectionReason = rejectEvent?.reasonCode 
          ? `Reason: ${rejectEvent.reasonCode.replace(/_/g, ' ')}`
          : '';

        return {
          type: 'error' as const,
          icon: <CloseCircleOutlined />,
          message: 'Lead Rejected',
          description: `Your lead was not approved. ${rejectionReason}. You can review the feedback in the timeline and resubmit with updated information.`,
          action: onResubmit ? (
            <Button type="primary" danger onClick={onResubmit}>
              Resubmit Lead
            </Button>
          ) : null,
        };

      case LeadStatus.RESUBMITTED:
        return {
          type: 'info' as const,
          icon: <CheckCircleOutlined />,
          message: 'Resubmitted for Review',
          description: 'Your lead has been resubmitted and is awaiting review. You will be notified when there are updates.',
          action: null,
        };

      default:
        return {
          type: 'info' as const,
          icon: <CheckCircleOutlined />,
          message: 'No action needed',
          description: 'Your lead is being processed. You will be notified of any updates.',
          action: null,
        };
    }
  };

  const content = getActionContent();

  return (
    <Card 
      title="Next Best Action" 
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
