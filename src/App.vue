<script setup lang="ts">
import { ref, computed } from 'vue'
import { sendCheckoutToSheet, getCheckoutRecords, type CheckoutData } from '@/services/googleSheetsService'

// Configuration - Set these environment variables or update them directly
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || ''

// Form state
const personName = ref('')
const deviceType = ref<'Google Pixel' | 'Apple iPhone' | 'Mac Mini'>('Google Pixel')
const deviceId = ref('')
const status = ref<'checked-out' | 'checked-in'>('checked-out')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const records = ref<CheckoutData[]>([])
const showRecords = ref(false)

// Device options
const deviceTypes = ['Google Pixel', 'Apple iPhone', 'Mac Mini'] as const
const statusOptions = ['checked-out', 'checked-in'] as const

// Validation
const isFormValid = computed(() => {
  return personName.value.trim() !== '' && deviceId.value.trim() !== ''
})

// Submit checkout
const handleSubmit = async () => {
  if (!isFormValid.value) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  if (!API_KEY || !SPREADSHEET_ID) {
    errorMessage.value = 'Google API credentials are not configured. Please set VITE_GOOGLE_API_KEY and VITE_GOOGLE_SPREADSHEET_ID environment variables.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const now = new Date()
    const checkoutTime = now.toLocaleString()

    const data: CheckoutData = {
      personName: personName.value.trim(),
      deviceType: deviceType.value,
      deviceId: deviceId.value.trim(),
      checkoutTime,
      status: status.value,
    }

    await sendCheckoutToSheet(SPREADSHEET_ID, data, API_KEY)

    successMessage.value = `Device ${status.value === 'checked-out' ? 'checked out' : 'checked in'} successfully!`

    // Reset form
    personName.value = ''
    deviceType.value = 'Google Pixel'
    deviceId.value = ''
    status.value = 'checked-out'
  } catch (error) {
    errorMessage.value = `Error: ${error instanceof Error ? error.message : String(error)}`
    console.error('Checkout error:', error)
  } finally {
    isLoading.value = false
  }
}

// Fetch records
const handleFetchRecords = async () => {
  if (!API_KEY || !SPREADSHEET_ID) {
    errorMessage.value = 'Google API credentials are not configured.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    records.value = await getCheckoutRecords(SPREADSHEET_ID, API_KEY)
    showRecords.value = true
  } catch (error) {
    errorMessage.value = `Error fetching records: ${error instanceof Error ? error.message : String(error)}`
    console.error('Fetch error:', error)
  } finally {
    isLoading.value = false
  }
}

// Clear messages
const clearMessages = () => {
  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 5000)
}

// Watch for messages
clearMessages()
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Device Checkout System</h1>
      <p class="subtitle">Check in and out mobile devices for testing</p>
    </header>

    <main>
      <!-- Error Message -->
      <div v-if="errorMessage" class="message error">
        <strong>Error:</strong> {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>

      <!-- Checkout Form -->
      <section class="form-section">
        <h2>Device Checkout Form</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="person-name">Person Name *</label>
            <input
              id="person-name"
              v-model="personName"
              type="text"
              placeholder="Enter your name"
              required
            />
          </div>

          <div class="form-group">
            <label for="device-type">Device Type *</label>
            <select id="device-type" v-model="deviceType">
              <option v-for="type in deviceTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="device-id">Device ID *</label>
            <input
              id="device-id"
              v-model="deviceId"
              type="text"
              placeholder="Enter device serial or ID number"
              required
            />
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select id="status" v-model="status">
              <option v-for="st in statusOptions" :key="st" :value="st">
                {{ st === 'checked-out' ? 'Check Out' : 'Check In' }}
              </option>
            </select>
          </div>

          <button type="submit" :disabled="!isFormValid || isLoading" class="btn btn-primary">
            {{ isLoading ? 'Submitting...' : status === 'checked-out' ? 'Check Out Device' : 'Check In Device' }}
          </button>
        </form>
      </section>

      <!-- View Records Section -->
      <section class="records-section">
        <button @click="handleFetchRecords" :disabled="isLoading" class="btn btn-secondary">
          {{ isLoading ? 'Loading...' : 'View All Records' }}
        </button>

        <div v-if="showRecords && records.length > 0" class="records-table">
          <h2>Checkout Records</h2>
          <table>
            <thead>
              <tr>
                <th>Person Name</th>
                <th>Device Type</th>
                <th>Device ID</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in records" :key="index">
                <td>{{ record.personName }}</td>
                <td>{{ record.deviceType }}</td>
                <td>{{ record.deviceId }}</td>
                <td>{{ record.checkoutTime }}</td>
                <td :class="['status', record.status]">
                  {{ record.status === 'checked-out' ? 'Checked Out' : 'Checked In' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="showRecords && records.length === 0" class="no-records">
          <p>No records found in the Google Sheet.</p>
        </div>
      </section>
    </main>

    <footer>
      <p>Device Checkout App v1.0</p>
    </footer>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #4285f4;
  --secondary-color: #34a853;
  --error-color: #d32f2f;
  --warning-color: #fbbc04;
  --text-color: #202124;
  --border-color: #dadce0;
  --bg-light: #f8f9fa;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #ffffff;
}

header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
  border-bottom: 2px solid var(--border-color);
}

header h1 {
  margin: 0;
  color: var(--primary-color);
  font-size: 2.5rem;
}

header .subtitle {
  margin: 10px 0 0 0;
  color: #5f6368;
  font-size: 1rem;
}

main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

section {
  background-color: var(--bg-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 25px;
}

section h2 {
  margin-top: 0;
  color: var(--text-color);
  font-size: 1.5rem;
}

/* Messages */
.message {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 1rem;
}

.message.error {
  background-color: #fcebee;
  color: var(--error-color);
  border: 1px solid #f48fb1;
}

.message.success {
  background-color: #e8f5e9;
  color: var(--secondary-color);
  border: 1px solid #81c784;
}

/* Form Styles */
.form-section form {
  display: grid;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

input,
select {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

input::placeholder {
  color: #9aa0a6;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  width: 100%;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1765cc;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #1e8449;
  box-shadow: 0 2px 8px rgba(52, 168, 83, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Records Table */
.records-table {
  margin-top: 30px;
  overflow-x: auto;
}

.records-table h2 {
  margin-top: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

thead {
  background-color: #f1f3f4;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--border-color);
}

td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.status {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
  display: inline-block;
  min-width: 100px;
}

.status.checked-out {
  background-color: #fff3cd;
  color: #856404;
}

.status.checked-in {
  background-color: #d4edda;
  color: #155724;
}

.no-records {
  text-align: center;
  padding: 30px;
  color: #5f6368;
  font-style: italic;
}

/* Footer */
footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  color: #5f6368;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-container {
    padding: 15px;
  }

  header h1 {
    font-size: 1.8rem;
  }

  section {
    padding: 15px;
  }

  table {
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 8px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 0.95rem;
  }
}
</style>
