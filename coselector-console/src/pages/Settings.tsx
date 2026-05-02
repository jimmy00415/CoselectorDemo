import React from 'react';
import { Typography, Card } from 'antd';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

const SettingsPage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>设置</Title>
      <Card style={{ marginTop: 24 }}>
        <Paragraph>用户设置和偏好将在此处实现。</Paragraph>
      </Card>
    </div>
  );
};

export default SettingsPage;
