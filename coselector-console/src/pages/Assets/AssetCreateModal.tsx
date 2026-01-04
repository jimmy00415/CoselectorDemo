import React, { useState } from 'react';
import { Modal, Form, Input, Select, Radio, message, Steps } from 'antd';
import { LinkOutlined, QrcodeOutlined, MailOutlined } from '@ant-design/icons';
import { AssetType } from '../../types/enums';


interface AssetCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

/**
 * Asset Creation Modal with 3-step wizard
 * Per PRD §7.2.2: Choose type → Labeling → Landing target
 */
const AssetCreateModal: React.FC<AssetCreateModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<AssetType>(AssetType.SHORT_LINK);
  const [loading, setLoading] = useState(false);

  const handleTypeSelect = (type: AssetType) => {
    setSelectedType(type);
    setCurrentStep(1);
  };

  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        await form.validateFields(['name', 'channelTag']);
        setCurrentStep(2);
      }
    } catch (error) {
      // Validation failed
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit({
        ...values,
        type: selectedType,
      });
      form.resetFields();
      setCurrentStep(0);
    } catch (error) {
      message.error('Please fill in all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    onClose();
  };

  const getModalFooter = () => {
    if (currentStep === 0) return null;
    if (currentStep === 1) {
      return [
        <button key="back" onClick={handleBack}>
          Back
        </button>,
        <button key="next" onClick={handleNext}>
          Next
        </button>,
      ];
    }
    return [
      <button key="back" onClick={handleBack}>
        Back
      </button>,
      <button key="submit" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating...' : 'Create Asset'}
      </button>,
    ];
  };

  return (
    <Modal
      title="Create Asset"
      open={visible}
      onCancel={handleCancel}
      footer={getModalFooter()}
      width={600}
      destroyOnClose
    >
      <Steps 
        current={currentStep} 
        style={{ marginBottom: 24 }}
        items={[
          { title: 'Type' },
          { title: 'Labeling' },
          { title: 'Target' },
        ]}
      />

      <Form form={form} layout="vertical">
        {/* Step 1: Choose Type */}
        {currentStep === 0 && (
          <div className="asset-type-selection">
            <Radio.Group
              value={selectedType}
              onChange={(e) => handleTypeSelect(e.target.value)}
              style={{ width: '100%' }}
            >
              <Radio.Button
                value={AssetType.SHORT_LINK}
                style={{ width: '33%', textAlign: 'center', height: 80 }}
              >
                <div>
                  <LinkOutlined style={{ fontSize: 24 }} />
                  <div>Short Link</div>
                </div>
              </Radio.Button>
              <Radio.Button
                value={AssetType.QR_CODE}
                style={{ width: '33%', textAlign: 'center', height: 80 }}
              >
                <div>
                  <QrcodeOutlined style={{ fontSize: 24 }} />
                  <div>QR Code</div>
                </div>
              </Radio.Button>
              <Radio.Button
                value={AssetType.INVITE_CODE}
                style={{ width: '34%', textAlign: 'center', height: 80 }}
              >
                <div>
                  <MailOutlined style={{ fontSize: 24 }} />
                  <div>Invite Code</div>
                </div>
              </Radio.Button>
            </Radio.Group>
          </div>
        )}

        {/* Step 2: Labeling */}
        {currentStep === 1 && (
          <>
            <Form.Item
              name="name"
              label="Asset Name"
              rules={[
                { required: true, message: 'Please enter asset name' },
                { max: 60, message: 'Name must be 60 characters or less' },
              ]}
            >
              <Input placeholder="e.g., Spring Campaign - WeChat" maxLength={60} />
            </Form.Item>

            <Form.Item
              name="channelTag"
              label="Channel Tag"
              rules={[{ required: true, message: 'Please select channel tag' }]}
            >
              <Select placeholder="Select channel">
                <Select.Option value="wechat">WeChat</Select.Option>
                <Select.Option value="douyin">Douyin</Select.Option>
                <Select.Option value="xiaohongshu">Xiaohongshu</Select.Option>
                <Select.Option value="weibo">Weibo</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="campaign" label="Campaign (Optional)">
              <Input placeholder="e.g., Spring Sale 2026" />
            </Form.Item>
          </>
        )}

        {/* Step 3: Landing Target */}
        {currentStep === 2 && (
          <>
            <Form.Item
              name="landingTarget"
              label="Landing URL or Deeplink"
              rules={[
                { required: true, message: 'Please enter landing target' },
                { type: 'url', message: 'Please enter a valid URL' },
              ]}
            >
              <Input placeholder="https://example.com/landing" />
            </Form.Item>

            <Form.Item name="customParams" label="Custom Parameters (Optional)">
              <Input.TextArea
                placeholder="utm_source=kol&utm_medium=social"
                rows={3}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AssetCreateModal;
