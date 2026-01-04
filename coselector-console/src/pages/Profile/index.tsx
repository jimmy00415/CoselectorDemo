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
    message.success('KYC submitted successfully. Review typically takes 1-2 business days.');
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
    message.success('KYC resubmitted successfully. Review typically takes 1-2 business days.');
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
    message.success('Bank account saved. Please verify to enable payouts.');
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
      'Test transfer initiated. In a real system, you would confirm the amount received.'
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
    message.success('Notification preferences saved');
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
        'Conflict declared. Your account is under review. Payouts are blocked until review is complete.'
      );
    } else {
      message.success('No conflicts declared. Thank you for your good faith disclosure.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const minThreshold = 50;

  const items: TabsProps['items'] = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile
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
            <h3>Personal Information</h3>
            <p>Name, email, phone, timezone settings</p>
            <p style={{ fontSize: 12 }}>(Can be implemented with basic form)</p>
          </div>
        </div>
      ),
    },
    {
      key: 'kyc',
      label: (
        <span>
          <SafetyOutlined />
          KYC Status
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
          Payout Method
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
          Tax Info
        </span>
      ),
      children: (
        <div style={{ textAlign: 'center', padding: 64, color: '#8c8c8c' }}>
          <FileTextOutlined style={{ fontSize: 64, marginBottom: 16 }} />
          <h3>Tax Information</h3>
          <p>Tax ID, withholding preferences, tax forms</p>
          <p style={{ fontSize: 12 }}>(Placeholder for future implementation)</p>
        </div>
      ),
    },
    {
      key: 'compliance',
      label: (
        <span>
          <SafetyOutlined />
          Compliance
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <COIDisclosureForm userProfile={user} onSubmit={handleCOIDisclosure} />
          <div style={{ textAlign: 'center', padding: 64, color: '#8c8c8c' }}>
            <SafetyOutlined style={{ fontSize: 64, marginBottom: 16 }} />
            <h3>Compliance Training</h3>
            <p>Required training modules, certifications, acknowledgments</p>
            <p style={{ fontSize: 12 }}>(Placeholder for future implementation)</p>
          </div>
        </Space>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
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
          Rulebook
        </span>
      ),
      children: (
        <div style={{ textAlign: 'center', padding: 64, color: '#8c8c8c' }}>
          <BookOutlined style={{ fontSize: 64, marginBottom: 16 }} />
          <h3>Commission Rulebook</h3>
          <p>Versioned rules, rate tables, policy documents</p>
          <p style={{ fontSize: 12 }}>(Placeholder for future implementation)</p>
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
