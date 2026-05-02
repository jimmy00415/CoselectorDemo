import { Modal, Form, Input, Select, Row, Col, Checkbox, Upload, Button, Typography, Divider, Space, Alert } from 'antd';
import { UploadOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Lead } from '../../types';
import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * LeadFormModal Component
 * Per Sprint 1 §7.2: Multi-section form with 5 sections and validation
 * 
 * Sections:
 * A) Merchant Basics* (name, category, region)
 * B) Contact* (name, phone OR email)
 * C) Commercial (volume range, notes)
 * D) Attachments (multi-file)
 * E) COI Declaration* (checkbox + conditional details)
 * 
 * Key Requirements (Sprint 1 §7.2):
 * - Auto-save draft every 10 seconds
 * - Validation summary banner at top
 * - Preserve user input on error
 * - Submit button enabled only when required fields pass
 */

const { Title, Text } = Typography;
const { TextArea } = Input;

interface LeadFormModalProps {
  visible: boolean;
  lead: Lead | null;
  onCancel: () => void;
  onSubmit: (values: Partial<Lead>) => void;
  onSaveDraft?: (values: Partial<Lead>) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  visible,
  lead,
  onCancel,
  onSubmit,
  onSaveDraft,
}) => {
  const [form] = Form.useForm();
  const [coiDeclared, setCoiDeclared] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formValuesRef = useRef<any>({});

  // Auto-save draft every 10 seconds per Sprint 1 §7.2
  const saveDraft = useCallback(() => {
    if (!onSaveDraft) return;
    
    const values = form.getFieldsValue();
    formValuesRef.current = values;
    onSaveDraft(values);
    setLastSaved(new Date());
  }, [form, onSaveDraft]);

  // Setup auto-save timer
  useEffect(() => {
    if (!visible) {
      // Clear timer when modal closes
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    // Start auto-save timer when modal opens
    autoSaveTimerRef.current = setInterval(() => {
      saveDraft();
    }, 10000); // 10 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [visible, saveDraft]);

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
        const errors = ['至少需要填写电话或邮箱'];
        form.setFields([
          {
            name: 'contactPhone',
            errors,
          },
          {
            name: 'contactEmail',
            errors,
          },
        ]);
        setValidationErrors([...errors, '请在联系人部分填写电话或邮箱中的至少一项']);
        return;
      }

      // COI declaration is required before submit
      if (!coiDeclared) {
        const errors = ['提交前必须确认利益冲突声明'];
        form.setFields([
          {
            name: 'coiDeclared',
            errors,
          },
        ]);
        setValidationErrors(errors);
        return;
      }

      // Clear validation errors on successful validation
      setValidationErrors([]);
      
      onSubmit(values);
      form.resetFields();
      setCoiDeclared(false);
      setFileList([]);
      setLastSaved(null);
    } catch (error: any) {
      // Form validation failed - preserve input (don't reset)
      // Extract error messages for validation summary banner
      const errors: string[] = [];
      if (error.errorFields) {
        error.errorFields.forEach((field: any) => {
          errors.push(...field.errors);
        });
      }
      setValidationErrors(errors);
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    // Save draft before closing per Sprint 1 §7.2
    if (onSaveDraft) {
      saveDraft();
    }
    // Preserve form state when canceling (per PRD requirement)
    onCancel();
  };

  return (
    <Modal
      title={lead ? '编辑线索' : '提交新线索'}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      width={800}
      okText="提交"
      cancelText="保存为草稿"
      destroyOnClose={false} // Keep form state
    >
      {/* Validation Summary Banner per Sprint 1 §7.2 & §2.2 */}
      {validationErrors.length > 0 && (
        <Alert
          message="表单校验错误"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="error"
          closable
          onClose={() => setValidationErrors([])}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {/* Auto-save indicator per Sprint 1 §7.2 */}
      {lastSaved && (
        <Alert
          message={
            <Space>
              <CheckCircleOutlined />
              草稿已于 {lastSaved.toLocaleTimeString()} 自动保存
            </Space>
          }
          type="success"
          style={{ marginBottom: 16 }}
          banner
        />
      )}

      <Form
        form={form}
        layout="vertical"
        preserve={true} // Preserve form values on unmount
      >
        {/* Section A: Merchant Basics (required) - Sprint 1 §7.2 */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          A) 商户基础信息 *
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="merchantName"
              label="商户名称"
              rules={[{ required: true, message: '商户名称为必填项' }]}
            >
              <Input placeholder="输入商户名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="类目"
              rules={[{ required: true, message: '类目为必填项' }]}
            >
              <Select placeholder="选择类目">
                <Select.Option value="Restaurant">餐饮</Select.Option>
                <Select.Option value="Retail">零售</Select.Option>
                <Select.Option value="Beauty & Spa">美妆与护理</Select.Option>
                <Select.Option value="Entertainment">娱乐</Select.Option>
                <Select.Option value="Education">教育</Select.Option>
                <Select.Option value="Healthcare">医疗健康</Select.Option>
                <Select.Option value="Other">其他</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="region"
              label="区域"
              rules={[{ required: true, message: '区域为必填项' }]}
            >
              <Select placeholder="选择区域">
                <Select.Option value="Beijing">北京</Select.Option>
                <Select.Option value="Shanghai">上海</Select.Option>
                <Select.Option value="Guangdong">广东</Select.Option>
                <Select.Option value="Zhejiang">浙江</Select.Option>
                <Select.Option value="Jiangsu">江苏</Select.Option>
                <Select.Option value="Sichuan">四川</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="city"
              label="城市"
              rules={[{ required: true, message: '城市为必填项' }]}
            >
              <Input placeholder="输入城市" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="website"
          label="网站 / 社交媒体"
          rules={[
            { type: 'url', message: '请输入有效 URL' },
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Divider />

        {/* Section B: Contact (at least one method required) - Sprint 1 §7.2 */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          B) 联系人 *
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactName"
              label="联系人姓名"
              rules={[{ required: true, message: '联系人姓名为必填项' }]}
            >
              <Input placeholder="输入联系人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactRole"
              label="角色 / 职位"
            >
              <Input placeholder="例如：负责人、经理" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPhone"
              label="电话"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效手机号' },
              ]}
            >
              <Input placeholder="13800138000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactEmail"
              label="邮箱"
              rules={[
                { type: 'email', message: '请输入有效邮箱' },
              ]}
            >
              <Input placeholder="contact@example.com" />
            </Form.Item>
          </Col>
        </Row>
        <Text type="secondary" style={{ fontSize: 12 }}>
          * 电话或邮箱至少填写一项
        </Text>

        <Divider />

        {/* Section C: Commercial (optional for Sprint 1) */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          C) 商业信息
        </Title>
        <Form.Item
          name="estimatedMonthlyVolume"
          label="预估月成交额"
        >
          <Select placeholder="选择预估月成交额">
            <Select.Option value="< ¥50,000">&lt; ¥50,000</Select.Option>
            <Select.Option value="¥50,000 - ¥100,000">¥50,000 - ¥100,000</Select.Option>
            <Select.Option value="¥100,000 - ¥500,000">¥100,000 - ¥500,000</Select.Option>
            <Select.Option value="¥500,000 - ¥1,000,000">¥500,000 - ¥1,000,000</Select.Option>
            <Select.Option value="> ¥1,000,000">&gt; ¥1,000,000</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="serviceAvailability"
          label="服务可用时间"
        >
          <Input placeholder="例如：工作日 10:00-20:00" />
        </Form.Item>
        <Form.Item
          name="notes"
          label="补充备注"
        >
          <TextArea
            rows={4}
            placeholder="关于商户的其他补充信息..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Divider />

        {/* Section D: Attachments (optional but must exist) - Sprint 1 §7.2 */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          D) 附件
        </Title>
        <Form.Item
          name="attachments"
          label="上传文件"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <Upload
            beforeUpload={() => false} // Prevent auto upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            multiple
          >
            <Button icon={<UploadOutlined />}>上传菜单 / 介绍材料 / 报价单</Button>
          </Upload>
        </Form.Item>
        <Text type="secondary" style={{ fontSize: 12 }}>
          支持格式：PDF、JPG、PNG、DOCX（每个文件最大 10MB）
        </Text>

        <Divider />

        {/* Section E: COI Declaration (required) - Sprint 1 §7.2 */}
        <Title level={5}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          E) 利益冲突声明 *
        </Title>
        <Form.Item
          name="coiDeclared"
          valuePropName="checked"
        >
          <Checkbox onChange={(e) => setCoiDeclared(e.target.checked)}>
            <Text strong>
              我确认已披露任何潜在利益冲突
            </Text>
          </Checkbox>
        </Form.Item>
        {coiDeclared && (
          <Form.Item
            name="coiDetails"
            label="利益冲突详情（如适用）"
          >
            <TextArea
              rows={3}
              placeholder="请描述任何潜在利益冲突..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        )}
      </Form>

      <Space style={{ marginTop: 16 }}>
        <InfoCircleOutlined style={{ color: '#1890ff' }} />
        <Text type="secondary">
          提交前必须填写必填字段。若校验失败，已输入内容会保留。
        </Text>
      </Space>
    </Modal>
  );
};
