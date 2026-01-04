import React from 'react';
import { Disputes } from './Disputes/index';

/**
 * Disputes Page
 * 
 * Per PRD §7.6 & §7.8:
 * - Dispute case management with lifecycle states (OPEN → WAITING → RESOLVED)
 * - Evidence upload with file preview and checklist
 * - Messaging thread with Brand Support
 * - Resolution workflow with accept/appeal actions
 * - Deadline tracking with urgency indicators
 */
const DisputesPage: React.FC = () => {
  return <Disputes />;
};

export default DisputesPage;

