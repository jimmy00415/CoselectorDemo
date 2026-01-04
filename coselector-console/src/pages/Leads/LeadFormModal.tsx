import { Modal, Form, Input, Select, Row, Col, Checkbox, Upload, Button, Typography, Divider, Space } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Lead } from '../../types';
import { useEffect, useState } from 'react';

/**
 * LeadFormModal Component
 * Per PRD §7.4.2: Multi-section form with 5 sections and validation
 * 
 * Sections:
 * A) Basic Info: Merchant name, Category, Region/City, Website/Social
 * B) Contact: Name, Role, Phone, Email (at least one required)
 * C) Commercial Fit: Estimated monthly volume, Service availability, Notes
 * D) Attachments: Upload menu/deck/pricing sheet
 * E) COI Declaration: Checkbox + conditional details field
 * 
 * Key Requirements:
 * - Block submit if required fields missing
 * - Preserve user input on validation errors (don't reset)
 * - Phone OR Email required (at least one)
 */

const { Title, Text } = Typography;
const { TextArea } = Input;

interface LeadFormModalProps {
  visible: boolean;
  lead: Lead | null;
  onCancel: () => void;
  onSubmit: (values: Partial<Lead>) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  visible,
  lead,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [coiDeclared, setCoiDeclared] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  // Reset form when modal opens/closes or lead changes
  useEffect(() => {
    if (visible && lead) {
      form.setFieldsValue({
        merchantName: lead.merchantName,
        category: lead.category,
        region: lead.region,
        city: lead.city,
        website: lead.website,
        contactName: lead.contactName,
        contactRole: (lead as any).contactRole,
        contactPhone: lead.contactPhone,
        contactEmail: lead.contactEmail,
        estimatedMonthlyVolume: lead.estimatedMonthlyVolume,
        serviceAvailability: (lead as any).serviceAvailability,
        notes: lead.notes,
        coiDeclared: false,
        coiDetails: (lead as any).coiDetails,
      });
      setCoiDeclared(false);
    } else if (visible && !lead) {
      form.resetFields();
      setCoiDeclared(false);
      setFileList([]);
    }
  }, [visible, lead, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Custom validation: At least phone OR email required
      if (!values.contactPhone && !values.contactEmail) {
        form.setFields([
          {
            name: 'contactPhone',
            errors: ['At least phone or email is required'],
          },
          {
            name: 'contactEmail',
            errors: ['At least phone or email is required'],
          },
        ]);
        return;
      }

      // COI declaration is required before submit
      if (!coiDeclared) {
        form.setFields([
          {
            name: 'coiDeclared',
            errors: ['You must confirm COI declaration before submitting'],
          },
        ]);
        return;
      }

      onSubmit(values);
      form.resetFields();
      setCoiDeclared(false);
      setFileList([]);
    } catch (error) {
      // Form validation failed - preserve input (don't reset)
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    // Preserve form state when canceling (per PRD requirement)
    onCancel();
  };

  return (
    <Modal
      title={lead ? 'Edit Lead' : 'Submit New Lead'}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      width={800}
      okText="Submit"
      cancelText="Save as Draft"
      destroyOnClose={false} // Keep form state
    >
      <Form
        form={form}
        layout="vertical"
        preserve={true} // Preserve form values on unmount
      >
        {/* Section A: Basic Info */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          A) Basic Information
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="merchantName"
              label="Merchant Name"
              rules={[{ required: true, message: 'Merchant name is required' }]}
            >
              <Input placeholder="Enter merchant name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="Restaurant">Restaurant</Select.Option>
                <Select.Option value="Retail">Retail</Select.Option>
                <Select.Option value="Beauty & Spa">Beauty & Spa</Select.Option>
                <Select.Option value="Entertainment">Entertainment</Select.Option>
                <Select.Option value="Education">Education</Select.Option>
                <Select.Option value="Healthcare">Healthcare</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="region"
              label="Region"
              rules={[{ required: true, message: 'Region is required' }]}
            >
              <Select placeholder="Select region">
                <Select.Option value="Beijing">Beijing</Select.Option>
                <Select.Option value="Shanghai">Shanghai</Select.Option>
                <Select.Option value="Guangdong">Guangdong</Select.Option>
                <Select.Option value="Zhejiang">Zhejiang</Select.Option>
                <Select.Option value="Jiangsu">Jiangsu</Select.Option>
                <Select.Option value="Sichuan">Sichuan</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="website"
          label="Website / Social Media"
          rules={[
            { type: 'url', message: 'Please enter a valid URL' },
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Divider />

        {/* Section B: Contact Information */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          B) Contact Information
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactName"
              label="Contact Name"
              rules={[{ required: true, message: 'Contact name is required' }]}
            >
              <Input placeholder="Enter contact person name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactRole"
              label="Role / Position"
            >
              <Input placeholder="e.g., Owner, Manager" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPhone"
              label="Phone"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: 'Please enter a valid phone number' },
              ]}
            >
              <Input placeholder="13800138000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactEmail"
              label="Email"
              rules={[
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="contact@example.com" />
            </Form.Item>
          </Col>
        </Row>
        <Text type="secondary" style={{ fontSize: 12 }}>
          * At least phone or email is required
        </Text>

        <Divider />

        {/* Section C: Commercial Fit */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          C) Commercial Fit
        </Title>
        <Form.Item
          name="estimatedMonthlyVolume"
          label="Estimated Monthly Volume"
        >
          <Select placeholder="Select estimated monthly volume">
            <Select.Option value="< ¥50,000">&lt; ¥50,000</Select.Option>
            <Select.Option value="¥50,000 - ¥100,000">¥50,000 - ¥100,000</Select.Option>
            <Select.Option value="¥100,000 - ¥500,000">¥100,000 - ¥500,000</Select.Option>
            <Select.Option value="¥500,000 - ¥1,000,000">¥500,000 - ¥1,000,000</Select.Option>
            <Select.Option value="> ¥1,000,000">&gt; ¥1,000,000</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="serviceAvailability"
          label="Service Availability Window"
        >
          <Input placeholder="e.g., Weekdays 10am-8pm" />
        </Form.Item>
        <Form.Item
          name="notes"
          label="Additional Notes"
        >
          <TextArea
            rows={4}
            placeholder="Any additional information about the merchant..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Divider />

        {/* Section D: Attachments */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          D) Supporting Documents
        </Title>
        <Form.Item
          name="attachments"
          label="Upload Files"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <Upload
            beforeUpload={() => false} // Prevent auto upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            multiple
          >
            <Button icon={<UploadOutlined />}>Upload Menu / Deck / Pricing Sheet</Button>
          </Upload>
        </Form.Item>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Supported formats: PDF, JPG, PNG, DOCX (Max 10MB each)
        </Text>

        <Divider />

        {/* Section E: COI Declaration */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          E) Conflict of Interest (COI) Declaration
        </Title>
        <Form.Item
          name="coiDeclared"
          valuePropName="checked"
        >
          <Checkbox onChange={(e) => setCoiDeclared(e.target.checked)}>
            <Text strong>
              I confirm I have disclosed any potential conflict of interest
            </Text>
          </Checkbox>
        </Form.Item>
        {coiDeclared && (
          <Form.Item
            name="coiDetails"
            label="COI Details (if applicable)"
          >
            <TextArea
              rows={3}
              placeholder="Please describe any potential conflicts of interest..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        )}
      </Form>

      <Space style={{ marginTop: 16 }}>
        <InfoCircleOutlined style={{ color: '#1890ff' }} />
        <Text type="secondary">
          Required fields must be filled before submission. Your input will be preserved if validation fails.
        </Text>
      </Space>
    </Modal>
  );
};
