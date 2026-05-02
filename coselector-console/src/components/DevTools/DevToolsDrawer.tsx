import React, { useState } from 'react';
import { Drawer, Tabs, Card, Button, InputNumber, Select, Space, message, Alert, Divider, Typography, Statistic, Row, Col } from 'antd';
import type { TabsProps } from 'antd';
import {
  ClockCircleOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { mockApi } from '../../services/mockApi';
import type { Transaction, Lead } from '../../types';
import { EarningsState, LeadStatus, KYCStatus, ReversalReason } from '../../types/enums';
import { useAuth } from '../../contexts/AuthContext';
import { translateReasonCode, translateStatus } from '../../utils/i18n';

const { Text, Title } = Typography;
const { Option } = Select;

interface DevToolsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const DevToolsDrawer: React.FC<DevToolsDrawerProps> = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [advanceDays, setAdvanceDays] = useState(30);
  const [selectedTransaction, setSelectedTransaction] = useState<string>('');
  const [reversalReason, setReversalReason] = useState<ReversalReason>(ReversalReason.REFUND);
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [targetLeadStatus, setTargetLeadStatus] = useState<LeadStatus>(LeadStatus.APPROVED);
  const [kycAction, setKycAction] = useState<'approve' | 'reject'>('approve');
  const [generateCount, setGenerateCount] = useState(10);

  // Load data for selectors
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  React.useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const txs = await mockApi.transactions.getAll();
      const lds = await mockApi.leads.getAll();
      setTransactions(txs.filter(t => t.state !== EarningsState.REVERSED));
      setLeads(lds);
    } catch (error) {
      message.error('数据加载失败');
    }
  };

  // Time Machine
  const handleAdvanceTime = async () => {
    setLoading(true);
    try {
      const txs = await mockApi.transactions.getAll();
      let updatedCount = 0;

      // Advance lock_end_at dates
      for (const tx of txs) {
        if (tx.lockEndAt && tx.state === EarningsState.LOCKED) {
          const lockEndDate = dayjs(tx.lockEndAt);
          const now = dayjs();
          const newLockEnd = lockEndDate.subtract(advanceDays, 'day');

          if (newLockEnd.isBefore(now)) {
            // Transition to PAYABLE
            await mockApi.transactions.transitionState(
              tx.id,
              {
                actorType: 'SYSTEM' as any,
                actorName: '系统',
                transactionAmount: tx.amount,
              },
              EarningsState.PAYABLE
            );
            updatedCount++;
          }
        }
      }

      message.success(`时间已推进 ${advanceDays} 天，${updatedCount} 笔交易已解锁。`);
      loadData();
    } catch (error) {
      message.error('推进时间失败');
    } finally {
      setLoading(false);
    }
  };

  // Transaction Reversal
  const handleTriggerReversal = async () => {
    if (!selectedTransaction) {
      message.warning('请选择交易');
      return;
    }

    setLoading(true);
    try {
      const tx = transactions.find(t => t.id === selectedTransaction);
      await mockApi.transactions.transitionState(
        selectedTransaction,
        {
          actorType: 'SYSTEM' as any,
          actorName: '开发工具',
          reasonCode: reversalReason,
          transactionAmount: tx?.amount || 0,
        },
        EarningsState.REVERSED
      );

      message.success('交易已成功冲正');
      setSelectedTransaction('');
      loadData();
    } catch (error) {
      message.error('交易冲正失败');
    } finally {
      setLoading(false);
    }
  };

  // Lead Status Changer
  const handleChangeLeadStatus = async () => {
    if (!selectedLead) {
      message.warning('请选择线索');
      return;
    }

    setLoading(true);
    try {
      const lead = leads.find(l => l.id === selectedLead);
      if (!lead) {
        message.error('未找到线索');
        return;
      }

      await mockApi.leads.transitionStatus(
        selectedLead,
        {
          actorType: 'OPS_BD' as any,
          actorName: '开发工具',
        },
        targetLeadStatus
      );

      message.success(`线索状态已变更为 ${translateStatus(targetLeadStatus)}`);
      setSelectedLead('');
      loadData();
    } catch (error) {
      message.error('线索状态变更失败');
    } finally {
      setLoading(false);
    }
  };

  // KYC Manager
  const handleKycAction = async () => {
    if (!user) {
      message.error('未找到用户');
      return;
    }

    setLoading(true);
    try {
      const newStatus = kycAction === 'approve' ? KYCStatus.APPROVED : KYCStatus.REJECTED;
      const updates: any = {
        kycStatus: newStatus,
      };

      if (kycAction === 'approve') {
        updates.kycApprovedAt = new Date().toISOString();
      } else {
        updates.kycRejectionReason = '用于测试的模拟拒绝';
      }

      await updateUser(updates);
      message.success(`KYC 已${kycAction === 'approve' ? '通过' : '拒绝'}`);
    } catch (error) {
      message.error('KYC 状态更新失败');
    } finally {
      setLoading(false);
    }
  };

  // Event Generator
  const handleGenerateEvents = async () => {
    setLoading(true);
    try {
      // Note: In real implementation, would save these via mockApi
      // Simulating generation without storing for demo purposes
      message.success(`已生成 ${generateCount} 个新事件（模拟）`);
    } catch (error) {
      message.error('事件生成失败');
    } finally {
      setLoading(false);
    }
  };

  // Data Reset
  const handleResetData = async () => {
    setLoading(true);
    try {
      await mockApi.resetToSeedData();
      message.success('数据已重置为种子状态');
      loadData();
      window.location.reload(); // Reload to refresh all data
    } catch (error) {
      message.error('重置数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    try {
      await mockApi.clearAllData();
      message.success('所有数据已清除');
      loadData();
    } catch (error) {
      message.error('清除数据失败');
    } finally {
      setLoading(false);
    }
  };

  const tabs: TabsProps['items'] = [
    {
      key: 'time',
      label: (
        <Space>
          <ClockCircleOutlined />
          时间机器
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="info"
            message="模拟时间推进"
            description="推进系统时间以解锁交易，并测试基于截止时间的功能。"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>时间推进：</Text>
                <InputNumber
                  value={advanceDays}
                  onChange={(val) => setAdvanceDays(val || 0)}
                  min={1}
                  max={365}
                  addonAfter="天"
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="已锁定交易"
                    value={transactions.filter(t => t.state === EarningsState.LOCKED).length}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="将解锁"
                    value={transactions.filter(t => 
                      t.state === EarningsState.LOCKED && 
                      t.lockEndAt && 
                      dayjs(t.lockEndAt).subtract(advanceDays, 'day').isBefore(dayjs())
                    ).length}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              </Row>

              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleAdvanceTime}
                loading={loading}
                block
                size="large"
              >
                推进时间
              </Button>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'reversal',
      label: (
        <Space>
          <SwapOutlined />
          冲正
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="warning"
            message="触发交易冲正"
            description="模拟退款、拒付或欺诈冻结，以测试冲正处理。"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>选择交易：</Text>
                <Select
                  value={selectedTransaction}
                  onChange={setSelectedTransaction}
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="选择要冲正的交易"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={transactions.map(tx => ({
                    value: tx.id,
                    label: `${tx.id.substring(0, 8)} - ¥${tx.amount}（${translateStatus(tx.state)}）`,
                  }))}
                />
              </div>

              <div>
                <Text strong>冲正原因：</Text>
                <Select
                  value={reversalReason}
                  onChange={setReversalReason}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value={ReversalReason.REFUND}>{translateReasonCode(ReversalReason.REFUND)}</Option>
                  <Option value={ReversalReason.DISPUTE_CHARGEBACK}>{translateReasonCode(ReversalReason.DISPUTE_CHARGEBACK)}</Option>
                  <Option value={ReversalReason.FRAUD_HOLD}>{translateReasonCode(ReversalReason.FRAUD_HOLD)}</Option>
                  <Option value={ReversalReason.ORDER_VOID_CANCEL}>{translateReasonCode(ReversalReason.ORDER_VOID_CANCEL)}</Option>
                  <Option value={ReversalReason.SYSTEM_REATTRIBUTED}>{translateReasonCode(ReversalReason.SYSTEM_REATTRIBUTED)}</Option>
                </Select>
              </div>

              <Button
                danger
                icon={<SwapOutlined />}
                onClick={handleTriggerReversal}
                loading={loading}
                disabled={!selectedTransaction}
                block
                size="large"
              >
                触发冲正
              </Button>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'leads',
      label: (
        <Space>
          <CheckCircleOutlined />
          线索
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="info"
            message="模拟线索审核"
            description="变更线索状态以测试通过/拒绝工作流。"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>选择线索：</Text>
                <Select
                  value={selectedLead}
                  onChange={setSelectedLead}
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="选择线索"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={leads.map(lead => ({
                    value: lead.id,
                    label: `${lead.merchantName}（${translateStatus(lead.status)}）`,
                  }))}
                />
              </div>

              <div>
                <Text strong>变更状态为：</Text>
                <Select
                  value={targetLeadStatus}
                  onChange={setTargetLeadStatus}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value={LeadStatus.APPROVED}>{translateStatus(LeadStatus.APPROVED)}</Option>
                  <Option value={LeadStatus.REJECTED}>{translateStatus(LeadStatus.REJECTED)}</Option>
                  <Option value={LeadStatus.INFO_REQUESTED}>{translateStatus(LeadStatus.INFO_REQUESTED)}</Option>
                  <Option value={LeadStatus.UNDER_REVIEW}>{translateStatus(LeadStatus.UNDER_REVIEW)}</Option>
                </Select>
              </div>

              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleChangeLeadStatus}
                loading={loading}
                disabled={!selectedLead}
                block
                size="large"
              >
                变更状态
              </Button>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'kyc',
      label: (
        <Space>
          <CheckCircleOutlined />
          KYC
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="info"
            message="KYC 状态管理"
            description="通过或拒绝 KYC 提交，以测试提现资格流程。"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>当前 KYC 状态：</Text>
                <div style={{ marginTop: 8 }}>
                  <Text code>{translateStatus(user?.kycStatus || 'NOT_STARTED')}</Text>
                </div>
              </div>

              <div>
                <Text strong>操作：</Text>
                <Select
                  value={kycAction}
                  onChange={setKycAction}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="approve">通过 KYC</Option>
                  <Option value="reject">拒绝 KYC</Option>
                </Select>
              </div>

              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleKycAction}
                loading={loading}
                block
                size="large"
              >
                执行操作
              </Button>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'generate',
      label: (
        <Space>
          <ThunderboltOutlined />
          生成
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="info"
            message="事件生成器"
            description="创建新的点击、注册和订单事件用于测试。"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>事件数量：</Text>
                <InputNumber
                  value={generateCount}
                  onChange={(val) => setGenerateCount(val || 0)}
                  min={1}
                  max={100}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>

              <Alert
                type="warning"
                message="模拟生成"
                description="这将模拟事件生成。刷新页面可查看实际变化。"
                showIcon
              />

              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleGenerateEvents}
                loading={loading}
                block
                size="large"
              >
                生成事件
              </Button>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'data',
      label: (
        <Space>
          <ReloadOutlined />
          数据
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="warning"
            message="数据管理"
            description="重置或清除所有数据，请谨慎使用。"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={5}>重置为种子数据</Title>
                <Text type="secondary">
                  恢复包含默认值的原始种子数据。
                </Text>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleResetData}
                  loading={loading}
                  block
                  size="large"
                  style={{ marginTop: 12 }}
                >
                  重置数据
                </Button>
              </div>

              <Divider />

              <div>
                <Title level={5}>清除所有数据</Title>
                <Text type="secondary">
                  从 localStorage 删除所有数据。此操作无法撤销。
                </Text>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleClearData}
                  loading={loading}
                  block
                  size="large"
                  style={{ marginTop: 12 }}
                >
                  清除所有数据
                </Button>
              </div>
            </Space>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <span>开发工具</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
    >
      <Alert
        type="warning"
        message="仅限原型工具"
        description="这些工具用于测试和演示，通过 localStorage 模拟后端操作。"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Tabs items={tabs} defaultActiveKey="time" />
    </Drawer>
  );
};
