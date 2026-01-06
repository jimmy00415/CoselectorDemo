import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { DevToolsProvider } from './contexts/DevToolsContext';
import { DevToolsPanel } from './components/DevTools';
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
import { AdminReviewQueue } from './pages/Admin';

import './styles/global.css';

/**
 * Application Router Configuration
 * 
 * Per PRD §5: Complete navigation structure with 7 main modules
 * Using HashRouter for GitHub Pages compatibility
 */

/**
 * Application Router Configuration
 * 
 * Per PRD §5: Complete navigation structure with 7 main modules
 * Using HashRouter for GitHub Pages compatibility
 */

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
      <DevToolsProvider forceEnable={true}>
        <AuthProvider>
          <DevToolsPanel />
          <HashRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="assets/:assetId" element={<AssetsPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="content/:contentId" element={<ContentPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="leads/:id" element={<LeadDetailView />} />
              <Route path="admin/review-queue" element={<AdminReviewQueue />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="earnings/:transactionId" element={<EarningsPage />} />
              <Route path="payouts" element={<PayoutsPage />} />
              <Route path="payouts/:payoutId" element={<PayoutsPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="inbox/notifications" element={<NotificationsPage />} />
              <Route path="inbox/disputes" element={<DisputesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="showcase" element={<ComponentShowcase />} />
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </HashRouter>
        </AuthProvider>
      </DevToolsProvider>
    </ConfigProvider>
  );
};

export default App;
