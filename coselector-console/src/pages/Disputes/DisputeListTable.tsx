import React from 'react';
import { Table, Tag, Space, Button, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { DisputeCase } from '../../types';
import { DisputeStatus } from '../../types/enums';
import { formatDate } from '../../utils/format';

interface DisputeListTableProps {
  disputes: DisputeCase[];
  onViewDetails: (disputeId: string) => void;
  loading?: boolean;
}

export const DisputeListTable: React.FC<DisputeListTableProps> = ({
  disputes,
  onViewDetails,
  loading = false,
}) => {
  // Calculate days until deadline
  const getDaysUntilDeadline = (deadlineAt?: string): number => {
    if (!deadlineAt) return 999;
    const now = new Date();
    const deadline = new Date(deadlineAt);
    const diffMs = deadline.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Get deadline urgency tag
  const getDeadlineTag = (deadlineAt?: string, status?: DisputeStatus) => {
    if (status === DisputeStatus.RESOLVED || !deadlineAt) {
      return null;
    }

    const daysRemaining = getDaysUntilDeadline(deadlineAt);

    if (daysRemaining <= 0) {
      return (
        <Tag color="red" icon={<ExclamationCircleOutlined />}>
          OVERDUE
        </Tag>
      );
    } else if (daysRemaining <= 2) {
      return (
        <Tag color="red" icon={<ClockCircleOutlined />}>
          {daysRemaining}d left
        </Tag>
      );
    } else if (daysRemaining <= 7) {
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          {daysRemaining}d left
        </Tag>
      );
    } else {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          On track
        </Tag>
      );
    }
  };

  // Get status color
  const getStatusColor = (status: DisputeStatus): string => {
    switch (status) {
      case DisputeStatus.OPEN:
        return 'blue';
      case DisputeStatus.WAITING:
      case DisputeStatus.WAITING_FOR_RESPONSE:
        return 'orange';
      case DisputeStatus.RESOLVED:
        return 'green';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<DisputeCase> = [
    {
      title: 'Case ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Tooltip title={id}>
          <span style={{ fontFamily: 'monospace' }}>#{id.substring(0, 8)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (type: string) => type || 'Transaction Dispute',
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 140,
      render: (txId: string) => (
        <Tooltip title={txId}>
          <span style={{ fontFamily: 'monospace' }}>#{txId.substring(0, 8)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: DisputeStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: 'Open', value: DisputeStatus.OPEN },
        { text: 'Waiting', value: DisputeStatus.WAITING },
        { text: 'Resolved', value: DisputeStatus.RESOLVED },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Deadline',
      dataIndex: 'deadlineAt',
      key: 'deadlineAt',
      width: 160,
      render: (deadlineAt: string, record) => (
        <Space direction="vertical" size="small">
          <span>{formatDate(deadlineAt)}</span>
          {getDeadlineTag(deadlineAt, record.status)}
        </Space>
      ),
      sorter: (a, b) => {
        const aTime = a.deadlineAt ? new Date(a.deadlineAt).getTime() : 0;
        const bTime = b.deadlineAt ? new Date(b.deadlineAt).getTime() : 0;
        return aTime - bTime;
      },
    },
    {
      title: 'Evidence',
      key: 'evidence',
      width: 120,
      render: (_, record) => {
        const uploaded = record.evidence.filter(e => e).length;
        const required = record.requiredEvidenceCount || 3;
        const complete = uploaded >= required;

        return (
          <Tag color={complete ? 'green' : 'orange'}>
            {uploaded} / {required}
          </Tag>
        );
      },
    },
    {
      title: 'Opened',
      dataIndex: 'openedAt',
      key: 'openedAt',
      width: 140,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime(),
    },
    {
      title: 'Resolved',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      width: 140,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails(record.id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={disputes}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} dispute${total !== 1 ? 's' : ''}`,
      }}
      scroll={{ x: 1200 }}
    />
  );
};
