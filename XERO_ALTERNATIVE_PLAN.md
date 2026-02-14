
# Project: "CloudBaud Books" - Xero Alternative for IT Consultants

## Executive Summary
This project aims to build a specialized accounting platform tailored for IT Consultants, leveraging the existing secure `finance` schema. Unlike generic tools like Xero, "CloudBaud Books" focuses on the specific needs of high-end IT consulting: **Project-Based Billing**, **Subcontractor Management**, and **Tax-Optimized Expense Tracking**.

## Core Architecture
The system is built on a "Double-Entry" core (General Ledger) but exposes a "Single-Entry" user experience for speed, similar to Xero.

### 1. Existing Foundation (Leveraged)
*   **Secure Schema:** `finance` (Locked down, API access only)
*   **General Ledger:** `finance.ledger_entries` / `finance.ledger_lines`
*   **Chart of Accounts:** `finance.universal_coa`
*   **Tax Engine:** `finance.tax_entries` (The "Tax Dashboard")

### 2. New Modules Required

#### A. Sales & Invoicing (The "Income" Engine)
*   **Concept:** Consultants bill for *Time* or *Milestones*.
*   **New Tables:**
    *   `finance.customers` (Clients)
    *   `finance.projects` (Engagement containers)
    *   `finance.invoices` (The bill)
    *   `finance.invoice_lines` (Linked to GL Revenue Accounts)
*   **Features:**
    *   PDF Invoice Generation
    *   "Email to Client" functionality
    *   Stripe Integration for Payments

#### B. Banking & Reconciliation (The "Truth" Engine)
*   **Concept:** The bank feed is the source of truth. Features "One-Click Reconciliation".
*   **New Tables:**
    *   `finance.bank_accounts` (Physical accounts)
    *   `finance.bank_transactions` (Raw feed import)
*   **Features:**
    *   CSV Import (initial) -> Plaid Integration (future)
    *   **"Matcher" Agent:** Autosuggests GL accounts based on vendor name/history.

#### C. Purchases & Subcontractors (The "Expense" Engine)
*   **Concept:** IT Consultants have specific costs (Cloud, Software, Subcontractors).
*   **New Tables:**
    *   `finance.vendors` (SaaS providers, Contractors)
    *   `finance.bills` (Accounts Payable)
*   **Features:**
    *   Auto-categorization of "Recurring SaaS" (AWS, Azure, GitHub)
    *   W9/1099 Tracking for Subcontractors

## Implementation Roadmap

### Phase 1: The "Invoicing" MVP (Week 1)
*   [ ] Define `finance.customers` and `finance.invoices` schema.
*   [ ] Create Secure API functions (`api_create_invoice`, `api_get_open_invoices`).
*   [ ] Build "Invoice Builder" UI in React.
*   [ ] Generate PDF Invoice.

### Phase 2: The "Banking" Core (Week 2)
*   [ ] Define `finance.bank_transactions` schema.
*   [ ] Build CSV Importer for Bank Feeds.
*   [ ] Build "Reconciliation Dashboard" (Match Bank Line -> GL Entry).

### Phase 3: Reporting & AI (Week 3)
*   [ ] Real-time P&L Statement.
*   [ ] AI Agent ("The Bookkeeper") to auto-categorize transactions.

## Technical Stack
*   **Backend:** Supabase (Postgres) + Secure RPC API (`security definer`)
*   **Frontend:** React + Tailwind (High-Density "Consultant" Aesthetic)
*   **Auth:** Supabase Auth (Strict Row Level Security)

## "IT Consultant" Differentiators
1.  **"Pass-Through" Expenses:** Easily bill client for software/hardware purchased on their behalf.
2.  **Tax-Aware:** Every transaction is tagged for "Deductibility" immediately (leveraging existing Tax Dashboard).
3.  **Project Profitability:** Real-time view of `Revenue - (Hours * Rate) - Expenses` per project.

