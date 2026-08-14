/**
 * Tax Training Data — 2017 Golden Dataset
 * 
 * This module exports the 2017 training exemplars used to teach the 
 * local Ollama model how to classify tax documents and associate them
 * with the correct line items. This data is injected as context into
 * the system prompt when the AI is used from the Tax Dashboard.
 */

export const TAX_TRAINING_DATA_2017 = {
    year: 2017,
    taxpayer: 'Jishnath Family',
    filingStatus: 'Married Filing Jointly',

    // Document → Line Item mappings (golden truth)
    documentMappings: [
        {
            document: '1099-MISC.pdf',
            type: 'pdf',
            mapsTo: {
                section: 'biz_income',
                lineItem: 'cloudbaud_gross',
                label: 'CloudBaud LLC — Gross Revenue',
                formLine: 'Schedule C, Line 1',
                amount: 334565.42
            },
            classification: 'income',
            rule: '1099-MISC always maps to Business Gross Revenue, never to expenses'
        },
        {
            document: '2017 bizex CloudBaud Updated.xlsx',
            type: 'xlsx',
            mapsTo: {
                section: 'biz_income',
                lineItem: 'cloudbaud_expenses',
                label: 'CloudBaud LLC — Business Expenses',
                formLine: 'Schedule C, Lines 8-27',
                amount: -169000.00
            },
            classification: 'expense',
            rule: 'Business expense spreadsheets map ONLY to expense line items, never to revenue'
        },
        {
            document: '2017W2.pdf',
            type: 'pdf',
            mapsTo: {
                section: 'income',
                lineItem: 'wages',
                label: 'W-2 Wages & Salary',
                formLine: 'Form 1040, Line 1',
                amount: 63132.00
            },
            classification: 'income',
            rule: 'W-2 always maps to Wages & Salary, never to business income'
        },
        {
            document: '2017-1099INT.pdf',
            type: 'pdf',
            mapsTo: {
                section: 'income',
                lineItem: 'interest',
                label: 'Interest Income',
                formLine: 'Schedule B, Line 1',
                amount: 325.00
            },
            classification: 'income',
            rule: '1099-INT maps to Interest Income'
        },
        {
            document: '2017-1099DIV.pdf',
            type: 'pdf',
            mapsTo: {
                section: 'income',
                lineItem: 'dividends',
                label: 'Dividend Income',
                formLine: 'Schedule B, Line 5',
                amount: 89.00
            },
            classification: 'income',
            rule: '1099-DIV maps to Dividend Income'
        },
    ],

    // Anti-patterns (mistakes to avoid)
    antiPatterns: [
        {
            mistake: 'Associating business expense spreadsheet with gross revenue',
            document: '2017 bizex CloudBaud Updated.xlsx',
            wrongMapping: 'CloudBaud LLC — Gross Revenue',
            correctMapping: 'CloudBaud LLC — Business Expenses',
            reason: 'The file name contains "bizex" (business expenses). Expense files never map to revenue lines.'
        },
        {
            mistake: 'Associating W-2 with business income',
            document: '2017W2.pdf',
            wrongMapping: 'Business Gross Revenue',
            correctMapping: 'W-2 Wages & Salary',
            reason: 'W-2 is employer-issued for wages. Business income uses 1099-MISC/NEC.'
        }
    ],

    // Section → Expected Document Types mapping
    sectionDocRules: {
        income: {
            expectedDocs: ['W-2', '1099-INT', '1099-DIV', '1099-R'],
            neverAssociate: ['expense spreadsheets', 'receipts', 'mortgage statements']
        },
        biz_income: {
            expectedDocs: ['1099-MISC', '1099-NEC', 'business expense spreadsheets', 'P&L statements'],
            revenueOnly: ['1099-MISC', '1099-NEC'],
            expenseOnly: ['expense spreadsheets', 'receipt compilations']
        },
        adjustments: {
            expectedDocs: ['HSA statements', '5498-SA', 'SEP/IRA contribution records'],
            neverAssociate: ['W-2', '1099']
        },
        deductions: {
            expectedDocs: ['1098 (Mortgage)', 'charity receipts', 'medical receipts', 'property tax bills'],
            neverAssociate: ['1099-MISC', 'W-2', 'business spreadsheets']
        },
        credits: {
            expectedDocs: ['1098-T', 'child care statements', 'Form 8863'],
            neverAssociate: ['1099', 'W-2']
        },
        payments: {
            expectedDocs: ['W-2 (Box 2)', '1040-ES receipts', 'state refund 1099-G'],
            neverAssociate: ['expense spreadsheets']
        }
    }
};

/**
 * Generate a context-aware system prompt for the tax classifier
 * when used from the Tax Dashboard. This injects the 2017 training
 * data as few-shot examples into the prompt.
 */
export const buildTaxSystemPrompt = (yearData, activeSection) => {
    const training = TAX_TRAINING_DATA_2017;
    
    const mappingExamples = training.documentMappings
        .map(m => `- "${m.document}" (${m.type}) → ${m.mapsTo.label} [${m.mapsTo.formLine}] = $${m.mapsTo.amount.toLocaleString()}`)
        .join('\n');

    const antiPatternWarnings = training.antiPatterns
        .map(a => `⚠️ "${a.document}" should NEVER map to "${a.wrongMapping}". Correct: "${a.correctMapping}". Reason: ${a.reason}`)
        .join('\n');

    let sectionContext = '';
    if (activeSection && training.sectionDocRules[activeSection]) {
        const rules = training.sectionDocRules[activeSection];
        sectionContext = `\n\nCURRENT SECTION: ${activeSection.toUpperCase()}
Expected document types: ${rules.expectedDocs.join(', ')}
Never associate with: ${(rules.neverAssociate || []).join(', ')}`;
    }

    return `You are a Tax Document Classification Agent trained on the ${training.year} ${training.taxpayer} return (${training.filingStatus}).

## LEARNED DOCUMENT MAPPINGS (2017 Golden Data)
${mappingExamples}

## ANTI-PATTERNS (Mistakes to Avoid)
${antiPatternWarnings}
${sectionContext}

## CURRENT CONTEXT
${yearData ? `Analyzing tax year: ${yearData.year || 'unknown'}` : 'No specific year context'}

When asked about document classification, use these learned patterns. When uncertain, state your confidence level and explain your reasoning.`;
};
