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
        title: '存在待处理提现',
        icon: <WarningOutlined />,
        content:
          '你有一笔待处理提现。更改银行账户将需要重新验证，并可能延迟提现。是否继续？',
        okText: '确认更改账户',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          setIsEditing(true);
          setShowChangeWarning(true);
        },
      });
    } else if (isVerified) {
      Modal.confirm({
        title: '更改已验证账户',
        icon: <WarningOutlined />,
        content:
          '你当前的银行账户已验证。更改后需要通过测试转账重新验证。是否继续？',
        okText: '确认更改',
        cancelText: '取消',
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
      message.success('银行账户信息已保存');
    });
  };

  const handleVerify = () => {
    const values = form.getFieldsValue();
    Modal.confirm({
      title: '验证银行账户',
      icon: <BankOutlined />,
      content: (
        <Space direction="vertical">
          <p>
            我们将向以下账户发送 <strong>¥0.01</strong> 测试转账：
          </p>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="银行">{values.bankName}</Descriptions.Item>
            <Descriptions.Item label="账户号码">{values.accountNumber}</Descriptions.Item>
            <Descriptions.Item label="账户持有人">{values.accountHolder}</Descriptions.Item>
          </Descriptions>
          <p>
            请在 3 个工作日内确认测试金额以完成验证。
          </p>
        </Space>
      ),
      okText: '发送测试转账',
      cancelText: '取消',
      onOk: () => {
        onVerify(values);
        message.success('测试转账已发起，请查看你的银行账户。');
      },
    });
  };

  return (
    <Card
      title={
        <Space>
          <BankOutlined />
          提现方式
        </Space>
      }
      extra={
        !isEditing &&
        userProfile.bankAccount && (
          <Button type="link" onClick={handleEdit}>
            编辑
          </Button>
        )
      }
    >
      {showChangeWarning && (
        <Alert
          type="warning"
          message="检测到账户变更"
          description="更改银行账户需要重新验证。请确保新账户信息准确。"
          closable
          onClose={() => setShowChangeWarning(false)}
          style={{ marginBottom: 16 }}
        />
      )}

      {isVerified && !isEditing && (
        <Alert
          type="success"
          message="银行账户已验证"
          description="你的银行账户已验证，可用于提现。"
          icon={<CheckCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {!isVerified && userProfile.bankAccount && !isEditing && (
        <Alert
          type="warning"
          message="需要验证"
          description="你的银行账户尚未验证。请完成验证以启用提现。"
          icon={<WarningOutlined />}
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleVerify}>
              立即验证
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
          label="银行名称"
          name="bankName"
          rules={[{ required: true, message: '请输入银行名称' }]}
        >
          <Input
            prefix={<BankOutlined />}
            placeholder="例如：中国工商银行"
          />
        </Form.Item>

        <Form.Item
          label="账户号码"
          name="accountNumber"
          rules={[
            { required: true, message: '请输入账户号码' },
            {
              pattern: /^\d{16,19}$/,
              message: '账户号码必须为 16-19 位数字',
            },
          ]}
        >
          <Input placeholder="输入 16-19 位账户号码" maxLength={19} />
        </Form.Item>

        <Form.Item
          label="账户持有人姓名"
          name="accountHolder"
          rules={[
            { required: true, message: '请输入账户持有人姓名' },
            {
              validator: (_, value) => {
                if (value && value !== userProfile.displayName) {
                  return Promise.reject(
                    new Error(
                      '账户持有人姓名必须与你的注册姓名一致。如不一致，请联系支持团队。'
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="必须与注册姓名一致" />
        </Form.Item>

        <Form.Item label="支行名称（可选）" name="branchName">
          <Input placeholder="银行支行名称" />
        </Form.Item>

        <Form.Item
          label="SWIFT/BIC 代码（可选）"
          name="swiftCode"
          rules={[
            {
              pattern: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
              message: 'SWIFT 代码格式无效',
            },
          ]}
        >
          <Input placeholder="8 或 11 个字符" maxLength={11} />
        </Form.Item>

        {isEditing && (
          <Space>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
            {userProfile.bankAccount && (
              <Button onClick={handleCancel}>取消</Button>
            )}
          </Space>
        )}
      </Form>

      {!isEditing && !isVerified && userProfile.bankAccount && (
        <Alert
          type="info"
          message="下一步：验证"
          description="点击“立即验证”接收 ¥0.01 测试转账，并确认金额以完成验证。"
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};
