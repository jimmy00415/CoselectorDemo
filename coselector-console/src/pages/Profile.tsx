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
      <Title level={2}>Profile & Compliance</Title>
      <Paragraph type="secondary">
        Manage your profile and compliance documentation
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Paragraph>
          Profile management and compliance documentation will be implemented here.
        </Paragraph>
      </Card>
    </div>
  );
};

export default ProfilePage;
