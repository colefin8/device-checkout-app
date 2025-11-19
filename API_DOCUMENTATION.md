# Device Checkout App - API Documentation

This document describes the Google Sheets API integration used by the Device Checkout App.

## Overview

The app communicates with Google Sheets using the Google Sheets API v4 via HTTP requests. This approach is browser-friendly and doesn't require Node.js libraries.

## Base URL

```
https://sheets.googleapis.com/v4/spreadsheets
```

## Authentication

All requests require an API Key:

```
?key=YOUR_API_KEY
```

The API Key is provided via the `VITE_GOOGLE_API_KEY` environment variable.

## API Endpoints

### 1. Append Data (Check Out/In Device)

**Endpoint**: `POST /{spreadsheetId}/values/Sheet1!A:E:append`

**Purpose**: Add a new checkout/checkin record to the Google Sheet

**Parameters**:
- `spreadsheetId`: Your Google Sheet ID
- `key`: Your Google API Key

**Request Body**:
```json
{
  "values": [
    [
      "John Doe",
      "Google Pixel",
      "SN123456",
      "11/19/2025, 2:30:00 PM",
      "checked-out"
    ]
  ],
  "majorDimension": "ROWS"
}
```

**Response Success** (HTTP 200):
```json
{
  "spreadsheetId": "1ABC123...",
  "updatedRange": "Sheet1!A6:E6",
  "updatedRows": 1,
  "updatedColumns": 5,
  "updatedCells": 5
}
```

**Response Error** (HTTP 400+):
```json
{
  "error": {
    "code": 400,
    "message": "Invalid Spreadsheet ID",
    "errors": [...]
  }
}
```

### 2. Get Data (View Records)

**Endpoint**: `GET /{spreadsheetId}/values/Sheet1!A:E`

**Purpose**: Retrieve all checkout records from the Google Sheet

**Parameters**:
- `spreadsheetId`: Your Google Sheet ID
- `key`: Your Google API Key

**Request Body**: None (GET request)

**Response Success** (HTTP 200):
```json
{
  "spreadsheetId": "1ABC123...",
  "range": "Sheet1!A1:E1000",
  "majorDimension": "ROWS",
  "values": [
    ["Person Name", "Device Type", "Device ID", "Time", "Status"],
    ["John Doe", "Google Pixel", "SN123456", "11/19/2025, 2:30:00 PM", "checked-out"],
    ["Jane Smith", "Apple iPhone", "IMEI789", "11/19/2025, 2:45:00 PM", "checked-in"],
    ...
  ]
}
```

**Response Error** (HTTP 400+):
```json
{
  "error": {
    "code": 401,
    "message": "API key not valid. Please pass a valid API key.",
    "errors": [...]
  }
}
```

## Data Format

### Checkout Record Structure

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| personName | string | Name of person checking out device | "John Doe" |
| deviceType | enum | Type of device | "Google Pixel", "Apple iPhone", "Mac Mini" |
| deviceId | string | Serial number or device identifier | "SN123456" |
| checkoutTime | string | ISO timestamp of transaction | "11/19/2025, 2:30:00 PM" |
| status | enum | Checkout or check-in status | "checked-out", "checked-in" |

### Valid Device Types

- `Google Pixel` - Google Pixel phones
- `Apple iPhone` - iPhone devices
- `Mac Mini` - Mac Mini computers

### Valid Status Values

- `checked-out` - Device is being checked out
- `checked-in` - Device is being checked back in

## Implementation in App

### Service Module: `src/services/googleSheetsService.ts`

#### Function: `sendCheckoutToSheet()`

```typescript
async function sendCheckoutToSheet(
  spreadsheetId: string,
  data: CheckoutData,
  apiKey: string
): Promise<void>
```

**Parameters**:
- `spreadsheetId`: ID of the target Google Sheet
- `data`: CheckoutData object with device information
- `apiKey`: Google API Key

**Throws**: Error if API call fails

**Usage Example**:
```typescript
const data: CheckoutData = {
  personName: "John Doe",
  deviceType: "Google Pixel",
  deviceId: "SN123456",
  checkoutTime: new Date().toLocaleString(),
  status: "checked-out"
};

await sendCheckoutToSheet(SPREADSHEET_ID, data, API_KEY);
```

#### Function: `getCheckoutRecords()`

```typescript
async function getCheckoutRecords(
  spreadsheetId: string,
  apiKey: string
): Promise<CheckoutData[]>
```

**Parameters**:
- `spreadsheetId`: ID of the target Google Sheet
- `apiKey`: Google API Key

**Returns**: Array of CheckoutData objects

**Usage Example**:
```typescript
const records = await getCheckoutRecords(SPREADSHEET_ID, API_KEY);
records.forEach(record => {
  console.log(`${record.personName} checked ${record.status}`);
});
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid or expired API Key | Regenerate API Key in Google Cloud Console |
| 403 Forbidden | API Key has insufficient permissions | Ensure Google Sheets API is enabled |
| 404 Not Found | Invalid Spreadsheet ID | Verify Spreadsheet ID is correct |
| 400 Bad Request | Invalid request format | Check request body format |

### Error Response Example

```json
{
  "error": {
    "code": 403,
    "message": "The caller does not have permission",
    "errors": [
      {
        "message": "The caller does not have permission",
        "domain": "global",
        "reason": "forbidden"
      }
    ]
  }
}
```

## Rate Limiting

Google Sheets API has rate limits:

- **Read requests**: 300 per minute per user
- **Write requests**: 60 per minute per user

For normal usage, these limits are sufficient. If you exceed them, requests will return a 429 (Too Many Requests) error.

## Data Persistence

All data is stored in Google Sheets permanently:
- Each checkout/checkin creates a new row
- Data is never automatically deleted
- Manual deletion must be done through Google Sheets UI

## Best Practices

### 1. API Key Security
- Don't share your API Key
- Regenerate if compromised
- Consider using restricted keys with specific APIs
- Rotate keys periodically

### 2. Error Handling
```typescript
try {
  await sendCheckoutToSheet(spreadsheetId, data, apiKey);
} catch (error) {
  console.error('Failed to send data:', error);
  // Show user-friendly error message
}
```

### 3. User Feedback
- Show loading state while API requests are in progress
- Display clear success/error messages
- Don't submit twice (disable button while sending)

### 4. Data Validation
```typescript
// Validate before sending
if (!personName.trim()) {
  throw new Error('Person name is required');
}
if (!deviceId.trim()) {
  throw new Error('Device ID is required');
}
```

## Troubleshooting

### App shows "Google API credentials are not configured"

Check that environment variables are set:
```bash
echo $VITE_GOOGLE_API_KEY
echo $VITE_GOOGLE_SPREADSHEET_ID
```

### "Error: API key not valid"

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Verify the API Key is still valid
3. Check that Google Sheets API is enabled
4. Regenerate the key if needed

### Data not appearing in Google Sheet

1. Verify the API response (check browser DevTools Network tab)
2. Confirm the Google Sheet is public or shared
3. Check that headers are in row 1
4. Try manually adding a row to verify sheet is writable

### "Insufficient permissions" Error

1. Go to Google Cloud Console
2. Select your project
3. Go to APIs & Services → Enabled APIs & services
4. Ensure Google Sheets API is listed
5. If not, enable it

## Advanced Configuration

### Custom Sheet Names

To use a different sheet name, update the API calls:

```typescript
// Change from "Sheet1" to custom name
range: 'CustomSheetName!A:E'
```

### Multiple Sheets

To write to different sheets based on device type:

```typescript
let sheetName = 'Sheet1';
if (data.deviceType === 'Mac Mini') {
  sheetName = 'MacDevices';
}
range: `${sheetName}!A:E`
```

### Custom Timestamp Format

Change timestamp format in App.vue:

```typescript
const now = new Date();
const checkoutTime = now.toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});
```

## References

- [Google Sheets API v4 Documentation](https://developers.google.com/sheets/api)
- [Google Sheets API REST Reference](https://developers.google.com/sheets/api/reference/rest)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server-flow)

---

For more help, check the [GETTING_STARTED.md](./GETTING_STARTED.md) or [README_SETUP.md](./README_SETUP.md).
