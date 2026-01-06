import React, { useState } from 'react';
import { Card, Space, Button, Modal, Form, Input, Radio, message, Drawer, Checkbox } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { Lead, TimelineEvent } from '../../types';
import { LeadStatus, ActorType } from '../../types/enums';
import { useAuth } from '../../contexts/AuthContext';
import { mockApi } from '../../services/mockApi';
import { generateId } from '../../utils/helpers';

/**
 * Admin Action Panel Component
 * 
 * Per Sprint 1 §8.4: Admin-specific actions for OPS_BD role
 * 
 * Four flows:
 * 1. Set Under Review: Only if currently Submitted
 * 2. Request Info: Opens drawer with checklist + free text
 * 3. Approve: Opens modal with reason code + note
 * 4. Reject: Opens modal with reason code + note + resubmission_allowed
 * 
 * All actions create timeline events with who/when/why enforcement.
 */

interface AdminActionPanelProps {
  lead: Lead;
  onUpdate: () => void;
}

type ActionType = 'under-review' | 'request-info' | 'approve' | 'reject' | null;

export const AdminActionPanel: React.FC<AdminActionPanelProps> = ({ lead, onUpdate }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null; // Guard against null user

  // §8.4.1 Set Under Review
  const handleSetUnderReview = async () => {
    Modal.confirm({
      title: 'Set Lead Under Review',
      icon: <EyeOutlined />,
      content: (
        <div>
          <p>Are you sure you want to set this lead to "Under Review"?</p>
          <Form.Item label="Optional Note" style={{ marginBottom: 0, marginTop: 16 }}>
            <Input.TextArea 
              id="under-review-note"
              rows={3} 
              placeholder="Add any notes about why this lead is being reviewed..."
            />
          </Form.Item>
        </div>
      ),
      okText: 'Set Under Review',
      onOk: async () => {
        try {
          setLoading(true);
          const note = (document.getElementById('under-review-note') as HTMLTextAreaElement)?.value || '';

          const event: TimelineEvent = {
            id: generateId(),
            actorType: ActorType.OPS_BD,
            actorName: user.displayName,
            occurredAt: new Date().toISOString(),
            eventType: 'STATUS_CHANGED',
            description: `Status changed to Under Review${note ? `: ${note}` : ''}`,
            reasonCode: 'UNDER_REVIEW',
            metadata: {
              previousStatus: lead.status,
              newStatus: LeadStatus.UNDER_REVIEW,
              note: note || undefined,
            },
          };

          await mockApi.leads.update(lead.id, {
            status: LeadStatus.UNDER_REVIEW,
            timeline: [...lead.timeline, event],
            lastUpdatedAt: new Date().toISOString(),
          });

          message.success('Lead set to Under Review');
          onUpdate();
        } catch (error) {
          message.error('Failed to update lead status');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // §8.4.2 Request Info
  const handleRequestInfo = () => {
    setCurrentAction('request-info');
  };

  const handleRequestInfoSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Build requested items list from checkboxes
      const requestedItems = [];
      if (values.merchantInfo) requestedItems.push('Additional merchant information');
      if (values.documents) requestedItems.push('Supporting documents');
      if (values.financials) requestedItems.push('Financial statements');
      if (values.references) requestedItems.push('Business references');

      const event: TimelineEvent = {
        id: generateId(),
        actorType: ActorType.OPS_BD,
        actorName: user.displayName,
        occurredAt: new Date().toISOString(),
        eventType: 'INFO_REQUESTED',
        description: `Information requested: ${requestedItems.join(', ')}`,
        reasonCode: 'INFO_REQUESTED',
        metadata: {
          previousStatus: lead.status,
          newStatus: LeadStatus.INFO_REQUESTED,
          requestedItems,
          note: values.note || undefined,
        },
      };

      await mockApi.leads.update(lead.id, {
        status: LeadStatus.INFO_REQUESTED,
        timeline: [...lead.timeline, event],
        lastUpdatedAt: new Date().toISOString(),
      });

      message.success('Information request sent');
      setCurrentAction(null);
      form.resetFields();
      onUpdate();
    } catch (error) {
      message.error('Failed to request information');
    } finally {
      setLoading(false);
    }
  };

  // §8.4.3 Approve
  const handleApprove = () => {
    setCurrentAction('approve');
  };

  const handleApproveSubmit = async (values: any) => {
    try {
      setLoading(true);

      const event: TimelineEvent = {
        id: generateId(),
        actorType: ActorType.OPS_BD,
        actorName: user.displayName,
        occurredAt: new Date().toISOString(),
        eventType: 'APPROVED',
        description: `Lead approved: ${values.reasonCode}${values.note ? ` - ${values.note}` : ''}`,
        reasonCode: values.reasonCode,
        metadata: {
          previousStatus: lead.status,
          newStatus: LeadStatus.APPROVED,
          note: values.note || undefined,
        },
      };

      await mockApi.leads.update(lead.id, {
        status: LeadStatus.APPROVED,
        timeline: [...lead.timeline, event],
        lastUpdatedAt: new Date().toISOString(),
      });

      message.success('Lead approved successfully');
      setCurrentAction(null);
      form.resetFields();
      onUpdate();
    } catch (error) {
      message.error('Failed to approve lead');
    } finally {
      setLoading(false);
    }
  };

  // §8.4.4 Reject
  const handleReject = () => {
    setCurrentAction('reject');
  };

  const handleRejectSubmit = async (values: any) => {
    try {
      setLoading(true);

      const event: TimelineEvent = {
        id: generateId(),
        actorType: ActorType.OPS_BD,
        actorName: user.displayName,
        occurredAt: new Date().toISOString(),
        eventType: 'REJECTED',
        description: `Lead rejected: ${values.reasonCode}${values.note ? ` - ${values.note}` : ''}`,
        reasonCode: values.reasonCode,
        metadata: {
          previousStatus: lead.status,
          newStatus: LeadStatus.REJECTED,
          resubmissionAllowed: values.resubmissionAllowed ?? true,
          note: values.note || undefined,
        },
      };

      await mockApi.leads.update(lead.id, {
        status: LeadStatus.REJECTED,
        timeline: [...lead.timeline, event],
        lastUpdatedAt: new Date().toISOString(),
      });

      message.success('Lead rejected');
      setCurrentAction(null);
      form.resetFields();
      onUpdate();
    } catch (error) {
      message.error('Failed to reject lead');
    } finally {
      setLoading(false);
    }
  };

  // Deterministic rules per Sprint 1 §8.4
  const canSetUnderReview = lead.status === LeadStatus.SUBMITTED;
  const canRequestInfo = [LeadStatus.SUBMITTED, LeadStatus.UNDER_REVIEW].includes(lead.status);
  const canApproveOrReject = 
    [LeadStatus.UNDER_REVIEW, LeadStatus.INFO_REQUESTED].includes(lead.status) && 
    lead.assignedOwner; // Owner must exist before approving/rejecting

  return (
    <>
      <Card 
        title="Admin Actions" 
        className="admin-action-panel"
        style={{ marginBottom: 24 }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* Set Under Review */}
          <Button
            icon={<EyeOutlined />}
            onClick={handleSetUnderReview}
            disabled={!canSetUnderReview || loading}
            block
          >
            Set Under Review
            {!canSetUnderReview && ` (Only available for Submitted leads)`}
          </Button>

          {/* Request Info */}
          <Button
            icon={<ExclamationCircleOutlined />}
            onClick={handleRequestInfo}
            disabled={!canRequestInfo || loading}
            block
          >
            Request Info
            {!canRequestInfo && ` (Not available for ${lead.status})`}
          </Button>

          <div style={{ 
            borderTop: '1px solid #f0f0f0', 
            margin: '12px 0', 
            paddingTop: 12 
          }}>
            <Space style={{ width: '100%' }}>
              {/* Approve */}
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                disabled={!canApproveOrReject || loading}
                style={{ flex: 1 }}
              >
                Approve
              </Button>

              {/* Reject */}
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleReject}
                disabled={!canApproveOrReject || loading}
                style={{ flex: 1 }}
              >
                Reject
              </Button>
            </Space>
            {!canApproveOrReject && (
              <div style={{ 
                marginTop: 8, 
                fontSize: 12, 
                color: '#999',
                textAlign: 'center'
              }}>
                {!lead.assignedOwner 
                  ? 'Owner must be assigned before approval/rejection' 
                  : `Not available for ${lead.status} status`}
              </div>
            )}
          </div>
        </Space>
      </Card>

      {/* Request Info Drawer */}
      <Drawer
        title="Request Additional Information"
        open={currentAction === 'request-info'}
        onClose={() => {
          setCurrentAction(null);
          form.resetFields();
        }}
        width={500}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => {
              setCurrentAction(null);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()} loading={loading}>
              Send Request
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRequestInfoSubmit}
        >
          <Form.Item label="Select requested items:">
            <Space direction="vertical">
              <Form.Item name="merchantInfo" valuePropName="checked" noStyle>
                <Checkbox>Additional merchant information</Checkbox>
              </Form.Item>
              <Form.Item name="documents" valuePropName="checked" noStyle>
                <Checkbox>Supporting documents</Checkbox>
              </Form.Item>
              <Form.Item name="financials" valuePropName="checked" noStyle>
                <Checkbox>Financial statements</Checkbox>
              </Form.Item>
              <Form.Item name="references" valuePropName="checked" noStyle>
                <Checkbox>Business references</Checkbox>
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item
            name="note"
            label="Additional Notes"
            rules={[{ required: true, message: 'Please provide details about what is needed' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Specify exactly what information is needed and why..."
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Approve Modal */}
      <Modal
        title="Approve Lead"
        open={currentAction === 'approve'}
        onCancel={() => {
          setCurrentAction(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApproveSubmit}
        >
          <Form.Item
            name="reasonCode"
            label="Reason for Approval"
            rules={[{ required: true, message: 'Please select a reason' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="MEETS_CRITERIA">Meets all criteria</Radio>
                <Radio value="STRONG_PROFILE">Strong merchant profile</Radio>
                <Radio value="STRATEGIC_FIT">Strategic fit</Radio>
                <Radio value="CONDITIONAL">Conditional approval</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="note"
            label="Notes (Optional)"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Add any additional notes about this decision..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCurrentAction(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Approve Lead
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Lead"
        open={currentAction === 'reject'}
        onCancel={() => {
          setCurrentAction(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRejectSubmit}
          initialValues={{ resubmissionAllowed: true }}
        >
          <Form.Item
            name="reasonCode"
            label="Reason for Rejection"
            rules={[{ required: true, message: 'Please select a reason' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="INCOMPLETE_INFO">Incomplete information</Radio>
                <Radio value="DOES_NOT_MEET_CRITERIA">Does not meet criteria</Radio>
                <Radio value="HIGH_RISK">High risk profile</Radio>
                <Radio value="DUPLICATE">Duplicate submission</Radio>
                <Radio value="OTHER">Other</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="note"
            label="Rejection Details"
            rules={[{ required: true, message: 'Please provide details about the rejection' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Explain why this lead is being rejected..."
            />
          </Form.Item>

          <Form.Item
            name="resubmissionAllowed"
            valuePropName="checked"
          >
            <Checkbox>Allow resubmission after addressing issues</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCurrentAction(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button danger type="primary" htmlType="submit" loading={loading}>
                Reject Lead
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
