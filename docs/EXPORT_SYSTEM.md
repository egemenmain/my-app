# Export System Implementation

## Overview

This document describes the implementation of the new export system that replaces "JSON indir" buttons with a comprehensive "Dışa Aktar" (Export) menu system.

## Features

### 1. Export Menu Component (`components/ExportMenu.tsx`)

- **Multi-format support**: PDF, Excel (XLSX), CSV, and JSON (developer only)
- **Role-based access**: JSON export only available to developers/admins
- **Rate limiting**: 100 exports per hour per user
- **Data sanitization**: PII and KVKK data masking for non-developer users
- **Accessibility**: Full ARIA support, keyboard navigation
- **Security**: File size validation, audit logging

### 2. Configuration System (`config/exportConfig.ts`)

- **Environment variables**: `PUBLIC_ENABLE_JSON` flag
- **User roles**: `citizen`, `developer`, `admin`
- **Feature flags**: Dynamic format availability based on role
- **Rate limits**: Configurable per-hour limits
- **File size limits**: Maximum 10MB per export

### 3. Security Layer (`lib/exportSecurity.ts`)

- **PII masking**: T.C. Kimlik No, telefon, email, adres fields
- **KVKK compliance**: Health, income, debt information masking
- **Rate limiting**: Client-side rate limit tracking
- **Audit logging**: Export activity tracking
- **File validation**: Size and format validation

### 4. Open Data Portal (`app/acik-veri/page.tsx`)

- **API documentation**: Available endpoints and schemas
- **Rate limit information**: Usage guidelines
- **License information**: Creative Commons Attribution 4.0
- **Developer resources**: Examples and support contacts

## Implementation Details

### Data Sanitization

```typescript
// PII fields are masked for non-developers
const PII_FIELDS = [
  'tcNo', 'tcKimlikNo', 'kimlikNo',
  'telefon', 'phone', 'cepTelefonu',
  'email', 'ePosta', 'eposta',
  'adres', 'address'
];

// Example: "12345678901" becomes "12*******01"
```

### Rate Limiting

```typescript
// 100 exports per hour per user
const rateLimit = checkRateLimit();
if (!rateLimit.allowed) {
  // Show error message with reset time
}
```

### Role-Based Access

```typescript
// JSON export only for developers/admins
const canExportJson = (): boolean => {
  return exportConfig.enableJsonExport || 
         ['developer', 'admin'].includes(exportConfig.userRole);
};
```

## Migration from JSON Buttons

### Before (Old System)
```tsx
<button onClick={() => downloadJSON("data.json", data)}>
  JSON indir
</button>
```

### After (New System)
```tsx
<ExportMenu 
  data={data} 
  filename="data"
  resourceId="service-name"
/>
```

## Security Considerations

### 1. Data Privacy
- **PII masking**: Personal information is masked in exports
- **KVKK compliance**: Sensitive data is protected
- **Role-based access**: Developers can access raw data

### 2. Rate Limiting
- **Client-side tracking**: Uses localStorage for rate limiting
- **Configurable limits**: 100 exports per hour (configurable)
- **User feedback**: Clear error messages when limits exceeded

### 3. File Validation
- **Size limits**: Maximum 10MB per export
- **Format validation**: Only allowed formats can be exported
- **Content sanitization**: Data is cleaned before export

## Accessibility Features

### 1. ARIA Support
- `aria-haspopup="menu"`: Indicates dropdown menu
- `aria-expanded`: Shows menu state
- `role="menu"` and `role="menuitem"`: Proper menu semantics

### 2. Keyboard Navigation
- **Tab navigation**: Focusable elements
- **Enter/Space**: Activate buttons
- **Escape**: Close menu
- **Arrow keys**: Navigate menu items

### 3. Screen Reader Support
- **Descriptive labels**: Clear button and menu item labels
- **State announcements**: Menu open/closed states
- **Error messages**: Accessible error feedback

## Testing

### Unit Tests
- Component rendering and interaction
- Accessibility compliance
- Security function validation
- Rate limiting behavior

### Manual Testing Checklist
- [ ] Export menu opens and closes correctly
- [ ] All export formats work as expected
- [ ] Rate limiting prevents excessive exports
- [ ] Data sanitization masks PII correctly
- [ ] Accessibility features work with screen readers
- [ ] Open Data Portal is accessible and informative

## Configuration

### Environment Variables
```bash
# Enable JSON export for all users (default: false)
PUBLIC_ENABLE_JSON=true

# Set user role (default: citizen)
NEXT_PUBLIC_USER_ROLE=developer
```

### Customization
- **Rate limits**: Modify `exportConfig.rateLimitPerHour`
- **File size limits**: Change `exportConfig.maxFileSize`
- **PII fields**: Add to `PII_FIELDS` array in `exportSecurity.ts`
- **Export formats**: Modify `availableFormats` in `exportConfig.ts`

## Deployment Notes

### 1. Environment Setup
- Set appropriate environment variables
- Configure rate limiting for production
- Set up audit logging if required

### 2. Monitoring
- Monitor export usage patterns
- Track rate limit violations
- Review audit logs for security

### 3. Updates
- Update PII field lists as needed
- Adjust rate limits based on usage
- Add new export formats as required

## Troubleshooting

### Common Issues

1. **Export button disabled**
   - Check rate limit status
   - Verify user role configuration
   - Check browser console for errors

2. **Data not sanitized**
   - Verify user role is not 'developer'
   - Check PII field configuration
   - Ensure security functions are imported

3. **Menu not opening**
   - Check for JavaScript errors
   - Verify component imports
   - Test accessibility features

### Debug Mode
Enable debug logging by setting:
```typescript
console.log('Export audit log:', auditLog);
```

## Future Enhancements

### Planned Features
- **Server-side rate limiting**: More secure rate limiting
- **Export history**: Track user export history
- **Custom formats**: User-defined export formats
- **Batch exports**: Multiple data sets in one export
- **Cloud storage**: Direct export to cloud services

### Integration Opportunities
- **Analytics**: Export usage analytics
- **Notifications**: Export completion notifications
- **Scheduling**: Scheduled exports
- **API integration**: Direct API access for developers




