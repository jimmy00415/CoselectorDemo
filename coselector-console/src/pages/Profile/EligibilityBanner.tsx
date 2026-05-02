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
          label: '尚未开始 KYC 验证',
          resolved: false,
          action: '开始 KYC',
          target: '/profile?tab=kyc&highlight=true',
          priority: 1,
        });
      } else if (userProfile.kycStatus === KYCStatus.REJECTED) {
        issues.push({
          key: 'kyc',
          label: 'KYC 验证已拒绝 - 需要重新提交',
          resolved: false,
          action: '重新提交 KYC',
          target: '/profile?tab=kyc&highlight=true',
          priority: 1,
        });
      } else if (userProfile.kycStatus === KYCStatus.SUBMITTED) {
        // Non-blocking for SUBMITTED (under review)
        issues.push({
          key: 'kyc',
          label: 'KYC 审核中（不阻塞）',
          resolved: false,
          action: '查看状态',
          target: '/profile?tab=kyc',
          priority: 3,
        });
      }
    }

    // Priority 2: Payout method check
    if (!userProfile.bankAccount?.bankName) {
      issues.push({
        key: 'bank',
        label: '尚未配置银行账户',
        resolved: false,
        action: '添加银行账户',
        target: '/profile?tab=payout&highlight=true',
        priority: 2,
      });
    } else if (!userProfile.bankAccount?.verified) {
      issues.push({
        key: 'bank-verify',
        label: '银行账户尚未验证',
        resolved: false,
        action: '验证账户',
        target: '/profile?tab=payout&highlight=true',
        priority: 2,
      });
    }

    // Priority 3: Minimum threshold
    if (payableBalance < minThreshold) {
      issues.push({
        key: 'threshold',
        label: `可提现余额低于最低门槛（¥${minThreshold}）`,
        resolved: false,
        action: '查看收益',
        target: '/earnings',
        priority: 3,
      });
    }

    // Priority 4: Account frozen/under review (critical)
    if (userProfile.accountFrozen) {
      issues.push({
        key: 'frozen',
        label: '账户已冻结或正在审核',
        resolved: false,
        action: '联系支持',
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
        message="符合提现条件"
        description={`所有要求均已满足。你可以申请提取 ¥${payableBalance.toFixed(2)} 的可提现余额。`}
        icon={<CheckCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
        action={
          <Button type="primary" size="small" onClick={() => navigate('/earnings?tab=payouts')}>
            申请提现
          </Button>
        }
      />
    );
  }

  return (
    <Alert
      type="error"
      message="提现受阻"
      description={
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <span>
            申请提现前请先解决以下问题（{blockingIssues.length} 项阻塞）：
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
                      阻塞
                    </Tag>
                  ) : (
                    <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                      警告
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
