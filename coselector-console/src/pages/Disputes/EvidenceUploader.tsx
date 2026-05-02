import React, { useState } from 'react';
import { Card, Upload, Button, List, Progress, Alert, Space, Typography, message, Modal, Tag } from 'antd';
import type { UploadFile } from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { DisputeCase } from '../../types';
import { formatDate } from '../../utils/format';

const { Text } = Typography;

interface EvidenceUploaderProps {
  disputeCase: DisputeCase;
  onUploadEvidence: (file: UploadFile, itemName: string) => void;
  onDeleteEvidence: (evidenceUrl: string) => void;
  canEdit: boolean;
}

interface EvidenceItem {
  name: string;
  required: boolean;
  uploaded: boolean;
  uploadedAt?: string;
  fileUrl?: string;
  fileName?: string;
}

// Define evidence requirements by dispute type
const getEvidenceRequirements = (_disputeType?: string): EvidenceItem[] => {
  // Default requirements
  return [
    { name: '交易截图', required: true, uploaded: false },
    { name: '沟通记录', required: true, uploaded: false },
    { name: '补充证明文件', required: false, uploaded: false },
  ];
};

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  disputeCase,
  onUploadEvidence,
  onDeleteEvidence,
  canEdit,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Get evidence requirements with upload status
  const evidenceRequirements = getEvidenceRequirements(disputeCase.type);
  
  // Map uploaded evidence to requirements
  const evidenceStatus = evidenceRequirements.map(req => {
    const uploaded = disputeCase.evidence.find(e => 
      e && (e.includes(req.name.toLowerCase().replace(/\s+/g, '-')))
    );
    return {
      ...req,
      uploaded: !!uploaded,
      fileUrl: uploaded,
      uploadedAt: uploaded ? new Date().toISOString() : undefined,
    };
  });

  const requiredCount = evidenceRequirements.filter(e => e.required).length;
  const uploadedRequired = evidenceStatus.filter(e => e.required && e.uploaded).length;
  const progress = (uploadedRequired / requiredCount) * 100;

  const handleUpload = ({ file, onSuccess }: any) => {
    // Simulate file upload
    setTimeout(() => {
      // File size check (10MB limit)
      if (file.size && file.size > 10 * 1024 * 1024) {
        message.error(`${file.name} 超过 10MB 大小限制`);
        return;
      }

      // Trigger upload callback
      onUploadEvidence(file, '补充证明文件');
      
      if (onSuccess) {
        onSuccess('ok');
      }
      
      message.success(`${file.name} 上传成功`);
      setFileList([]);
    }, 500);
  };

  const handlePreview = (fileUrl: string) => {
    setPreviewUrl(fileUrl);
    setPreviewVisible(true);
  };

  const handleDelete = (evidenceUrl: string, evidenceName: string) => {
    Modal.confirm({
      title: '删除证据',
      content: `确定要删除“${evidenceName}”吗？此操作无法撤销。`,
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        onDeleteEvidence(evidenceUrl);
        message.success('证据已删除');
      },
    });
  };

  return (
    <Card
      title={
        <Space>
          <FileOutlined />
          <span>证据清单</span>
          <Tag color={progress === 100 ? 'green' : 'orange'}>
            {uploadedRequired} / {requiredCount} 必填
          </Tag>
        </Space>
      }
    >
      {canEdit && uploadedRequired < requiredCount && (
        <Alert
          type="warning"
          message="缺少必填证据"
          description={`请上传所有必填证据后继续。还剩 ${requiredCount - uploadedRequired} 项必填证据。`}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Progress
        percent={progress}
        strokeColor={progress === 100 ? '#52c41a' : '#1890ff'}
        style={{ marginBottom: 16 }}
      />

      <List
        dataSource={evidenceStatus}
        renderItem={(item) => (
          <List.Item
            actions={
              item.uploaded
                ? [
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(item.fileUrl!)}
                    >
                      查看
                    </Button>,
                    canEdit && (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item.fileUrl!, item.name)}
                      >
                        删除
                      </Button>
                    ),
                  ].filter(Boolean)
                : canEdit
                ? [
                    <Upload
                      customRequest={handleUpload}
                      fileList={fileList}
                      onChange={({ fileList }) => setFileList(fileList)}
                      showUploadList={false}
                      accept="image/*,.pdf,.doc,.docx"
                    >
                      <Button type="link" size="small" icon={<UploadOutlined />}>
                        上传
                      </Button>
                    </Upload>,
                  ]
                : []
            }
          >
            <List.Item.Meta
              avatar={
                item.uploaded ? (
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                ) : (
                  <ExclamationCircleOutlined
                    style={{
                      fontSize: 24,
                      color: item.required ? '#ff4d4f' : '#8c8c8c',
                    }}
                  />
                )
              }
              title={
                <Space>
                  <Text strong>{item.name}</Text>
                  {item.required ? (
                    <Tag color="red" style={{ fontSize: 10 }}>
                      必填
                    </Tag>
                  ) : (
                    <Tag color="default" style={{ fontSize: 10 }}>
                      可选
                    </Tag>
                  )}
                </Space>
              }
              description={
                item.uploaded
                  ? `已上传 ${formatDate(item.uploadedAt!)}`
                  : item.required
                  ? '必填 - 请上传'
                  : '可选补充文件'
              }
            />
          </List.Item>
        )}
      />

      {canEdit && (
        <>
          <Alert
            type="info"
            message="上传指引"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>支持格式：图片（JPG、PNG）、PDF、Word 文档</li>
                <li>单个文件最大 10MB</li>
                <li>请确保所有文字和细节清晰可见</li>
                <li>如有必要，请遮盖敏感信息</li>
              </ul>
            }
            style={{ marginTop: 16 }}
          />

          <div style={{ marginTop: 16 }}>
            <Upload
              customRequest={handleUpload}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              multiple
              accept="image/*,.pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />} block>
                上传补充证据
              </Button>
            </Upload>
          </div>
        </>
      )}

      <Modal
        open={previewVisible}
        title="证据预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        {previewUrl && (
          <img src={previewUrl} alt="证据" style={{ width: '100%' }} />
        )}
      </Modal>
    </Card>
  );
};
