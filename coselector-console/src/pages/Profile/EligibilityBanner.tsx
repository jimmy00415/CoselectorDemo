import React from 'react';
import { Card, Alert, Space, Tag, Button, Divider } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  BankOutlined,
  DollarOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { UserProfile } from '../../types';
import { KYCStatus } from '../../types/enums';
import { useNavigate, useLocation } from 'react-router-dom';

interface EligibilityBannerProps {
  userProfile: UserProfile;
  payableBalance: number;
  minThreshold: number;
}

interface EligibilityIssue {
  key: string;
  label: string;
  resolved: boolean;
  action: string;
  target: string;
  priority: number;
}

export const EligibilityBanner: React.FC<EligibilityBannerProps> = ({
  userProfile,
  payableBalance,
  minThreshold,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const checkEligibility = (): { isEligible: boolean; issues: EligibilityIssue[] } => {
    const issues: EligibilityIssue[] = [];

    // Priority 1: KYC check (most critical)
    if (userProfile.kycStatus !== KYCStatus.APPROVED) {
      if (userProfile.kycStatus === KYCStatus.NOT_STARTED) {
        issues.push({
          key: 'kyc',
          label: 'KYC verification not started',
          resolved: false,
          action: 'Start KYC',
          target: '/profile?tab=kyc&highlight=true',
          priority: 1,
        });
      } else if (userProfile.kycStatus === KYCStatus.REJECTED) {
        issues.push({
          key: 'kyc',
          label: 'KYC verification rejected - resubmit required',
          resolved: false,
          action: 'Resubmit KYC',
          target: '/profile?tab=kyc&highlight=true',
          priority: 1,
        });
      } else if (userProfile.kycStatus === KYCStatus.SUBMITTED) {
        // Non-blocking for SUBMITTED (under review)
        issues.push({
          key: 'kyc',
          label: 'KYC under review (non-blocking)',
          resolved: false,
          action: 'Check Status',
          target: '/profile?tab=kyc',
          priority: 3,
        });
      }
    }

    // Priority 2: Payout method check
    if (!userProfile.bankAccount?.bankName) {
      issues.push({
        key: 'bank',
        label: 'Bank account not configured',
        resolved: false,
        action: 'Add Bank Account',
        target: '/profile?tab=payout&highlight=true',
        priority: 2,
      });
    } else if (!userProfile.bankAccount?.verified) {
      issues.push({
        key: 'bank-verify',
        label: 'Bank account not verified',
        resolved: false,
        action: 'Verify Account',
        target: '/profile?tab=payout&highlight=true',
        priority: 2,
      });
    }

    // Priority 3: Minimum threshold
    if (payableBalance < minThreshold) {
      issues.push({
        key: 'threshold',
        label: `Payable balance below minimum threshold (¥${minThreshold})`,
        resolved: false,
        action: 'View Earnings',
        target: '/earnings',
        priority: 3,
      });
    }

    // Priority 4: Account frozen/under review (critical)
    if (userProfile.accountFrozen) {
      issues.push({
        key: 'frozen',
        label: 'Account is frozen or under review',
        resolved: false,
        action: 'Contact Support',
        target: '/profile?tab=compliance',
        priority: 1,
      });
    }

    // Filter out non-blocking issues for eligibility check
    const blockingIssues = issues.filter(
      (issue) => issue.priority <= 2 && issue.key !== 'kyc-submitted'
    );

    return {
      isEligible: blockingIssues.length === 0,
      issues: issues.sort((a, b) => a.priority - b.priority),
    };
  };

  const { isEligible, issues } = checkEligibility();
  const blockingIssues = issues.filter((issue) => issue.priority <= 2);

  const handleFixNow = (target: string) => {
    // If already on profile page, just update query params
    if (location.pathname === '/profile') {
      const url = new URL(target, window.location.origin);
      const tab = url.searchParams.get('tab');
      const highlight = url.searchParams.get('highlight');
      navigate(`/profile?tab=${tab}${highlight ? '&highlight=true' : ''}`);
    } else {
      navigate(target);
    }
  };

  if (isEligible) {
    return (
      <Alert
        type="success"
        message="Eligible for Payout"
        description={`All requirements met. You can request a withdrawal for your payable balance of ¥${payableBalance.toFixed(2)}.`}
        icon={<CheckCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
        action={
          <Button type="primary" size="small" onClick={() => navigate('/earnings?tab=payouts')}>
            Request Payout
          </Button>
        }
      />
    );
  }

  return (
    <Alert
      type="error"
      message="Payout Blocked"
      description={
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <span>
            Please resolve the following issues before requesting a payout (
            {blockingIssues.length} blocking):
          </span>
          <Divider style={{ margin: '8px 0' }} />
          {issues.map((issue) => {
            const isBlocking = issue.priority <= 2;
            const icon = issue.key.includes('kyc') ? (
              <SafetyOutlined />
            ) : issue.key.includes('bank') ? (
              <BankOutlined />
            ) : issue.key.includes('threshold') ? (
              <DollarOutlined />
            ) : (
              <LockOutlined />
            );

            return (
              <Space key={issue.key} style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small">
                  {icon}
                  <span>{issue.label}</span>
                  {isBlocking ? (
                    <Tag color="red" icon={<CloseCircleOutlined />}>
                      Blocking
                    </Tag>
                  ) : (
                    <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                      Warning
                    </Tag>
                  )}
                </Space>
                <Button type="link" size="small" onClick={() => handleFixNow(issue.target)}>
                  {issue.action}
                </Button>
              </Space>
            );
          })}
        </Space>
      }
      icon={<ExclamationCircleOutlined />}
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};
