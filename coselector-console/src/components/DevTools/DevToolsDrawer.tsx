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
      message.error('Failed to load data');
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
                actorName: 'System',
                transactionAmount: tx.amount,
              },
              EarningsState.PAYABLE
            );
            updatedCount++;
          }
        }
      }

      message.success(`Time advanced ${advanceDays} days. ${updatedCount} transactions unlocked.`);
      loadData();
    } catch (error) {
      message.error('Failed to advance time');
    } finally {
      setLoading(false);
    }
  };

  // Transaction Reversal
  const handleTriggerReversal = async () => {
    if (!selectedTransaction) {
      message.warning('Please select a transaction');
      return;
    }

    setLoading(true);
    try {
      const tx = transactions.find(t => t.id === selectedTransaction);
      await mockApi.transactions.transitionState(
        selectedTransaction,
        {
          actorType: 'SYSTEM' as any,
          actorName: 'Dev Tools',
          reasonCode: reversalReason,
          transactionAmount: tx?.amount || 0,
        },
        EarningsState.REVERSED
      );

      message.success('Transaction reversed successfully');
      setSelectedTransaction('');
      loadData();
    } catch (error) {
      message.error('Failed to reverse transaction');
    } finally {
      setLoading(false);
    }
  };

  // Lead Status Changer
  const handleChangeLeadStatus = async () => {
    if (!selectedLead) {
      message.warning('Please select a lead');
      return;
    }

    setLoading(true);
    try {
      const lead = leads.find(l => l.id === selectedLead);
      if (!lead) {
        message.error('Lead not found');
        return;
      }

      await mockApi.leads.transitionStatus(
        selectedLead,
        {
          actorType: 'OPS_BD' as any,
          actorName: 'Dev Tools',
        },
        targetLeadStatus
      );

      message.success(`Lead status changed to ${targetLeadStatus}`);
      setSelectedLead('');
      loadData();
    } catch (error) {
      message.error('Failed to change lead status');
    } finally {
      setLoading(false);
    }
  };

  // KYC Manager
  const handleKycAction = async () => {
    if (!user) {
      message.error('User not found');
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
        updates.kycRejectionReason = 'Simulated rejection for testing purposes';
      }

      await updateUser(updates);
      message.success(`KYC ${kycAction === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      message.error('Failed to update KYC status');
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
      message.success(`Generated ${generateCount} new events (simulated)`);
    } catch (error) {
      message.error('Failed to generate events');
    } finally {
      setLoading(false);
    }
  };

  // Data Reset
  const handleResetData = async () => {
    setLoading(true);
    try {
      await mockApi.resetToSeedData();
      message.success('Data reset to seed state successfully');
      loadData();
      window.location.reload(); // Reload to refresh all data
    } catch (error) {
      message.error('Failed to reset data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    try {
      await mockApi.clearAllData();
      message.success('All data cleared successfully');
      loadData();
    } catch (error) {
      message.error('Failed to clear data');
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
          Time Machine
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="info"
            message="Simulate Time Passage"
            description="Advance system time to unlock transactions and test deadline-based features."
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Advance Time By:</Text>
                <InputNumber
                  value={advanceDays}
                  onChange={(val) => setAdvanceDays(val || 0)}
                  min={1}
                  max={365}
                  addonAfter="days"
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Locked Transactions"
                    value={transactions.filter(t => t.state === EarningsState.LOCKED).length}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Will Unlock"
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
                Advance Time
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
          Reversal
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="warning"
            message="Trigger Transaction Reversal"
            description="Simulate refunds, chargebacks, or fraud holds to test reversal handling."
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Select Transaction:</Text>
                <Select
                  value={selectedTransaction}
                  onChange={setSelectedTransaction}
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Choose a transaction to reverse"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={transactions.map(tx => ({
                    value: tx.id,
                    label: `${tx.id.substring(0, 8)} - ¥${tx.amount} (${tx.state})`,
                  }))}
                />
              </div>

              <div>
                <Text strong>Reversal Reason:</Text>
                <Select
                  value={reversalReason}
                  onChange={setReversalReason}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value={ReversalReason.REFUND}>Refund</Option>
                  <Option value={ReversalReason.DISPUTE_CHARGEBACK}>Dispute/Chargeback</Option>
                  <Option value={ReversalReason.FRAUD_HOLD}>Fraud Hold</Option>
                  <Option value={ReversalReason.ORDER_VOID_CANCEL}>Order Void/Cancel</Option>
                  <Option value={ReversalReason.SYSTEM_REATTRIBUTED}>System Reattributed</Option>
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
                Trigger Reversal
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
          Leads
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="info"
            message="Simulate Lead Review"
            description="Change lead status to test approval/rejection workflows."
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Select Lead:</Text>
                <Select
                  value={selectedLead}
                  onChange={setSelectedLead}
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Choose a lead"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={leads.map(lead => ({
                    value: lead.id,
                    label: `${lead.merchantName} (${lead.status})`,
                  }))}
                />
              </div>

              <div>
                <Text strong>Change Status To:</Text>
                <Select
                  value={targetLeadStatus}
                  onChange={setTargetLeadStatus}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value={LeadStatus.APPROVED}>Approved</Option>
                  <Option value={LeadStatus.REJECTED}>Rejected</Option>
                  <Option value={LeadStatus.INFO_REQUESTED}>Info Requested</Option>
                  <Option value={LeadStatus.UNDER_REVIEW}>Under Review</Option>
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
                Change Status
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
            message="KYC Status Manager"
            description="Approve or reject KYC submissions to test payout eligibility flows."
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Current KYC Status:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text code>{user?.kycStatus || 'NOT_STARTED'}</Text>
                </div>
              </div>

              <div>
                <Text strong>Action:</Text>
                <Select
                  value={kycAction}
                  onChange={setKycAction}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="approve">Approve KYC</Option>
                  <Option value="reject">Reject KYC</Option>
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
                Execute Action
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
          Generate
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="info"
            message="Event Generator"
            description="Create new clicks, registrations, and orders for testing."
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Number of Events:</Text>
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
                message="Simulated Generation"
                description="This will simulate event generation. Refresh the page to see real changes."
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
                Generate Events
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
          Data
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Alert
            type="warning"
            message="Data Management"
            description="Reset or clear all data. Use with caution!"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={5}>Reset to Seed Data</Title>
                <Text type="secondary">
                  Restore original seed data with all default values.
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
                  Reset Data
                </Button>
              </div>

              <Divider />

              <div>
                <Title level={5}>Clear All Data</Title>
                <Text type="secondary">
                  Delete all data from localStorage. Cannot be undone.
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
                  Clear All Data
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
          <span>Development Tools</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
    >
      <Alert
        type="warning"
        message="Prototype Tools Only"
        description="These tools are for testing and demonstration purposes. They simulate backend operations using localStorage."
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Tabs items={tabs} defaultActiveKey="time" />
    </Drawer>
  );
};
