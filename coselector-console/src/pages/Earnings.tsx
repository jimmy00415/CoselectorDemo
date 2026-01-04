import React from 'react';
import { Typography, Card } from 'antd';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

/**
 * Earnings (Transactions) Page
 * Per PRD §5.1: "Earnings" in primary navigation
 */
const EarningsPage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>Earnings & Transactions</Title>
      <Paragraph type="secondary">
        Track your revenue and transaction history
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Paragraph>
          Earnings module with transaction tracking will be implemented here.
        </Paragraph>
      </Card>
    </div>
  );
};

export default EarningsPage;
