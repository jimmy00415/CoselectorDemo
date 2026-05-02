import React, { useState } from 'react';
import { Row, Col, Button, Tag, Descriptions, Typography, Divider } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  DataTable,
  DetailsDrawer,
  ConfirmModal,
  Timeline,
  FilterRail,
  ActionBar,
  KPICard,
  EmptyState,
} from '../components';
import type { DataTableColumn, RowAction, DrawerSection, FilterConfig } from '../components';
import { TimelineEvent } from '../types';
import { ActorType } from '../types/enums';
import { formatCurrency, formatDate, getStatusColor, translateStatus } from '../utils';

const { Title, Paragraph } = Typography;

interface SampleRecord {
  id: string;
  name: string;
  type: string;
  status: string;
  amount: number;
  date: string;
}

/**
 * Component Showcase Page
 * Demonstrates all reusable components
 */
const ComponentShowcase: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SampleRecord | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sample data for table
  const sampleData: SampleRecord[] = [
    {
      id: '1',
      name: '示例资产 1',
      type: '短链接',
      status: 'ACTIVE',
      amount: 1500.50,
      date: '2026-01-01',
    },
    {
      id: '2',
      name: '示例资产 2',
      type: '二维码',
      status: 'PENDING',
      amount: 2300.75,
      date: '2026-01-02',
    },
    {
      id: '3',
      name: '示例资产 3',
      type: '邀请码',
      status: 'LOCKED',
      amount: 980.00,
      date: '2026-01-03',
    },
  ];

  // Table columns
  const columns: DataTableColumn<SampleRecord>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      searchable: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: '短链接', value: '短链接' },
        { text: '二维码', value: '二维码' },
        { text: '邀请码', value: '邀请码' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{translateStatus(status)}</Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => formatDate(date),
    },
  ];

  // Row actions
  const rowActions: RowAction<SampleRecord>[] = [
    {
      key: 'view',
      label: '查看',
      icon: <EyeOutlined />,
      onClick: (record) => {
        setSelectedRecord(record);
        setDrawerVisible(true);
      },
    },
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: (_record) => {
        // Edit functionality to be implemented
      },
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: (record) => {
        setSelectedRecord(record);
        setModalVisible(true);
      },
    },
  ];

  // Drawer sections
  const drawerSections: DrawerSection[] = [
    {
      key: 'basic',
      title: '基础信息',
      collapsible: false,
      content: (
        <Descriptions column={1}>
          <Descriptions.Item label="名称">{selectedRecord?.name}</Descriptions.Item>
          <Descriptions.Item label="类型">{selectedRecord?.type}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(selectedRecord?.status || '')}>
              {translateStatus(selectedRecord?.status || '')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="金额">
            {formatCurrency(selectedRecord?.amount || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="日期">
            {formatDate(selectedRecord?.date || '')}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'details',
      title: '补充详情',
      defaultOpen: false,
      content: (
        <Paragraph>
          这里展示所选记录的补充信息，可放置任意 React 组件或 HTML 内容。
        </Paragraph>
      ),
    },
  ];

  // Timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      actorType: ActorType.SYSTEM,
      actorName: '系统',
      occurredAt: '2026-01-04T10:00:00Z',
      eventType: 'Created',
      description: '记录已创建',
    },
    {
      id: '2',
      actorType: ActorType.CO_SELECTOR,
      actorName: '张三',
      occurredAt: '2026-01-04T11:30:00Z',
      eventType: 'Status Changed',
      description: '状态已从草稿变更为启用',
      reasonCode: 'USER_ACTION',
    },
    {
      id: '3',
      actorType: ActorType.OPS,
      actorName: '管理员',
      occurredAt: '2026-01-04T14:15:00Z',
      eventType: 'Approved',
      description: '记录已批准处理',
      reasonCode: 'VERIFICATION_COMPLETE',
    },
  ];

  // Filter configuration
  const filterConfig: FilterConfig[] = [
    {
      key: 'type',
      label: '类型',
      type: 'select',
      options: [
        { label: '短链接', value: 'short_link' },
        { label: '二维码', value: 'qr_code' },
        { label: '邀请码', value: 'invite_code' },
      ],
    },
    {
      key: 'status',
      label: '状态',
      type: 'multiSelect',
      options: [
        { label: '启用', value: 'active' },
        { label: '待处理', value: 'pending' },
        { label: '已锁定', value: 'locked' },
      ],
    },
    {
      key: 'dateRange',
      label: '日期范围',
      type: 'dateRange',
      advanced: true,
    },
    {
      key: 'search',
      label: '搜索',
      type: 'input',
      placeholder: '按名称搜索...',
      advanced: true,
    },
  ];

  return (
    <div className="app-content">
      <Title level={2}>组件展示</Title>
      <Paragraph>
        此页面展示设计系统中的所有可复用组件。
      </Paragraph>

      <Divider />

      {/* KPI Cards */}
      <section>
        <Title level={3}>KPI 卡片</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard
              title="总收入"
              value={formatCurrency(125000)}
              change={12.5}
              changeType="increase"
              tooltip="本周期总收入"
              onClick={() => {
                // Navigate to revenue detail
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard
              title="启用资产"
              value={1523}
              change={-3.2}
              changeType="decrease"
              onClick={() => {
                // Navigate to assets list
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard
              title="转化率"
              value="3.45%"
              change={8.1}
              changeType="increase"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard
              title="待审核"
              value={45}
              tooltip="等待审核的项目"
            />
          </Col>
        </Row>
      </section>

      <Divider />

      {/* Action Bar */}
      <section>
        <Title level={3}>操作栏</Title>
        <ActionBar
          primaryAction={{
            label: '新建',
            icon: <PlusOutlined />,
            onClick: () => {
              // Open create modal
            },
          }}
          secondaryActions={[
            {
              label: '导出',
              onClick: () => {
                // Export data
              },
            },
          ]}
          bulkActions={[
            {
              key: 'delete',
              label: '删除所选',
              danger: true,
              onClick: () => {
                // Bulk delete action
              },
            },
          ]}
          selectedCount={0}
        />
      </section>

      <Divider />

      {/* Data Table with Filters */}
      <section>
        <Title level={3}>带筛选的数据表</Title>
        <Row gutter={16}>
          <Col xs={24} lg={6}>
            <FilterRail
              filters={filterConfig}
              values={filterValues}
              onChange={(key, value) => {
                setFilterValues({ ...filterValues, [key]: value });
              }}
              onClear={() => setFilterValues({})}
              showAdvanced={showAdvancedFilters}
              onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
            />
          </Col>
          <Col xs={24} lg={18}>
            <DataTable
              data={sampleData}
              columns={columns}
              rowKey="id"
              loading={false}
              rowActions={rowActions}
              onRowClick={(record) => {
                setSelectedRecord(record);
                setDrawerVisible(true);
              }}
              refreshable
              onRefresh={() => {
                // Refresh table data
              }}
              searchable
              searchPlaceholder="搜索记录..."
              exportable
              onExport={() => {
                // Export data to CSV
              }}
              ariaLabel="示例数据表"
            />
          </Col>
        </Row>
      </section>

      <Divider />

      {/* Timeline */}
      <section>
        <Title level={3}>时间线（审计轨迹）</Title>
        <Timeline events={timelineEvents} showRelativeTime />
      </section>

      <Divider />

      {/* Empty State */}
      <section>
        <Title level={3}>空状态</Title>
        <EmptyState
          title="暂无数据"
          description="创建第一个项目开始使用"
          action={{
            label: '创建项目',
            onClick: () => {
              // Open create dialog
            },
          }}
          secondaryAction={{
            label: '了解更多',
            onClick: () => {
              // Open documentation
            },
          }}
        />
      </section>

      {/* Details Drawer */}
      <DetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title={`详情：${selectedRecord?.name || ''}`}
        sections={drawerSections}
        headerActions={
          <Button size="small" icon={<EditOutlined />}>
            编辑
          </Button>
        }
        footerActions={
          <>
            <Button onClick={() => setDrawerVisible(false)}>关闭</Button>
            <Button type="primary">保存更改</Button>
          </>
        }
      />

      {/* Confirm Modal */}
      <ConfirmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="删除记录？"
        message={`确定要删除“${selectedRecord?.name}”吗？`}
        consequenceText="此操作无法撤销。记录将被永久删除。"
        confirmText="删除"
        cancelText="取消"
        danger
        onConfirm={async () => {
          // Simulate async delete operation
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setModalVisible(false);
        }}
      />
    </div>
  );
};

export default ComponentShowcase;
