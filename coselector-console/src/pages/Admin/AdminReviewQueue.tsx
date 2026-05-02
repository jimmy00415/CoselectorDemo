import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Tag, message } from 'antd';
import { EyeOutlined, UserAddOutlined } from '@ant-design/icons';
import { Lead } from '../../types';
import { LeadStatus, ActorType } from '../../types/enums';
import { mockApi } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '../../components/PermissionGuard';
import { Permission } from '../../services/permissions';
import { formatDate, generateId, translateCategory, translateRegion, translateStatus } from '../../utils';
import './styles.css';

/**
 * Admin Review Queue
 * Per Sprint 1 §8.1: OPS/BD Admin Review Queue
 * 
 * Features:
 * - Filters: Status (Submitted, Under Review, Info Requested), Submitted date, Assigned to
 * - Columns: Lead ID, Merchant, Submitted at, Status, Owner, COI flag, Last activity
 * - Inline actions: Claim (if unassigned), View
 * - Opens detail on row click
 * - Internal only for OPS_BD role
 * 
 * Sprint 1 §8.2 Claim Flow:
 * - Immediate UI update: owner = current ops user
 * - Timeline event OWNER_ASSIGNED (actor=OPS_BD, reason_code=CLAIMED)
 * - Toast "Claimed"
 */

const { Title, Text } = Typography;

export const AdminReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingLeadId, setClaimingLeadId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<LeadStatus[]>([
    LeadStatus.SUBMITTED,
    LeadStatus.UNDER_REVIEW,
    LeadStatus.INFO_REQUESTED,
  ]);
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'unassigned' | 'me'>('unassigned');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const allLeads = await mockApi.leads.getAll();
      
      // Apply filters
      let filtered = allLeads.filter(lead => statusFilter.includes(lead.status));
      
      // Owner filter
      if (ownerFilter === 'unassigned') {
        filtered = filtered.filter(lead => !lead.assignedOwner);
      } else if (ownerFilter === 'me') {
        filtered = filtered.filter(lead => lead.assignedOwner === user?.displayName);
      }
      
      // Date range filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        filtered = filtered.filter(lead => {
          if (!lead.submittedAt) return false;
          const submitDate = new Date(lead.submittedAt);
          return submitDate >= new Date(dateRange[0]) && submitDate <= new Date(dateRange[1]);
        });
      }
      
      // Sort: Unassigned first (pinned), then by submitted date desc
      filtered.sort((a, b) => {
        // Unassigned first
        if (!a.assignedOwner && b.assignedOwner) return -1;
        if (a.assignedOwner && !b.assignedOwner) return 1;
        
        // Then by submitted date (newest first)
        const aDate = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bDate = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bDate - aDate;
      });
      
      setLeads(filtered);
    } catch (error) {
      console.error('Failed to load leads:', error);
      message.error('线索加载失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, ownerFilter, dateRange, user]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Sprint 1 §8.2: Claim Flow
  const handleClaim = async (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    
    if (!user?.displayName) {
      message.error('用户信息不可用');
      return;
    }

    setClaimingLeadId(lead.id);
    
    try {
      // Create OWNER_ASSIGNED timeline event per Sprint 1 §8.2
      const event = {
        id: generateId(),
        actorType: ActorType.OPS_BD,
        actorName: user.displayName,
        occurredAt: new Date().toISOString(),
        eventType: 'OWNER_ASSIGNED',
        description: `线索已由 ${user.displayName} 认领`,
        reasonCode: 'CLAIMED',
        metadata: {
          previousOwner: lead.assignedOwner,
          newOwner: user.displayName,
        },
      };

      // Update lead with new owner and timeline event
      await mockApi.leads.update(lead.id, {
        assignedOwner: user.displayName,
        timeline: [...lead.timeline, event],
        lastUpdatedAt: new Date().toISOString(),
      });

      message.success('线索认领成功');
      loadLeads();
    } catch (error) {
      console.error('Failed to claim lead:', error);
      message.error('线索认领失败');
    } finally {
      setClaimingLeadId(null);
    }
  };

  const handleRowClick = (lead: Lead) => {
    navigate(`/leads/${lead.id}`);
  };

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

  return (
    <PermissionGuard permission={Permission.LEAD_CHANGE_STATUS} mode="hide">
      <div className="admin-review-queue">
        <div className="page-header">
          <Title level={2}>管理审核队列</Title>
          <Text type="secondary">
            仅内部使用 - 运营/BD 线索审核与分配
          </Text>
        </div>

        {/* Filters */}
        <div className="filter-section" style={{ marginBottom: 24 }}>
          <Space size="large" wrap>
            <Space direction="vertical" size={4}>
              <Text strong>状态筛选</Text>
              <Space wrap>
                {[LeadStatus.SUBMITTED, LeadStatus.UNDER_REVIEW, LeadStatus.INFO_REQUESTED].map(status => (
                  <Tag.CheckableTag
                    key={status}
                    checked={statusFilter.includes(status)}
                    onChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, status]);
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== status));
                      }
                    }}
                  >
                    {translateStatus(status)}
                  </Tag.CheckableTag>
                ))}
              </Space>
            </Space>

            <Space direction="vertical" size={4}>
              <Text strong>负责人筛选</Text>
              <Space>
                <Tag.CheckableTag
                  checked={ownerFilter === 'all'}
                  onChange={() => setOwnerFilter('all')}
                >
                  全部
                </Tag.CheckableTag>
                <Tag.CheckableTag
                  checked={ownerFilter === 'unassigned'}
                  onChange={() => setOwnerFilter('unassigned')}
                >
                  未分配（置顶）
                </Tag.CheckableTag>
                <Tag.CheckableTag
                  checked={ownerFilter === 'me'}
                  onChange={() => setOwnerFilter('me')}
                >
                  我的线索
                </Tag.CheckableTag>
              </Space>
            </Space>
          </Space>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">共 {leads.length} 条线索</Text>
        </div>

        {/* Table */}
        <div className="leads-table">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>加载中...</div>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Text type="secondary">没有符合当前筛选条件的线索</Text>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>商户</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>提交时间</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>状态</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>负责人</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>最近活动</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const isUnassigned = !lead.assignedOwner;
                  const isClaiming = claimingLeadId === lead.id;
                  
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => handleRowClick(lead)}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        backgroundColor: isUnassigned ? '#fffbe6' : 'transparent',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isUnassigned ? '#fffbe6' : 'transparent'}
                    >
                      <td style={{ padding: '12px 8px' }}>
                        <Space direction="vertical" size={0}>
                          <Text strong>{lead.merchantName}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {translateCategory(lead.category)} · {translateRegion(lead.city)}, {translateRegion(lead.region)}
                          </Text>
                        </Space>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Text>{lead.submittedAt ? formatDate(lead.submittedAt) : '不适用'}</Text>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Tag color={statusColors[lead.status]}>
                          {translateStatus(lead.status)}
                        </Tag>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {lead.assignedOwner ? (
                          <Text>{lead.assignedOwner}</Text>
                        ) : (
                          <Text type="secondary">未分配</Text>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(lead.lastUpdatedAt)}
                        </Text>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <Space size="small">
                          {/* Claim button - only for unassigned leads per Sprint 1 §8.1 */}
                          {isUnassigned && (
                            <Button
                              type="primary"
                              size="small"
                              icon={<UserAddOutlined />}
                              onClick={(e) => handleClaim(lead, e)}
                              loading={isClaiming}
                            >
                              认领
                            </Button>
                          )}
                          
                          {/* View button */}
                          <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(lead);
                            }}
                          >
                            查看
                          </Button>
                        </Space>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default AdminReviewQueue;
