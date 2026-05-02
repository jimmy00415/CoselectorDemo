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
      <Title level={2}>收益与交易</Title>
      <Paragraph type="secondary">
        追踪你的收益和交易历史
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Paragraph>
          收益模块和交易追踪将在此实现。
        </Paragraph>
      </Card>
    </div>
  );
};

export default EarningsPage;
