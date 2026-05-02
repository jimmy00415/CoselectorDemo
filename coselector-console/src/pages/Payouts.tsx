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
      <Title level={2}>提现管理</Title>
      <Paragraph type="secondary">
        申请并追踪你的提现
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Paragraph>
          带申请流程的提现模块将在此实现。
        </Paragraph>
      </Card>
    </div>
  );
};

export default PayoutsPage;
