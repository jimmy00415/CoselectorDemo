import React, { useState, useEffect } from 'react';
import { Card, Button, Space, message, Empty, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { mockApi } from '../../services/mockApi';
import type { DisputeCase } from '../../types';
import { ActorType } from '../../types/enums';
import { DisputeListTable } from './DisputeListTable';
import { DisputeDetailsDrawer } from './DisputeDetailsDrawer';
import './styles.css'; // Disputes page styles

export const Disputes: React.FC = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load disputes
  const loadDisputes = async () => {
    setLoading(true);
    try {
      const data = await mockApi.disputes.getAll();
      setDisputes(data);
    } catch (error) {
      message.error('争议加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  // Handle view details
  const handleViewDetails = (disputeId: string) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (dispute) {
      setSelectedDispute(dispute);
      setDrawerOpen(true);
    }
  };

  // Handle upload evidence
  const handleUploadEvidence = async (file: UploadFile, itemName: string) => {
    if (!selectedDispute) return;

    try {
      // Mock file URL
      const fileUrl = `evidence-${itemName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      // Add evidence to dispute
      const updatedEvidence = [...selectedDispute.evidence, fileUrl];
      
      // Update dispute via API
      const updatedDispute: DisputeCase = {
        ...selectedDispute,
        evidence: updatedEvidence,
        timeline: [
          ...selectedDispute.timeline,
          {
            id: `evt-${Date.now()}`,
            actorType: ActorType.CO_SELECTOR,
            actorName: user?.displayName || '未知用户',
            occurredAt: new Date().toISOString(),
            eventType: 'EVIDENCE_UPLOADED',
            description: `已上传证据：${itemName}`,
          },
        ],
      };

      // Update state
      setSelectedDispute(updatedDispute);
      setDisputes((prev) =>
        prev.map((d) => (d.id === updatedDispute.id ? updatedDispute : d))
      );

      message.success('证据上传成功');
    } catch (error) {
      message.error('证据上传失败');
    }
  };

  // Handle delete evidence
  const handleDeleteEvidence = async (evidenceUrl: string) => {
    if (!selectedDispute) return;

    try {
      const updatedEvidence = selectedDispute.evidence.filter((e) => e !== evidenceUrl);
      
      const updatedDispute: DisputeCase = {
        ...selectedDispute,
        evidence: updatedEvidence,
        timeline: [
          ...selectedDispute.timeline,
          {
            id: `evt-${Date.now()}`,
            actorType: ActorType.CO_SELECTOR,
            actorName: user?.displayName || '未知用户',
            occurredAt: new Date().toISOString(),
            eventType: 'EVIDENCE_DELETED',
            description: '已删除证据项',
          },
        ],
      };
      
      setSelectedDispute(updatedDispute);
      setDisputes((prev) =>
        prev.map((d) => (d.id === updatedDispute.id ? updatedDispute : d))
      );

      message.success('证据已删除');
    } catch (error) {
      message.error('证据删除失败');
    }
  };

  // Handle send message
  const handleSendMessage = async (content: string) => {
    if (!selectedDispute) return;

    try {
      const updatedDispute: DisputeCase = {
        ...selectedDispute,
        messageCount: (selectedDispute.messageCount || 0) + 1,
        timeline: [
          ...selectedDispute.timeline,
          {
            id: `evt-${Date.now()}`,
            actorType: ActorType.CO_SELECTOR,
            actorName: user?.displayName || '未知用户',
            occurredAt: new Date().toISOString(),
            eventType: 'MESSAGE_SENT',
            description: `已发送消息：${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          },
        ],
      };

      setSelectedDispute(updatedDispute);
      setDisputes((prev) =>
        prev.map((d) => (d.id === updatedDispute.id ? updatedDispute : d))
      );
    } catch (error) {
      // Error already handled in MessagingThread
    }
  };

  // Handle accept resolution
  const handleAcceptResolution = async () => {
    if (!selectedDispute) return;

    try {
      const updatedDispute: DisputeCase = {
        ...selectedDispute,
        resolutionStatus: 'ACCEPTED',
        timeline: [
          ...selectedDispute.timeline,
          {
            id: `evt-${Date.now()}`,
            actorType: ActorType.CO_SELECTOR,
            actorName: user?.displayName || '未知用户',
            occurredAt: new Date().toISOString(),
            eventType: 'RESOLUTION_ACCEPTED',
            description: '已接受处理结果，案件已关闭。',
          },
        ],
      };

      setSelectedDispute(updatedDispute);
      setDisputes((prev) =>
        prev.map((d) => (d.id === updatedDispute.id ? updatedDispute : d))
      );

      message.success('已接受处理结果，案件已关闭。');
    } catch (error) {
      message.error('接受处理结果失败');
    }
  };

  // Handle appeal resolution
  const handleAppealResolution = async (reason: string) => {
    if (!selectedDispute) return;

    try {
      const updatedDispute: DisputeCase = {
        ...selectedDispute,
        resolutionStatus: 'APPEAL_PENDING',
        appealReason: reason,
        timeline: [
          ...selectedDispute.timeline,
          {
            id: `evt-${Date.now()}`,
            actorType: ActorType.CO_SELECTOR,
            actorName: user?.displayName || '未知用户',
            occurredAt: new Date().toISOString(),
            eventType: 'RESOLUTION_APPEALED',
            description: `已申诉处理结果。原因：${reason.substring(0, 100)}${reason.length > 100 ? '...' : ''}`,
          },
        ],
      };

      setSelectedDispute(updatedDispute);
      setDisputes((prev) =>
        prev.map((d) => (d.id === updatedDispute.id ? updatedDispute : d))
      );

      message.success('申诉提交成功');
    } catch (error) {
      message.error('申诉提交失败');
    }
  };

  // Handle close drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedDispute(null);
  };

  return (
    <div className="disputes-page">
      <Card
        title="争议"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadDisputes}>
              刷新
            </Button>
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : disputes.length === 0 ? (
          <Empty description="未找到争议" />
        ) : (
          <DisputeListTable
            disputes={disputes}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        )}
      </Card>

      <DisputeDetailsDrawer
        open={drawerOpen}
        disputeCase={selectedDispute}
        onClose={handleCloseDrawer}
        onUploadEvidence={handleUploadEvidence}
        onDeleteEvidence={handleDeleteEvidence}
        onSendMessage={handleSendMessage}
        onAcceptResolution={handleAcceptResolution}
        onAppealResolution={handleAppealResolution}
      />
    </div>
  );
};
