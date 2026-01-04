# Co-Selector Console

A comprehensive KOL (Key Opinion Leader) commission management platform for China affiliate marketing programs. Built with React 18, TypeScript, and Ant Design.

## 📋 Overview

The Co-Selector Console enables content creators to manage their affiliate marketing operations with 14 integrated modules:

### Core Features
- **🔗 Assets Management**: Track links, QR codes, and invite codes with real-time analytics
- **📝 Content Management**: Associate content items with tracking assets across platforms
- **👥 Leads Management**: Submit and track merchant partnership applications
- **💰 Earnings Tracking**: Real-time commission data with detailed transaction traces
- **💸 Payouts Management**: Withdraw earnings with state machine-based approval workflows
- **⚖️ Disputes Handling**: Manage chargebacks with evidence submission and resolution workflows
- **👤 Profile Management**: 7-tab comprehensive profile with KYC, payment methods, and compliance
- **🔧 Dev Tools**: Time manipulation, transaction simulation, and data management for testing

### Technical Stack
- **Frontend**: React 18.3.1, TypeScript 5.7.3
- **UI Library**: Ant Design 6.1.3
- **State Management**: React Hooks + Context API
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Mock Backend**: localStorage-based with state machines
- **Architecture**: Feature-based organization with shared components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested with v10.9.3)
- npm 9+

### Installation & Launch

```powershell
# Navigate to project directory
cd d:\VS_PROJECT\CoselectorDemo\coselector-console

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

The app will open at **http://localhost:3000**

### Login Credentials

**Default Test Account**:
- **Username**: `demo@coselector.com`
- **Password**: Any password (mock authentication)
- **Role**: CO_SELECTOR (full access)

## 🎯 Quick Testing (10 Minutes)

### 1. First Login & Dashboard (1 min)
- Login with demo credentials
- View dashboard with 4 KPI cards (Total Earnings, Pending Payouts, Active Assets, Conversion Rate)
- Check sidebar navigation (8 menu items)

### 2. Open Dev Tools (30 seconds)
**Press `Ctrl + Shift + D`** → Dev Tools drawer opens on the right!

Features:
- ⏰ **Time Machine**: Advance time to unlock transactions
- 🔄 **Transaction Reversals**: Simulate refunds/disputes
- ✅ **Quick Actions**: Approve/reject leads, manage KYC status
- ⚡ **Data Generation**: Create test transactions/events
- 🗄️ **Data Management**: Reset to seed data

### 3. Test Time Machine (2 min)
1. In Dev Tools, go to **Time Machine** tab
2. Set "Advance Time By" to: **35 days**
3. Preview: "Will Unlock: X transactions"
4. Click **"Advance Time"** button
5. Navigate to **Earnings** page
6. Verify transactions moved from LOCKED to PAYABLE state

### 4. Test Asset Tracking (2 min)
1. Navigate to **Assets** page
2. Click on any asset card
3. View detail drawer with:
   - QR code visualization
   - Performance metrics (Views, Clicks, Conversions)
   - Recent activity timeline
4. Test copy functionality for tracking links

### 5. Test Transaction Reversal (3 min)
1. Go to **Earnings** page → **Payouts** tab
2. Find a completed payout
3. Open Dev Tools (`Ctrl + Shift + D`)
4. Go to **Transaction Reversals** tab
5. Select payout ID and reason (e.g., "Dispute Chargeback")
6. Click **"Create Reversal"**
7. Return to Earnings and verify reversal transaction appears

### 6. Test Disputes Workflow (2 min)
1. Navigate to **Disputes** page
2. Click on any dispute case
3. View dispute details drawer with:
   - Timeline of events
   - Evidence attachments
   - Messaging history
4. Test evidence upload (simulated)
5. Test message sending

## 📚 Comprehensive Testing Guide

For full module-by-module testing (2+ hours), follow these phases:

### Phase 1: Basic Navigation (5 min)
- Explore all 8 main pages
- Test sidebar navigation
- Verify top navigation with user dropdown

### Phase 2: Assets Management (15 min)
- View asset details with analytics
- Test asset creation workflow
- Verify QR code generation
- Check performance metrics

### Phase 3: Content Management (15 min)
- View content items across platforms
- Test content-asset associations
- Filter by status and channel
- Check platform-specific badges

### Phase 4: Leads Management (20 min)
- Submit new merchant lead
- Track lead status (SUBMITTED → UNDER_REVIEW → APPROVED)
- Use Dev Tools to quick approve
- Test fraud flag toggling

### Phase 5: Earnings Tracking (20 min)
- View transaction list with state badges
- Open transaction trace drawer
- Test time-based state transitions (LOCKED → PAYABLE → PAID)
- Filter by date range and state

### Phase 6: Payouts Management (15 min)
- Request payout (select PAYABLE transactions)
- Track payout status (DRAFT → PENDING → IN_TRANSIT → COMPLETED)
- View payout details
- Test payout transitions with Dev Tools

### Phase 7: Disputes Handling (25 min)
- View dispute cases
- Submit evidence with file upload
- Send messages in dispute thread
- Use resolution workflow
- Track dispute status changes

### Phase 8: Profile Management (10 min)
- Complete 7 profile tabs:
  - Basic Info (name, email, phone)
  - Identity Verification (KYC documents)
  - Business Info (business type, registration)
  - Payout Methods (bank account, Alipay)
  - Audience & Platforms (follower count, channels)
  - Content Strategy (niches, content types)
  - Conflict of Interest (declarations)

### Phase 9: Dev Tools Advanced (20 min)
- Time Machine: Test various day increments
- Transaction Reversals: Test all 7 reversal reasons
- Quick Actions: Batch approve leads
- KYC Management: Toggle verification status
- Data Generation: Create test events
- Data Management: Reset and restore seed data

### Phase 10: RBAC Testing (15 min)
- Test role-based access (currently mock)
- Verify permission checks
- Test action restrictions

## 📦 Project Structure

```
coselector-console/
├── public/                    # Static assets
├── src/
│   ├── components/           # Shared components
│   │   ├── Common/          # Buttons, cards, badges
│   │   ├── Layout/          # App layout with sidebar
│   │   ├── DevTools/        # Developer tools drawer
│   │   └── Timeline/        # Timeline component
│   ├── pages/               # Feature modules (14 modules)
│   │   ├── Dashboard/       # KPI dashboard
│   │   ├── Assets/          # Asset management
│   │   ├── Content/         # Content management
│   │   ├── Leads/           # Lead submission
│   │   ├── Earnings/        # Transaction tracking
│   │   ├── Payouts/         # Payout requests
│   │   ├── Disputes/        # Dispute handling
│   │   ├── Statements/      # Statement generation
│   │   └── Profile/         # 7-tab profile
│   ├── services/            # Mock API & seed data
│   │   ├── mockApi.ts       # localStorage-based API
│   │   └── seedData.ts      # Initial test data
│   ├── state-machines/      # State transition logic
│   │   ├── EarningsStateMachine.ts
│   │   ├── PayoutStateMachine.ts
│   │   └── DisputeStateMachine.ts
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Main app with routing
│   └── index.tsx            # Entry point
├── package.json             # Dependencies
└── tsconfig.json           # TypeScript config
```

## 🔧 Key Features

### State Machines
- **Earnings**: PENDING → LOCKED (30d) → PAYABLE → PAID
- **Payouts**: DRAFT → PENDING → APPROVED → IN_TRANSIT → COMPLETED
- **Disputes**: REPORTED → EVIDENCE_SUBMITTED → UNDER_REVIEW → RESOLVED/LOST

### Dev Tools (Ctrl + Shift + D)
Essential for testing state transitions and workflows:
- **Time Machine**: Jump forward to unlock transactions
- **Transaction Reversals**: Simulate refunds, disputes, fraud
- **Quick Actions**: Instant lead approval, KYC management
- **Data Management**: Reset to seed data anytime

### Mock Data
- 20 pre-seeded assets with tracking data
- 15 content items across platforms
- 50+ transactions with realistic amounts
- 10 payout records with various states
- 8 dispute cases with evidence

## 🎨 UI Components

### Ant Design 6.x Integration
- **Tables**: Sortable, filterable transaction/dispute lists
- **Drawers**: Slide-in panels for details and forms
- **Forms**: Multi-step forms with validation
- **Modals**: Confirmation dialogs and quick actions
- **Tags**: Color-coded status badges
- **Timelines**: Event history visualization
- **Charts**: Placeholder for analytics (extensible)

### Custom Components
- **StatusBadge**: Consistent status visualization across modules
- **ActionButton**: Permission-aware action buttons
- **TimelinePanel**: Reusable timeline for events
- **DevToolsDrawer**: Comprehensive testing toolkit

## 📝 Development Notes

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- All interfaces exported from `types/index.ts`

### Code Organization
- Feature-based structure (each page is self-contained)
- Shared components in `components/`
- Type-safe mock API with localStorage persistence
- Consistent naming conventions

### Testing Approach
- Use Dev Tools for state transition testing
- Mock authentication (any password works)
- Seed data automatically loaded on first launch
- Reset capability for clean testing

## 🐛 Known Limitations

### Current Implementation
- **Authentication**: Mock only (any password accepted)
- **Backend**: localStorage-based (no real API)
- **RBAC**: Mock implementation (permissions not enforced)
- **File Upload**: Simulated (files not actually stored)
- **Charts**: Placeholder components (data visualization basic)

### Production Considerations
To make this production-ready:
1. Replace mock API with real REST/GraphQL endpoints
2. Implement proper JWT authentication
3. Add server-side state machine validation
4. Implement real file upload to cloud storage
5. Add comprehensive error handling
6. Implement proper RBAC with backend enforcement
7. Add data visualization with Chart.js/D3.js
8. Implement real-time updates with WebSocket
9. Add proper form validation
10. Implement internationalization (i18n)

## 📄 Documentation

- **PRD.markdown**: Complete product requirements document (4,000+ lines)
- **This README**: Setup and testing guide
- All code includes inline comments and JSDoc
- TypeScript interfaces serve as API documentation

## 🤝 Contributing

This is a demo/prototype implementation. For production use:
1. Review all TODO comments in code
2. Replace mock services with real implementations
3. Add comprehensive unit/integration tests
4. Implement proper error boundaries
5. Add logging and monitoring

## 📜 License

[Specify your license here]

## 👤 Author

Co-Selector Platform Team

---

**Ready to start?** Run `npm start` and login with `demo@coselector.com`!
