/**
 * Google Sheets API Service for Device Checkout App
 * Uses direct HTTP requests instead of googleapis library for better browser compatibility
 */

export interface CheckoutData {
  personName: string
  deviceType: 'Google Pixel' | 'Apple iPhone' | 'Mac Mini'
  deviceId: string
  checkoutTime: string
  status: 'checked-out' | 'checked-in'
}

const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

/**
 * Send checkout data to Google Sheet
 * @param spreadsheetId - The ID of the Google Sheet
 * @param data - The checkout data to send
 * @param apiKey - Google API key
 */
export async function sendCheckoutToSheet(
  spreadsheetId: string,
  data: CheckoutData,
  apiKey: string
): Promise<void> {
  try {
    const values = [
      [
        data.personName,
        data.deviceType,
        data.deviceId,
        data.checkoutTime,
        data.status,
      ],
    ]

    const response = await fetch(
      `${SHEETS_API_URL}/${spreadsheetId}/values/Sheet1!A:E:append?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
          majorDimension: 'ROWS',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `HTTP ${response.status}`)
    }

    console.log('Data sent to Google Sheet successfully')
  } catch (error) {
    console.error('Error sending data to Google Sheet:', error)
    throw error
  }
}

/**
 * Get all checkout records from Google Sheet
 * @param spreadsheetId - The ID of the Google Sheet
 * @param apiKey - Google API key
 */
export async function getCheckoutRecords(
  spreadsheetId: string,
  apiKey: string
): Promise<CheckoutData[]> {
  try {
    const response = await fetch(
      `${SHEETS_API_URL}/${spreadsheetId}/values/Sheet1!A:E?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `HTTP ${response.status}`)
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
