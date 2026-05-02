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
import { translateStatus, translateText } from '../../utils/i18n';
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
      message.success(`已切换到 ${translateText(newRole)} 角色`);
    } catch (error) {
      message.error('角色切换失败');
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
      message.success(`已生成${translateStatus(status)}线索：${lead.merchantName}`);
    } catch (error) {
      message.error('线索生成失败');
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
      
      message.success(`已生成 ${leads.length} 条多样化线索`);
    } catch (error) {
      message.error('批量生成线索失败');
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
        message.error('未找到线索');
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

      message.success('时间线事件已注入');
      form.resetFields();
    } catch (error) {
      message.error('注入时间线事件失败');
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
    if (window.confirm('这将删除所有线索并重置为默认状态。是否继续？')) {
      try {
        localStorage.removeItem('coselector_leads');
        message.success('所有数据已清除。刷新页面可查看默认状态。');
      } catch (error) {
        message.error('重置数据失败');
      }
    }
  };

  // Refresh from Storage
  const handleRefreshFromStorage = () => {
    try {
      window.location.reload();
      message.info('正在刷新...');
    } catch (error) {
      message.error('刷新失败');
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <BugOutlined style={{ color: '#1890ff' }} />
          <span>开发工具</span>
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
        message="原型模式"
        description="这些工具仅用于演示和测试，变更只会影响 localStorage。"
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
              角色
            </span>
          }
          key="role"
        >
          <Card title="切换用户角色" size="small">
            <Paragraph type="secondary">
              当前角色：<Text strong>{translateText(role)}</Text>
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              在不同角色间切换，以测试不同权限场景。界面会立即更新。
            </Paragraph>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                block
                type={role === UserRole.CO_SELECTOR ? 'primary' : 'default'}
                onClick={() => handleRoleSwitch(UserRole.CO_SELECTOR)}
                icon={<UserSwitchOutlined />}
              >
                协同遴选者（CO_SELECTOR）
              </Button>
              <Button
                block
                type={role === UserRole.OPS_BD ? 'primary' : 'default'}
                onClick={() => handleRoleSwitch(UserRole.OPS_BD)}
                icon={<UserSwitchOutlined />}
              >
                运营/BD（OPS_BD）
              </Button>
              <Button
                block
                type={role === UserRole.FINANCE ? 'primary' : 'default'}
                onClick={() => handleRoleSwitch(UserRole.FINANCE)}
                icon={<UserSwitchOutlined />}
              >
                财务（FINANCE）
              </Button>
            </Space>

            <Divider />

            <Paragraph style={{ fontSize: 12, marginBottom: 0 }}>
              <Text type="secondary">
                CO_SELECTOR：可创建/提交线索<br/>
                OPS_BD：可审核/通过/拒绝<br/>
                FINANCE：只读访问
              </Text>
            </Paragraph>
          </Card>
        </TabPane>

        {/* Mock Data Tab */}
        <TabPane
          tab={
            <span>
              <DatabaseOutlined />
              数据
            </span>
          }
          key="data"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="生成单条线索" size="small">
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                创建指定状态的单条线索，用于测试工作流。
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
                    生成{translateStatus(status)}线索
                  </Button>
                ))}
              </Space>
            </Card>

            <Card title="批量生成" size="small">
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                创建 10 条覆盖各类状态场景的线索。
              </Paragraph>
              <Button
                block
                type="primary"
                onClick={handleGenerateBatch}
                loading={loading}
                icon={<DatabaseOutlined />}
              >
                生成 10 条多样化线索
              </Button>
            </Card>

            <Card title="数据管理" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  onClick={handleRefreshFromStorage}
                  icon={<ReloadOutlined />}
                >
                  从存储刷新
                </Button>
                <Button
                  block
                  danger
                  onClick={handleResetData}
                  icon={<DatabaseOutlined />}
                >
                  重置所有数据
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
              时间线
            </span>
          }
          key="timeline"
        >
          <Card title="注入时间线事件" size="small">
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              手动向任意线索添加时间线事件，用于测试审计轨迹。
            </Paragraph>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleInjectTimelineEvent}
            >
              <Form.Item
                name="leadId"
                label="线索 ID"
                rules={[{ required: true, message: '请输入线索 ID' }]}
              >
                <Input placeholder="输入线索 ID（例如 lead_123）" />
              </Form.Item>

              <Form.Item
                name="eventType"
                label="事件类型"
                rules={[{ required: true, message: '请选择事件类型' }]}
              >
                <Select placeholder="选择事件类型">
                  <Select.Option value="STATUS_CHANGED">状态已变更</Select.Option>
                  <Select.Option value="OWNER_ASSIGNED">负责人已分配</Select.Option>
                  <Select.Option value="INFO_REQUESTED">需补充信息</Select.Option>
                  <Select.Option value="APPROVED">已通过</Select.Option>
                  <Select.Option value="REJECTED">已拒绝</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="actorType"
                label="操作者类型"
                rules={[{ required: true, message: '请选择操作者类型' }]}
              >
                <Select placeholder="选择操作者类型">
                  <Select.Option value={ActorType.CO_SELECTOR}>协同遴选者</Select.Option>
                  <Select.Option value={ActorType.OPS_BD}>运营/BD</Select.Option>
                  <Select.Option value={ActorType.SYSTEM}>系统</Select.Option>
                  <Select.Option value={ActorType.FINANCE}>财务</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="reasonCode"
                label="原因代码"
                rules={[{ required: true, message: '请输入原因代码' }]}
              >
                <Input placeholder="例如：MANUAL_OVERRIDE" />
              </Form.Item>

              <Form.Item
                name="metadata"
                label="元数据（JSON）"
                help="可选 JSON 对象，用于补充数据"
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
                注入事件
              </Button>
            </Form>
          </Card>
        </TabPane>

        {/* Settings Tab */}
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              设置
            </span>
          }
          key="settings"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title="开发工具设置" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>键盘快捷键（Ctrl+Shift+D）</Text>
                  <Switch
                    checked={state.keyboardShortcuts}
                    onChange={devTools.setKeyboardShortcuts}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>自动刷新</Text>
                  <Switch
                    checked={state.autoRefresh}
                    onChange={devTools.setAutoRefresh}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>启用模拟数据</Text>
                  <Switch
                    checked={state.mockDataEnabled}
                    onChange={devTools.setMockDataEnabled}
                  />
                </div>
              </Space>
            </Card>

            <Card title="环境信息" size="small">
              <Paragraph style={{ fontSize: 12, marginBottom: 8 }}>
                <Text type="secondary">
                  <strong>模式：</strong> {process.env.NODE_ENV}<br/>
                  <strong>用户：</strong> {user?.displayName}<br/>
                  <strong>角色：</strong> {translateText(role)}<br/>
                  <strong>存储：</strong> localStorage
                </Text>
              </Paragraph>
            </Card>

            <Button
              block
              danger
              onClick={devTools.resetSettings}
            >
              重置所有设置
            </Button>
          </Space>
        </TabPane>
      </Tabs>
    </Drawer>
  );
};
