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
          申请提现
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="提交申请"
      okButtonProps={{ disabled: !confirmed || !hasBankAccount }}
      width={600}
    >
      {!hasBankAccount && (
        <Alert
          type="error"
          message="缺少提现方式"
          description={
            <span>
              请先<a href="/profile">设置银行账户</a>，再申请提现。
            </span>
          }
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {amountChanged && (
        <Alert
          type="warning"
          message="可提现余额已变化"
          description={`你的可提现余额已从 ${formatCurrency(
            currentPayable
          )} 变为 ${formatCurrency(maxPayable)}。请调整申请金额。`}
          style={{ marginBottom: 16 }}
          showIcon
          closable
        />
      )}

      <Form form={form} layout="vertical" disabled={!hasBankAccount}>
        <Form.Item
          label="提现金额"
          name="amount"
          rules={[
            { required: true, message: '请输入提现金额' },
            {
              type: 'number',
              min: 0.01,
              message: '金额必须大于 0',
            },
            {
              type: 'number',
              max: maxPayable,
              message: `金额不能超过 ${formatCurrency(maxPayable)}`,
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            prefix="¥"
            precision={2}
            placeholder="输入金额"
            max={maxPayable}
            addonAfter={
              <Button
                type="link"
                size="small"
                onClick={() => form.setFieldsValue({ amount: maxPayable })}
              >
                全部
              </Button>
            }
          />
        </Form.Item>

        <Alert
          type="info"
          message={`最高可提现：${formatCurrency(maxPayable)}`}
          style={{ marginBottom: 16 }}
        />

        <Descriptions
          title={
            <Space>
              <BankOutlined />
              收款账户
            </Space>
          }
          bordered
          column={1}
          size="small"
        >
          <Descriptions.Item label="银行名称">
            {userProfile?.bankAccount?.bankName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="账户名">
            {userProfile?.bankAccount?.accountHolder || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="账号">
            {userProfile?.bankAccount?.accountNumber || '-'}
          </Descriptions.Item>
        </Descriptions>

        {hasBankAccount && (
          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}>
              我确认以上提现信息正确，金额准确无误。
            </Checkbox>
          </Form.Item>
        )}
      </Form>

      <Alert
        type="info"
        message="处理时效"
        description="提现通常会在 1-2 个工作日内审批，通过后 3-5 个工作日内转账。"
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};
