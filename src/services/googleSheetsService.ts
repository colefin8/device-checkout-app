/**
 * Google Sheets API Service for Device Checkout App
 * Uses a backend service account for automatic authentication
 * No user login required!
 */

export interface CheckoutData {
  personName: string
  deviceType: 'Google Pixel' | 'Apple iPhone' | 'Mac Mini'
  deviceId: string
  checkoutTime: string
  status: 'checked-out' | 'checked-in'
}

// Backend API endpoint (from environment or localhost for dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const SHEETS_ENDPOINT = `${API_BASE_URL}/api/sheets`

/**
 * Send checkout data to Google Sheet using service account
 * @param spreadsheetId - The ID of the Google Sheet
 * @param data - The checkout data to send
 */
export async function sendCheckoutToSheet(
  spreadsheetId: string,
  data: CheckoutData
): Promise<void> {
  try {
    const response = await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'append',
        spreadsheetId,
        data: [
          data.personName,
          data.deviceType,
          data.deviceId,
          data.checkoutTime,
          data.status,
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    console.log('Data sent to Google Sheet successfully')
  } catch (error) {
    console.error('Error sending data to Google Sheet:', error)
    throw error
  }
}

/**
 * Get all checkout records from Google Sheet using service account
 * @param spreadsheetId - The ID of the Google Sheet
 */
export async function getCheckoutRecords(
  spreadsheetId: string
): Promise<CheckoutData[]> {
  try {
    const response = await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'read',
        spreadsheetId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const data = (await response.json()) as Record<string, unknown>
    const rows = (data.values as (string | number | boolean)[][]) || []
    const records: CheckoutData[] = []

    // Skip header row if it exists
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row && row.length >= 5) {
        records.push({
          personName: String(row[0] ?? ''),
          deviceType: String(row[1] ?? '') as 'Google Pixel' | 'Apple iPhone' | 'Mac Mini',
          deviceId: String(row[2] ?? ''),
          checkoutTime: String(row[3] ?? ''),
          status: String(row[4] ?? '') as 'checked-out' | 'checked-in',
        })
      }
    }

    return records
  } catch (error) {
    console.error('Error retrieving checkout records:', error)
    throw error
  }
}
