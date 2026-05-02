import React, { useState } from 'react';
import { Card, Form, Radio, Input, Alert, Button, Space, Divider, Typography } from 'antd';
import { WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { UserProfile } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface COIDisclosureFormProps {
  userProfile: UserProfile;
  onSubmit: (disclosure: COIDisclosure) => void;
}

export interface COIDisclosure {
  hasConflict: boolean;
  conflictDescription?: string;
  declaredAt: string;
}

export const COIDisclosureForm: React.FC<COIDisclosureFormProps> = ({ userProfile, onSubmit }) => {
  const [form] = Form.useForm();
  const [hasConflict, setHasConflict] = useState(
    userProfile.coiDisclosure?.hasConflict || false
  );

  const isUnderReview = userProfile.accountUnderReview || false;
  const hasActiveCOI = userProfile.coiDisclosure?.hasConflict && !userProfile.coiDisclosure?.resolvedAt;

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const disclosure: COIDisclosure = {
        hasConflict: values.hasConflict,
        conflictDescription: values.hasConflict ? values.conflictDescription : undefined,
        declaredAt: new Date().toISOString(),
      };
      onSubmit(disclosure);
    });
  };

  return (
    <Card title="利益冲突（COI）披露">
      {hasActiveCOI && isUnderReview && (
        <Alert
          type="warning"
          message="已声明利益冲突 - 账户审核中"
          description={
            <Space direction="vertical" size="small">
              <p>
                你已声明潜在利益冲突。运营团队正在审核你的账户。
              </p>
              <p>
                <strong>声明时间：</strong>{' '}
                {new Date(userProfile.coiDisclosure?.declaredAt || '').toLocaleDateString()}
              </p>
              <p>
                <strong>描述：</strong> {userProfile.coiDisclosure?.conflictDescription}
              </p>
              <p style={{ marginTop: 8 }}>
                <Text type="secondary">
                  审核完成前提现将被阻止。收益跟踪会继续正常进行。
                </Text>
              </p>
            </Space>
          }
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {userProfile.coiDisclosure?.resolvedAt && (
        <Alert
          type="success"
          message="利益冲突已解决"
          description={
            <Space direction="vertical" size="small">
              <p>你之前的利益冲突声明已审核并解决。</p>
              <p>
                <strong>解决时间：</strong>{' '}
                {new Date(userProfile.coiDisclosure.resolvedAt).toLocaleDateString()}
              </p>
              {userProfile.coiDisclosure.resolutionNote && (
                <p>
                  <strong>处理备注：</strong> {userProfile.coiDisclosure.resolutionNote}
                </p>
              )}
            </Space>
          }
          icon={<CheckCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Alert
        type="info"
        message="什么是利益冲突？"
        description={
          <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
            <li>你是竞争品牌的员工或承包商</li>
            <li>你在竞争产品或服务中拥有财务利益</li>
            <li>你正在推广自己直接拥有或控制的产品</li>
            <li>
              你与品牌决策者存在可能影响佣金的个人关系
            </li>
          </ul>
        }
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          hasConflict: userProfile.coiDisclosure?.hasConflict || false,
          conflictDescription: userProfile.coiDisclosure?.conflictDescription || '',
        }}
        disabled={isUnderReview}
      >
        <Form.Item
          label={
            <Space>
              <WarningOutlined style={{ color: '#ff4d4f' }} />
              你是否有任何潜在利益冲突需要声明？
            </Space>
          }
          name="hasConflict"
          rules={[{ required: true, message: '请选择一项' }]}
        >
          <Radio.Group onChange={(e) => setHasConflict(e.target.value)}>
            <Space direction="vertical">
              <Radio value={false}>
                <strong>否</strong> - 我没有任何利益冲突
              </Radio>
              <Radio value={true}>
                <strong>是</strong> - 我有潜在利益冲突需要声明
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {hasConflict && (
          <>
            <Divider />
            <Alert
              type="warning"
              message="声明后果"
              description="声明利益冲突后，你的账户将进入审核。审核完成前提现将被阻止。请在下方提供详细信息。"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              label="利益冲突描述"
              name="conflictDescription"
              rules={[
                {
                  required: hasConflict,
                  message: '请详细描述利益冲突',
                },
                {
                  min: 50,
                  message: '请至少提供 50 个字符的详细说明',
                },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="请详细描述利益冲突的性质。包括：&#10;- 涉及的各方&#10;- 关系或财务利益的性质&#10;- 相关日期或时间线&#10;- 你已采取的缓解措施"
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </>
        )}

        {!isUnderReview && (
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              {hasConflict ? '提交声明' : '确认无利益冲突'}
            </Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </Space>
        )}
      </Form>

      <Divider />

      <Alert
        type="info"
        message="诚信声明"
        description="提交此表单即表示你确认已诚信审查自己的关系和财务利益。未披露重大利益冲突可能导致账户暂停并没收未支付佣金。"
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};
