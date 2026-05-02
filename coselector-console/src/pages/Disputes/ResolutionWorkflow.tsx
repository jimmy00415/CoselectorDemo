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
      title: '接受处理结果',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            <strong>你将接受此争议的处理结果。</strong>
          </p>
          <p>
            一旦接受，此操作将<strong>最终生效且不可撤销</strong>。你将无法申诉或重新打开此案件。
          </p>
          <p>确定要继续吗？</p>
        </div>
      ),
      okText: '确认接受处理结果',
      okType: 'primary',
      cancelText: '取消',
      onOk: () => {
        onAcceptResolution();
        message.success('已接受处理结果，案件已关闭。');
      },
    });
  };

  const handleAppealSubmit = async () => {
    if (appealReason.trim().length < 100) {
      message.error('申诉原因至少需要 100 个字符');
      return;
    }

    setIsSubmitting(true);

    try {
      onAppealResolution(appealReason);
      message.success('申诉提交成功。我们的团队将重新审核你的案件。');
      setAppealModalVisible(false);
      setAppealReason('');
    } catch (error) {
      message.error('申诉提交失败，请重试。');
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
              ? '案件已关闭'
              : '申诉待处理'
          }
          description={
            disputeCase.resolutionStatus === 'ACCEPTED'
              ? '你已接受处理结果。此案件现已关闭，无法重新打开。'
              : '你的申诉已提交，运营团队正在审核。做出决定后我们会通知你。'
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
          <span>需要确认处理结果</span>
        </Space>
      }
    >
      <Alert
        type="warning"
        message="需要操作"
        description={
          <div>
            <p>
              此争议已解决。请在时间线中查看处理详情，并决定接受或申诉。
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>{daysUntilAutoClose} 天后自动关闭：</strong>如果未采取操作，此案件将自动关闭，处理结果将视为已接受。
            </p>
          </div>
        }
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ padding: '16px 0' }}>
        <Title level={5}>处理结果摘要</Title>
        <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <Text>
            {disputeCase.resolution || '请查看时间线了解详细处理信息。'}
          </Text>
        </div>

        <Text type="secondary" style={{ fontSize: 12 }}>
          解决时间：{disputeCase.resolvedAt ? formatDate(disputeCase.resolvedAt) : '不适用'}
        </Text>
      </div>

      <Space size="large" style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleAccept}
        >
          接受处理结果
        </Button>
        <Button
          danger
          size="large"
          icon={<CloseCircleOutlined />}
          onClick={() => setAppealModalVisible(true)}
        >
          申诉决定
        </Button>
      </Space>

      <Modal
        title="申诉处理结果"
        open={appealModalVisible}
        onOk={handleAppealSubmit}
        onCancel={() => {
          setAppealModalVisible(false);
          setAppealReason('');
        }}
        okText="提交申诉"
        okButtonProps={{ disabled: appealReason.trim().length < 100, loading: isSubmitting }}
        width={600}
      >
        <Alert
          type="info"
          message="申诉指引"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>清楚说明你不同意处理结果的原因</li>
              <li>提供任何补充证据或背景信息</li>
              <li>申诉将由高级运营成员审核</li>
              <li>申诉审核可能需要 3-5 个工作日</li>
            </ul>
          }
          showIcon
          style={{ marginBottom: 16 }}
        />

        <TextArea
          value={appealReason}
          onChange={(e) => setAppealReason(e.target.value)}
          placeholder="说明你为什么申诉此处理结果...（至少 100 个字符）"
          rows={6}
          maxLength={1000}
          showCount
        />

        {appealReason.trim().length > 0 && appealReason.trim().length < 100 && (
          <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            请至少再输入 {100 - appealReason.trim().length} 个字符
          </Text>
        )}
      </Modal>
    </Card>
  );
};
