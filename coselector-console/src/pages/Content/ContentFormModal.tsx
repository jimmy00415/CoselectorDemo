import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import { ContentPlatform } from '../../types/enums';
import { ContentItem } from '../../types';
import dayjs from 'dayjs';

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
      title={content ? 'Edit Content Item' : 'Add Content Item'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {content ? 'Update' : 'Create'}
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
          label="Platform"
          rules={[{ required: true, message: 'Please select a platform' }]}
        >
          <Select
            placeholder="Select platform"
            options={[
              { label: 'Douyin', value: ContentPlatform.DOUYIN },
              { label: 'Xiaohongshu', value: ContentPlatform.XIAOHONGSHU },
              { label: 'WeChat', value: ContentPlatform.WECHAT },
              { label: 'Weibo', value: ContentPlatform.WEIBO },
              { label: 'Bilibili', value: ContentPlatform.BILIBILI },
              { label: 'Kuaishou', value: ContentPlatform.KUAISHOU },
              { label: 'Other', value: ContentPlatform.OTHER },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { max: 200, message: 'Title must be less than 200 characters' },
          ]}
        >
          <Input placeholder="Enter content title" />
        </Form.Item>

        <Form.Item
          name="url"
          label="URL"
          rules={[
            {
              type: 'url',
              message: 'Please enter a valid URL',
            },
          ]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item
          name="publishDate"
          label="Publish Date"
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder="Select publish date"
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea
            rows={4}
            placeholder="Optional notes about this content"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContentFormModal;
