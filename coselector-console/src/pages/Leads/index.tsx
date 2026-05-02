import { useState, useEffect } from 'react';
import { Button, Space, message, Modal, Select, DatePicker, Row, Col, Table } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Lead } from '../../types';
import { LeadStatus, ActorType } from '../../types/enums';
import { mockApi } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, Permission } from '../../services/permissions';
import { getLeadsColumns, leadFilterOptions, hasMissingInfo } from './config';
import { LeadFormModal } from './LeadFormModal';
import { LeadStateMachine } from '../../services/stateMachines';
import './styles.css';

/**
 * Leads Module - Main List Page
 * Per PRD §7.4.1: Pipeline table with filters, actions, and permission-based controls
 * 
 * Features:
 * - Primary CTA: "Submit lead" (CO_SELECTOR only)
 * - Filters: Status, Category, Region, Owner assigned, Missing info, Date range
 * - Actions: View, Edit draft (status-based), Duplicate
 * - Permission enforcement: CO_SELECTOR vs OPS_BD
 * 
 * Key Interaction Logic:
 * - CO_SELECTOR can create, edit drafts, submit, resubmit
 * - OPS_BD can assign, change status, request info
 * - Edit only allowed for DRAFT or INFO_REQUESTED status
 */

const { RangePicker } = DatePicker;

export const Leads: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [missingInfoFilter, setMissingInfoFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  // Permissions
  const canCreate = hasPermission(role, Permission.LEAD_CREATE);
  const canEdit = hasPermission(role, Permission.LEAD_EDIT);
  const canSubmit = hasPermission(role, Permission.LEAD_SUBMIT);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await mockApi.leads.getAll();
      setLeads(data);
    } catch (error) {
      message.error('线索加载失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to leads data
  const filteredLeads = leads.filter((lead) => {
    // Status filter
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && lead.category !== categoryFilter) return false;

    // Region filter
    if (regionFilter !== 'all' && lead.region !== regionFilter) return false;

    // Owner assigned filter
    if (ownerFilter === 'assigned' && !lead.assignedOwner) return false;
    if (ownerFilter === 'unassigned' && lead.assignedOwner) return false;

    // Missing info filter
    if (missingInfoFilter === 'missing' && !hasMissingInfo(lead)) return false;
    if (missingInfoFilter === 'complete' && hasMissingInfo(lead)) return false;

    // Date range filter
    if (dateRange && lead.submittedAt) {
      const submittedDate = new Date(lead.submittedAt);
      const [start, end] = dateRange;
      if (submittedDate < start || submittedDate > end) return false;
    }

    return true;
  });

  const handleCreate = async (values: Partial<Lead>) => {
    try {
      await mockApi.leads.create({
        ...values as any,
        status: LeadStatus.DRAFT,
      });
      message.success('线索创建成功');
      setCreateModalVisible(false);
      loadLeads();
    } catch (error) {
      message.error('线索创建失败');
      console.error(error);
    }
  };

  const handleEdit = async (values: Partial<Lead>) => {
    if (!selectedLead) return;

    try {
      await mockApi.leads.update(selectedLead.id, values);
      message.success('线索更新成功');
      setEditModalVisible(false);
      setSelectedLead(null);
      loadLeads();
    } catch (error) {
      message.error('线索更新失败');
      console.error(error);
    }
  };

  const handleView = (lead: Lead) => {
    navigate(`/leads/${lead.id}`);
  };

  const handleEditClick = (lead: Lead) => {
    // Permission check: Can only edit DRAFT or INFO_REQUESTED
    if (lead.status !== LeadStatus.DRAFT && lead.status !== LeadStatus.INFO_REQUESTED) {
      message.warning('只能编辑草稿或需补充信息状态的线索');
      return;
    }

    setSelectedLead(lead);
    setEditModalVisible(true);
  };

  const handleSubmitLead = (lead: Lead) => {
    Modal.confirm({
      title: '提交线索审核',
      icon: <ExclamationCircleOutlined />,
      content: '确定要提交此线索吗？线索将发送给运营团队审核。',
      okText: '提交',
      cancelText: '取消',
      onOk: async () => {
        try {
          // Check if required fields are complete
          if (hasMissingInfo(lead)) {
            message.warning('请先补全所有必填字段再提交');
            return;
          }

          // Use state machine to transition from DRAFT to SUBMITTED
          const result = LeadStateMachine.transition(
            {
              currentStatus: lead.status,
              actorType: ActorType.CO_SELECTOR,
              actorName: user?.displayName || '未知用户',
            },
            LeadStatus.SUBMITTED
          );

          if (!result.isValid) {
            message.error(result.error || '无法提交线索');
            return;
          }

          // Update lead with new status and timeline event
          await mockApi.leads.update(lead.id, {
            status: result.newStatus,
            timeline: [...lead.timeline, result.event],
            submittedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          });

          message.success('线索提交成功');
          loadLeads();
        } catch (error) {
          message.error('线索提交失败');
          console.error(error);
        }
      },
    });
  };

  const handleDuplicate = async (lead: Lead) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, timeline, ...leadData } = lead; // Omit id and timeline
      await mockApi.leads.create({
        ...leadData,
        merchantName: `${lead.merchantName}（副本）`,
        status: LeadStatus.DRAFT,
        submittedAt: undefined,
        lastUpdatedAt: new Date().toISOString(),
        assignedOwner: undefined,
      });
      message.success('线索复制成功');
      loadLeads();
    } catch (error) {
      message.error('线索复制失败');
      console.error(error);
    }
  };

  const handleDelete = (lead: Lead) => {
    Modal.confirm({
      title: '删除线索',
      content: '确定要删除此线索吗？此操作无法撤销。',
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await mockApi.leads.delete(lead.id);
          message.success('线索删除成功');
          loadLeads();
        } catch (error) {
          message.error('线索删除失败');
          console.error(error);
        }
      },
    });
  };

  // Configure table columns with action buttons
  const columns = getLeadsColumns().map((col) => {
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_: any, record: Lead) => (
          <Space size="small">
            <Button type="link" size="small" onClick={() => handleView(record)}>
              查看
            </Button>
            {canEdit && (record.status === LeadStatus.DRAFT || record.status === LeadStatus.INFO_REQUESTED) && (
              <Button type="link" size="small" onClick={() => handleEditClick(record)}>
                编辑
              </Button>
            )}
            {canSubmit && record.status === LeadStatus.DRAFT && (
              <Button type="link" size="small" onClick={() => handleSubmitLead(record)}>
                提交
              </Button>
            )}
            {canCreate && (
              <Button type="link" size="small" onClick={() => handleDuplicate(record)}>
                复制
              </Button>
            )}
            {canEdit && record.status === LeadStatus.DRAFT && (
              <Button type="link" size="small" danger onClick={() => handleDelete(record)}>
                删除
              </Button>
            )}
          </Space>
        ),
      };
    }
    return col;
  });

  return (
    <div className="leads-container">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>共选线索</h1>
            <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>提交并追踪商户线索的审核流程</p>
          </div>
          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              提交新线索
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 24, padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              options={leadFilterOptions.status}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="类目"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={leadFilterOptions.category}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="区域"
              value={regionFilter}
              onChange={setRegionFilter}
              options={leadFilterOptions.region}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="负责人分配"
              value={ownerFilter}
              onChange={setOwnerFilter}
              options={leadFilterOptions.ownerAssigned}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="缺失信息"
              value={missingInfoFilter}
              onChange={setMissingInfoFilter}
              options={leadFilterOptions.missingInfo}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={10}>
            <RangePicker
              placeholder={['提交起始日', '提交结束日']}
              onChange={(dates) => setDateRange(dates as any)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setRegionFilter('all');
                setOwnerFilter('all');
                setMissingInfoFilter('all');
                setDateRange(null);
              }}
            >
              清除筛选
            </Button>
          </Col>
        </Row>
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        dataSource={filteredLeads}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条线索`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Create Modal */}
      <LeadFormModal
        visible={createModalVisible}
        lead={null}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Modal */}
      <LeadFormModal
        visible={editModalVisible}
        lead={selectedLead}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedLead(null);
        }}
        onSubmit={handleEdit}
      />
    </div>
  );
};
