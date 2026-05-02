import React, { useState, useEffect } from 'react';
import { Tabs, message, Space } from 'antd';
import type { TabsProps } from 'antd';
import {
  UserOutlined,
  SafetyOutlined,
  BankOutlined,
  FileTextOutlined,
  BellOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { EligibilityBanner } from './EligibilityBanner';
import { KYCStepper, type KYCSubmission } from './KYCStepper';
import { PayoutMethodForm, type BankAccountInfo } from './PayoutMethodForm';
import { NotificationPreferences, type NotificationSettings } from './NotificationPreferences';
import { COIDisclosureForm, type COIDisclosure } from './COIDisclosureForm';
import type { UserProfile } from '../../types';
import { KYCStatus } from '../../types/enums';
import { useAuth } from '../../contexts/AuthContext';
import { mockApi } from '../../services/mockApi';
import './styles.css';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [payableBalance, setPayableBalance] = useState(0);
  const [hasPendingPayout, setHasPendingPayout] = useState(false);

  // Parse query params for deep linking
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const highlight = params.get('highlight');

    if (tab) {
      setActiveTab(tab);
    }

    // Scroll to top and highlight if requested
    if (highlight === 'true') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.search]);

  // Calculate payable balance
  useEffect(() => {
    const loadData = async () => {
      const transactions = await mockApi.transactions.getAll();
      const payable = transactions
        .filter((t) => t.state === 'PAYABLE')
        .reduce((sum, t) => sum + t.amount, 0);
      setPayableBalance(payable);

      // Check for pending payouts
      const payouts = await mockApi.payouts.getAll();
      const pending = payouts.some((p) => p.status === 'REQUESTED');
      setHasPendingPayout(pending);
    };

    loadData();
  }, []);

  // Handle KYC submission
  const handleKYCSubmit = (kycData: KYCSubmission) => {
    if (!user) return;

    // Update user KYC status
    const updatedUser: UserProfile = {
      ...user,
      kycStatus: KYCStatus.SUBMITTED,
      kycSubmittedAt: new Date().toISOString(),
      kycData: {
        fullName: kycData.fullName,
        idNumber: kycData.idNumber,
        idType: kycData.idType,
        dateOfBirth: kycData.dateOfBirth,
        address: kycData.address,
        city: kycData.city,
        province: kycData.province,
        postalCode: kycData.postalCode,
      },
    };

    updateUser(updatedUser);
    message.success('KYC 已提交成功。审核通常需要 1-2 个工作日。');
  };

  // Handle KYC resubmission
  const handleKYCResubmit = (kycData: KYCSubmission) => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      kycStatus: KYCStatus.SUBMITTED,
      kycSubmittedAt: new Date().toISOString(),
      kycRejectionReason: undefined,
      kycData: {
        fullName: kycData.fullName,
        idNumber: kycData.idNumber,
        idType: kycData.idType,
        dateOfBirth: kycData.dateOfBirth,
        address: kycData.address,
        city: kycData.city,
        province: kycData.province,
        postalCode: kycData.postalCode,
      },
    };

    updateUser(updatedUser);
    message.success('KYC 已重新提交成功。审核通常需要 1-2 个工作日。');
  };

  // Handle bank account save
  const handleBankAccountSave = (bankAccount: BankAccountInfo) => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      bankAccount: {
        ...bankAccount,
        verified: false, // Reset verification when changing account
      },
    };

    updateUser(updatedUser);
    message.success('银行账户已保存。请完成验证以启用提现。');
  };

  // Handle bank account verification
  const handleBankAccountVerify = (bankAccount: BankAccountInfo) => {
    if (!user) return;

    // Mock verification process
    const updatedUser: UserProfile = {
      ...user,
      bankAccount: {
        ...bankAccount,
        verified: true,
        verifiedAt: new Date().toISOString(),
      },
    };

    updateUser(updatedUser);
    message.success(
      '测试转账已发起。真实系统中你需要确认收到的金额。'
    );
  };

  // Handle notification preferences save
  const handleNotificationPreferencesSave = (preferences: NotificationSettings) => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      notificationPreferences: preferences,
    };

    updateUser(updatedUser);
    message.success('通知偏好已保存');
  };

  // Handle COI disclosure
  const handleCOIDisclosure = (disclosure: COIDisclosure) => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      coiDisclosure: disclosure,
      accountUnderReview: disclosure.hasConflict, // Block payouts if conflict declared
    };

    updateUser(updatedUser);

    if (disclosure.hasConflict) {
      message.warning(
        '已声明利益冲突。你的账户正在审核中，审核完成前将无法提现。'
      );
    } else {
      message.success('未声明利益冲突。感谢你的诚信披露。');
    }
  };

  if (!user) {
    return <div>加载中...</div>;
  }

  const minThreshold = 50;

  const items: TabsProps['items'] = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          资料
        </span>
      ),
      children: (
        <div>
          <EligibilityBanner
            userProfile={user}
            payableBalance={payableBalance}
            minThreshold={minThreshold}
          />
          {/* Personal info would go here */}
          <div style={{ textAlign: 'center', padding: 64, color: '#8c8c8c' }}>
            <UserOutlined style={{ fontSize: 64, marginBottom: 16 }} />
            <h3>个人信息</h3>
            <p>姓名、邮箱、电话、时区设置</p>
            <p style={{ fontSize: 12 }}>（可通过基础表单实现）</p>
          </div>
        </div>
      ),
    },
    {
      key: 'kyc',
      label: (
        <span>
          <SafetyOutlined />
          KYC 状态
        </span>
      ),
      children: (
        <div>
          <EligibilityBanner
            userProfile={user}
            payableBalance={payableBalance}
            minThreshold={minThreshold}
          />
          <KYCStepper
            userProfile={user}
            onSubmit={handleKYCSubmit}
            onResubmit={handleKYCResubmit}
          />
        </div>
      ),
    },
    {
      key: 'payout',
      label: (
        <span>
          <BankOutlined />
          提现方式
        </span>
      ),
      children: (
        <div>
          <EligibilityBanner
            userProfile={user}
            payableBalance={payableBalance}
            minThreshold={minThreshold}
          />
          <PayoutMethodForm
            userProfile={user}
            hasPendingPayout={hasPendingPayout}
            onSave={handleBankAccountSave}
            onVerify={handleBankAccountVerify}
          />
        </div>
      ),
    },
    {
      key: 'tax',
      label: (
        <span>
          <FileTextOutlined />
          税务信息
        </span>
      ),
      children: (
        <div style={{ textAlign: 'center', padding: 64, color: '#8c8c8c' }}>
          <FileTextOutlined style={{ fontSize: 64, marginBottom: 16 }} />
          <h3>税务信息</h3>
          <p>税号、预扣偏好、税务表单</p>
          <p style={{ fontSize: 12 }}>（后续实现占位）</p>
        </div>
      ),
    },
    {
      key: 'compliance',
      label: (
        <span>
          <SafetyOutlined />
          合规
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <COIDisclosureForm userProfile={user} onSubmit={handleCOIDisclosure} />
          <div style={{ textAlign: 'center', padding: 64, color: '#8c8c8c' }}>
            <SafetyOutlined style={{ fontSize: 64, marginBottom: 16 }} />
            <h3>合规培训</h3>
            <p>必修培训模块、认证和确认记录</p>
            <p style={{ fontSize: 12 }}>（后续实现占位）</p>
          </div>
        </Space>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          通知
        </span>
      ),
      children: (
        <NotificationPreferences
          userProfile={user}
          onSave={handleNotificationPreferencesSave}
        />
      ),
    },
    {
      key: 'rulebook',
      label: (
        <span>
          <BookOutlined />
          规则手册
        </span>
      ),
      children: (
        <div style={{ textAlign: 'center', padding: 64, color: '#8c8c8c' }}>
          <BookOutlined style={{ fontSize: 64, marginBottom: 16 }} />
          <h3>佣金规则手册</h3>
          <p>版本化规则、费率表和政策文件</p>
          <p style={{ fontSize: 12 }}>（后续实现占位）</p>
        </div>
      ),
    },
  ];

  return (
    <div className="profile-container">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </div>
  );
};
