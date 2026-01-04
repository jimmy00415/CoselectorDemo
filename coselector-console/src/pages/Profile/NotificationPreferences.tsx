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
          Notification Preferences
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
        <Title level={5}>Delivery Methods</Title>
        <Form.Item label="Email Notifications" name="emailEnabled" valuePropName="checked">
          <Checkbox>Enable email notifications to {userProfile.email}</Checkbox>
        </Form.Item>

        <Form.Item label="SMS Notifications" name="smsEnabled" valuePropName="checked">
          <Checkbox>Enable SMS notifications to {userProfile.phone || '(not set)'}</Checkbox>
        </Form.Item>

        <Divider />

        {/* Critical Notifications */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={5}>
            <Space>
              <LockOutlined style={{ color: '#ff4d4f' }} />
              Critical Notifications (Cannot be disabled)
            </Space>
          </Title>
          <Alert
            type="warning"
            message="These notifications are mandatory for compliance and security reasons."
            showIcon
            style={{ marginBottom: 8 }}
          />

          <Form.Item name={['criticalNotifications', 'kycRejected']} valuePropName="checked">
            <Checkbox checked disabled>
              <Space>
                <Text strong>KYC Rejected</Text>
                <Text type="secondary">- Identity verification failed</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['criticalNotifications', 'accountFrozen']} valuePropName="checked">
            <Checkbox checked disabled>
              <Space>
                <Text strong>Account Frozen</Text>
                <Text type="secondary">- Account suspended or under review</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['criticalNotifications', 'disputeDeadline']} valuePropName="checked">
            <Checkbox checked disabled>
              <Space>
                <Text strong>Dispute Deadline Approaching</Text>
                <Text type="secondary">- Response required within 48 hours</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['criticalNotifications', 'payoutFailed']} valuePropName="checked">
            <Checkbox checked disabled>
              <Space>
                <Text strong>Payout Failed</Text>
                <Text type="secondary">- Bank transfer unsuccessful</Text>
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
              Important Notifications (Recommended)
            </Space>
          </Title>

          <Form.Item
            name={['importantNotifications', 'transactionLocked']}
            valuePropName="checked"
          >
            <Checkbox>
              <Space>
                <Text strong>Transaction Locked</Text>
                <Text type="secondary">- Earnings moved to locked state</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['importantNotifications', 'payoutApproved']} valuePropName="checked">
            <Checkbox>
              <Space>
                <Text strong>Payout Approved</Text>
                <Text type="secondary">- Withdrawal request approved by finance</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['importantNotifications', 'leadApproved']} valuePropName="checked">
            <Checkbox>
              <Space>
                <Text strong>Lead Approved</Text>
                <Text type="secondary">- Lead submission accepted</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item name={['importantNotifications', 'leadRejected']} valuePropName="checked">
            <Checkbox>
              <Space>
                <Text strong>Lead Rejected</Text>
                <Text type="secondary">- Lead submission declined</Text>
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
              Informational Notifications (Optional)
            </Space>
          </Title>

          <Form.Item
            name={['informationalNotifications', 'policyUpdates']}
            valuePropName="checked"
          >
            <Checkbox>
              <Space>
                <Text strong>Policy Updates</Text>
                <Text type="secondary">- Changes to terms and policies</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item
            name={['informationalNotifications', 'rulebookVersion']}
            valuePropName="checked"
          >
            <Checkbox>
              <Space>
                <Text strong>Rulebook Version Updates</Text>
                <Text type="secondary">- New commission rule versions released</Text>
              </Space>
            </Checkbox>
          </Form.Item>

          <Form.Item
            name={['informationalNotifications', 'monthlyStatement']}
            valuePropName="checked"
          >
            <Checkbox>
              <Space>
                <Text strong>Monthly Statement Available</Text>
                <Text type="secondary">- New earnings statement ready for download</Text>
              </Space>
            </Checkbox>
          </Form.Item>
        </Space>

        <Divider />

        <Space>
          <Button type="primary" onClick={handleSave} disabled={!hasChanges}>
            Save Preferences
          </Button>
          <Button onClick={handleReset}>Reset to Defaults</Button>
        </Space>
      </Form>
    </Card>
  );
};
