import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import { ContentPlatform } from '../../types/enums';
import { ContentItem } from '../../types';
import dayjs from 'dayjs';
import { translatePlatform } from '../../utils/i18n';

const { TextArea } = Input;

interface ContentFormModalProps {
  visible: boolean;
  content: ContentItem | null; // If editing existing content
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
}

/**
 * Content Form Modal
 * 
 * Per PRD §7.3.2:
 * - Platform (required)
 * - Title (required)
 * - URL (optional; validate format)
 * - Publish date (optional)
 * - Notes (optional)
 */
const ContentFormModal: React.FC<ContentFormModalProps> = ({
  visible,
  content,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or content changes
  useEffect(() => {
    if (visible) {
      if (content) {
        // Edit mode - populate form
        form.setFieldsValue({
          platform: content.platform,
          title: content.title,
          url: content.url,
          publishDate: content.publishDate ? dayjs(content.publishDate) : null,
          notes: content.notes,
        });
      } else {
        // Create mode - reset form
        form.resetFields();
      }
    }
  }, [visible, content, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format date if present
      const formattedValues = {
        ...values,
        publishDate: values.publishDate ? values.publishDate.toISOString() : undefined,
      };

      await onSubmit(formattedValues);
      form.resetFields();
    } catch (error) {
      // Form validation failed
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={content ? '编辑内容项' : '新增内容项'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {content ? '更新' : '创建'}
        </Button>,
      ]}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="platform"
          label="平台"
          rules={[{ required: true, message: '请选择平台' }]}
        >
          <Select
            placeholder="选择平台"
            options={[
              { label: translatePlatform(ContentPlatform.DOUYIN), value: ContentPlatform.DOUYIN },
              { label: translatePlatform(ContentPlatform.XIAOHONGSHU), value: ContentPlatform.XIAOHONGSHU },
              { label: translatePlatform(ContentPlatform.WECHAT), value: ContentPlatform.WECHAT },
              { label: translatePlatform(ContentPlatform.WEIBO), value: ContentPlatform.WEIBO },
              { label: translatePlatform(ContentPlatform.BILIBILI), value: ContentPlatform.BILIBILI },
              { label: translatePlatform(ContentPlatform.KUAISHOU), value: ContentPlatform.KUAISHOU },
              { label: translatePlatform(ContentPlatform.OTHER), value: ContentPlatform.OTHER },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="标题"
          rules={[
            { required: true, message: '请输入标题' },
            { max: 200, message: '标题不能超过 200 个字符' },
          ]}
        >
          <Input placeholder="输入内容标题" />
        </Form.Item>

        <Form.Item
          name="url"
          label="URL"
          rules={[
            {
              type: 'url',
              message: '请输入有效 URL',
            },
          ]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item
          name="publishDate"
          label="发布日期"
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder="选择发布日期"
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="备注"
        >
          <TextArea
            rows={4}
            placeholder="关于此内容的可选备注"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContentFormModal;
