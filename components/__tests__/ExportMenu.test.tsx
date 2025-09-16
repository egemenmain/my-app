import { render, screen, fireEvent } from '@testing-library/react';
import ExportMenu from '../ExportMenu';

// Mock the security functions
jest.mock('@/lib/exportSecurity', () => ({
    sanitizeDataForExport: jest.fn((data) => data),
    checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 100, resetTime: Date.now() + 3600000 })),
    incrementRateLimit: jest.fn(),
    validateFileSize: jest.fn(() => ({ valid: true, size: 1, maxSize: 10 })),
    generateAuditLog: jest.fn(() => ({ timestamp: '2024-01-01T00:00:00Z', action: 'export' }))
}));

// Mock the config
jest.mock('@/config/exportConfig', () => ({
    exportConfig: {
        rateLimitPerHour: 100,
        userRole: 'citizen'
    },
    canExportJson: jest.fn(() => false),
    getAvailableFormats: jest.fn(() => ['pdf', 'xlsx', 'csv']),
    formatLabels: {
        pdf: 'PDF',
        xlsx: 'Excel (XLSX)',
        csv: 'CSV'
    },
    formatDescriptions: {
        pdf: 'Yazdırılabilir PDF formatı',
        xlsx: 'Excel ile açılabilir tablo formatı',
        csv: 'Virgülle ayrılmış değerler'
    }
}));

describe('ExportMenu', () => {
    const mockData = { test: 'data' };
    const mockFilename = 'test-file';
    const mockResourceId = 'test-resource';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders export button with correct accessibility attributes', () => {
        render(
            <ExportMenu
                data={mockData}
                filename="test-file.json"
                resourceId={mockResourceId}
            />
        );

        const button = screen.getByRole('button', { name: /dışa aktarım seçenekleri/i });
        expect(button).toHaveAttribute('aria-haspopup', 'menu');
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens menu when button is clicked', () => {
        render(
            <ExportMenu
                data={mockData}
                filename="test-file.json"
                resourceId={mockResourceId}
            />
        );

        const button = screen.getByRole('button', { name: /dışa aktarım seçenekleri/i });
        fireEvent.click(button);

        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('shows available export formats', () => {
        render(
            <ExportMenu
                data={mockData}
                filename="test-file.json"
                resourceId={mockResourceId}
            />
        );

        const button = screen.getByRole('button', { name: /dışa aktarım seçenekleri/i });
        fireEvent.click(button);

        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('Excel (XLSX)')).toBeInTheDocument();
        expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    it('shows rate limit information', () => {
        render(
            <ExportMenu
                data={mockData}
                filename="test-file.json"
                resourceId={mockResourceId}
            />
        );

        const button = screen.getByRole('button', { name: /dışa aktarım seçenekleri/i });
        fireEvent.click(button);

        expect(screen.getByText(/kalan: 100/)).toBeInTheDocument();
        expect(screen.getByText(/100\/saat/)).toBeInTheDocument();
    });

    it('shows open data portal link', () => {
        render(
            <ExportMenu
                data={mockData}
                filename="test-file.json"
                resourceId={mockResourceId}
            />
        );

        const button = screen.getByRole('button', { name: /dışa aktarım seçenekleri/i });
        fireEvent.click(button);

        const portalLink = screen.getByRole('menuitem', { name: /açık veri portalı/i });
        expect(portalLink).toHaveAttribute('href', '/acik-veri');
    });

    it('disables button when rate limit is exceeded', () => {
        const { checkRateLimit } = require('@/lib/exportSecurity');
        checkRateLimit.mockReturnValue({
            allowed: false,
            remaining: 0,
            resetTime: Date.now() + 3600000
        });

        render(
            <ExportMenu
                data={mockData}
                filename="test-file.json"
                resourceId={mockResourceId}
            />
        );

        const button = screen.getByRole('button', { name: /dışa aktarım seçenekleri/i });
        expect(button).toBeDisabled();
        expect(button).toHaveClass('cursor-not-allowed');
    });
});

