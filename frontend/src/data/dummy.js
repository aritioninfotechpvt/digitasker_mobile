export const currentUser = {
  name: 'Account User',
  email: 'user@digitasker.com',
  phone: '',
  city: '',
  country: 'India',
  level: 'Auditor',
  rating: 5.0,
  approval: 100,
  completed: 0,
  kyc: 'Pending',
  wallet: { balance: 0, available: 0, hold: 0, earned: 0 }
};

export const tasks = [];
export const transactions = [];
export const campaigns = [];
export const submissions = [];
export const users = [];
export const kycUsers = [];
export const clients = [];
export const stores = [];
export const disputes = [];
export const bonusPrograms = [];
export const auditLogs = [];
export const notificationTemplates = [];
export const payoutRequests = [];
export const vendors = [];
export const vendorTasks = [];
export const vendorMembers = [];

export const vendorPayments = { admin: [], members: [] };

export const workflowTemplates = [];
export const workflowNodes = [
  { type: 'trigger', title: 'Assignment accepted', meta: 'Starts workflow' },
  { type: 'location', title: 'GPS check-in', meta: '≤ 200m from store' },
  { type: 'form', title: 'Pre-visit questions', meta: 'Mandatory questions' },
  { type: 'evidence', title: 'Camera evidence', meta: 'Photo / Video proof' },
  { type: 'logic', title: 'Conditional branch', meta: 'Conditional logic' },
  { type: 'survey', title: 'Audit questionnaire', meta: 'Questionnaire score' },
  { type: 'qc', title: 'QC review', meta: 'QC approval' },
  { type: 'payout', title: 'Wallet payout', meta: 'Auto credit' }
];

export const vendorRateCards = [];
export const vendorContracts = [];
export const vendorSettlementRows = [];
export const vendorCapacityRows = [];
export const vendorBids = [];
export const vendorScorecards = [];
export const workforceRows = [];
export const smartAllocationRows = [];
export const budgetControlRows = [];
export const controlTowerAlerts = [];
export const sourcingMix = [];
export const approvalChains = [];
export const whiteLabelTenants = [];

export const automations = [];
export const certifications = [];
export const clientTeams = [];
export const financeSummary = { totalVolume: '₹0', grossMargin: '0%', escrowBalance: '₹0', pendingPayouts: '₹0' };
export const fraudSignals = [];
export const qcQueue = [];
export const scheduledReports = [];
export const webhookRows = [];

