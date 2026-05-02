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
import { translateReasonCode, translateStatus } from '../../utils/i18n';

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
      title: '将线索设为审核中',
      icon: <EyeOutlined />,
      content: (
        <div>
          <p>确定要将此线索设为“审核中”吗？</p>
          <Form.Item label="可选备注" style={{ marginBottom: 0, marginTop: 16 }}>
            <Input.TextArea 
              id="under-review-note"
              rows={3} 
              placeholder="补充说明此线索进入审核的原因..."
            />
          </Form.Item>
        </div>
      ),
      okText: '设为审核中',
      cancelText: '取消',
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
            description: `状态已变更为审核中${note ? `：${note}` : ''}`,
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

          message.success('线索已设为审核中');
          onUpdate();
        } catch (error) {
          message.error('线索状态更新失败');
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
      if (values.merchantInfo) requestedItems.push('补充商户信息');
      if (values.documents) requestedItems.push('证明文件');
      if (values.financials) requestedItems.push('财务资料');
      if (values.references) requestedItems.push('业务推荐/证明');

      const event: TimelineEvent = {
        id: generateId(),
        actorType: ActorType.OPS_BD,
        actorName: user.displayName,
        occurredAt: new Date().toISOString(),
        eventType: 'INFO_REQUESTED',
        description: `已请求补充信息：${requestedItems.join('、')}`,
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

      message.success('补充信息请求已发送');
      setCurrentAction(null);
      form.resetFields();
      onUpdate();
    } catch (error) {
      message.error('补充信息请求发送失败');
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
        description: `线索已通过：${translateReasonCode(values.reasonCode)}${values.note ? ` - ${values.note}` : ''}`,
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

      message.success('线索通过成功');
      setCurrentAction(null);
      form.resetFields();
      onUpdate();
    } catch (error) {
      message.error('线索通过失败');
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
        description: `线索已拒绝：${translateReasonCode(values.reasonCode)}${values.note ? ` - ${values.note}` : ''}`,
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

      message.success('线索已拒绝');
      setCurrentAction(null);
      form.resetFields();
      onUpdate();
    } catch (error) {
      message.error('线索拒绝失败');
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
        title="管理操作" 
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
            设为审核中
            {!canSetUnderReview && `（仅适用于已提交线索）`}
          </Button>

          {/* Request Info */}
          <Button
            icon={<ExclamationCircleOutlined />}
            onClick={handleRequestInfo}
            disabled={!canRequestInfo || loading}
            block
          >
            请求补充信息
            {!canRequestInfo && `（${translateStatus(lead.status)}不可用）`}
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
                通过
              </Button>

              {/* Reject */}
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleReject}
                disabled={!canApproveOrReject || loading}
                style={{ flex: 1 }}
              >
                拒绝
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
                  ? '通过或拒绝前必须先分配负责人' 
                  : `${translateStatus(lead.status)}状态不可用`}
              </div>
            )}
          </div>
        </Space>
      </Card>

      {/* Request Info Drawer */}
      <Drawer
        title="请求补充信息"
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
              取消
            </Button>
            <Button type="primary" onClick={() => form.submit()} loading={loading}>
              发送请求
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRequestInfoSubmit}
        >
          <Form.Item label="选择所需项目：">
            <Space direction="vertical">
              <Form.Item name="merchantInfo" valuePropName="checked" noStyle>
                <Checkbox>补充商户信息</Checkbox>
              </Form.Item>
              <Form.Item name="documents" valuePropName="checked" noStyle>
                <Checkbox>证明文件</Checkbox>
              </Form.Item>
              <Form.Item name="financials" valuePropName="checked" noStyle>
                <Checkbox>财务资料</Checkbox>
              </Form.Item>
              <Form.Item name="references" valuePropName="checked" noStyle>
                <Checkbox>业务推荐/证明</Checkbox>
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item
            name="note"
            label="补充备注"
            rules={[{ required: true, message: '请说明需要补充哪些信息' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="请明确说明需要哪些信息以及原因..."
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Approve Modal */}
      <Modal
        title="通过线索"
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
            label="通过原因"
            rules={[{ required: true, message: '请选择原因' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="MEETS_CRITERIA">符合全部标准</Radio>
                <Radio value="STRONG_PROFILE">商户画像优秀</Radio>
                <Radio value="STRATEGIC_FIT">战略匹配</Radio>
                <Radio value="CONDITIONAL">有条件通过</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="note"
            label="备注（可选）"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="补充说明此决策..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCurrentAction(null);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                通过线索
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="拒绝线索"
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
            label="拒绝原因"
            rules={[{ required: true, message: '请选择原因' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="INCOMPLETE_INFO">信息不完整</Radio>
                <Radio value="DOES_NOT_MEET_CRITERIA">不符合标准</Radio>
                <Radio value="HIGH_RISK">高风险画像</Radio>
                <Radio value="DUPLICATE">重复提交</Radio>
                <Radio value="OTHER">其他</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="note"
            label="拒绝详情"
            rules={[{ required: true, message: '请填写拒绝详情' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="说明为什么拒绝此线索..."
            />
          </Form.Item>

          <Form.Item
            name="resubmissionAllowed"
            valuePropName="checked"
          >
            <Checkbox>允许修正问题后重新提交</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCurrentAction(null);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button danger type="primary" htmlType="submit" loading={loading}>
                拒绝线索
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
