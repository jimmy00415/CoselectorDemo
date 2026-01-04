import React from 'react';
import { Typography, Card } from 'antd';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

/**
 * Leads (Co-selection) Page
 * Per PRD §5.1: "Co-selection" in primary navigation
 */
const LeadsPage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>Co-selection Leads</Title>
      <Paragraph type="secondary">
        Manage partnership opportunities and applications
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Paragraph>
          Leads module with state machine workflow will be implemented here.
        </Paragraph>
      </Card>
    </div>
  );
};

export default LeadsPage;
