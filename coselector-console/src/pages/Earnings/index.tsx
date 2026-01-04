import { useState, useEffect } from 'react';
import { Tabs, Table, message, Button, Space } from 'antd';
import { 
  DollarOutlined, 
  UnorderedListOutlined, 
  BankOutlined, 
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Transaction } from '../../types';
import { EarningsState } from '../../types/enums';
import { mockApi } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { EarningsOverview } from './EarningsOverview';
import { TransactionTraceDrawer } from './TransactionTraceDrawer';
import { getTransactionColumns, getDaysUntilLock, canLockNow } from './config';
import { EarningsStateMachine } from '../../services/stateMachines';
import { StatementsPage } from '../Statements';
import './styles.css';

/**
 * Earnings Module - Main Page
 * Per PRD §7.5: Complete earnings lifecycle management
 * 
 * Tabs:
 * 1. Overview - Balance summary, lock distribution, reversal rate
 * 2. Transactions - Table with trace drawer
 * 3. Payouts - Payout request and history (placeholder)
 * 4. Statements - Monthly statements (placeholder)
 * 
 * Critical Features:
 * - Auto-transition pending → locked when lock_end_at passes
 * - Single trace drawer (replace on click)
 * - Filter by state or lock date range
 */

export const Earnings: React.FC = () => {
  const { user, role } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [traceDrawerVisible, setTraceDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stateFilter, setStateFilter] = useState<EarningsState | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    // Apply filters
    if (stateFilter) {
      setFilteredTransactions(transactions.filter(tx => tx.state === stateFilter));
    } else {
      setFilteredTransactions(transactions);
    }
  }, [transactions, stateFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await mockApi.transactions.getAll();
      
      // Auto-lock eligible pending transactions
      const updated = await autoLockTransactions(data);
      
      setTransactions(updated);
      setFilteredTransactions(updated);
    } catch (error) {
      message.error('Failed to load transactions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-lock transactions where lock_end_at has passed
   * Per PM/SE agreement: Background simulation on page load
   */
  const autoLockTransactions = async (txs: Transaction[]): Promise<Transaction[]> => {
    const updated = [...txs];
    let hasChanges = false;

    for (let i = 0; i < updated.length; i++) {
      const tx = updated[i];
      
      if (tx.state === EarningsState.PENDING && canLockNow(tx.lockEndAt)) {
        try {
          // Transition using state machine
          const result = EarningsStateMachine.transition(
            {
              currentState: tx.state,
              actorType: 'SYSTEM' as any,
              actorName: 'System Auto-Lock',
              lockEndDate: tx.lockEndAt,
              transactionAmount: tx.amount,
            },
            EarningsState.LOCKED
          );

          if (result.isValid) {
            updated[i] = {
              ...tx,
              state: result.newState,
              timeline: [...tx.timeline, result.event],
            };
            
            // Update in storage
            await mockApi.transactions.transitionState(
              tx.id,
              {
                actorType: 'SYSTEM' as any,
                actorName: 'System Auto-Lock',
                lockEndDate: tx.lockEndAt,
                transactionAmount: tx.amount,
              },
              EarningsState.LOCKED
            );
            
            hasChanges = true;
          }
        } catch (error) {
          console.error(`Failed to auto-lock transaction ${tx.id}:`, error);
        }
      }
    }

    if (hasChanges) {
      message.success('Pending transactions auto-locked');
    }

    return updated;
  };

  const handleViewTrace = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTraceDrawerVisible(true);
  };

  const handleCloseTrace = () => {
    setTraceDrawerVisible(false);
    // Keep selectedTransaction for a moment to avoid flicker
    setTimeout(() => setSelectedTransaction(null), 300);
  };

  const handleFilterByState = (state: EarningsState) => {
    setStateFilter(state);
    setActiveTab('transactions');
    message.info(`Filtered transactions by state: ${state}`);
  };

  const handleFilterByLockRange = (minDays: number, maxDays: number) => {
    const now = new Date();
    const filtered = transactions.filter(tx => {
      if (tx.state !== EarningsState.PENDING) return false;
      
      const daysUntil = getDaysUntilLock(tx.lockEndAt);
      return daysUntil >= minDays && daysUntil <= maxDays;
    });

    setFilteredTransactions(filtered);
    setStateFilter(null);
    setActiveTab('transactions');
    message.info(`Filtered ${filtered.length} transactions locking in ${minDays}-${maxDays} days`);
  };

  const handleClearFilters = () => {
    setStateFilter(null);
    setFilteredTransactions(transactions);
    message.success('Filters cleared');
  };

  // Check eligibility (placeholder logic)
  const isEligible = user?.kycStatus === 'APPROVED';
  const eligibilityIssues = [
    ...(user?.kycStatus !== 'APPROVED' ? [{ label: 'KYC Verification', action: 'Submit KYC', actionUrl: '/profile' }] : []),
    ...(!user?.bankAccount ? [{ label: 'Payout Method', action: 'Add Bank Account', actionUrl: '/profile' }] : []),
  ];

  const columns = getTransactionColumns(handleViewTrace);

  return (
    <div className="earnings-container">
      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Earnings & Payouts</h1>
          <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
            Track your earnings lifecycle from pending to paid
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadTransactions}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <DollarOutlined />
                Overview
              </span>
            ),
            children: (
              <EarningsOverview
                transactions={transactions}
                onFilterByState={handleFilterByState}
                onFilterByLockRange={handleFilterByLockRange}
                isEligible={isEligible}
                eligibilityIssues={eligibilityIssues}
              />
            ),
          },
          {
            key: 'transactions',
            label: (
              <span>
                <UnorderedListOutlined />
                Transactions
              </span>
            ),
            children: (
              <div>
                {/* Filter indicator */}
                {stateFilter && (
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <span>Filtered by state: <strong>{stateFilter}</strong></span>
                      <Button size="small" onClick={handleClearFilters}>
                        Clear Filter
                      </Button>
                    </Space>
                  </div>
                )}

                <Table
                  columns={columns}
                  dataSource={filteredTransactions}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} transactions`,
                  }}
                  scroll={{ x: 1200 }}
                  onRow={(record) => ({
                    onClick: () => {
                      // Click row to open trace (alternative to action button)
                      if (selectedTransaction?.id === record.id) {
                        handleCloseTrace();
                      } else {
                        handleViewTrace(record);
                      }
                    },
                    style: {
                      cursor: 'pointer',
                      backgroundColor: selectedTransaction?.id === record.id ? '#e6f7ff' : undefined,
                    },
                  })}
                />
              </div>
            ),
          },
          {
            key: 'payouts',
            label: (
              <span>
                <BankOutlined />
                Payouts
              </span>
            ),
            children: <div style={{ padding: 24 }}>Payouts feature available in dedicated Payouts page</div>,
          },
          {
            key: 'statements',
            label: (
              <span>
                <FileTextOutlined />
                Statements
              </span>
            ),
            children: <StatementsPage />,
          },
        ]}
      />

      {/* Trace Drawer */}
      <TransactionTraceDrawer
        visible={traceDrawerVisible}
        transaction={selectedTransaction}
        onClose={handleCloseTrace}
      />
    </div>
  );
};
