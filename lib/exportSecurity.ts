import { exportConfig } from '@/config/exportConfig';

// PII (Personally Identifiable Information) fields that should be masked
const PII_FIELDS = [
    'tcNo', 'tcKimlikNo', 'kimlikNo', 'kimlik',
    'telefon', 'phone', 'cepTelefonu', 'mobile',
    'email', 'ePosta', 'eposta',
    'adres', 'address', 'evAdresi', 'isAdresi',
    'dogumTarihi', 'birthDate', 'dogumYeri', 'birthPlace',
    'anneAdi', 'babaAdi', 'motherName', 'fatherName'
];

// KVKK (GDPR) sensitive fields
const KVKK_FIELDS = [
    'sağlıkBilgisi', 'healthInfo', 'hastalık', 'disease',
    'engelDurumu', 'disability', 'engelBilgisi',
    'gelirBilgisi', 'income', 'maaş', 'salary',
    'borçBilgisi', 'debt', 'krediBilgisi', 'credit'
];

// Rate limiting storage
const RATE_LIMIT_KEY = 'export_rate_limit';
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

/**
 * Sanitize data by masking PII and KVKK fields
 */
export function sanitizeDataForExport(data: unknown, format: string): unknown {
    if (!data || typeof data !== 'object') {
        return data;
    }

    // For JSON format, we can be more permissive for developers
    if (format === 'json' && exportConfig.userRole === 'developer') {
        return data;
    }

    return sanitizeObject(data as Record<string, unknown>);
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();

        // Check if field contains PII or KVKK data
        if (PII_FIELDS.some(field => lowerKey.includes(field.toLowerCase())) ||
            KVKK_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {

            // Mask the value
            if (typeof value === 'string') {
                sanitized[key] = maskString(value);
            } else if (typeof value === 'number') {
                sanitized[key] = maskNumber(value);
            } else {
                sanitized[key] = '[MASKED]';
            }
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) : item
            );
        } else if (value && typeof value === 'object') {
            sanitized[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

function maskString(str: string): string {
    if (str.length <= 4) {
        return '*'.repeat(str.length);
    }

    // Keep first 2 and last 2 characters, mask the middle
    const start = str.substring(0, 2);
    const end = str.substring(str.length - 2);
    const middle = '*'.repeat(str.length - 4);

    return `${start}${middle}${end}`;
}

function maskNumber(num: number): string {
    const str = num.toString();
    if (str.length <= 4) {
        return '*'.repeat(str.length);
    }

    // Keep first 2 and last 2 digits, mask the middle
    const start = str.substring(0, 2);
    const end = str.substring(str.length - 2);
    const middle = '*'.repeat(str.length - 4);

    return `${start}${middle}${end}`;
}

/**
 * Check rate limiting for exports
 */
export function checkRateLimit(): { allowed: boolean; remaining: number; resetTime: number } {
    if (typeof window === 'undefined') {
        return { allowed: true, remaining: exportConfig.rateLimitPerHour, resetTime: Date.now() + RATE_LIMIT_WINDOW };
    }

    try {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        const now = Date.now();

        let rateLimit: RateLimitEntry;

        if (stored) {
            rateLimit = JSON.parse(stored);

            // Reset if window has passed
            if (now > rateLimit.resetTime) {
                rateLimit = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
            }
        } else {
            rateLimit = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
        }

        const allowed = rateLimit.count < exportConfig.rateLimitPerHour;
        const remaining = Math.max(0, exportConfig.rateLimitPerHour - rateLimit.count);

        return { allowed, remaining, resetTime: rateLimit.resetTime };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        return { allowed: true, remaining: exportConfig.rateLimitPerHour, resetTime: Date.now() + RATE_LIMIT_WINDOW };
    }
}

/**
 * Increment rate limit counter
 */
export function incrementRateLimit(): void {
    if (typeof window === 'undefined') return;

    try {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        const now = Date.now();

        let rateLimit: RateLimitEntry;

        if (stored) {
            rateLimit = JSON.parse(stored);

            // Reset if window has passed
            if (now > rateLimit.resetTime) {
                rateLimit = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
            } else {
                rateLimit.count++;
            }
        } else {
            rateLimit = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
        }

        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateLimit));
    } catch (error) {
        console.error('Rate limit increment failed:', error);
    }
}

/**
 * Validate file size before export
 */
export function validateFileSize(data: unknown): { valid: boolean; size: number; maxSize: number } {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    const maxSizeMB = exportConfig.maxFileSize;

    return {
        valid: sizeInMB <= maxSizeMB,
        size: sizeInMB,
        maxSize: maxSizeMB
    };
}

/**
 * Generate audit log entry for export
 */
export function generateAuditLog(format: string, resourceId: string, dataSize: number): Record<string, unknown> {
    return {
        timestamp: new Date().toISOString(),
        action: 'export',
        format,
        resourceId,
        dataSize,
        userRole: exportConfig.userRole,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        ip: 'client-side', // In a real app, this would be server-side
        sanitized: format !== 'json' || exportConfig.userRole !== 'developer'
    };
}




