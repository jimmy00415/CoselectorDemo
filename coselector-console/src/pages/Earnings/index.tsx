import { useCallback, useState, useEffect } from 'react';
import { Tabs, Table, message, Button, Space } from 'antd';
import { 
  DollarOutlined, 
  UnorderedListOutlined, 
  BankOutlined, 
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Transaction } from '../../types';
import type { TrackingAsset } from '../../types';
import { EarningsState, KYCStatus } from '../../types/enums';
import { mockApi } from '../../services/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { EarningsOverview } from './EarningsOverview';
import { TransactionTraceDrawer } from './TransactionTraceDrawer';
import { getTransactionColumns, getDaysUntilLock, canLockNow } from './config';
import { EarningsStateMachine } from '../../services/stateMachines';
import PayoutsPage from '../Payouts';
import { StatementsPage } from '../Statements';
import { translateStatus } from '../../utils';
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
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<TrackingAsset[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [traceDrawerVisible, setTraceDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stateFilter, setStateFilter] = useState<EarningsState | null>(null);

  useEffect(() => {
    // Apply filters
    if (stateFilter) {
      setFilteredTransactions(transactions.filter(tx => tx.state === stateFilter));
    } else {
      setFilteredTransactions(transactions);
    }
  }, [transactions, stateFilter]);

  /**
   * Auto-lock transactions where lock_end_at has passed
   * Per PM/SE agreement: Background simulation on page load
   */
  const autoLockTransactions = useCallback(async (txs: Transaction[]): Promise<Transaction[]> => {
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
              actorName: '系统自动锁定',
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
                actorName: '系统自动锁定',
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
      message.success('待锁定交易已自动锁定');
    }

    return updated;
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      await mockApi.initializeData();
      const [data, assetData] = await Promise.all([
        mockApi.transactions.getAll(),
        mockApi.assets.getAll(),
      ]);
      
      // Auto-lock eligible pending transactions
      const updated = await autoLockTransactions(data);
      
      setTransactions(updated);
      setAssets(assetData);
      setFilteredTransactions(updated);
    } catch (error) {
      message.error('交易加载失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [autoLockTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

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
    message.info(`已按状态筛选交易：${translateStatus(state)}`);
  };

  const handleFilterByLockRange = (minDays: number, maxDays: number) => {
    const filtered = transactions.filter(tx => {
      if (tx.state !== EarningsState.PENDING) return false;
      
      const daysUntil = getDaysUntilLock(tx.lockEndAt);
      return daysUntil >= minDays && daysUntil <= maxDays;
    });

    setFilteredTransactions(filtered);
    setStateFilter(null);
    setActiveTab('transactions');
    message.info(`已筛选 ${filtered.length} 笔将在 ${minDays}-${maxDays} 天内锁定的交易`);
  };

  const handleClearFilters = () => {
    setStateFilter(null);
    setFilteredTransactions(transactions);
    message.success('筛选已清除');
  };

  const kycReady = user?.kycStatus === KYCStatus.APPROVED || user?.kycStatus === KYCStatus.VERIFIED;
  const isEligible = !!kycReady && !!user?.bankAccount;
  const eligibilityIssues = [
    ...(!kycReady ? [{ label: 'KYC 验证', action: '提交 KYC', actionUrl: '#/profile' }] : []),
    ...(!user?.bankAccount ? [{ label: '提现方式', action: '添加银行账户', actionUrl: '#/profile' }] : []),
  ];

  const columns = getTransactionColumns(handleViewTrace);

  return (
    <div className="earnings-container">
      {/* Page Header */}
      <div className="earnings-page-titlebar">
        <div>
          <h1>浏览与收益</h1>
          <p>
            按 SPU 链接看清平台浏览线索、转化质量、抽佣结果和每日收益节奏
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadTransactions}
          loading={loading}
        >
          刷新
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
                总览
              </span>
            ),
            children: (
              <EarningsOverview
                transactions={transactions}
                assets={assets}
                onFilterByState={handleFilterByState}
                onFilterByLockRange={handleFilterByLockRange}
                onOpenPayouts={() => setActiveTab('payouts')}
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
                交易追踪
              </span>
            ),
            children: (
              <div>
                {/* Filter indicator */}
                {stateFilter && (
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <span>按状态筛选：<strong>{translateStatus(stateFilter)}</strong></span>
                      <Button size="small" onClick={handleClearFilters}>
                        清除筛选
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
                    showTotal: (total) => `共 ${total} 笔交易`,
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
                提现
              </span>
            ),
            children: <PayoutsPage />,
          },
          {
            key: 'statements',
            label: (
              <span>
                <FileTextOutlined />
                对账单
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
        assets={assets}
        onClose={handleCloseTrace}
      />
    </div>
  );
};

export default Earnings;
