import React from 'react';
import { StatementList } from './StatementList';
import type { Transaction, Payout } from '../../types';
import { mockApi } from '../../services/mockApi';

export const StatementsPage: React.FC = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [payouts, setPayouts] = React.useState<Payout[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const txs = await mockApi.transactions.getAll();
      const pys = await mockApi.payouts.getAll();
      setTransactions(txs);
      setPayouts(pys);
    };
    loadData();
  }, []);

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <StatementList transactions={transactions} payouts={payouts} />
    </div>
  );
};
