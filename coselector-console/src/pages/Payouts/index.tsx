import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Alert, message, Modal } from 'antd';
import {
  DollarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { RequestPayoutModal } from './RequestPayoutModal';
import { PayoutHistoryTable } from './PayoutHistoryTable';
import { PayoutDetailsDrawer } from './PayoutDetailsDrawer';
import type { Payout, Transaction } from '../../types';
import { PayoutStatus, EarningsState, ActorType } from '../../types/enums';
import { useAuth } from '../../contexts/AuthContext';
import { mockApi } from '../../services/mockApi';
import { PayoutStateMachine } from '../../services/stateMachines';
import { generateId } from '../../utils/helpers';
import { translateText } from '../../utils/i18n';
import './styles.css';

export const PayoutsPage: React.FC = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await mockApi.initializeData();
      const allPayouts = await mockApi.payouts.getAll();
      const allTransactions = await mockApi.transactions.getAll();
      setPayouts(allPayouts);
      setTransactions(allTransactions);
    } catch (error) {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  // Calculate payable balance
  const calculatePayableBalance = () => {
    return transactions
      .filter((t) => t.state === EarningsState.PAYABLE)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const payableBalance = calculatePayableBalance();

  // Check eligibility
  const checkEligibility = () => {
    const issues: string[] = [];

    if (!user) {
      issues.push('用户未登录');
      return { isEligible: false, issues };
    }

    // KYC check
    if (user.kycStatus !== 'APPROVED') {
      if (user.kycStatus === 'NOT_STARTED') {
        issues.push('KYC 验证未开始');
      } else if (user.kycStatus === 'SUBMITTED') {
        // Non-blocking for SUBMITTED (under review)
      } else if (user.kycStatus === 'REJECTED') {
        issues.push('KYC 验证已被拒绝');
      }
    }

    // Payout method check
    if (!user.bankAccount?.bankName) {
      issues.push('银行账户未配置');
    }

    // Minimum threshold check (example: $50)
    const minThreshold = 50;
    if (payableBalance < minThreshold) {
      issues.push(`可提现余额低于最低门槛（¥${minThreshold}）`);
    }

    // Account frozen check (example field)
    // if (user.accountFrozen) {
    //   issues.push('Account is frozen');
    // }

    return {
      isEligible: issues.length === 0,
      issues,
    };
  };

  const { isEligible, issues } = checkEligibility();

  // Handle payout request
  const handleRequestPayout = (amount: number) => {
    if (!user) {
      message.error('用户未登录');
      return;
    }

    // Re-validate payable balance
    const currentPayable = calculatePayableBalance();
    if (amount > currentPayable) {
      message.error(`金额超过可用余额：¥${currentPayable.toFixed(2)}`);
      return;
    }

    // Re-check payout method
    if (!user.bankAccount?.bankName) {
      message.error('请先设置银行账户');
      return;
    }

    // Get all payable transaction IDs
    const payableTransactionIds = transactions
      .filter((t) => t.state === EarningsState.PAYABLE)
      .map((t) => t.id);

    // Create new payout
    const newPayout: Payout = {
      id: generateId(),
      amount,
      status: PayoutStatus.REQUESTED,
      requestedAt: new Date().toISOString(),
      bankAccount: {
        bankName: user.bankAccount.bankName,
        accountNumber: user.bankAccount.accountNumber,
        accountHolder: user.bankAccount.accountHolder,
      },
      transactionIds: payableTransactionIds,
      timeline: [
        {
          id: generateId(),
          actorType: ActorType.CO_SELECTOR,
          actorName: user.displayName,
          occurredAt: new Date().toISOString(),
          eventType: '提现已申请',
          description: `已提交 ¥${amount.toFixed(2)} 的提现申请`,
          metadata: {
            amount,
            transactionCount: payableTransactionIds.length,
          },
        },
      ],
    };

    // Save payout
    mockApi.payouts.create(newPayout);

    // Update transactions state from PAYABLE to a locked state
    // (In real app, this would be handled by backend)
    // For prototype, we'll keep them as PAYABLE and just create the payout record

    setPayouts([...payouts, newPayout]);
    setRequestModalVisible(false);
    message.success('提现申请提交成功');
  };

  // Handle cancel payout
  const handleCancelPayout = (payoutId: string) => {
    const payout = payouts.find((p) => p.id === payoutId);
    if (!payout) return;

    if (payout.status !== PayoutStatus.REQUESTED) {
      message.error('只有已申请状态的提现可以取消');
      return;
    }

    Modal.confirm({
      title: '取消提现',
      icon: <ExclamationCircleOutlined />,
      content: '确定要取消此提现申请吗？',
      okText: '确认取消',
      okType: 'danger',
      cancelText: '不取消',
      onOk: () => {
        // Transition to CANCELLED state
        const result = PayoutStateMachine.transition(
          {
            currentStatus: payout.status,
            actorType: ActorType.CO_SELECTOR,
            actorName: user?.displayName || '用户',
            payoutAmount: payout.amount,
          },
          PayoutStatus.CANCELLED
        );

        if (!result.isValid) {
          message.error(result.error || '提现取消失败');
          return;
        }

        // Update payout
        const updatedPayout = {
          ...payout,
          status: result.newStatus,
          timeline: [...payout.timeline, result.event],
        };

        // Note: mockApi.payouts.update doesn't exist, we'll just update local state
        setPayouts(payouts.map((p) => (p.id === payoutId ? updatedPayout : p)));
        message.success('提现已取消');
      },
    });
  };

  // Handle view details
  const handleViewDetails = (payout: Payout) => {
    setSelectedPayout(payout);
    setDetailsDrawerVisible(true);
  };

  // Handle view transaction from drawer
  const handleViewTransaction = (transactionId: string) => {
    message.info(`跳转到交易：${transactionId}`);
    // In real app, navigate to Earnings tab and highlight this transaction
    setDetailsDrawerVisible(false);
  };

  return (
    <div className="payouts-container">
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        {/* Eligibility Banner */}
        {isEligible ? (
          <Alert
            type="success"
            title="符合提现条件"
            description={`你可以发起提现申请。可用余额：¥${payableBalance.toFixed(2)}`}
            icon={<CheckCircleOutlined />}
            showIcon
            action={
              <Button
                type="primary"
                size="small"
                icon={<DollarOutlined />}
                onClick={() => setRequestModalVisible(true)}
                disabled={payableBalance <= 0}
              >
                申请提现
              </Button>
            }
          />
        ) : (
          <Alert
            type="error"
            title="提现受阻"
            description={
              <Space orientation="vertical" size="small">
                <span>申请提现前请先解决以下问题：</span>
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  {issues.map((issue, index) => (
                    <li key={index}>{translateText(issue)}</li>
                  ))}
                </ul>
              </Space>
            }
            icon={<StopOutlined />}
            showIcon
            action={
              <Button type="primary" size="small" href="#/profile">
                立即处理
              </Button>
            }
          />
        )}

        {/* Payout History Table */}
        <Card title="提现历史">
          <PayoutHistoryTable
            payouts={payouts}
            loading={loading}
            onViewDetails={handleViewDetails}
            onCancelPayout={handleCancelPayout}
            currentUserRole={user?.role || 'AFFILIATE'}
          />
        </Card>
      </Space>

      {/* Request Payout Modal */}
      <RequestPayoutModal
        visible={requestModalVisible}
        maxPayable={payableBalance}
        userProfile={user}
        onSubmit={handleRequestPayout}
        onCancel={() => setRequestModalVisible(false)}
      />

      {/* Payout Details Drawer */}
      <PayoutDetailsDrawer
        visible={detailsDrawerVisible}
        payout={selectedPayout}
        onClose={() => setDetailsDrawerVisible(false)}
        onViewTransaction={handleViewTransaction}
      />
    </div>
  );
};

export default PayoutsPage;
