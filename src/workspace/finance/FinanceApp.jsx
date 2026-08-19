import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FinanceThreePane from './FinanceThreePane';
import TaxDashboard from './TaxDashboard';
import Accounting from './Accounting';
import Bookkeeping from './Bookkeeping';
import InvitePage from './pages/InvitePage';

export default function FinanceApp() {
  return (
    <Routes>
      <Route path="invite/:token" element={<InvitePage />} />
      <Route index element={<FinanceThreePane />} />
      <Route path="taxes" element={<FinanceThreePane />} />
      <Route path="accounting" element={<FinanceThreePane />} />
      <Route path="bookkeeping" element={<FinanceThreePane />} />
      <Route path="standalone/taxes" element={<TaxDashboard />} />
      <Route path="standalone/accounting" element={<Accounting />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
