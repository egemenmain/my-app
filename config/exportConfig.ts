export type UserRole = 'citizen' | 'developer' | 'admin';

export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json';

export interface ExportConfig {
    // Feature flags
    enableJsonExport: boolean;

    // User role
    userRole: UserRole;

    // Export options
    availableFormats: ExportFormat[];

    // Security settings
    rateLimitPerHour: number;
    maxFileSize: number; // in MB
}

// Environment-based configuration
const getExportConfig = (): ExportConfig => {
    const enableJsonExport = process.env.PUBLIC_ENABLE_JSON === 'true';
    const userRole = (process.env.NEXT_PUBLIC_USER_ROLE as UserRole) || 'citizen';

    return {
        enableJsonExport,
        userRole,
        availableFormats: enableJsonExport || ['developer', 'admin'].includes(userRole)
            ? ['pdf', 'xlsx', 'csv', 'json']
            : ['pdf', 'xlsx', 'csv'],
        rateLimitPerHour: 100,
        maxFileSize: 10
    };
};

export const exportConfig = getExportConfig();

// Helper functions
export const canExportJson = (): boolean => {
    return exportConfig.enableJsonExport || ['developer', 'admin'].includes(exportConfig.userRole);
};

export const getAvailableFormats = (): ExportFormat[] => {
    return exportConfig.availableFormats;
};

export const isDeveloperMode = (): boolean => {
    return ['developer', 'admin'].includes(exportConfig.userRole);
};

// Export format labels
export const formatLabels: Record<ExportFormat, string> = {
    pdf: 'PDF',
    xlsx: 'Excel (XLSX)',
    csv: 'CSV',
    json: 'JSON (Geliştirici)'
};

// Export format descriptions
export const formatDescriptions: Record<ExportFormat, string> = {
    pdf: 'Yazdırılabilir PDF formatı',
    xlsx: 'Excel ile açılabilir tablo formatı',
    csv: 'Virgülle ayrılmış değerler',
    json: 'Geliştiriciler için API formatı'
};






