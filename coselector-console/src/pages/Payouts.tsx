import React from 'react';
import { Typography, Card } from 'antd';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

/**
 * Payouts Page
 * Accessible from Earnings section
 */
const PayoutsPage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>Payout Management</Title>
      <Paragraph type="secondary">
        Request and track your payouts
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Paragraph>
          Payouts module with request workflow will be implemented here.
        </Paragraph>
      </Card>
    </div>
  );
};

export default PayoutsPage;
