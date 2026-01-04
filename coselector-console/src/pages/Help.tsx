import React, { useState, useEffect } from 'react';
import { Typography, Card, Collapse, Input, Button, Space } from 'antd';
import { SearchOutlined, QuestionCircleOutlined, ToolOutlined } from '@ant-design/icons';
import PageBreadcrumb from '../layout/PageBreadcrumb';
import { DevToolsDrawer } from '../components/DevTools';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Help & Glossary Page
 * Per PRD §5.2: Accessible from top bar
 * Per PRD §9.3: Hidden dev tools accessible via special key combo
 */
const HelpPage: React.FC = () => {
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);

  // Listen for Ctrl+Shift+D to open dev tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDevToolsOpen(true);
      }

      // Easter egg: type "devmode" to show button
      const newSequence = [...keySequence, e.key].slice(-7);
      setKeySequence(newSequence);
      
      if (newSequence.join('').toLowerCase() === 'devmode') {
        const btn = document.getElementById('dev-tools-btn');
        if (btn) {
          btn.style.display = 'inline-block';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence]);

  return (
    <div>
      <PageBreadcrumb />
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Title level={2}>
            <QuestionCircleOutlined /> Help & Glossary
          </Title>
          <Paragraph type="secondary">
            Find answers to common questions and understand key terms
          </Paragraph>
        </div>
        <Button
          id="dev-tools-btn"
          icon={<ToolOutlined />}
          onClick={() => setDevToolsOpen(true)}
          style={{ display: 'none' }}
          type="dashed"
        >
          Dev Tools
        </Button>
      </Space>

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

      <DevToolsDrawer open={devToolsOpen} onClose={() => setDevToolsOpen(false)} />
    </div>
  );
};

export default HelpPage;
