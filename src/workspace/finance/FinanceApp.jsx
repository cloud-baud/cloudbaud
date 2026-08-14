import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TaxDashboard from './TaxDashboard';

// Fallback for other tabs until migrated
const Placeholder = ({ label }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">{label}</h1>
    <p className="text-sm text-slate-500 mt-2">Migrating from prod — taxes dashboard ready.</p>
  </div>
);

export default function FinanceApp() {
  return (
    <Routes>
      {/* /collaboration/finance -> taxes */}
      <Route index element={<TaxDashboard />} />
      {/* /collaboration/finance/taxes?year=2022 */}
      <Route path="taxes" element={<TaxDashboard />} />
      <Route path="taxes/*" element={<TaxDashboard />} />
      <Route path="bookkeeping" element={<Placeholder label="Bookkeeping" />} />
      <Route path="accounting" element={<Placeholder label="Accounting" />} />
      <Route path="consulting" element={<Placeholder label="Consulting" />} />
      <Route path="investments" element={<Placeholder label="Investments" />} />
      <Route path="*" element={<Navigate to="taxes" replace />} />
    </Routes>
  );
}