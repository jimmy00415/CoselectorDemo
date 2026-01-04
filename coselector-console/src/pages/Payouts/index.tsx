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
import type { Payout, Transaction, UserProfile } from '../../types';
import { PayoutStatus, EarningsState, ActorType } from '../../types/enums';
import { useAuth } from '../../contexts/AuthContext';
import { mockApi } from '../../services/mockApi';
import { PayoutStateMachine } from '../../services/stateMachines';
import { generateId } from '../../utils/helpers';
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
      const allPayouts = await mockApi.payouts.getAll();
      const allTransactions = await mockApi.transactions.getAll();
      setPayouts(allPayouts);
      setTransactions(allTransactions);
    } catch (error) {
      message.error('Failed to load data');
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
      issues.push('User not logged in');
      return { isEligible: false, issues };
    }

    // KYC check
    if (user.kycStatus !== 'APPROVED') {
      if (user.kycStatus === 'NOT_STARTED') {
        issues.push('KYC verification not started');
      } else if (user.kycStatus === 'SUBMITTED') {
        // Non-blocking for SUBMITTED (under review)
      } else if (user.kycStatus === 'REJECTED') {
        issues.push('KYC verification rejected');
      }
    }

    // Payout method check
    if (!user.bankAccount?.bankName) {
      issues.push('Bank account not configured');
    }

    // Minimum threshold check (example: $50)
    const minThreshold = 50;
    if (payableBalance < minThreshold) {
      issues.push(`Payable balance below minimum threshold (¥${minThreshold})`);
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
      message.error('User not logged in');
      return;
    }

    // Re-validate payable balance
    const currentPayable = calculatePayableBalance();
    if (amount > currentPayable) {
      message.error(`Amount exceeds available balance: ¥${currentPayable.toFixed(2)}`);
      return;
    }

    // Re-check payout method
    if (!user.bankAccount?.bankName) {
      message.error('Please set up your bank account first');
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
          eventType: 'Payout Requested',
          description: `Withdrawal request submitted for ¥${amount.toFixed(2)}`,
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
    message.success('Payout request submitted successfully');
  };

  // Handle cancel payout
  const handleCancelPayout = (payoutId: string) => {
    const payout = payouts.find((p) => p.id === payoutId);
    if (!payout) return;

    if (payout.status !== PayoutStatus.REQUESTED) {
      message.error('Only requested payouts can be cancelled');
      return;
    }

    Modal.confirm({
      title: 'Cancel Payout',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to cancel this payout request?',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        // Transition to CANCELLED state
        const result = PayoutStateMachine.transition(
          {
            currentStatus: payout.status,
            actorType: ActorType.CO_SELECTOR,
            actorName: user?.displayName || 'User',
            payoutAmount: payout.amount,
          },
          PayoutStatus.CANCELLED
        );

        if (!result.isValid) {
          message.error(result.error || 'Failed to cancel payout');
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
        message.success('Payout cancelled successfully');
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
    message.info(`Navigate to transaction: ${transactionId}`);
    // In real app, navigate to Earnings tab and highlight this transaction
    setDetailsDrawerVisible(false);
  };

  return (
    <div className="payouts-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Eligibility Banner */}
        {isEligible ? (
          <Alert
            type="success"
            message="Eligible for Payout"
            description={`You can request a withdrawal. Available balance: ¥${payableBalance.toFixed(2)}`}
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
                Request Withdrawal
              </Button>
            }
          />
        ) : (
          <Alert
            type="error"
            message="Payout Blocked"
            description={
              <Space direction="vertical" size="small">
                <span>Please resolve the following issues before requesting a payout:</span>
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  {issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </Space>
            }
            icon={<StopOutlined />}
            showIcon
            action={
              <Button type="primary" size="small" href="/profile">
                Fix Now
              </Button>
            }
          />
        )}

        {/* Payout History Table */}
        <Card title="Payout History">
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
