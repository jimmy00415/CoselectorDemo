import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import {
  DollarOutlined,
  RiseOutlined,
  TeamOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import PageBreadcrumb from '../layout/PageBreadcrumb';
import { KPICard } from '../components';

const { Title, Paragraph } = Typography;

/**
 * Home Page / Dashboard
 * 
 * Per PRD §5.1: First item in primary navigation
 * Per PRD §6: Overview-first drill-down pattern
 */
const HomePage: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb />
      <Title level={2}>仪表盘</Title>
      <Paragraph type="secondary">
        查看你的协同遴选表现与近期活动概览
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="累计收益"
            value="¥12,450.00"
            change={15.3}
            changeType="increase"
            prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="启用链接"
            value="24"
            change={12.5}
            changeType="increase"
            prefix={<LinkOutlined style={{ color: '#1890ff' }} />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="待处理线索"
            value="8"
            change={-20}
            changeType="decrease"
            prefix={<TeamOutlined style={{ color: '#faad14' }} />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="转化率"
            value="12.5%"
            change={2.1}
            changeType="increase"
            prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="近期活动">
            <Paragraph>近期活动时间线将在此展示</Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="快捷操作">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>快捷操作按钮将在此展示</Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
