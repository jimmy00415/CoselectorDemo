import React, { useState } from 'react';
import { Card, Button, Modal, Input, Space, Typography, Alert, message } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { DisputeCase } from '../../types';
import { DisputeStatus } from '../../types/enums';
import { formatDate } from '../../utils/format';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface ResolutionWorkflowProps {
  disputeCase: DisputeCase;
  onAcceptResolution: () => void;
  onAppealResolution: (reason: string) => void;
}

export const ResolutionWorkflow: React.FC<ResolutionWorkflowProps> = ({
  disputeCase,
  onAcceptResolution,
  onAppealResolution,
}) => {
  const [appealModalVisible, setAppealModalVisible] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate days until auto-close (7 days after resolution)
  const getDaysUntilAutoClose = (): number => {
    if (!disputeCase.resolvedAt) return 999;
    const resolvedDate = new Date(disputeCase.resolvedAt);
    const autoCloseDate = new Date(resolvedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = autoCloseDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysUntilAutoClose = getDaysUntilAutoClose();

  const handleAccept = () => {
    Modal.confirm({
      title: 'Accept Resolution',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            <strong>You are about to accept the resolution for this dispute.</strong>
          </p>
          <p>
            Once accepted, this action is <strong>final and irreversible</strong>. You will not be able to appeal or reopen this case.
          </p>
          <p>Are you sure you want to proceed?</p>
        </div>
      ),
      okText: 'Yes, Accept Resolution',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: () => {
        onAcceptResolution();
        message.success('Resolution accepted. Case is now closed.');
      },
    });
  };

  const handleAppealSubmit = async () => {
    if (appealReason.trim().length < 100) {
      message.error('Appeal reason must be at least 100 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      onAppealResolution(appealReason);
      message.success('Appeal submitted successfully. Our team will review your case.');
      setAppealModalVisible(false);
      setAppealReason('');
    } catch (error) {
      message.error('Failed to submit appeal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show if not resolved
  if (disputeCase.status !== DisputeStatus.RESOLVED) {
    return null;
  }

  // Don't show if already accepted/appealed (case closed or appeal pending)
  if (disputeCase.resolutionStatus && ['ACCEPTED', 'APPEAL_PENDING'].includes(disputeCase.resolutionStatus)) {
    return (
      <Card>
        <Alert
          type="info"
          message={
            disputeCase.resolutionStatus === 'ACCEPTED'
              ? 'Case Closed'
              : 'Appeal Pending'
          }
          description={
            disputeCase.resolutionStatus === 'ACCEPTED'
              ? 'You have accepted the resolution. This case is now closed and cannot be reopened.'
              : 'Your appeal has been submitted and is under review by our operations team. We will notify you once a decision is made.'
          }
          showIcon
        />
      </Card>
    );
  }

  // Show resolution decision UI
  return (
    <Card
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
          <span>Resolution Decision Required</span>
        </Space>
      }
    >
      <Alert
        type="warning"
        message="Action Required"
        description={
          <div>
            <p>
              This dispute has been resolved. Please review the resolution details in the timeline and decide whether to accept or appeal.
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>Auto-close in {daysUntilAutoClose} day{daysUntilAutoClose !== 1 ? 's' : ''}:</strong> If no action is taken, this case will automatically close and the resolution will be considered accepted.
            </p>
          </div>
        }
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ padding: '16px 0' }}>
        <Title level={5}>Resolution Summary</Title>
        <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <Text>
            {disputeCase.resolution || 'Please review the timeline for detailed resolution information.'}
          </Text>
        </div>

        <Text type="secondary" style={{ fontSize: 12 }}>
          Resolved on: {disputeCase.resolvedAt ? formatDate(disputeCase.resolvedAt) : 'N/A'}
        </Text>
      </div>

      <Space size="large" style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleAccept}
        >
          Accept Resolution
        </Button>
        <Button
          danger
          size="large"
          icon={<CloseCircleOutlined />}
          onClick={() => setAppealModalVisible(true)}
        >
          Appeal Decision
        </Button>
      </Space>

      <Modal
        title="Appeal Resolution"
        open={appealModalVisible}
        onOk={handleAppealSubmit}
        onCancel={() => {
          setAppealModalVisible(false);
          setAppealReason('');
        }}
        okText="Submit Appeal"
        okButtonProps={{ disabled: appealReason.trim().length < 100, loading: isSubmitting }}
        width={600}
      >
        <Alert
          type="info"
          message="Appeal Guidelines"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>Clearly explain why you disagree with the resolution</li>
              <li>Provide any additional evidence or context</li>
              <li>Appeals are reviewed by senior operations team members</li>
              <li>Appeal review may take 3-5 business days</li>
            </ul>
          }
          showIcon
          style={{ marginBottom: 16 }}
        />

        <TextArea
          value={appealReason}
          onChange={(e) => setAppealReason(e.target.value)}
          placeholder="Explain why you are appealing this resolution... (minimum 100 characters)"
          rows={6}
          maxLength={1000}
          showCount
        />

        {appealReason.trim().length > 0 && appealReason.trim().length < 100 && (
          <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            Please provide at least {100 - appealReason.trim().length} more characters
          </Text>
        )}
      </Modal>
    </Card>
  );
};
