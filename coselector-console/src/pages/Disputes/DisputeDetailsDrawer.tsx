import React from 'react';
import { Drawer, Tabs, Space, Button } from 'antd';
import type { TabsProps } from 'antd';
import {
  InfoCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { DisputeCase } from '../../types';
import { DisputeCaseHeader } from './DisputeCaseHeader';
import { EvidenceUploader } from './EvidenceUploader';
import { MessagingThread } from './MessagingThread';
import { ResolutionWorkflow } from './ResolutionWorkflow';
import { Timeline } from '../../components/Timeline/Timeline';
import { DisputeStatus } from '../../types/enums';

interface DisputeDetailsDrawerProps {
  open: boolean;
  disputeCase: DisputeCase | null;
  onClose: () => void;
  onUploadEvidence: (file: any, itemName: string) => void;
  onDeleteEvidence: (evidenceUrl: string) => void;
  onSendMessage: (content: string) => void;
  onAcceptResolution: () => void;
  onAppealResolution: (reason: string) => void;
}

export const DisputeDetailsDrawer: React.FC<DisputeDetailsDrawerProps> = ({
  open,
  disputeCase,
  onClose,
  onUploadEvidence,
  onDeleteEvidence,
  onSendMessage,
  onAcceptResolution,
  onAppealResolution,
}) => {
  if (!disputeCase) return null;

  const canEdit = disputeCase.status !== DisputeStatus.RESOLVED;
  const canSendMessage = disputeCase.status !== DisputeStatus.RESOLVED;

  const tabs: TabsProps['items'] = [
    {
      key: 'overview',
      label: (
        <Space>
          <InfoCircleOutlined />
          Overview
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <DisputeCaseHeader disputeCase={disputeCase} />
          <div style={{ marginTop: 16 }}>
            <h3>Dispute Description</h3>
            <p style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8 }}>
              {disputeCase.description || 'No description provided.'}
            </p>
          </div>
          {disputeCase.reason && (
            <div style={{ marginTop: 16 }}>
              <h3>Reason</h3>
              <p style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 8 }}>
                {disputeCase.reason}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'evidence',
      label: (
        <Space>
          <FileTextOutlined />
          Evidence
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <EvidenceUploader
            disputeCase={disputeCase}
            onUploadEvidence={onUploadEvidence}
            onDeleteEvidence={onDeleteEvidence}
            canEdit={canEdit}
          />
        </div>
      ),
    },
    {
      key: 'messages',
      label: (
        <Space>
          <MessageOutlined />
          Messages
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <MessagingThread
            disputeCase={disputeCase}
            onSendMessage={onSendMessage}
            canSendMessage={canSendMessage}
          />
        </div>
      ),
    },
    {
      key: 'timeline',
      label: (
        <Space>
          <ClockCircleOutlined />
          Timeline
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <Timeline events={disputeCase.timeline} />
        </div>
      ),
    },
  ];

  // Add resolution tab if case is resolved
  if (disputeCase.status === DisputeStatus.RESOLVED) {
    tabs.push({
      key: 'resolution',
      label: (
        <Space>
          <CheckCircleOutlined />
          Resolution
        </Space>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          <ResolutionWorkflow
            disputeCase={disputeCase}
            onAcceptResolution={onAcceptResolution}
            onAppealResolution={onAppealResolution}
          />
        </div>
      ),
    });
  }

  return (
    <Drawer
      title={`Dispute Case #${disputeCase.id.substring(0, 8)}`}
      placement="right"
      onClose={onClose}
      open={open}
      width={800}
      extra={
        <Button onClick={onClose}>Close</Button>
      }
    >
      <Tabs items={tabs} defaultActiveKey="overview" />
    </Drawer>
  );
};
