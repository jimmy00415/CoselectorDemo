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
    { name: 'Transaction Screenshot', required: true, uploaded: false },
    { name: 'Communication Log', required: true, uploaded: false },
    { name: 'Supporting Documentation', required: false, uploaded: false },
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
        message.error(`${file.name} exceeds 10MB size limit`);
        return;
      }

      // Trigger upload callback
      onUploadEvidence(file, 'Supporting Documentation');
      
      if (onSuccess) {
        onSuccess('ok');
      }
      
      message.success(`${file.name} uploaded successfully`);
      setFileList([]);
    }, 500);
  };

  const handlePreview = (fileUrl: string) => {
    setPreviewUrl(fileUrl);
    setPreviewVisible(true);
  };

  const handleDelete = (evidenceUrl: string, evidenceName: string) => {
    Modal.confirm({
      title: 'Delete Evidence',
      content: `Are you sure you want to delete "${evidenceName}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        onDeleteEvidence(evidenceUrl);
        message.success('Evidence deleted');
      },
    });
  };

  return (
    <Card
      title={
        <Space>
          <FileOutlined />
          <span>Evidence Checklist</span>
          <Tag color={progress === 100 ? 'green' : 'orange'}>
            {uploadedRequired} / {requiredCount} required
          </Tag>
        </Space>
      }
    >
      {canEdit && uploadedRequired < requiredCount && (
        <Alert
          type="warning"
          message="Required Evidence Missing"
          description={`Please upload all required evidence items to proceed. ${requiredCount - uploadedRequired} required item(s) remaining.`}
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
                      View
                    </Button>,
                    canEdit && (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item.fileUrl!, item.name)}
                      >
                        Delete
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
                        Upload
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
                      Required
                    </Tag>
                  ) : (
                    <Tag color="default" style={{ fontSize: 10 }}>
                      Optional
                    </Tag>
                  )}
                </Space>
              }
              description={
                item.uploaded
                  ? `Uploaded ${formatDate(item.uploadedAt!)}`
                  : item.required
                  ? 'Required - Please upload'
                  : 'Optional supporting document'
              }
            />
          </List.Item>
        )}
      />

      {canEdit && (
        <>
          <Alert
            type="info"
            message="Upload Guidelines"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>Accepted formats: Images (JPG, PNG), PDF, Word documents</li>
                <li>Maximum file size: 10MB per file</li>
                <li>Ensure all text and details are clearly visible</li>
                <li>Redact sensitive information if necessary</li>
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
                Upload Additional Evidence
              </Button>
            </Upload>
          </div>
        </>
      )}

      <Modal
        open={previewVisible}
        title="Evidence Preview"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        {previewUrl && (
          <img src={previewUrl} alt="Evidence" style={{ width: '100%' }} />
        )}
      </Modal>
    </Card>
  );
};
