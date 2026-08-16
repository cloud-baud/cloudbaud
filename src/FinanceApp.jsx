import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TaxDashboard from './TaxDashboard';
import Accounting from './Accounting';
import Bookkeeping from './Bookkeeping';
import InvitePage from './pages/InvitePage';

export default function FinanceApp() {
  return (
    <Routes>
      <Route path="invite/:token" element={<InvitePage />} />
      <Route index element={<TaxDashboard />} />
      <Route path="taxes" element={<TaxDashboard />} />
      <Route path="taxes/*" element={<TaxDashboard />} />
      <Route path="bookkeeping" element={<Bookkeeping />} />
      <Route path="accounting" element={<Accounting />} />
      <Route path="coa" element={<Accounting />} />
      <Route path="*" element={<Navigate to="taxes" replace />} />
    </Routes>
  );
}
