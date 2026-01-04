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
import { formatDate } from '../../utils';
import { LeadTimeline } from './LeadTimeline';
import { LeadReviewPanel } from './LeadReviewPanel';
import { LeadFormModal } from './LeadFormModal';
import { getMissingFieldsText, hasMissingInfo } from './config';
import './styles.css';

/**
 * LeadDetailView Component
 * Per PRD §7.4.3: Comprehensive lead detail page with:
 * - Header (name + status + owner + timestamps)
 * - Required Info Checklist (dynamic, shows missing items with CTAs)
 * - Timeline/Audit Trail (vertical timeline with actor/timestamp/reason)
 * - Milestones Tracker (Onboarded, First order, 30/60/90-day tiers)
 * - Review Actions (OPS only)
 * 
 * Permission Logic:
 * - CO_SELECTOR can edit only when status is INFO_REQUESTED
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
        <Text>Lead not found</Text>
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
        Back to Leads
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
                  {lead.status.replace(/_/g, ' ')}
                </Tag>
                <Tag>{lead.category}</Tag>
                <Text type="secondary">{lead.city}, {lead.region}</Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end" size={4}>
              {lead.assignedOwner && (
                <Space>
                  <Text type="secondary">Assigned to:</Text>
                  <Text strong>{lead.assignedOwner}</Text>
                </Space>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Last updated: {formatDate(lead.lastUpdatedAt)}
              </Text>
              {lead.submittedAt && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Submitted: {formatDate(lead.submittedAt)}
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
            Edit Lead
          </Button>
        )}

        {/* Info Request Alert */}
        {lead.status === LeadStatus.INFO_REQUESTED && (
          <Alert
            message="Additional Information Requested"
            description="OPS team has requested more information. Please review the timeline below and update the required fields."
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={16}>
          {/* Required Info Checklist */}
          {hasMissing && (
            <Card style={{ marginBottom: 24, borderLeft: '4px solid #faad14' }}>
              <Title level={4}>
                <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                Required Information Checklist
              </Title>
              <Alert
                message={missingText}
                type="warning"
                showIcon
                action={
                  canEditNow && (
                    <Button size="small" type="primary" onClick={() => setEditModalVisible(true)}>
                      Complete Now
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
                  All Required Information Complete
                </Title>
              </Space>
            </Card>
          )}

          {/* Lead Information */}
          <Card title="Lead Details" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Merchant Name" span={2}>
                {lead.merchantName}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {lead.category}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {lead.city}, {lead.region}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[lead.status]}>
                  {lead.status.replace(/_/g, ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned Owner">
                {lead.assignedOwner || 'Unassigned'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Contact Information</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text strong>Name:</Text>
                <Text>{lead.contactName}</Text>
              </Space>
              {lead.contactPhone && (
                <Space>
                  <PhoneOutlined />
                  <Text>{lead.contactPhone}</Text>
                  <Button type="link" size="small" href={`tel:${lead.contactPhone}`}>
                    Call
                  </Button>
                </Space>
              )}
              {lead.contactEmail && (
                <Space>
                  <MailOutlined />
                  <Text>{lead.contactEmail}</Text>
                  <Button type="link" size="small" href={`mailto:${lead.contactEmail}`}>
                    Email
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
                <Title level={5}>Commercial Information</Title>
                <Space direction="vertical">
                  <Space>
                    <Text strong>Estimated Monthly Volume:</Text>
                    <Text>{lead.estimatedMonthlyVolume}</Text>
                  </Space>
                </Space>
              </>
            )}

            {lead.notes && (
              <>
                <Divider />
                <Title level={5}>Additional Notes</Title>
                <Text>{lead.notes}</Text>
              </>
            )}
          </Card>

          {/* Timeline */}
          <LeadTimeline events={lead.timeline} />
        </Col>

        <Col span={8}>
          {/* OPS Review Panel (permission-based) */}
          {canViewReview && (
            <LeadReviewPanel
              lead={lead}
              currentUserName={user?.displayName || 'Unknown User'}
              onUpdateLead={handleUpdateLead}
            />
          )}

          {/* Milestones Card (Placeholder - can be expanded) */}
          <Card title="Milestones" style={{ marginTop: 24 }}>
            <List
              size="small"
              dataSource={[
                { name: 'Lead Submitted', status: 'completed', date: lead.submittedAt },
                { name: 'Under Review', status: 'current', date: null },
                { name: 'Approved', status: 'pending', date: null },
                { name: 'Onboarded', status: 'pending', date: null },
                { name: 'First Order', status: 'pending', date: null },
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
