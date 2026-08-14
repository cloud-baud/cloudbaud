import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { cn } from '@/shared/lib/utils';
import { AlertCircle, RefreshCw, Table2 } from 'lucide-react';

/**
 * SpreadsheetPreview — renders .xlsx / .xls / .csv files as an HTML table.
 * Fetches the file from the given URL, parses it client-side with SheetJS,
 * and renders the first sheet as a styled data grid.
 */
const SpreadsheetPreview = ({ url, name, className }) => {
    const [data, setData] = useState(null);       // { headers: [], rows: [][] }
    const [sheetNames, setSheetNames] = useState([]);
    const [activeSheet, setActiveSheet] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) return;
        setLoading(true);
        setError(null);

        const fetchAndParse = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const buffer = await response.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                setSheetNames(workbook.SheetNames);
                parseSheet(workbook, 0);
            } catch (err) {
                console.error('Spreadsheet parse error:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAndParse();
    }, [url]);

    const parseSheet = (workbook, sheetIndex) => {
        const sheetName = workbook.SheetNames[sheetIndex];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (jsonData.length === 0) {
            setData({ headers: [], rows: [] });
        } else {
            setData({
                headers: jsonData[0] || [],
                rows: jsonData.slice(1)
            });
        }
        setActiveSheet(sheetIndex);
        setLoading(false);
    };

    const handleSheetChange = (index) => {
        setLoading(true);
        // Re-fetch and parse the selected sheet
        fetch(url)
            .then(r => r.arrayBuffer())
            .then(buffer => {
                const workbook = XLSX.read(buffer, { type: 'array' });
                parseSheet(workbook, index);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    if (loading) {
        return (
            <div className={cn("flex-1 flex items-center justify-center bg-white dark:bg-slate-900", className)}>
                <div className="text-center space-y-3">
                    <RefreshCw className="size-8 text-green-500 animate-spin mx-auto" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading spreadsheet…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("flex-1 flex items-center justify-center bg-white dark:bg-slate-900", className)}>
                <div className="text-center space-y-3 max-w-xs">
                    <AlertCircle className="size-8 text-red-500 mx-auto" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to load spreadsheet</p>
                    <p className="text-xs text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className={cn("flex flex-col h-full bg-white dark:bg-slate-900", className)}>
            {/* Sheet Tabs (if multiple sheets) */}
            {sheetNames.length > 1 && (
                <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 overflow-x-auto shrink-0">
                    {sheetNames.map((name, i) => (
                        <button
                            key={i}
                            onClick={() => handleSheetChange(i)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-t transition-all whitespace-nowrap",
                                i === activeSheet
                                    ? "bg-white dark:bg-slate-700 text-green-700 dark:text-green-400 border border-b-0 border-slate-200 dark:border-slate-600 shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            )}

            {/* Status Bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800/30 shrink-0">
                <div className="flex items-center gap-2">
                    <Table2 className="size-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-[11px] font-medium text-green-700 dark:text-green-300">
                        {data.rows.length} rows × {data.headers.length} columns
                    </span>
                </div>
                <span className="text-[10px] text-green-600/70 dark:text-green-400/50 font-mono truncate max-w-[200px]">
                    {name}
                </span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            {/* Row number column */}
                            <th className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-mono px-2 py-1.5 w-10 text-center border-r border-b border-slate-300 dark:border-slate-600 sticky left-0 z-20">
                                #
                            </th>
                            {data.headers.map((h, i) => (
                                <th
                                    key={i}
                                    className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-semibold px-3 py-1.5 text-left border-r border-b border-green-200 dark:border-green-800/30 whitespace-nowrap"
                                >
                                    {h || `Col ${i + 1}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, ri) => (
                            <tr
                                key={ri}
                                className={cn(
                                    "hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors",
                                    ri % 2 === 0
                                        ? "bg-white dark:bg-slate-900"
                                        : "bg-slate-50 dark:bg-slate-800/30"
                                )}
                            >
                                {/* Row number */}
                                <td className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-mono px-2 py-1 text-center border-r border-b border-slate-200 dark:border-slate-700 sticky left-0">
                                    {ri + 1}
                                </td>
                                {data.headers.map((_, ci) => {
                                    const cell = row[ci];
                                    const isNumber = typeof cell === 'number';
                                    return (
                                        <td
                                            key={ci}
                                            className={cn(
                                                "px-3 py-1 border-r border-b border-slate-100 dark:border-slate-800 whitespace-nowrap",
                                                isNumber
                                                    ? "text-right font-mono text-slate-700 dark:text-slate-300"
                                                    : "text-left text-slate-600 dark:text-slate-400"
                                            )}
                                        >
                                            {isNumber ? cell.toLocaleString() : (cell ?? '')}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SpreadsheetPreview;
