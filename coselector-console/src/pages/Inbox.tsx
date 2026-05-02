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
      <Title level={2}>收件箱</Title>
      <Paragraph type="secondary">
        管理通知与争议事项
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Tabs
          defaultActiveKey="notifications"
          onChange={(key) => navigate(`/inbox/${key}`)}
          items={[
            {
              key: 'notifications',
              label: '通知',
              children: <Paragraph>通知列表将在此展示</Paragraph>,
            },
            {
              key: 'disputes',
              label: '争议',
              children: <Paragraph>争议管理将在此展示</Paragraph>,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default InboxPage;
