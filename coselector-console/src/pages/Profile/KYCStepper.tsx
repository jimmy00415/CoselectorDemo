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
        message.error(`${file.name} 超过 5MB 大小限制`);
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
        message.error('请至少上传 2 份身份证明文件');
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
              { title: '身份基础信息', icon: <UserOutlined /> },
              { title: '文件上传', icon: <IdcardOutlined /> },
              { title: '审核中', icon: <ClockCircleOutlined /> },
              { title: '已通过', icon: <CheckCircleOutlined /> },
            ]}
          />
          <Alert
            type="info"
            message="KYC 审核中"
            description={`你的 KYC 提交正在审核中。提交时间：${new Date(
              userProfile.kycSubmittedAt || ''
            ).toLocaleDateString()}。审核完成后你会收到通知。`}
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
              { title: '身份基础信息', icon: <UserOutlined /> },
              { title: '文件上传', icon: <IdcardOutlined /> },
              { title: '审核中', icon: <ClockCircleOutlined /> },
              { title: '已通过', icon: <CheckCircleOutlined /> },
            ]}
          />
          <Alert
            type="success"
            message="KYC 已通过"
            description={`你的身份已验证。通过时间：${new Date(
              userProfile.kycApprovedAt || ''
            ).toLocaleDateString()}。如果信息发生变化，请联系支持团队。`}
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
            { title: '身份基础信息', icon: <UserOutlined /> },
            { title: '文件上传', icon: <IdcardOutlined /> },
            { title: '审核', icon: <SafetyOutlined /> },
          ]}
        />

        {userProfile.kycStatus === KYCStatus.REJECTED && (
          <Alert
            type="error"
            message="KYC 已拒绝"
            description={
              <div>
                <p>你上一次 KYC 提交已被拒绝。</p>
                <p>
                  <strong>原因：</strong> {userProfile.kycRejectionReason || '文件不清晰或信息不一致'}
                </p>
                <p>请检查以下信息并重新提交。</p>
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
                label="姓名"
                name="fullName"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="输入法定姓名" />
              </Form.Item>

              <Form.Item
                label="证件类型"
                name="idType"
                initialValue="ID_CARD"
                rules={[{ required: true, message: '请选择证件类型' }]}
              >
                <Radio.Group>
                  <Radio.Button value="ID_CARD">身份证</Radio.Button>
                  <Radio.Button value="PASSPORT">护照</Radio.Button>
                  <Radio.Button value="DRIVER_LICENSE">驾驶证</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="证件号码"
                name="idNumber"
                rules={[
                  { required: true, message: '请输入证件号码' },
                  {
                    pattern: /^[A-Z0-9]{6,20}$/,
                    message: '证件号码格式无效',
                  },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="输入证件号码"
                  maxLength={20}
                />
              </Form.Item>

              <Form.Item
                label="出生日期"
                name="dateOfBirth"
                rules={[{ required: true, message: '请输入出生日期' }]}
              >
                <Input type="date" />
              </Form.Item>

              <Form.Item
                label="地址"
                name="address"
                rules={[{ required: true, message: '请输入地址' }]}
              >
                <Input.TextArea rows={2} placeholder="街道地址" />
              </Form.Item>

              <Space style={{ width: '100%' }}>
                <Form.Item
                  label="城市"
                  name="city"
                  rules={[{ required: true, message: '必填' }]}
                >
                  <Input placeholder="城市" />
                </Form.Item>

                <Form.Item
                  label="省份"
                  name="province"
                  rules={[{ required: true, message: '必填' }]}
                >
                  <Select placeholder="选择省份" style={{ width: 150 }}>
                    <Select.Option value="Beijing">北京</Select.Option>
                    <Select.Option value="Shanghai">上海</Select.Option>
                    <Select.Option value="Guangdong">广东</Select.Option>
                    <Select.Option value="Zhejiang">浙江</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="邮政编码"
                  name="postalCode"
                  rules={[{ required: true, message: '必填' }]}
                >
                  <Input placeholder="邮政编码" maxLength={6} />
                </Form.Item>
              </Space>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Alert
                type="info"
                message="文件上传要求"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>至少上传 2 张清晰的身份证明文件照片</li>
                    <li>身份证正反面，或护照所有页面</li>
                    <li>文件格式：JPG、PNG 或 PDF</li>
                    <li>单个文件最大 5MB</li>
                    <li>请确保所有文字清晰可读</li>
                  </ul>
                }
                style={{ marginBottom: 16 }}
              />

              <Form.Item label="身份证明文件">
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
                      <div style={{ marginTop: 8 }}>上传</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              {fileList.length > 0 && fileList.length < 2 && (
                <Alert
                  type="warning"
                  message={`请至少再上传 ${2 - fileList.length} 份文件`}
                  showIcon
                />
              )}
            </>
          )}

          {currentStep === 2 && (
            <>
              <Alert
                type="success"
                message="准备提交"
                description="提交前请检查你的信息。提交后，在审核完成前无法编辑。"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Card size="small" title="摘要">
                <p>
                  <strong>姓名：</strong> {form.getFieldValue('fullName')}
                </p>
                <p>
                  <strong>证件类型：</strong> {form.getFieldValue('idType')}
                </p>
                <p>
                  <strong>证件号码：</strong> {form.getFieldValue('idNumber')}
                </p>
                <p>
                  <strong>出生日期：</strong> {form.getFieldValue('dateOfBirth')}
                </p>
                <p>
                  <strong>地址：</strong>{' '}
                  {`${form.getFieldValue('address')}, ${form.getFieldValue('city')}, ${form.getFieldValue('province')} ${form.getFieldValue('postalCode')}`}
                </p>
                <p>
                  <strong>文件：</strong> 已上传 {fileList.length} 个文件
                </p>
              </Card>
            </>
          )}
        </Form>

        <Space style={{ marginTop: 16 }}>
          {currentStep > 0 && currentStep < 2 && (
            <Button onClick={handlePrevious}>上一步</Button>
          )}
          {currentStep < 2 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="primary" onClick={handleSubmit}>
              {userProfile.kycStatus === KYCStatus.REJECTED ? '重新提交' : '提交审核'}
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};
