import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, message, Space, Modal, Descriptions } from 'antd';
import { BankOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import type { UserProfile } from '../../types';

interface PayoutMethodFormProps {
  userProfile: UserProfile;
  hasPendingPayout: boolean;
  onSave: (bankAccount: BankAccountInfo) => void;
  onVerify: (bankAccount: BankAccountInfo) => void;
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branchName?: string;
  swiftCode?: string;
}

export const PayoutMethodForm: React.FC<PayoutMethodFormProps> = ({
  userProfile,
  hasPendingPayout,
  onSave,
  onVerify,
}) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(!userProfile.bankAccount);
  const [showChangeWarning, setShowChangeWarning] = useState(false);

  const isVerified = userProfile.bankAccount?.verified || false;

  const handleEdit = () => {
    if (hasPendingPayout) {
      Modal.confirm({
        title: 'Pending Payout Exists',
        icon: <WarningOutlined />,
        content:
          'You have a pending payout. Changing your bank account will require re-verification and may delay your payout. Do you want to continue?',
        okText: 'Yes, Change Account',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          setIsEditing(true);
          setShowChangeWarning(true);
        },
      });
    } else if (isVerified) {
      Modal.confirm({
        title: 'Change Verified Account',
        icon: <WarningOutlined />,
        content:
          'Your current bank account is verified. Changing it will require re-verification with a test transfer. Continue?',
        okText: 'Yes, Change',
        cancelText: 'Cancel',
        onOk: () => {
          setIsEditing(true);
          setShowChangeWarning(true);
        },
      });
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowChangeWarning(false);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave(values);
      setIsEditing(false);
      setShowChangeWarning(false);
      message.success('Bank account information saved');
    });
  };

  const handleVerify = () => {
    const values = form.getFieldsValue();
    Modal.confirm({
      title: 'Verify Bank Account',
      icon: <BankOutlined />,
      content: (
        <Space direction="vertical">
          <p>
            We will send a test transfer of <strong>¥0.01</strong> to the account below:
          </p>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Bank">{values.bankName}</Descriptions.Item>
            <Descriptions.Item label="Account Number">{values.accountNumber}</Descriptions.Item>
            <Descriptions.Item label="Account Holder">{values.accountHolder}</Descriptions.Item>
          </Descriptions>
          <p>
            Please confirm the test amount within 3 business days to complete verification.
          </p>
        </Space>
      ),
      okText: 'Send Test Transfer',
      cancelText: 'Cancel',
      onOk: () => {
        onVerify(values);
        message.success('Test transfer initiated. Please check your bank account.');
      },
    });
  };

  return (
    <Card
      title={
        <Space>
          <BankOutlined />
          Payout Method
        </Space>
      }
      extra={
        !isEditing &&
        userProfile.bankAccount && (
          <Button type="link" onClick={handleEdit}>
            Edit
          </Button>
        )
      }
    >
      {showChangeWarning && (
        <Alert
          type="warning"
          message="Account Change Detected"
          description="Changing your bank account requires re-verification. Please ensure the new account details are correct."
          closable
          onClose={() => setShowChangeWarning(false)}
          style={{ marginBottom: 16 }}
        />
      )}

      {isVerified && !isEditing && (
        <Alert
          type="success"
          message="Bank Account Verified"
          description="Your bank account has been verified and is ready for payouts."
          icon={<CheckCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {!isVerified && userProfile.bankAccount && !isEditing && (
        <Alert
          type="warning"
          message="Verification Required"
          description="Your bank account is not verified yet. Please verify it to enable payouts."
          icon={<WarningOutlined />}
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleVerify}>
              Verify Now
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={userProfile.bankAccount || {}}
        disabled={!isEditing}
      >
        <Form.Item
          label="Bank Name"
          name="bankName"
          rules={[{ required: true, message: 'Please enter bank name' }]}
        >
          <Input
            prefix={<BankOutlined />}
            placeholder="e.g., Industrial and Commercial Bank of China"
          />
        </Form.Item>

        <Form.Item
          label="Account Number"
          name="accountNumber"
          rules={[
            { required: true, message: 'Please enter account number' },
            {
              pattern: /^\d{16,19}$/,
              message: 'Account number must be 16-19 digits',
            },
          ]}
        >
          <Input placeholder="Enter 16-19 digit account number" maxLength={19} />
        </Form.Item>

        <Form.Item
          label="Account Holder Name"
          name="accountHolder"
          rules={[
            { required: true, message: 'Please enter account holder name' },
            {
              validator: (_, value) => {
                if (value && value !== userProfile.displayName) {
                  return Promise.reject(
                    new Error(
                      'Account holder name must match your registered name. If different, please contact support.'
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Must match your registered name" />
        </Form.Item>

        <Form.Item label="Branch Name (Optional)" name="branchName">
          <Input placeholder="Bank branch name" />
        </Form.Item>

        <Form.Item
          label="SWIFT/BIC Code (Optional)"
          name="swiftCode"
          rules={[
            {
              pattern: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
              message: 'Invalid SWIFT code format',
            },
          ]}
        >
          <Input placeholder="8 or 11 characters" maxLength={11} />
        </Form.Item>

        {isEditing && (
          <Space>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
            {userProfile.bankAccount && (
              <Button onClick={handleCancel}>Cancel</Button>
            )}
          </Space>
        )}
      </Form>

      {!isEditing && !isVerified && userProfile.bankAccount && (
        <Alert
          type="info"
          message="Next Step: Verification"
          description="Click 'Verify Now' to receive a ¥0.01 test transfer. Confirm the amount to complete verification."
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};
