import React from 'react';
import { Typography, Card, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;

/**
 * Inbox Page
 * Per PRD §5.1: "Inbox" in primary navigation with sub-items
 */
const InboxPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>Inbox</Title>
      <Paragraph type="secondary">
        Notifications and dispute management
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Tabs
          defaultActiveKey="notifications"
          onChange={(key) => navigate(`/inbox/${key}`)}
          items={[
            {
              key: 'notifications',
              label: 'Notifications',
              children: <Paragraph>Notifications list will be displayed here</Paragraph>,
            },
            {
              key: 'disputes',
              label: 'Disputes',
              children: <Paragraph>Disputes management will be displayed here</Paragraph>,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default InboxPage;
