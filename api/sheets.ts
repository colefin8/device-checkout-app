import type { VercelRequest, VercelResponse } from '@vercel/node'
import { JWT } from 'google-auth-library'

const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

// Parse service account JSON from environment variable
function getServiceAccount() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable not set')
  }
  return JSON.parse(serviceAccountJson)
}

// Get OAuth token using service account
async function getServiceAccountToken(): Promise<string> {
  const serviceAccount = getServiceAccount()
  const jwtClient = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const token = await jwtClient.getAccessToken()
  return token.token || ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers on all responses FIRST (before any other logic)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle CORS preflight - must return 200 with headers
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { action, spreadsheetId, data } = req.body

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'spreadsheetId is required' })
    }

    const accessToken = await getServiceAccountToken()

    if (action === 'append') {
      if (!data) {
        return res.status(400).json({ error: 'data is required for append action' })
      }

      const response = await fetch(
        `${SHEETS_API_URL}/${spreadsheetId}/values/Sheet1!A:E:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            values: [data],
            majorDimension: 'ROWS',
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || `HTTP ${response.status}`)
      }

      return res.status(200).json({ success: true })
    }

    if (action === 'read') {
      const response = await fetch(
        `${SHEETS_API_URL}/${spreadsheetId}/values/Sheet1!A:E`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || `HTTP ${response.status}`)
      }

      const sheetData = await response.json()
      return res.status(200).json(sheetData)
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
