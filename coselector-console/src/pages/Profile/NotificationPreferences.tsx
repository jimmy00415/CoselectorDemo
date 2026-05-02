import React, { useState } from 'react';
import { Card, Form, Radio, Checkbox, Alert, Button, Space, Divider, Typography } from 'antd';
import { BellOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import type { UserProfile } from '../../types';

const { Title, Text } = Typography;

interface NotificationPreferencesProps {
  userProfile: UserProfile;
  onSave: (preferences: NotificationSettings) => void;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  // Critical notifications (cannot disable)
  criticalNotifications: {
    kycRejected: boolean;
    accountFrozen: boolean;
    disputeDeadline: boolean;
    payoutFailed: boolean;
  };
  // Important notifications (default ON)
  importantNotifications: {
    transactionLocked: boolean;
    payoutApproved: boolean;
    leadApproved: boolean;
    leadRejected: boolean;
  };
  // Informational notifications (default OFF)
  informationalNotifications: {
    policyUpdates: boolean;
    rulebookVersion: boolean;
    monthlyStatement: boolean;
  };
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userProfile,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  const defaultSettings: NotificationSettings = {
    emailEnabled: true,
    smsEnabled: false,
    criticalNotifications: {
      kycRejected: true,
      accountFrozen: true,
      disputeDeadline: true,
      payoutFailed: true,
    },
    importantNotifications: {
      transactionLocked: true,
      payoutApproved: true,
      leadApproved: true,
      leadRejected: true,
    },
    informationalNotifications: {
      policyUpdates: false,
      rulebookVersion: false,
      monthlyStatement: true,
    },
  };

  const initialValues = userProfile.notificationPreferences || defaultSettings;

  const handleSave = () => {
    const values = form.getFieldsValue();
    onSave(values);
    setHasChanges(false);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultSettings);
    setHasChanges(true);
  };

  return (
    <Card
      title={
        <Space>
          <BellOutlined />
          通知偏好
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={() => setHasChanges(true)}
      >
        {/* Delivery Methods */}
        <Title level={5}>送达方式</Title>
        <Form.Item label="邮件通知" name="emailEnabled" valuePropName="checked">
          <Checkbox>向 {userProfile.email} 启用邮件通知</Checkbox>
        </Form.Item>

        <Form.Item label="短信通知" name="smsEnabled" valuePropName="checked">
          <Checkbox>向 {userProfile.phone || '（未设置）'} 启用短信通知</Checkbox>
        </Form.Item>

        <Divider />

        {/* Critical Notifications */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={5}>
            <Space>
              <LockOutlined style={{ color: '#ff4d4f' }} />
              关键通知（不可关闭）
            </Space>
          </Title>
          <Alert
            type="warning"
            message="出于合规和安全原因，这些通知为强制开启。"
            showIcon
            style={{ marginBottom: 8 }}
          />

          <Form.Item name={['criticalNotifications', 'kycRejected']} valuePropName="checked">
            <Checkbox checked disabled>
              <Space>
                <Text strong>KYC 被拒绝</Text>
                <Text type="secondary">- 身份验证失败</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['criticalNotifications', 'accountFrozen']} valuePropName="checked">
            <Checkbox checked disabled>
              <Space>
                <Text strong>账户冻结</Text>
                <Text type="secondary">- 账户已暂停或正在审核</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['criticalNotifications', 'disputeDeadline']} valuePropName="checked">
            <Checkbox checked disabled>
              <Space>
                <Text strong>争议截止时间临近</Text>
                <Text type="secondary">- 需在 48 小时内回复</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['criticalNotifications', 'payoutFailed']} valuePropName="checked">
            <Checkbox checked disabled>
              <Space>
                <Text strong>提现失败</Text>
                <Text type="secondary">- 银行转账未成功</Text>
              </Space>
            </Checkbox>
          </Form.Item>
        </Space>

        <Divider />

        {/* Important Notifications */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={5}>
            <Space>
              <SafetyOutlined style={{ color: '#1890ff' }} />
              重要通知（推荐开启）
            </Space>
          </Title>

          <Form.Item
            name={['importantNotifications', 'transactionLocked']}
            valuePropName="checked"
          >
            <Checkbox>
              <Space>
                <Text strong>交易已锁定</Text>
                <Text type="secondary">- 收益已进入锁定状态</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['importantNotifications', 'payoutApproved']} valuePropName="checked">
            <Checkbox>
              <Space>
                <Text strong>提现已批准</Text>
                <Text type="secondary">- 提现请求已由财务批准</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['importantNotifications', 'leadApproved']} valuePropName="checked">
            <Checkbox>
              <Space>
                <Text strong>线索已通过</Text>
                <Text type="secondary">- 线索提交已接受</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['importantNotifications', 'leadRejected']} valuePropName="checked">
            <Checkbox>
              <Space>
                <Text strong>线索已拒绝</Text>
                <Text type="secondary">- 线索提交已被拒绝</Text>
              </Space>
            </Checkbox>
          </Form.Item>
        </Space>

        <Divider />

        {/* Informational Notifications */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={5}>
            <Space>
              <BellOutlined style={{ color: '#52c41a' }} />
              信息通知（可选）
            </Space>
          </Title>

          <Form.Item
            name={['informationalNotifications', 'policyUpdates']}
            valuePropName="checked"
          >
            <Checkbox>
              <Space>
                <Text strong>政策更新</Text>
                <Text type="secondary">- 条款和政策变更</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item
            name={['informationalNotifications', 'rulebookVersion']}
            valuePropName="checked"
          >
            <Checkbox>
              <Space>
                <Text strong>规则手册版本更新</Text>
                <Text type="secondary">- 新佣金规则版本已发布</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item
            name={['informationalNotifications', 'monthlyStatement']}
            valuePropName="checked"
          >
            <Checkbox>
              <Space>
                <Text strong>月度对账单可用</Text>
                <Text type="secondary">- 新收益对账单可下载</Text>
              </Space>
            </Checkbox>
          </Form.Item>
        </Space>

        <Divider />

        <Space>
          <Button type="primary" onClick={handleSave} disabled={!hasChanges}>
            保存偏好
          </Button>
          <Button onClick={handleReset}>重置为默认值</Button>
        </Space>
      </Form>
    </Card>
  );
};
