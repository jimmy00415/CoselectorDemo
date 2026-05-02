import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Descriptions, 
  List,
  Alert,
  Divider,
  Spin,
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Lead } from '../../types';
import { LeadStatus } from '../../types/enums';
import { mockApi } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, Permission } from '../../services/permissions';
import { formatDate, translateCategory, translateRegion, translateStatus } from '../../utils';
import { LeadTimeline } from './LeadTimeline';
import { LeadReviewPanel } from './LeadReviewPanel';
import { LeadFormModal } from './LeadFormModal';
import { NextBestAction } from './NextBestAction';
import { StatusExplanation } from './StatusExplanation';
import { AdminActionPanel } from '../Admin';
import { getMissingFieldsText, hasMissingInfo } from './config';
import './styles.css';

/**
 * LeadDetailView Component
 * Per Sprint 1 §7.3: Lead Detail Must Answer 3 Questions:
 * 
 * Q1) What is the current status?
 *     - Status chip + explanation (StatusExplanation component)
 * 
 * Q2) What happened and why?
 *     - Timeline component (reverse chronological with from→to)
 * 
 * Q3) What should I do next?
 *     - Next Best Action banner with rule-based text + CTAs
 * 
 * Permission Logic:
 * - CO_SELECTOR can edit only when status is INFO_REQUESTED or DRAFT
 * - OPS_BD can access review panel
 */

const { Title, Text } = Typography;

export const LeadDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const canEdit = hasPermission(role, Permission.LEAD_EDIT);
  const canViewReview = hasPermission(role, Permission.LEAD_CHANGE_STATUS); // OPS only

  // Permission check: CO_SELECTOR can only edit when INFO_REQUESTED
  const canEditNow = canEdit && (
    lead?.status === LeadStatus.DRAFT || 
    lead?.status === LeadStatus.INFO_REQUESTED
  );

  const loadLead = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await mockApi.leads.getById(id);
      setLead(data);
    } catch (error) {
      console.error('Failed to load lead:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!lead) return;

    try {
      const updated = await mockApi.leads.update(lead.id, updates);
      setLead(updated);
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const handleEditSubmit = async (values: Partial<Lead>) => {
    await handleUpdateLead(values);
    setEditModalVisible(false);
  };

  const handleResubmit = () => {
    // Resubmit creates a new draft with updated status
    // Per Sprint 1 §7.3 Q3: Rejected → Resubmitted flow
    setEditModalVisible(true);
  };

  const handleUploadDocs = () => {
    // Jump to attachments section in edit modal
    setEditModalVisible(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Text>未找到线索</Text>
      </div>
    );
  }

  // Status color mapping
  const statusColors: Record<LeadStatus, string> = {
    [LeadStatus.DRAFT]: 'default',
    [LeadStatus.SUBMITTED]: 'blue',
    [LeadStatus.UNDER_REVIEW]: 'orange',
    [LeadStatus.INFO_REQUESTED]: 'purple',
    [LeadStatus.APPROVED]: 'green',
    [LeadStatus.REJECTED]: 'red',
    [LeadStatus.RESUBMITTED]: 'cyan',
  };

  // Calculate missing required info
  const hasMissing = hasMissingInfo(lead);
  const missingText = getMissingFieldsText(lead);

  return (
    <div className="lead-detail-container">
      {/* Back Button */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/leads')}
        style={{ marginBottom: 16 }}
      >
        返回线索列表
      </Button>

      {/* Header Card */}
      <Card className="lead-detail-header">
        <Row justify="space-between" align="top">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0 }}>
                {lead.merchantName}
              </Title>
              <Space>
                <Tag color={statusColors[lead.status]} style={{ fontSize: 14 }}>
                  {translateStatus(lead.status)}
                </Tag>
                <Tag>{translateCategory(lead.category)}</Tag>
                <Text type="secondary">{translateRegion(lead.city)}, {translateRegion(lead.region)}</Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end" size={4}>
              {lead.assignedOwner && (
                <Space>
                  <Text type="secondary">分配给：</Text>
                  <Text strong>{lead.assignedOwner}</Text>
                </Space>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                最近更新：{formatDate(lead.lastUpdatedAt)}
              </Text>
              {lead.submittedAt && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  提交时间：{formatDate(lead.submittedAt)}
                </Text>
              )}
            </Space>
          </Col>
        </Row>

        {/* Edit Button (permission-based) */}
        {canEditNow && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditModalVisible(true)}
            style={{ marginTop: 16 }}
          >
            编辑线索
          </Button>
        )}

        {/* Info Request Alert */}
        {lead.status === LeadStatus.INFO_REQUESTED && (
          <Alert
            message="需要补充信息"
            description="运营团队要求补充更多信息。请查看下方时间线并更新所需字段。"
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={16}>
          {/* Q1: What is the current status? - Sprint 1 §7.3 */}
          <StatusExplanation status={lead.status} assignedOwner={lead.assignedOwner} />

          {/* Q3: What should I do next? - Sprint 1 §7.3 */}
          <NextBestAction 
            lead={lead} 
            onResubmit={handleResubmit}
            onUploadDocs={handleUploadDocs}
          />

          {/* Required Info Checklist */}
          {hasMissing && (
            <Card style={{ marginBottom: 24, borderLeft: '4px solid #faad14' }}>
              <Title level={4}>
                <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                必填信息清单
              </Title>
              <Alert
                message={missingText}
                type="warning"
                showIcon
                action={
                  canEditNow && (
                    <Button size="small" type="primary" onClick={() => setEditModalVisible(true)}>
                      立即补全
                    </Button>
                  )
                }
              />
            </Card>
          )}

          {!hasMissing && (
            <Card style={{ marginBottom: 24, borderLeft: '4px solid #52c41a' }}>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                <Title level={4} style={{ margin: 0 }}>
                  所有必填信息已完整
                </Title>
              </Space>
            </Card>
          )}

          {/* Lead Information */}
          <Card title="线索详情" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="商户名称" span={2}>
                {lead.merchantName}
              </Descriptions.Item>
              <Descriptions.Item label="类目">
                {translateCategory(lead.category)}
              </Descriptions.Item>
              <Descriptions.Item label="位置">
                {translateRegion(lead.city)}, {translateRegion(lead.region)}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[lead.status]}>
                  {translateStatus(lead.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="分配负责人">
                {lead.assignedOwner || '未分配'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>联系信息</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text strong>姓名：</Text>
                <Text>{lead.contactName}</Text>
              </Space>
              {lead.contactPhone && (
                <Space>
                  <PhoneOutlined />
                  <Text>{lead.contactPhone}</Text>
                  <Button type="link" size="small" href={`tel:${lead.contactPhone}`}>
                    拨打
                  </Button>
                </Space>
              )}
              {lead.contactEmail && (
                <Space>
                  <MailOutlined />
                  <Text>{lead.contactEmail}</Text>
                  <Button type="link" size="small" href={`mailto:${lead.contactEmail}`}>
                    发邮件
                  </Button>
                </Space>
              )}
              {lead.website && (
                <Space>
                  <GlobalOutlined />
                  <a href={lead.website} target="_blank" rel="noopener noreferrer">
                    {lead.website}
                  </a>
                </Space>
              )}
            </Space>

            {lead.estimatedMonthlyVolume && (
              <>
                <Divider />
                <Title level={5}>商业信息</Title>
                <Space direction="vertical">
                  <Space>
                    <Text strong>预估月成交额：</Text>
                    <Text>{lead.estimatedMonthlyVolume}</Text>
                  </Space>
                </Space>
              </>
            )}

            {lead.notes && (
              <>
                <Divider />
                <Title level={5}>补充备注</Title>
                <Text>{lead.notes}</Text>
              </>
            )}
          </Card>

          {/* Q2: What happened and why? - Sprint 1 §7.3 */}
          {/* Timeline component (reverse chronological with from→to) */}
          <LeadTimeline events={lead.timeline} title="时间线与审计记录（发生了什么以及原因）" />
        </Col>

        <Col span={8}>
          {/* Admin Action Panel (Sprint 1 §8.4) - OPS_BD only */}
          {canViewReview && (
            <AdminActionPanel
              lead={lead}
              onUpdate={loadLead}
            />
          )}

          {/* Legacy OPS Review Panel - Keep for backward compatibility */}
          {canViewReview && (
            <LeadReviewPanel
              lead={lead}
              currentUserName={user?.displayName || '未知用户'}
              onUpdateLead={handleUpdateLead}
            />
          )}

          {/* Milestones Card (Placeholder - can be expanded) */}
          <Card title="里程碑" style={{ marginTop: 24 }}>
            <List
              size="small"
              dataSource={[
                { name: '线索已提交', status: 'completed', date: lead.submittedAt },
                { name: '审核中', status: 'current', date: null },
                { name: '已通过', status: 'pending', date: null },
                { name: '已入驻', status: 'pending', date: null },
                { name: '首单', status: 'pending', date: null },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    {item.status === 'completed' && (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    )}
                    {item.status === 'current' && (
                      <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
                    )}
                    {item.status === 'pending' && (
                      <div style={{ width: 14, height: 14, border: '2px solid #d9d9d9', borderRadius: '50%' }} />
                    )}
                    <Text>{item.name}</Text>
                  </Space>
                  {item.date && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(item.date)}
                    </Text>
                  )}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <LeadFormModal
        visible={editModalVisible}
        lead={lead}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};
