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
    '/': 'Home',
    '/assets': 'Links',
    '/content': 'Content',
    '/leads': 'Co-selection',
    '/earnings': 'Earnings',
    '/payouts': 'Payouts',
    '/inbox': 'Inbox',
    '/inbox/notifications': 'Notifications',
    '/inbox/disputes': 'Disputes',
    '/profile': 'Profile & Compliance',
    '/profile/settings': 'Settings',
    '/help': 'Help & Glossary',
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home
    breadcrumbs.push({ path: '/', label: 'Home' });

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

  return (
    <Breadcrumb className="page-breadcrumb">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <Breadcrumb.Item key={item.path}>
            {index === 0 ? (
              <Link to={item.path}>
                <HomeOutlined /> {item.label}
              </Link>
            ) : isLast ? (
              <span>{item.label}</span>
            ) : (
              <Link to={item.path}>{item.label}</Link>
            )}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default PageBreadcrumb;
