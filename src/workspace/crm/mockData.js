
export const leads = [
  { id: 'L-001', name: 'James Smith', company: 'Acme Corp', email: 'james.smith@acme.com', status: 'New', source: 'Web', created: '2023-10-01' },
  { id: 'L-002', name: 'Sarah Connor', company: 'Skynet Inc', email: 's.connor@skynet.com', status: 'Contacted', source: 'Referral', created: '2023-10-05' },
  { id: 'L-003', name: 'Bruce Wayne', company: 'Wayne Enterprises', email: 'bruce@wayne.com', status: 'Qualified', source: 'Event', created: '2023-10-10' },
  { id: 'L-004', name: 'Clark Kent', company: 'Daily Planet', email: 'ckent@dailyplanet.com', status: 'Nurturing', source: 'Web', created: '2023-10-12' },
  { id: 'L-005', name: 'Diana Prince', company: 'Themyscira Ltd', email: 'diana@themyscira.com', status: 'New', source: 'Web', created: '2023-10-15' },
];

export const accounts = [
  { id: 'A-001', name: 'Acme Corp', industry: 'Technology', type: 'Customer', website: 'www.acme.com', owner: 'John Doe' },
  { id: 'A-002', name: 'Skynet Inc', industry: 'Defense', type: 'Prospect', website: 'www.skynet.com', owner: 'Jane Doe' },
  { id: 'A-003', name: 'Wayne Enterprises', industry: 'Conglomerate', type: 'Partner', website: 'www.wayne.com', owner: 'Alfred P.' },
];

export const opportunities = [
  { id: 'O-001', name: 'Acme - 500 Licenses', account: 'Acme Corp', stage: 'Negotiation', amount: 50000, closeDate: '2023-12-01', probability: 80 },
  { id: 'O-002', name: 'Skynet - AI Upgrade', account: 'Skynet Inc', stage: 'Proposal', amount: 120000, closeDate: '2024-01-15', probability: 60 },
  { id: 'O-003', name: 'Wayne Ent - Cloud Migration', account: 'Wayne Enterprises', stage: 'Discovery', amount: 75000, closeDate: '2023-11-20', probability: 40 },
];

export const contacts = [
  { id: 'C-001', name: 'James Smith', account: 'Acme Corp', title: 'CTO', email: 'james@acme.com', phone: '555-0100' },
  { id: 'C-002', name: 'Sarah Connor', account: 'Skynet Inc', title: 'Head of Security', email: 'sarah@skynet.com', phone: '555-0101' },
  { id: 'C-003', name: 'Lucius Fox', account: 'Wayne Enterprises', title: 'CEO', email: 'lucius@wayne.com', phone: '555-0102' },
];

export const dashboardMetrics = [
    { label: 'Quarterly Sales', value: '$245,000', change: '+12%', type: 'positive' },
    { label: 'Open Opportunities', value: '14', change: '-2', type: 'neutral' },
    { label: 'Win Rate', value: '42%', change: '+5%', type: 'positive' },
    { label: 'Avg Deal Size', value: '$18,500', change: '-3%', type: 'negative' },
];
