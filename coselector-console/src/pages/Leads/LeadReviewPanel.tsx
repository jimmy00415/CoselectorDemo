import { Card, Button, Select, Input, Space, Typography, Divider, Form, message } from 'antd';
import { 
  UserAddOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Lead } from '../../types';
import { LeadStatus, LeadReviewReason, ActorType } from '../../types/enums';
import { LeadStateMachine } from '../../services/stateMachines';
import { useState } from 'react';

/**
 * LeadReviewPanel Component
 * Per PRD §7.4: OPS-only review actions
 * 
 * OPS_BD can:
 * - Assign owner
 * - Change status (Approve / Reject with reason)
 * - Request additional info with reason
 * 
 * CO_SELECTOR cannot see this panel (permission-based)
 */

const { Title, Text } = Typography;
const { TextArea } = Input;

interface LeadReviewPanelProps {
  lead: Lead;
  currentUserName: string;
  onUpdateLead: (updates: Partial<Lead>) => void;
}

export const LeadReviewPanel: React.FC<LeadReviewPanelProps> = ({
  lead,
  currentUserName,
  onUpdateLead,
}) => {
  const [form] = Form.useForm();
  const [actionType, setActionType] = useState<'assign' | 'approve' | 'reject' | 'requestInfo' | null>(null);
  const [loading, setLoading] = useState(false);

  // Determine which actions are available based on lead status
  const canAssign = true; // OPS can always assign/reassign
  const canApprove = lead.status === LeadStatus.UNDER_REVIEW || lead.status === LeadStatus.RESUBMITTED;
  const canReject = lead.status === LeadStatus.UNDER_REVIEW || lead.status === LeadStatus.RESUBMITTED;
  const canRequestInfo = lead.status === LeadStatus.UNDER_REVIEW;

  const handleAssignOwner = async () => {
    try {
      const values = await form.validateFields(['assignedOwner']);
      setLoading(true);

      // Update lead with new owner
      onUpdateLead({
        assignedOwner: values.assignedOwner,
      });

      message.success('Owner assigned successfully');
      form.resetFields();
      setActionType(null);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus: LeadStatus) => {
    try {
      const values = await form.validateFields(['reasonCode', 'reasonNote']);
      setLoading(true);

      // Validate state transition using state machine
      const result = LeadStateMachine.transition(
        {
          currentStatus: lead.status,
          actorType: ActorType.OPS_BD,
          actorName: currentUserName,
          reasonCode: values.reasonCode,
          reasonNote: values.reasonNote,
        },
        targetStatus
      );

      if (!result.isValid) {
        message.error(result.error || 'Invalid status transition');
        setLoading(false);
        return;
      }

      // Update lead with new status and timeline event
      onUpdateLead({
        status: result.newStatus,
        timeline: [...lead.timeline, result.event],
        lastUpdatedAt: new Date().toISOString(),
      });

      message.success(`Lead ${targetStatus.toLowerCase()} successfully`);
      form.resetFields();
      setActionType(null);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActionForm = () => {
    switch (actionType) {
      case 'assign':
        return (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f5f5f5' }}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="assignedOwner"
                label="Assign to"
                rules={[{ required: true, message: 'Please select an owner' }]}
              >
                <Select placeholder="Select owner">
                  <Select.Option value="Alice Wang">Alice Wang</Select.Option>
                  <Select.Option value="Bob Chen">Bob Chen</Select.Option>
                  <Select.Option value="Carol Li">Carol Li</Select.Option>
                  <Select.Option value="David Zhang">David Zhang</Select.Option>
                </Select>
              </Form.Item>
              <Space>
                <Button type="primary" onClick={handleAssignOwner} loading={loading}>
                  Assign
                </Button>
                <Button onClick={() => setActionType(null)}>Cancel</Button>
              </Space>
            </Form>
          </Card>
        );

      case 'approve':
        return (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f0f9ff', borderLeft: '4px solid #52c41a' }}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="reasonCode"
                label="Approval Reason"
                rules={[{ required: true, message: 'Please select a reason' }]}
              >
                <Select placeholder="Select reason">
                  <Select.Option value={LeadReviewReason.HIGH_VOLUME}>High Volume Potential</Select.Option>
                  <Select.Option value={LeadReviewReason.STRATEGIC_FIT}>Strategic Fit</Select.Option>
                  <Select.Option value={LeadReviewReason.GOOD_REPUTATION}>Good Reputation</Select.Option>
                  <Select.Option value={LeadReviewReason.OTHER}>Other</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reasonNote"
                label="Additional Notes"
              >
                <TextArea rows={3} placeholder="Optional notes..." />
              </Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(LeadStatus.APPROVED)} 
                  loading={loading}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Approve Lead
                </Button>
                <Button onClick={() => setActionType(null)}>Cancel</Button>
              </Space>
            </Form>
          </Card>
        );

      case 'reject':
        return (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#fff2f0', borderLeft: '4px solid #f5222d' }}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="reasonCode"
                label="Rejection Reason"
                rules={[{ required: true, message: 'Please select a reason' }]}
              >
                <Select placeholder="Select reason">
                  <Select.Option value={LeadReviewReason.LOW_VOLUME}>Low Volume</Select.Option>
                  <Select.Option value={LeadReviewReason.POOR_REPUTATION}>Poor Reputation</Select.Option>
                  <Select.Option value={LeadReviewReason.INCOMPLETE_INFO}>Incomplete Information</Select.Option>
                  <Select.Option value={LeadReviewReason.OUT_OF_SCOPE}>Out of Scope</Select.Option>
                  <Select.Option value={LeadReviewReason.OTHER}>Other</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reasonNote"
                label="Detailed Reason"
                rules={[{ required: true, message: 'Please provide detailed reason' }]}
              >
                <TextArea rows={3} placeholder="Explain why this lead is being rejected..." />
              </Form.Item>
              <Space>
                <Button 
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(LeadStatus.REJECTED)} 
                  loading={loading}
                >
                  Reject Lead
                </Button>
                <Button onClick={() => setActionType(null)}>Cancel</Button>
              </Space>
            </Form>
          </Card>
        );

      case 'requestInfo':
        return (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#fffbe6', borderLeft: '4px solid #faad14' }}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="reasonCode"
                label="Information Needed"
                rules={[{ required: true, message: 'Please select what information is needed' }]}
              >
                <Select placeholder="Select required information">
                  <Select.Option value={LeadReviewReason.MISSING_CONTACT}>Missing Contact Information</Select.Option>
                  <Select.Option value={LeadReviewReason.MISSING_DOCS}>Missing Documents</Select.Option>
                  <Select.Option value={LeadReviewReason.UNCLEAR_VOLUME}>Unclear Volume Estimate</Select.Option>
                  <Select.Option value={LeadReviewReason.OTHER}>Other</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reasonNote"
                label="Specific Request"
                rules={[{ required: true, message: 'Please specify what information is needed' }]}
              >
                <TextArea rows={3} placeholder="Describe what additional information is required..." />
              </Form.Item>
              <Space>
                <Button 
                  type="primary"
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => handleStatusChange(LeadStatus.INFO_REQUESTED)} 
                  loading={loading}
                  style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                >
                  Request Information
                </Button>
                <Button onClick={() => setActionType(null)}>Cancel</Button>
              </Space>
            </Form>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <Title level={4}>Review Actions</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Internal only - These actions are visible to OPS/BD team only
      </Text>

      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Assign Owner */}
        {canAssign && (
          <Button
            icon={<UserAddOutlined />}
            onClick={() => setActionType('assign')}
            disabled={actionType !== null && actionType !== 'assign'}
            block
          >
            {lead.assignedOwner ? 'Reassign Owner' : 'Assign Owner'}
          </Button>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Status Change Actions */}
        <Text strong>Change Status:</Text>

        {canApprove && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setActionType('approve')}
            disabled={actionType !== null && actionType !== 'approve'}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            block
          >
            Approve Lead
          </Button>
        )}

        {canReject && (
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => setActionType('reject')}
            disabled={actionType !== null && actionType !== 'reject'}
            block
          >
            Reject Lead
          </Button>
        )}

        {canRequestInfo && (
          <Button
            icon={<ExclamationCircleOutlined />}
            onClick={() => setActionType('requestInfo')}
            disabled={actionType !== null && actionType !== 'requestInfo'}
            style={{ borderColor: '#faad14', color: '#faad14' }}
            block
          >
            Request More Information
          </Button>
        )}

        {!canApprove && !canReject && !canRequestInfo && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            No status change actions available for current lead status
          </Text>
        )}
      </Space>

      {/* Action Form */}
      {renderActionForm()}
    </Card>
  );
};
