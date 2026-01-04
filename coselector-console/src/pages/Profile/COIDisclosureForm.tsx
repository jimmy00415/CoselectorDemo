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
    <Card title="Conflict of Interest (COI) Disclosure">
      {hasActiveCOI && isUnderReview && (
        <Alert
          type="warning"
          message="Conflict Declared - Account Under Review"
          description={
            <Space direction="vertical" size="small">
              <p>
                You have declared a potential conflict of interest. Your account is under review by
                the operations team.
              </p>
              <p>
                <strong>Declared on:</strong>{' '}
                {new Date(userProfile.coiDisclosure?.declaredAt || '').toLocaleDateString()}
              </p>
              <p>
                <strong>Description:</strong> {userProfile.coiDisclosure?.conflictDescription}
              </p>
              <p style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Payouts are blocked until the review is complete. Earnings tracking continues
                  normally.
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
          message="Conflict Resolved"
          description={
            <Space direction="vertical" size="small">
              <p>Your previous conflict of interest declaration has been reviewed and resolved.</p>
              <p>
                <strong>Resolved on:</strong>{' '}
                {new Date(userProfile.coiDisclosure.resolvedAt).toLocaleDateString()}
              </p>
              {userProfile.coiDisclosure.resolutionNote && (
                <p>
                  <strong>Resolution Note:</strong> {userProfile.coiDisclosure.resolutionNote}
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
        message="What is a Conflict of Interest?"
        description={
          <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
            <li>You are an employee or contractor of a competing brand</li>
            <li>You have a financial interest in a competing product or service</li>
            <li>You are promoting products you have direct ownership or control over</li>
            <li>
              You have a personal relationship with a brand decision-maker that could influence
              commissions
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
              Do you have any potential conflicts of interest to declare?
            </Space>
          }
          name="hasConflict"
          rules={[{ required: true, message: 'Please make a selection' }]}
        >
          <Radio.Group onChange={(e) => setHasConflict(e.target.value)}>
            <Space direction="vertical">
              <Radio value={false}>
                <strong>No</strong> - I do not have any conflicts of interest
              </Radio>
              <Radio value={true}>
                <strong>Yes</strong> - I have a potential conflict to declare
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {hasConflict && (
          <>
            <Divider />
            <Alert
              type="warning"
              message="Declaration Consequences"
              description="Declaring a conflict of interest will place your account under review. Payouts will be blocked until the review is complete. Please provide detailed information below."
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              label="Conflict Description"
              name="conflictDescription"
              rules={[
                {
                  required: hasConflict,
                  message: 'Please describe the conflict in detail',
                },
                {
                  min: 50,
                  message: 'Please provide at least 50 characters of detail',
                },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Please describe the nature of the conflict in detail. Include:&#10;- The parties involved&#10;- The nature of the relationship or financial interest&#10;- Any relevant dates or timelines&#10;- Steps you've taken to mitigate the conflict"
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </>
        )}

        {!isUnderReview && (
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              {hasConflict ? 'Submit Declaration' : 'Confirm No Conflicts'}
            </Button>
            <Button onClick={() => form.resetFields()}>Reset</Button>
          </Space>
        )}
      </Form>

      <Divider />

      <Alert
        type="info"
        message="Good Faith Declaration"
        description="By submitting this form, you acknowledge that you have reviewed your relationships and financial interests in good faith. Failure to disclose a material conflict may result in account suspension and forfeiture of unpaid commissions."
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};
