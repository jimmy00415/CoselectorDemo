import React, { useState } from 'react';
import { Card, Steps, Form, Input, Button, Upload, Alert, message, Space, Select, Radio } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { KYCStatus } from '../../types/enums';
import type { UserProfile } from '../../types';

interface KYCStepperProps {
  userProfile: UserProfile;
  onSubmit: (kycData: KYCSubmission) => void;
  onResubmit: (kycData: KYCSubmission) => void;
}

export interface KYCSubmission {
  fullName: string;
  idNumber: string;
  idType: 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE';
  dateOfBirth: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  documents: UploadFile[];
}

export const KYCStepper: React.FC<KYCStepperProps> = ({ userProfile, onSubmit, onResubmit }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const getStepStatus = () => {
    switch (userProfile.kycStatus) {
      case KYCStatus.NOT_STARTED:
        return { current: 0, status: 'process' as const };
      case KYCStatus.SUBMITTED:
        return { current: 2, status: 'process' as const };
      case KYCStatus.APPROVED:
        return { current: 3, status: 'finish' as const };
      case KYCStatus.REJECTED:
        return { current: 0, status: 'error' as const };
      default:
        return { current: 0, status: 'process' as const };
    }
  };

  const { current, status } = getStepStatus();

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    // Client-side size check (max 5MB per file)
    const validFiles = newFileList.filter((file) => {
      if (file.size && file.size > 5 * 1024 * 1024) {
        message.error(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      return true;
    });
    setFileList(validFiles);
  };

  const handleNext = () => {
    form.validateFields().then(() => {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      }
    });
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (fileList.length < 2) {
        message.error('Please upload at least 2 identity documents');
        return;
      }

      const kycData: KYCSubmission = {
        ...values,
        documents: fileList,
      };

      if (userProfile.kycStatus === KYCStatus.REJECTED) {
        onResubmit(kycData);
      } else {
        onSubmit(kycData);
      }
    });
  };

  // If already submitted or approved, show read-only status
  if (userProfile.kycStatus === KYCStatus.SUBMITTED) {
    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Steps
            current={2}
            status="process"
            items={[
              { title: 'Identity Basics', icon: <UserOutlined /> },
              { title: 'Document Upload', icon: <IdcardOutlined /> },
              { title: 'Under Review', icon: <ClockCircleOutlined /> },
              { title: 'Approved', icon: <CheckCircleOutlined /> },
            ]}
          />
          <Alert
            type="info"
            message="KYC Under Review"
            description={`Your KYC submission is under review. Submitted on ${new Date(
              userProfile.kycSubmittedAt || ''
            ).toLocaleDateString()}. You will be notified once the review is complete.`}
            icon={<ClockCircleOutlined />}
            showIcon
          />
        </Space>
      </Card>
    );
  }

  if (userProfile.kycStatus === KYCStatus.APPROVED) {
    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Steps
            current={3}
            status="finish"
            items={[
              { title: 'Identity Basics', icon: <UserOutlined /> },
              { title: 'Document Upload', icon: <IdcardOutlined /> },
              { title: 'Under Review', icon: <ClockCircleOutlined /> },
              { title: 'Approved', icon: <CheckCircleOutlined /> },
            ]}
          />
          <Alert
            type="success"
            message="KYC Approved"
            description={`Your identity has been verified. Approved on ${new Date(
              userProfile.kycApprovedAt || ''
            ).toLocaleDateString()}. If your information changes, please contact support.`}
            icon={<CheckCircleOutlined />}
            showIcon
          />
        </Space>
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Steps
          current={current}
          status={status}
          items={[
            { title: 'Identity Basics', icon: <UserOutlined /> },
            { title: 'Document Upload', icon: <IdcardOutlined /> },
            { title: 'Review', icon: <SafetyOutlined /> },
          ]}
        />

        {userProfile.kycStatus === KYCStatus.REJECTED && (
          <Alert
            type="error"
            message="KYC Rejected"
            description={
              <div>
                <p>Your previous KYC submission was rejected.</p>
                <p>
                  <strong>Reason:</strong> {userProfile.kycRejectionReason || 'Document unclear or information mismatch'}
                </p>
                <p>Please review the information below and resubmit.</p>
              </div>
            }
            icon={<CloseCircleOutlined />}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter your full legal name" />
              </Form.Item>

              <Form.Item
                label="ID Type"
                name="idType"
                initialValue="ID_CARD"
                rules={[{ required: true, message: 'Please select ID type' }]}
              >
                <Radio.Group>
                  <Radio.Button value="ID_CARD">National ID Card</Radio.Button>
                  <Radio.Button value="PASSPORT">Passport</Radio.Button>
                  <Radio.Button value="DRIVER_LICENSE">Driver License</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="ID Number"
                name="idNumber"
                rules={[
                  { required: true, message: 'Please enter your ID number' },
                  {
                    pattern: /^[A-Z0-9]{6,20}$/,
                    message: 'Invalid ID number format',
                  },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="Enter your ID number"
                  maxLength={20}
                />
              </Form.Item>

              <Form.Item
                label="Date of Birth"
                name="dateOfBirth"
                rules={[{ required: true, message: 'Please enter your date of birth' }]}
              >
                <Input type="date" />
              </Form.Item>

              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: 'Please enter your address' }]}
              >
                <Input.TextArea rows={2} placeholder="Street address" />
              </Form.Item>

              <Space style={{ width: '100%' }}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="City" />
                </Form.Item>

                <Form.Item
                  label="Province"
                  name="province"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select placeholder="Select Province" style={{ width: 150 }}>
                    <Select.Option value="Beijing">Beijing</Select.Option>
                    <Select.Option value="Shanghai">Shanghai</Select.Option>
                    <Select.Option value="Guangdong">Guangdong</Select.Option>
                    <Select.Option value="Zhejiang">Zhejiang</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Postal Code"
                  name="postalCode"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="Postal Code" maxLength={6} />
                </Form.Item>
              </Space>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Alert
                type="info"
                message="Document Upload Requirements"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Upload at least 2 clear photos of your identity document</li>
                    <li>Front and back of ID card, or all pages of passport</li>
                    <li>File format: JPG, PNG, or PDF</li>
                    <li>Maximum file size: 5MB per file</li>
                    <li>Ensure all text is clearly readable</li>
                  </ul>
                }
                style={{ marginBottom: 16 }}
              />

              <Form.Item label="Identity Documents">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false} // Prevent auto upload
                  accept="image/*,.pdf"
                  multiple
                >
                  {fileList.length < 4 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              {fileList.length > 0 && fileList.length < 2 && (
                <Alert
                  type="warning"
                  message={`Please upload at least ${2 - fileList.length} more document(s)`}
                  showIcon
                />
              )}
            </>
          )}

          {currentStep === 2 && (
            <>
              <Alert
                type="success"
                message="Ready to Submit"
                description="Please review your information before submitting. Once submitted, you cannot edit until the review is complete."
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Card size="small" title="Summary">
                <p>
                  <strong>Full Name:</strong> {form.getFieldValue('fullName')}
                </p>
                <p>
                  <strong>ID Type:</strong> {form.getFieldValue('idType')}
                </p>
                <p>
                  <strong>ID Number:</strong> {form.getFieldValue('idNumber')}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {form.getFieldValue('dateOfBirth')}
                </p>
                <p>
                  <strong>Address:</strong>{' '}
                  {`${form.getFieldValue('address')}, ${form.getFieldValue('city')}, ${form.getFieldValue('province')} ${form.getFieldValue('postalCode')}`}
                </p>
                <p>
                  <strong>Documents:</strong> {fileList.length} file(s) uploaded
                </p>
              </Card>
            </>
          )}
        </Form>

        <Space style={{ marginTop: 16 }}>
          {currentStep > 0 && currentStep < 2 && (
            <Button onClick={handlePrevious}>Previous</Button>
          )}
          {currentStep < 2 && (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="primary" onClick={handleSubmit}>
              {userProfile.kycStatus === KYCStatus.REJECTED ? 'Resubmit' : 'Submit for Review'}
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};
