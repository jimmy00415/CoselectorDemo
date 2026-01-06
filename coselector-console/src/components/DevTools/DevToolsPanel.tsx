import React, { useState } from 'react';
import { 
  Drawer, 
  Tabs, 
  Button, 
  Space, 
  Typography, 
  Switch, 
  Divider,
  message,
  Alert,
  Card,
  Select,
  Input,
  Form
} from 'antd';
import {
  BugOutlined,
  UserSwitchOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  ReloadOutlined,
  PlusOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useDevTools } from '../../contexts/DevToolsContext';
import { UserRole, LeadStatus, ActorType } from '../../types/enums';
import { mockApi } from '../../services/mockApi';
import { 
  generateMockLead, 
  generateLeadBatch, 
  createCustomTimelineEvent,
  generateUserProfile 
} from '../../utils/devTools';
import './devTools.css';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

/**
 * Developer Tools Panel Component
 * 
 * Design Principles:
 * - Tab-based organization for different utilities
 * - Clear visual hierarchy
 * - Immediate feedback for all actions
 * - Undo/reset capabilities
 * - Non-destructive by default (with warnings)
 */
export const DevToolsPanel: React.FC = () => {
  const devTools = useDevTools();
  const { user, role, switchRole } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  if (!devTools) return null;

  const { state, closePanel } = devTools;

  // Role Switching
  const handleRoleSwitch = async (newRole: UserRole) => {
    try {
      generateUserProfile(newRole); // Validate role exists
      switchRole(newRole);
      message.success(`Switched to ${newRole} role`);
    } catch (error) {
      message.error('Failed to switch role');
    }
  };

  // Mock Data Generation
  const handleGenerateSingleLead = async (status: LeadStatus) => {
    try {
      setLoading(true);
      const lead = generateMockLead({ 
        status, 
        hasOwner: status !== LeadStatus.SUBMITTED,
        hasMissingInfo: status === LeadStatus.INFO_REQUESTED 
      });
      
      await mockApi.leads.create(lead);
      message.success(`Generated ${status} lead: ${lead.merchantName}`);
    } catch (error) {
      message.error('Failed to generate lead');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    try {
      setLoading(true);
      const leads = generateLeadBatch(10);
      
      for (const lead of leads) {
        await mockApi.leads.create(lead);
      }
      
      message.success(`Generated ${leads.length} diverse leads`);
    } catch (error) {
      message.error('Failed to generate lead batch');
    } finally {
      setLoading(false);
    }
  };

  // Timeline Injection
  const handleInjectTimelineEvent = async (values: any) => {
    try {
      setLoading(true);
      const leadId = values.leadId;
      const lead = await mockApi.leads.getById(leadId);
      
      if (!lead) {
        message.error('Lead not found');
        return;
      }
      
      const event = createCustomTimelineEvent(
        lead,
        values.eventType,
        values.actorType as ActorType,
        values.reasonCode,
        values.metadata ? JSON.parse(values.metadata) : undefined
      );

      await mockApi.leads.update(leadId, {
        timeline: [...lead.timeline, event],
        lastUpdatedAt: new Date().toISOString()
      });

      message.success('Timeline event injected successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to inject timeline event');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Status Toggle (commented out for future use)
  // const handleStatusToggle = async (leadId: string, newStatus: LeadStatus) => {
  //   try {
  //     setLoading(true);
  //     const lead = await mockApi.leads.getById(leadId);
  //     
  //     if (!lead) {
  //       message.error('Lead not found');
  //       return;
  //     }
  //     
  //     const event = createCustomTimelineEvent(
  //       lead,
  //       'STATUS_CHANGED',
  //       ActorType.SYSTEM,
  //       'DEV_TOOLS_OVERRIDE',
  //       {
  //         previousStatus: lead.status,
  //         newStatus,
  //         note: 'Changed via Dev Tools'
  //       }
  //     );
  //
  //     await mockApi.leads.update(leadId, {
  //       status: newStatus,
  //       timeline: [...lead.timeline, event],
  //       lastUpdatedAt: new Date().toISOString()
  //     });
  //
  //     message.success(`Status changed to ${newStatus}`);
  //   } catch (error) {
  //     message.error('Failed to update status');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Data Reset
  const handleResetData = () => {
    if (window.confirm('⚠️ This will delete ALL leads and reset to default state. Continue?')) {
      try {
        localStorage.removeItem('coselector_leads');
        message.success('All data cleared. Refresh page to see default state.');
      } catch (error) {
        message.error('Failed to reset data');
      }
    }
  };

  // Refresh from Storage
  const handleRefreshFromStorage = () => {
    try {
      window.location.reload();
      message.info('Refreshing...');
    } catch (error) {
      message.error('Failed to refresh');
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <BugOutlined style={{ color: '#1890ff' }} />
          <span>Developer Tools</span>
        </Space>
      }
      placement="right"
      width={600}
      open={state.isPanelOpen}
      onClose={closePanel}
      className="dev-tools-drawer"
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          Ctrl+Shift+D
        </Text>
      }
    >
      <Alert
        message="Prototype Mode"
        description="These tools are for demo and testing purposes only. Changes affect localStorage only."
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      <Tabs defaultActiveKey="role">
        {/* Role Switching Tab */}
        <TabPane
          tab={
            <span>
              <UserSwitchOutlined />
              Role
            </span>
          }
          key="role"
        >
          <Card title="Switch User Role" size="small">
            <Paragraph type="secondary">
              Current Role: <Text strong>{role}</Text>
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              Switch between roles to test different permission scenarios. UI will update immediately.
            </Paragraph>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                block
                type={role === UserRole.CO_SELECTOR ? 'primary' : 'default'}
                onClick={() => handleRoleSwitch(UserRole.CO_SELECTOR)}
                icon={<UserSwitchOutlined />}
              >
                Co-Selector (CO_SELECTOR)
              </Button>
              <Button
                block
                type={role === UserRole.OPS_BD ? 'primary' : 'default'}
                onClick={() => handleRoleSwitch(UserRole.OPS_BD)}
                icon={<UserSwitchOutlined />}
              >
                Ops/BD (OPS_BD)
              </Button>
              <Button
                block
                type={role === UserRole.FINANCE ? 'primary' : 'default'}
                onClick={() => handleRoleSwitch(UserRole.FINANCE)}
                icon={<UserSwitchOutlined />}
              >
                Finance (FINANCE)
              </Button>
            </Space>

            <Divider />

            <Paragraph style={{ fontSize: 12, marginBottom: 0 }}>
              <Text type="secondary">
                • CO_SELECTOR: Can create/submit leads<br/>
                • OPS_BD: Can review/approve/reject<br/>
                • FINANCE: View-only access
              </Text>
            </Paragraph>
          </Card>
        </TabPane>

        {/* Mock Data Tab */}
        <TabPane
          tab={
            <span>
              <DatabaseOutlined />
              Data
            </span>
          }
          key="data"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="Generate Single Lead" size="small">
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                Create a single lead in specific status for testing workflows.
              </Paragraph>
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.values(LeadStatus).map(status => (
                  <Button
                    key={status}
                    block
                    onClick={() => handleGenerateSingleLead(status)}
                    loading={loading}
                    icon={<PlusOutlined />}
                  >
                    Generate {status} Lead
                  </Button>
                ))}
              </Space>
            </Card>

            <Card title="Generate Batch" size="small">
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                Create 10 diverse leads covering all status scenarios.
              </Paragraph>
              <Button
                block
                type="primary"
                onClick={handleGenerateBatch}
                loading={loading}
                icon={<DatabaseOutlined />}
              >
                Generate 10 Diverse Leads
              </Button>
            </Card>

            <Card title="Data Management" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  onClick={handleRefreshFromStorage}
                  icon={<ReloadOutlined />}
                >
                  Refresh from Storage
                </Button>
                <Button
                  block
                  danger
                  onClick={handleResetData}
                  icon={<DatabaseOutlined />}
                >
                  Reset All Data
                </Button>
              </Space>
            </Card>
          </Space>
        </TabPane>

        {/* Timeline Injection Tab */}
        <TabPane
          tab={
            <span>
              <ClockCircleOutlined />
              Timeline
            </span>
          }
          key="timeline"
        >
          <Card title="Inject Timeline Event" size="small">
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              Manually add timeline events to any lead for testing audit trail.
            </Paragraph>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleInjectTimelineEvent}
            >
              <Form.Item
                name="leadId"
                label="Lead ID"
                rules={[{ required: true, message: 'Please enter lead ID' }]}
              >
                <Input placeholder="Enter lead ID (e.g., lead_123)" />
              </Form.Item>

              <Form.Item
                name="eventType"
                label="Event Type"
                rules={[{ required: true, message: 'Please select event type' }]}
              >
                <Select placeholder="Select event type">
                  <Select.Option value="STATUS_CHANGED">Status Changed</Select.Option>
                  <Select.Option value="OWNER_ASSIGNED">Owner Assigned</Select.Option>
                  <Select.Option value="INFO_REQUESTED">Info Requested</Select.Option>
                  <Select.Option value="APPROVED">Approved</Select.Option>
                  <Select.Option value="REJECTED">Rejected</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="actorType"
                label="Actor Type"
                rules={[{ required: true, message: 'Please select actor type' }]}
              >
                <Select placeholder="Select actor type">
                  <Select.Option value={ActorType.CO_SELECTOR}>CO_SELECTOR</Select.Option>
                  <Select.Option value={ActorType.OPS_BD}>OPS_BD</Select.Option>
                  <Select.Option value={ActorType.SYSTEM}>SYSTEM</Select.Option>
                  <Select.Option value={ActorType.FINANCE}>FINANCE</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="reasonCode"
                label="Reason Code"
                rules={[{ required: true, message: 'Please enter reason code' }]}
              >
                <Input placeholder="e.g., MANUAL_OVERRIDE" />
              </Form.Item>

              <Form.Item
                name="metadata"
                label="Metadata (JSON)"
                help="Optional JSON object for additional data"
              >
                <TextArea 
                  rows={3} 
                  placeholder='{"previousStatus": "SUBMITTED", "newStatus": "APPROVED"}' 
                />
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                icon={<ThunderboltOutlined />}
              >
                Inject Event
              </Button>
            </Form>
          </Card>
        </TabPane>

        {/* Settings Tab */}
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              Settings
            </span>
          }
          key="settings"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="DevTools Settings" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Keyboard Shortcuts (Ctrl+Shift+D)</Text>
                  <Switch
                    checked={state.keyboardShortcuts}
                    onChange={devTools.setKeyboardShortcuts}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Auto Refresh</Text>
                  <Switch
                    checked={state.autoRefresh}
                    onChange={devTools.setAutoRefresh}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Mock Data Enabled</Text>
                  <Switch
                    checked={state.mockDataEnabled}
                    onChange={devTools.setMockDataEnabled}
                  />
                </div>
              </Space>
            </Card>

            <Card title="Environment Info" size="small">
              <Paragraph style={{ fontSize: 12, marginBottom: 8 }}>
                <Text type="secondary">
                  <strong>Mode:</strong> {process.env.NODE_ENV}<br/>
                  <strong>User:</strong> {user?.displayName}<br/>
                  <strong>Role:</strong> {role}<br/>
                  <strong>Storage:</strong> localStorage
                </Text>
              </Paragraph>
            </Card>

            <Button
              block
              danger
              onClick={devTools.resetSettings}
            >
              Reset All Settings
            </Button>
          </Space>
        </TabPane>
      </Tabs>
    </Drawer>
  );
};
