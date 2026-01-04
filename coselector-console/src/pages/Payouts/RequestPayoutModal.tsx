import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Checkbox, Alert, Descriptions, Space, Button } from 'antd';
import { BankOutlined, DollarOutlined } from '@ant-design/icons';
import type { UserProfile } from '../../types';
import { formatCurrency } from '../../utils/format';

interface RequestPayoutModalProps {
  visible: boolean;
  maxPayable: number;
  userProfile: UserProfile | null;
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}

export const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({
  visible,
  maxPayable,
  userProfile,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [confirmed, setConfirmed] = useState(false);
  const [currentPayable, setCurrentPayable] = useState(maxPayable);
  const [amountChanged, setAmountChanged] = useState(false);

  // Snapshot payable balance when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentPayable(maxPayable);
      setAmountChanged(false);
      form.setFieldsValue({ amount: maxPayable });
      setConfirmed(false);
    }
  }, [visible, maxPayable, form]);

  // Re-validate on submit (check if payable changed)
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Simulate re-fetching current payable balance
      // In real app, this would be an API call
      if (currentPayable !== maxPayable) {
        setAmountChanged(true);
        setCurrentPayable(maxPayable);
        form.setFieldsValue({ amount: Math.min(values.amount, maxPayable) });
        return;
      }

      onSubmit(values.amount);
      form.resetFields();
      setConfirmed(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setConfirmed(false);
    setAmountChanged(false);
    onCancel();
  };

  // Check if payout method is missing
  const hasBankAccount = userProfile?.bankAccount?.bankName;

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined />
          Request Withdrawal
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Submit Request"
      okButtonProps={{ disabled: !confirmed || !hasBankAccount }}
      width={600}
    >
      {!hasBankAccount && (
        <Alert
          type="error"
          message="Payout Method Missing"
          description={
            <span>
              Please <a href="/profile">set up your bank account</a> before requesting a payout.
            </span>
          }
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {amountChanged && (
        <Alert
          type="warning"
          message="Payable Balance Changed"
          description={`Your payable balance decreased from ${formatCurrency(
            currentPayable
          )} to ${formatCurrency(maxPayable)}. Please adjust your request amount.`}
          style={{ marginBottom: 16 }}
          showIcon
          closable
        />
      )}

      <Form form={form} layout="vertical" disabled={!hasBankAccount}>
        <Form.Item
          label="Withdrawal Amount"
          name="amount"
          rules={[
            { required: true, message: 'Please enter withdrawal amount' },
            {
              type: 'number',
              min: 0.01,
              message: 'Amount must be greater than 0',
            },
            {
              type: 'number',
              max: maxPayable,
              message: `Amount cannot exceed ${formatCurrency(maxPayable)}`,
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            prefix="¥"
            precision={2}
            placeholder="Enter amount"
            max={maxPayable}
            addonAfter={
              <Button
                type="link"
                size="small"
                onClick={() => form.setFieldsValue({ amount: maxPayable })}
              >
                Max
              </Button>
            }
          />
        </Form.Item>

        <Alert
          type="info"
          message={`Maximum available: ${formatCurrency(maxPayable)}`}
          style={{ marginBottom: 16 }}
        />

        <Descriptions
          title={
            <Space>
              <BankOutlined />
              Destination Account
            </Space>
          }
          bordered
          column={1}
          size="small"
        >
          <Descriptions.Item label="Bank Name">
            {userProfile?.bankAccount?.bankName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Account Holder">
            {userProfile?.bankAccount?.accountHolder || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Account Number">
            {userProfile?.bankAccount?.accountNumber || '-'}
          </Descriptions.Item>
        </Descriptions>

        {hasBankAccount && (
          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}>
              I confirm that the payout details above are correct and the amount is accurate.
            </Checkbox>
          </Form.Item>
        )}
      </Form>

      <Alert
        type="info"
        message="Processing Time"
        description="Payouts are typically approved within 1-2 business days and transferred within 3-5 business days after approval."
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};
