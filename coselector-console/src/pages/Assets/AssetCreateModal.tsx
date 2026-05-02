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
      message.error('请填写所有必填字段');
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
          上一步
        </button>,
        <button key="next" onClick={handleNext}>
          下一步
        </button>,
      ];
    }
    return [
      <button key="back" onClick={handleBack}>
        上一步
      </button>,
      <button key="submit" onClick={handleSubmit} disabled={loading}>
        {loading ? '创建中...' : '创建资产'}
      </button>,
    ];
  };

  return (
    <Modal
      title="创建资产"
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
          { title: '类型' },
          { title: '标记' },
          { title: '目标' },
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
                  <div>短链接</div>
                </div>
              </Radio.Button>
              <Radio.Button
                value={AssetType.QR_CODE}
                style={{ width: '33%', textAlign: 'center', height: 80 }}
              >
                <div>
                  <QrcodeOutlined style={{ fontSize: 24 }} />
                  <div>二维码</div>
                </div>
              </Radio.Button>
              <Radio.Button
                value={AssetType.INVITE_CODE}
                style={{ width: '34%', textAlign: 'center', height: 80 }}
              >
                <div>
                  <MailOutlined style={{ fontSize: 24 }} />
                  <div>邀请码</div>
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
              label="资产名称"
              rules={[
                { required: true, message: '请输入资产名称' },
                { max: 60, message: '名称不能超过 60 个字符' },
              ]}
            >
              <Input placeholder="例如：春季活动 - 微信" maxLength={60} />
            </Form.Item>

            <Form.Item
              name="channelTag"
              label="渠道标签"
              rules={[{ required: true, message: '请选择渠道标签' }]}
            >
              <Select placeholder="选择渠道">
                <Select.Option value="wechat">微信</Select.Option>
                <Select.Option value="douyin">抖音</Select.Option>
                <Select.Option value="xiaohongshu">小红书</Select.Option>
                <Select.Option value="weibo">微博</Select.Option>
                <Select.Option value="other">其他</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="campaign" label="活动（可选）">
              <Input placeholder="例如：2026 春季促销" />
            </Form.Item>
          </>
        )}

        {/* Step 3: Landing Target */}
        {currentStep === 2 && (
          <>
            <Form.Item
              name="landingTarget"
              label="落地页 URL 或深链"
              rules={[
                { required: true, message: '请输入落地目标' },
                { type: 'url', message: '请输入有效 URL' },
              ]}
            >
              <Input placeholder="https://example.com/landing" />
            </Form.Item>

            <Form.Item name="customParams" label="自定义参数（可选）">
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
