/**
 * Utility types for export system
 */

// Enforce string literal types for filename props
export type FilenameString = string & { readonly __brand: 'FilenameString' };

// Helper function to create a filename string (ensures it's a string literal)
export function createFilename(filename: string): FilenameString {
    if (typeof filename !== 'string') {
        throw new Error('Filename must be a string literal');
    }
    return filename as FilenameString;
}

// Export menu props with strict typing
export interface StrictExportMenuProps {
    data: unknown;
    filename: FilenameString; // Enforces string literal usage
    resourceId?: string;
    className?: string;
}

// Common filename patterns for validation
export const FILENAME_PATTERNS = {
    JSON: /^[a-zA-Z0-9_-]+\.json$/,
    CSV: /^[a-zA-Z0-9_-]+\.csv$/,
    XLSX: /^[a-zA-Z0-9_-]+\.xlsx$/,
    PDF: /^[a-zA-Z0-9_-]+\.pdf$/
} as const;

// Validate filename format
export function validateFilename(filename: string, expectedExtension: keyof typeof FILENAME_PATTERNS): boolean {
    return FILENAME_PATTERNS[expectedExtension].test(filename);
}

// Common export data types
export interface ExportData {
    [key: string]: unknown;
}

export interface ExportResult {
    success: boolean;
    filename: string;
    size: number;
    format: string;
    error?: string;
}



