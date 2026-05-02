import React from 'react';
import { Typography, Card } from 'antd';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

const NotificationsPage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>通知</Title>
      <Card style={{ marginTop: 24 }}>
        <Paragraph>通知详情视图将在此实现。</Paragraph>
      </Card>
    </div>
  );
};

export default NotificationsPage;
