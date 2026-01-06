import React from 'react';
import { Typography, Card, Collapse, Input } from 'antd';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import PageBreadcrumb from '../layout/PageBreadcrumb';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Help & Glossary Page
 * Per PRD §5.2: Accessible from top bar
 * Note: Dev tools are now globally available via Ctrl+Shift+D (DevToolsContext)
 */
const HelpPage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <div>
        <Title level={2}>
          <QuestionCircleOutlined /> Help & Glossary
        </Title>
        <Paragraph type="secondary">
          Find answers to common questions and understand key terms
        </Paragraph>
      </div>

      <Card style={{ marginTop: 24 }}>
        <Input
          placeholder="Search help topics..."
          prefix={<SearchOutlined />}
          size="large"
          style={{ marginBottom: 24 }}
        />

        <Collapse defaultActiveKey={['1']}>
          <Panel header="What is Co-Selection?" key="1">
            <Paragraph>
              Co-Selection is a partnership model where KOLs (Key Opinion Leaders) collaborate
              with brands to promote products and earn commissions based on performance.
            </Paragraph>
          </Panel>
          <Panel header="How do I track my earnings?" key="2">
            <Paragraph>
              Navigate to the Earnings section to view all transactions, including pending,
              payable, and paid amounts. You can filter by date range and view detailed
              transaction history.
            </Paragraph>
          </Panel>
          <Panel header="What is a Lead?" key="3">
            <Paragraph>
              A Lead represents a potential partnership opportunity. Leads go through various
              states: New → Under Review → Approved → Active → Completed.
            </Paragraph>
          </Panel>
          <Panel header="How do payouts work?" key="4">
            <Paragraph>
              Once your earnings reach the minimum threshold, you can request a payout. Payouts
              are processed according to the schedule and sent to your registered bank account.
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
};

export default HelpPage;
