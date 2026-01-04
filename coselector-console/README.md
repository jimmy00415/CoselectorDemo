# Co-Selector Console

A comprehensive KOL (Key Opinion Leader) commission management platform for China affiliate marketing programs. Built with React 18, TypeScript, and Ant Design.

## 📋 Project Overview

The Co-Selector Console enables content creators to:
- **Track Assets**: Manage tracking links, QR codes, and invite codes
- **Manage Content**: Associate content items with tracking assets across platforms
- **Submit Leads**: Register new merchant partnerships for review
- **Monitor Earnings**: View real-time commission data with detailed transaction traces
- **Request Payouts**: Withdraw earned commissions with eligibility checks
- **Handle Disputes**: Manage chargebacks and disputes with evidence submission
- **Update Profile**: Complete KYC, configure payout methods, declare conflicts of interest

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation
```bash
# Navigate to project directory
cd coselector-console

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

## 🏗️ Architecture

### Technology Stack
- **Framework**: React 18.3.1 with TypeScript 5.7.3
- **UI Library**: Ant Design 5.22.9
- **Routing**: React Router 7.1.3
- **Date Handling**: dayjs 1.11.19
- **Build Tool**: Vite 6.0.11
- **State Management**: React Context API
- **Data Persistence**: localStorage (mock API layer)

### Project Structure
```
coselector-console/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Assets/          # Asset management components
│   │   ├── Content/         # Content item components
│   │   ├── DevTools/        # Development tools (hidden)
│   │   ├── Disputes/        # Dispute case components
│   │   ├── Earnings/        # Transaction & earnings components
│   │   ├── Leads/           # Lead management components
│   │   ├── Payouts/         # Payout request components
│   │   ├── Profile/         # User profile components
│   │   └── Timeline/        # Audit trail timeline
│   ├── contexts/            # React Context providers
│   ├── layout/              # Layout components
│   ├── pages/               # Top-level page components
│   ├── services/            # Business logic & data
│   │   ├── mockApi.ts       # Mock API with localStorage
│   │   ├── seedData.ts      # Test data generator
│   │   └── stateMachines.ts # State transition logic
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Root component with routing
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── index.html               # HTML template
└── vite.config.ts           # Vite configuration
```

## 🔑 Key Features

### 1. Role-Based Access Control (RBAC)
Three user roles with 38 granular permissions:
- **CO_SELECTOR**: Content creators (default role)
- **OPS_BD**: Operations & Business Development team
- **FINANCE**: Finance team

### 2. State Machines
Four independent state machines manage entity lifecycles with timeline events:
- **Lead**: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
- **Earnings**: PENDING → LOCKED → PAYABLE → PAID/REVERSED
- **Payout**: REQUESTED → APPROVED → PROCESSING → COMPLETED/FAILED
- **Dispute**: OPEN → WAITING → RESOLVED → CLOSED/APPEAL

### 3. Payout Eligibility System
Comprehensive pre-flight checks:
- KYC verification status
- Bank account verification
- Minimum threshold (¥500)
- Account frozen status
- Pending COI declarations

### 4. Dispute Management
- 4-level deadline urgency system
- Evidence upload with requirements
- Messaging thread with support
- Accept/Appeal/Auto-close workflow

### 5. Profile Management
7-tab comprehensive profile:
- Overview with eligibility banner
- KYC wizard with rejection handling
- Payout method with test transfer
- Tax information (placeholder)
- 3-tier notification preferences
- COI disclosure with blocking
- Compliance documents (placeholder)

## 🛠️ Development Tools

### Hidden Dev Tools Panel
Access via `Ctrl + Shift + D` or type "devmode" on Help page.

**Features**:
1. **Time Machine**: Advance time to unlock transactions
2. **Transaction Reversal**: Trigger refunds and chargebacks
3. **Lead Status Changer**: Simulate ops team reviews
4. **KYC Manager**: Approve/reject KYC submissions
5. **Event Generator**: Create test transactions
6. **Data Management**: Reset or clear all data

See [DEV_TOOLS_GUIDE.md](../DEV_TOOLS_GUIDE.md) for detailed documentation.

## 📊 Design Principles

1. **Trust by Transparency**: Every number can be drilled down to evidence
2. **Progressive Disclosure**: Show only high-frequency information by default
3. **Accessibility First**: WCAG 2.1 AA compliance
4. **Audit Trail**: Every change is traceable with timeline/audit log

## 📚 Documentation

- [PRD.markdown](../PRD.markdown) - Product Requirements Document
- [DEV_TOOLS_GUIDE.md](../DEV_TOOLS_GUIDE.md) - Development Tools Manual
- Inline JSDoc comments throughout codebase

## 🎯 Project Metrics

- **Total Lines of Code**: ~16,500+
- **Components**: 60+
- **Pages**: 15
- **API Methods**: 40+
- **Type Definitions**: 25+
- **State Machines**: 4
- **Development Steps**: 14 completed

---

**Built with ❤️ for KOL commission management**

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
