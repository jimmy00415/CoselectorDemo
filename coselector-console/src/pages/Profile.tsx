import React from 'react';
import { Typography, Card } from 'antd';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

/**
 * Profile & Compliance Page
 * Per PRD §5.1: "Profile & Compliance" in primary navigation
 */
const ProfilePage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>资料与合规</Title>
      <Paragraph type="secondary">
        管理你的资料和合规文件
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Paragraph>
          资料管理和合规文件将在此处实现。
        </Paragraph>
      </Card>
    </div>
  );
};

export default ProfilePage;
