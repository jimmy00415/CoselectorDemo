import React from 'react';
import { Typography, Card } from 'antd';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

const SettingsPage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>Settings</Title>
      <Card style={{ marginTop: 24 }}>
        <Paragraph>User settings and preferences will be implemented here.</Paragraph>
      </Card>
    </div>
  );
};

export default SettingsPage;
