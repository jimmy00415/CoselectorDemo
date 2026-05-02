import { Card, Button, Select, Input, Space, Typography, Divider, Form, message } from 'antd';
import { 
  UserAddOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Lead, TimelineEvent } from '../../types';
import { LeadStatus, LeadReviewReason, ActorType } from '../../types/enums';
import { LeadStateMachine } from '../../services/stateMachines';
import { generateId, translateReasonCode, translateStatus } from '../../utils';
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
      const values = await form.validateFields(['assignedOwner', 'reasonCode', 'reasonNote']);
      setLoading(true);

      // Create OWNER_ASSIGNED timeline event per Sprint 1 §9.2
      const event: TimelineEvent = {
        id: generateId(),
        actorType: ActorType.OPS_BD,
        actorName: currentUserName,
        occurredAt: new Date().toISOString(),
        eventType: 'OWNER_ASSIGNED',
        description: `负责人已${lead.assignedOwner ? '变更' : '分配'}给 ${values.assignedOwner}：${translateReasonCode(values.reasonCode)}${values.reasonNote ? ` - ${values.reasonNote}` : ''}`,
        reasonCode: values.reasonCode,
        metadata: {
          previousOwner: lead.assignedOwner,
          newOwner: values.assignedOwner,
          reasonNote: values.reasonNote,
        },
      };

      // Update lead with new owner and timeline event
      onUpdateLead({
        assignedOwner: values.assignedOwner,
        timeline: [...lead.timeline, event],
        lastUpdatedAt: new Date().toISOString(),
      });

      message.success('负责人分配成功');
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
        message.error(result.error || '无效状态流转');
        setLoading(false);
        return;
      }

      // Update lead with new status and timeline event
      onUpdateLead({
        status: result.newStatus,
        timeline: [...lead.timeline, result.event],
        lastUpdatedAt: new Date().toISOString(),
      });

      message.success(`线索已${translateStatus(targetStatus)}`);
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
                label="分配给"
                rules={[{ required: true, message: '请选择负责人' }]}
              >
                <Select placeholder="选择负责人">
                  <Select.Option value="Alice Wang">王艾丽</Select.Option>
                  <Select.Option value="Bob Chen">陈博</Select.Option>
                  <Select.Option value="Carol Li">李可柔</Select.Option>
                  <Select.Option value="David Zhang">张大卫</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reasonCode"
                label="分配原因"
                rules={[{ required: true, message: '请选择原因' }]}
                tooltip="负责人分配需要填写原因码"
              >
                <Select placeholder="为什么分配此负责人？">
                  <Select.Option value="CLAIMED">运营/BD 已认领</Select.Option>
                  <Select.Option value="EXPERTISE">专业能力匹配</Select.Option>
                  <Select.Option value="WORKLOAD">工作量平衡</Select.Option>
                  <Select.Option value="REGIONAL">区域覆盖</Select.Option>
                  <Select.Option value="OTHER">其他</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reasonNote"
                label="补充备注"
              >
                <Input.TextArea rows={2} placeholder="可选备注..." />
              </Form.Item>
              <Space>
                <Button type="primary" onClick={handleAssignOwner} loading={loading}>
                  分配
                </Button>
                <Button onClick={() => setActionType(null)}>取消</Button>
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
                label="通过原因"
                rules={[{ required: true, message: '请选择原因' }]}
              >
                <Select placeholder="选择原因">
                  <Select.Option value={LeadReviewReason.HIGH_VOLUME}>高潜力成交量</Select.Option>
                  <Select.Option value={LeadReviewReason.STRATEGIC_FIT}>战略匹配</Select.Option>
                  <Select.Option value={LeadReviewReason.GOOD_REPUTATION}>口碑良好</Select.Option>
                  <Select.Option value={LeadReviewReason.OTHER}>其他</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reasonNote"
                label="补充备注"
              >
                <TextArea rows={3} placeholder="可选备注..." />
              </Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(LeadStatus.APPROVED)} 
                  loading={loading}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  通过线索
                </Button>
                <Button onClick={() => setActionType(null)}>取消</Button>
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
                label="拒绝原因"
                rules={[{ required: true, message: '请选择原因' }]}
              >
                <Select placeholder="选择原因">
                  <Select.Option value={LeadReviewReason.LOW_VOLUME}>成交量偏低</Select.Option>
                  <Select.Option value={LeadReviewReason.POOR_REPUTATION}>口碑风险</Select.Option>
                  <Select.Option value={LeadReviewReason.INCOMPLETE_INFO}>信息不完整</Select.Option>
                  <Select.Option value={LeadReviewReason.OUT_OF_SCOPE}>不在合作范围内</Select.Option>
                  <Select.Option value={LeadReviewReason.OTHER}>其他</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reasonNote"
                label="详细原因"
                rules={[{ required: true, message: '请填写详细原因' }]}
              >
                <TextArea rows={3} placeholder="说明为什么拒绝此线索..." />
              </Form.Item>
              <Space>
                <Button 
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(LeadStatus.REJECTED)} 
                  loading={loading}
                >
                  拒绝线索
                </Button>
                <Button onClick={() => setActionType(null)}>取消</Button>
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
                label="所需信息"
                rules={[{ required: true, message: '请选择需要补充的信息' }]}
              >
                <Select placeholder="选择所需信息">
                  <Select.Option value={LeadReviewReason.MISSING_CONTACT}>缺少联系人信息</Select.Option>
                  <Select.Option value={LeadReviewReason.MISSING_DOCS}>缺少证明文件</Select.Option>
                  <Select.Option value={LeadReviewReason.UNCLEAR_VOLUME}>成交量预估不清</Select.Option>
                  <Select.Option value={LeadReviewReason.OTHER}>其他</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="reasonNote"
                label="具体要求"
                rules={[{ required: true, message: '请说明需要哪些信息' }]}
              >
                <TextArea rows={3} placeholder="说明需要补充哪些信息..." />
              </Form.Item>
              <Space>
                <Button 
                  type="primary"
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => handleStatusChange(LeadStatus.INFO_REQUESTED)} 
                  loading={loading}
                  style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                >
                  请求补充信息
                </Button>
                <Button onClick={() => setActionType(null)}>取消</Button>
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
      <Title level={4}>审核操作</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        仅内部可见 - 这些操作仅对运营/BD 团队显示
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
            {lead.assignedOwner ? '重新分配负责人' : '分配负责人'}
          </Button>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Status Change Actions */}
        <Text strong>变更状态：</Text>

        {canApprove && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setActionType('approve')}
            disabled={actionType !== null && actionType !== 'approve'}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            block
          >
            通过线索
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
            拒绝线索
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
            请求补充信息
          </Button>
        )}

        {!canApprove && !canReject && !canRequestInfo && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            当前线索状态没有可用的状态变更操作
          </Text>
        )}
      </Space>

      {/* Action Form */}
      {renderActionForm()}
    </Card>
  );
};
