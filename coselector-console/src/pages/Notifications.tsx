import React from 'react';
import { Typography, Card } from 'antd';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

const NotificationsPage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>Notifications</Title>
      <Card style={{ marginTop: 24 }}>
        <Paragraph>Detailed notifications view will be implemented here.</Paragraph>
      </Card>
    </div>
  );
};

export default NotificationsPage;
