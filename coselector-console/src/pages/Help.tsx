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
          <QuestionCircleOutlined /> 帮助与术语表
        </Title>
        <Paragraph type="secondary">
          查看常见问题答案，并了解关键术语
        </Paragraph>
      </div>

      <Card style={{ marginTop: 24 }}>
        <Input
          placeholder="搜索帮助主题..."
          prefix={<SearchOutlined />}
          size="large"
          style={{ marginBottom: 24 }}
        />

        <Collapse defaultActiveKey={['1']}>
          <Panel header="什么是协同遴选？" key="1">
            <Paragraph>
              协同遴选是一种合作模式，KOL 或合作伙伴与品牌协作推广产品，并根据实际表现获得佣金。
            </Paragraph>
          </Panel>
          <Panel header="如何追踪我的收益？" key="2">
            <Paragraph>
              进入收益页面即可查看全部交易，包括待锁定、可提现和已支付金额。你也可以按日期范围筛选并查看详细交易历史。
            </Paragraph>
          </Panel>
          <Panel header="什么是线索？" key="3">
            <Paragraph>
              线索代表一个潜在合作机会。线索会经历草稿、审核中、已通过、已拒绝等状态。
            </Paragraph>
          </Panel>
          <Panel header="提现如何运作？" key="4">
            <Paragraph>
              当收益达到最低提现门槛后，你可以发起提现申请。提现会按处理节奏审核并打款到已登记账户。
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
};

export default HelpPage;
