import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './layout/MainLayout';

// Page imports
import HomePage from './pages/Home';
import AssetsPage from './pages/Assets';
import ContentPage from './pages/Content';
import LeadsPage from './pages/Leads';
import { LeadDetailView } from './pages/Leads/LeadDetailView';
import EarningsPage from './pages/Earnings';
import PayoutsPage from './pages/Payouts';
import InboxPage from './pages/Inbox';
import NotificationsPage from './pages/Notifications';
import DisputesPage from './pages/Disputes';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import HelpPage from './pages/Help';
import NotFoundPage from './pages/NotFound';
import ComponentShowcase from './pages/ComponentShowcase';

import './styles/global.css';

/**
 * Application Router Configuration
 * 
 * Per PRD §5: Complete navigation structure with 7 main modules
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'assets',
        element: <AssetsPage />,
      },
      {
        path: 'assets/:assetId',
        element: <AssetsPage />,
      },
      {
        path: 'content',
        element: <ContentPage />,
      },
      {
        path: 'content/:contentId',
        element: <ContentPage />,
      },
      {
        path: 'leads',
        element: <LeadsPage />,
      },
      {
        path: 'leads/:id',
        element: <LeadDetailView />,
      },
      {
        path: 'earnings',
        element: <EarningsPage />,
      },
      {
        path: 'earnings/:transactionId',
        element: <EarningsPage />,
      },
      {
        path: 'payouts',
        element: <PayoutsPage />,
      },
      {
        path: 'payouts/:payoutId',
        element: <PayoutsPage />,
      },
      {
        path: 'inbox',
        element: <InboxPage />,
      },
      {
        path: 'inbox/notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'inbox/disputes',
        element: <DisputesPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'profile/settings',
        element: <SettingsPage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
      {
        path: 'showcase',
        element: <ComponentShowcase />,
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 4,
          fontSize: 14,
        },
      }}
    >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
