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
import { translateStatus, translateText } from '../../utils/i18n';

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
          已逾期
        </Tag>
      );
    } else if (daysRemaining <= 2) {
      return (
        <Tag color="red" icon={<ClockCircleOutlined />}>
          剩余 {daysRemaining} 天
        </Tag>
      );
    } else if (daysRemaining <= 7) {
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          剩余 {daysRemaining} 天
        </Tag>
      );
    } else {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          正常
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
      title: '案件 ID',
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (type: string) => translateText(type) || '交易争议',
    },
    {
      title: '交易 ID',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: DisputeStatus) => (
        <Tag color={getStatusColor(status)}>{translateStatus(status)}</Tag>
      ),
      filters: [
        { text: '处理中', value: DisputeStatus.OPEN },
        { text: '等待中', value: DisputeStatus.WAITING },
        { text: '已解决', value: DisputeStatus.RESOLVED },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '截止时间',
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
      title: '证据',
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
      title: '打开时间',
      dataIndex: 'openedAt',
      key: 'openedAt',
      width: 140,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime(),
    },
    {
      title: '解决时间',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      width: 140,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: '操作',
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
          查看
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
        showTotal: (total) => `共 ${total} 个争议`,
      }}
      scroll={{ x: 1200 }}
    />
  );
};
