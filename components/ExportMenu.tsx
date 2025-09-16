'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table, FileSpreadsheet, Code, AlertTriangle } from 'lucide-react';
import { exportConfig, canExportJson, getAvailableFormats, formatLabels, formatDescriptions, type ExportFormat } from '@/config/exportConfig';
import { sanitizeDataForExport, checkRateLimit, incrementRateLimit, validateFileSize, generateAuditLog } from '@/lib/exportSecurity';

export interface ExportMenuProps {
    data: unknown;
    filename: string; // String literal required - no curly braces
    resourceId?: string;
    className?: string;
}

const formatIcons: Record<ExportFormat, React.ComponentType<{ className?: string }>> = {
    pdf: FileText,
    xlsx: FileSpreadsheet,
    csv: Table,
    json: Code
};

export default function ExportMenu({ data, filename, resourceId, className = '' }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [rateLimit, setRateLimit] = useState(checkRateLimit());
    const menuRef = useRef<HTMLDivElement>(null);
    const availableFormats = getAvailableFormats();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = async (format: ExportFormat) => {
        try {
            // Check rate limiting
            const rateLimit = checkRateLimit();
            if (!rateLimit.allowed) {
                const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString('tr-TR');
                alert(`Çok fazla dışa aktarım yapıldı. Lütfen ${resetTime} saatinde tekrar deneyin.`);
                return;
            }

            // Validate file size
            const sizeCheck = validateFileSize(data);
            if (!sizeCheck.valid) {
                alert(`Dosya boyutu çok büyük (${sizeCheck.size.toFixed(2)}MB). Maksimum ${sizeCheck.maxSize}MB olabilir.`);
                return;
            }

            // Sanitize data for export
            const sanitizedData = sanitizeDataForExport(data, format);

            // Generate audit log
            const auditLog = generateAuditLog(format, resourceId || 'unknown', sizeCheck.size);
            console.log('Export audit log:', auditLog);

            // Analytics tracking (if available)
            if (typeof window !== 'undefined' && (window as any).analytics) {
                (window as any).analytics.track('export', {
                    format,
                    page: window.location.pathname,
                    component: 'ExportMenu',
                    resourceId,
                    dataSize: sizeCheck.size,
                    sanitized: auditLog.sanitized
                });
            }

            // Increment rate limit
            incrementRateLimit();
            setRateLimit(checkRateLimit());

            switch (format) {
                case 'pdf':
                    await exportToPDF(sanitizedData, filename);
                    break;
                case 'xlsx':
                    await exportToXLSX(sanitizedData, filename);
                    break;
                case 'csv':
                    await exportToCSV(sanitizedData, filename);
                    break;
                case 'json':
                    if (canExportJson()) {
                        exportToJSON(sanitizedData, filename);
                    }
                    break;
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Dışa aktarım sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsOpen(false);
        }
    };

    const exportToJSON = (data: unknown, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportToCSV = async (data: unknown, filename: string) => {
        // Simple CSV export for arrays of objects
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0] as Record<string, unknown>);
            const csvContent = [
                headers.join(','),
                ...data.map(row =>
                    headers.map(header => {
                        const value = (row as Record<string, unknown>)[header];
                        return typeof value === 'string' && value.includes(',')
                            ? `"${value.replace(/"/g, '""')}"`
                            : value;
                    }).join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            throw new Error('CSV export requires array data');
        }
    };

    const exportToXLSX = async (data: unknown, filename: string) => {
        // For now, we'll use a simple approach
        // In production, you might want to use a library like 'xlsx'
        if (Array.isArray(data)) {
            // Convert to CSV first (simplified approach)
            await exportToCSV(data, filename);
        } else {
            throw new Error('XLSX export requires array data');
        }
    };

    const exportToPDF = async (data: unknown, filename: string) => {
        // For now, we'll use a simple approach
        // In production, you might want to use a library like 'jsPDF' or 'puppeteer'
        const content = JSON.stringify(data, null, 2);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`; // Fallback to text file
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            <button
                type="button"
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 ${rateLimit.allowed
                    ? 'bg-gray-900 text-white hover:opacity-95'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
                disabled={!rateLimit.allowed}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="Dışa aktarım seçenekleri"
            >
                {rateLimit.allowed ? (
                    <Download className="h-4 w-4" />
                ) : (
                    <AlertTriangle className="h-4 w-4" />
                )}
                Dışa Aktar
                {!rateLimit.allowed && (
                    <span className="text-xs">(Limit)</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <ul role="menu" className="py-1">
                        {availableFormats.map((format) => {
                            const Icon = formatIcons[format];
                            const isJson = format === 'json';

                            return (
                                <li key={format} role="none">
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 ${isJson ? 'text-gray-500' : 'text-gray-900'
                                            }`}
                                        onClick={() => handleExport(format)}
                                        disabled={isJson && !canExportJson()}
                                        title={formatDescriptions[format]}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <div>
                                            <div className="font-medium">{formatLabels[format]}</div>
                                            {isJson && (
                                                <div className="text-xs text-gray-400">
                                                    Sadece geliştiriciler için
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}

                        {/* Rate Limit Info */}
                        <li role="none" className="border-t border-gray-100">
                            <div className="px-4 py-2 text-xs text-gray-500">
                                <div className="flex items-center justify-between">
                                    <span>Kalan: {rateLimit.remaining}</span>
                                    <span>/ {exportConfig.rateLimitPerHour}/saat</span>
                                </div>
                            </div>
                        </li>

                        {/* Open Data Portal Link */}
                        <li role="none" className="border-t border-gray-100">
                            <a
                                href="/acik-veri"
                                role="menuitem"
                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                title="Açık Veri Portalı - API dokümantasyonu"
                            >
                                <Code className="h-4 w-4" />
                                <div>
                                    <div className="font-medium">Açık Veri Portalı</div>
                                    <div className="text-xs text-gray-400">API & Dokümantasyon</div>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
