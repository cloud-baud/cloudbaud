import React from 'react';
import { CmdbScreen, useCmdbInventory } from 'synolic.core';

// CloudBaud is the operating entity, its tenant ID is: cb000000-0000-0000-0000-000000000000
const CLOUDBAUD_TENANT_ID = 'cb000000-0000-0000-0000-000000000000';

export default function CmdbDashboard() {
  // We use the live hook exposed from Synolic.Core which pulls from the cmdb_ci_typed view
  const { assets, loading, error, refresh } = useCmdbInventory(CLOUDBAUD_TENANT_ID);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md border border-red-200">
        Error loading CMDB inventory: {error}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-neutral-900">
      <CmdbScreen 
        data={assets} 
        isLoading={loading}
        reportName="CloudBaud Configuration Management Database (CMDB)"
        onRefresh={refresh}
      />
    </div>
  );
}
