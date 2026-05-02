import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import './PageBreadcrumb.css';

interface BreadcrumbItem {
  path: string;
  label: string;
}

/**
 * Page Breadcrumb Component
 * 
 * Automatically generates breadcrumbs based on current route
 * Per PRD §5: Navigation must include breadcrumbs
 */
const PageBreadcrumb: React.FC = () => {
  const location = useLocation();

  // Route label mapping
  const routeLabels: Record<string, string> = {
    '/': '首页',
    '/assets': '链接管理',
    '/content': '内容',
    '/earnings': '浏览与收益',
    '/payouts': '提现',
    '/inbox': '收件箱',
    '/inbox/notifications': '通知',
    '/inbox/disputes': '争议',
    '/profile': '资料与合规',
    '/profile/settings': '设置',
    '/help': '帮助与术语表',
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home
    breadcrumbs.push({ path: '/', label: '首页' });

    // Build cumulative path
    let currentPath = '';
    pathnames.forEach((pathname) => {
      currentPath += `/${pathname}`;
      const label = routeLabels[currentPath] || pathname;
      breadcrumbs.push({ path: currentPath, label });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  const breadcrumbItems = breadcrumbs.map((item, index) => {
    const isLast = index === breadcrumbs.length - 1;

    return {
      key: item.path,
      title: index === 0 ? (
        <Link to={item.path}>
          <HomeOutlined /> {item.label}
        </Link>
      ) : isLast ? (
        <span>{item.label}</span>
      ) : (
        <Link to={item.path}>{item.label}</Link>
      ),
    };
  });

  return <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} />;
};

export default PageBreadcrumb;
