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
import { formatCurrency, formatDate, getStatusColor } from '../utils';

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
      name: 'Sample Asset 1',
      type: 'Short Link',
      status: 'ACTIVE',
      amount: 1500.50,
      date: '2026-01-01',
    },
    {
      id: '2',
      name: 'Sample Asset 2',
      type: 'QR Code',
      status: 'PENDING',
      amount: 2300.75,
      date: '2026-01-02',
    },
    {
      id: '3',
      name: 'Sample Asset 3',
      type: 'Invite Code',
      status: 'LOCKED',
      amount: 980.00,
      date: '2026-01-03',
    },
  ];

  // Table columns
  const columns: DataTableColumn<SampleRecord>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      searchable: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Short Link', value: 'Short Link' },
        { text: 'QR Code', value: 'QR Code' },
        { text: 'Invite Code', value: 'Invite Code' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Date',
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
      label: 'View',
      icon: <EyeOutlined />,
      onClick: (record) => {
        setSelectedRecord(record);
        setDrawerVisible(true);
      },
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: (_record) => {
        // Edit functionality to be implemented
      },
    },
    {
      key: 'delete',
      label: 'Delete',
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
      title: 'Basic Information',
      collapsible: false,
      content: (
        <Descriptions column={1}>
          <Descriptions.Item label="Name">{selectedRecord?.name}</Descriptions.Item>
          <Descriptions.Item label="Type">{selectedRecord?.type}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(selectedRecord?.status || '')}>
              {selectedRecord?.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            {formatCurrency(selectedRecord?.amount || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Date">
            {formatDate(selectedRecord?.date || '')}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'details',
      title: 'Additional Details',
      defaultOpen: false,
      content: (
        <Paragraph>
          This is additional information about the selected record. It can contain
          any React component or HTML content.
        </Paragraph>
      ),
    },
  ];

  // Timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      actorType: ActorType.SYSTEM,
      actorName: 'System',
      occurredAt: '2026-01-04T10:00:00Z',
      eventType: 'Created',
      description: 'Record was created',
    },
    {
      id: '2',
      actorType: ActorType.CO_SELECTOR,
      actorName: 'John Doe',
      occurredAt: '2026-01-04T11:30:00Z',
      eventType: 'Status Changed',
      description: 'Status changed from Draft to Active',
      reasonCode: 'USER_ACTION',
    },
    {
      id: '3',
      actorType: ActorType.OPS,
      actorName: 'Admin User',
      occurredAt: '2026-01-04T14:15:00Z',
      eventType: 'Approved',
      description: 'Record approved for processing',
      reasonCode: 'VERIFICATION_COMPLETE',
    },
  ];

  // Filter configuration
  const filterConfig: FilterConfig[] = [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { label: 'Short Link', value: 'short_link' },
        { label: 'QR Code', value: 'qr_code' },
        { label: 'Invite Code', value: 'invite_code' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'multiSelect',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Locked', value: 'locked' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange',
      advanced: true,
    },
    {
      key: 'search',
      label: 'Search',
      type: 'input',
      placeholder: 'Search by name...',
      advanced: true,
    },
  ];

  return (
    <div className="app-content">
      <Title level={2}>Component Showcase</Title>
      <Paragraph>
        This page demonstrates all reusable components in the design system.
      </Paragraph>

      <Divider />

      {/* KPI Cards */}
      <section>
        <Title level={3}>KPI Cards</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard
              title="Total Revenue"
              value={formatCurrency(125000)}
              change={12.5}
              changeType="increase"
              tooltip="Total revenue for this period"
              onClick={() => {
                // Navigate to revenue detail
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard
              title="Active Assets"
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
              title="Conversion Rate"
              value="3.45%"
              change={8.1}
              changeType="increase"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard
              title="Pending Review"
              value={45}
              tooltip="Items waiting for review"
            />
          </Col>
        </Row>
      </section>

      <Divider />

      {/* Action Bar */}
      <section>
        <Title level={3}>Action Bar</Title>
        <ActionBar
          primaryAction={{
            label: 'Create New',
            icon: <PlusOutlined />,
            onClick: () => {
              // Open create modal
            },
          }}
          secondaryActions={[
            {
              label: 'Export',
              onClick: () => {
                // Export data
              },
            },
          ]}
          bulkActions={[
            {
              key: 'delete',
              label: 'Delete Selected',
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
        <Title level={3}>Data Table with Filters</Title>
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
              searchPlaceholder="Search records..."
              exportable
              onExport={() => {
                // Export data to CSV
              }}
              ariaLabel="Sample data table"
            />
          </Col>
        </Row>
      </section>

      <Divider />

      {/* Timeline */}
      <section>
        <Title level={3}>Timeline (Audit Trail)</Title>
        <Timeline events={timelineEvents} showRelativeTime />
      </section>

      <Divider />

      {/* Empty State */}
      <section>
        <Title level={3}>Empty State</Title>
        <EmptyState
          title="No data available"
          description="Get started by creating your first item"
          action={{
            label: 'Create Item',
            onClick: () => {
              // Open create dialog
            },
          }}
          secondaryAction={{
            label: 'Learn More',
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
        title={`Details: ${selectedRecord?.name || ''}`}
        sections={drawerSections}
        headerActions={
          <Button size="small" icon={<EditOutlined />}>
            Edit
          </Button>
        }
        footerActions={
          <>
            <Button onClick={() => setDrawerVisible(false)}>Close</Button>
            <Button type="primary">Save Changes</Button>
          </>
        }
      />

      {/* Confirm Modal */}
      <ConfirmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Delete Record?"
        message={`Are you sure you want to delete "${selectedRecord?.name}"?`}
        consequenceText="This action cannot be undone. The record will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
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
