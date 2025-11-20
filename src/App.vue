<script setup lang="ts">
import { ref, computed } from 'vue'
import { sendCheckoutToSheet, type CheckoutData } from '@/services/googleSheetsService'

// Configuration - Set these environment variables
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || ''

// Form state
const personName = ref('')
const deviceType = ref<'Google Pixel' | 'Apple iPhone' | 'Mac Mini'>('Google Pixel')
const deviceId = ref('')
const status = ref<'checked-out' | 'checked-in'>('checked-out')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

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

  if (!SPREADSHEET_ID) {
    errorMessage.value = 'Spreadsheet ID is not configured. Please set VITE_GOOGLE_SPREADSHEET_ID environment variable.'
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

    await sendCheckoutToSheet(SPREADSHEET_ID, data)

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
            <select class="dropdown" id="device-type" v-model="deviceType">
              <option v-for="type in deviceTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="device-id">Device Number *</label>
            <input
              id="device-id"
              v-model="deviceId"
              type="text"
              placeholder="Enter device number"
              required
            />
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select class="dropdown" id="status" v-model="status">
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
    </main>
  </div>
</template>

<style scoped>

.dropdown {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 30px;
  background: transparent;
  background-image: url('/public/dropdown-arrow-svgrepo-com.svg');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 30px;
  padding-right: 30px;
}

.dropdown::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--off-white);
  pointer-events: none;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--primary-blue);
}

header {
  background: var(--primary-blue);
  padding: .75rem .5rem;
  text-align: center;
  border-bottom: 3px solid #256CFA;
  box-shadow: 0 4px 12px rgba(37, 108, 250, 0.3);
}

header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--off-white);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 1rem;
  color: var(--off-white);
  font-weight: 300;
}

main {
  flex-grow: 1;
  padding: 3rem 2rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

section {
  margin-bottom: 3rem;
  background: rgba(37, 108, 250, 0.1);
  border: 2px solid #256CFA;
  border-radius: 12px;
  padding: .5rem;
  backdrop-filter: blur(10px);
}

section h2 {
  font-size: 1.5rem;
  color: var(--off-white);
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #256CFA;
  padding-bottom: 0.75rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--off-white);
  font-weight: 600;
  font-size: 0.95rem;
}

input,
select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--off-white);
  border-radius: 8px;
  background: var(--dark-blue);
  color: var(--off-white);
  font-family: 'SUSE Mono', sans-serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--off-white);
  box-shadow: 0 0 12px rgba(186, 219, 255, 0.5);
  background-color: var(--dark-blue);
}

input::placeholder {
  color: #DDD;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: 'SUSE Mono', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}


.btn-primary {
  background: #A8F39B;
  color: #020e1e;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(168, 243, 155, 0.4);
}

.btn-primary:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.message {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid;
  font-weight: 500;
}

.message.error {
  background: rgba(252, 131, 94, 0.15);
  border-left-color: #FC835E;
  color: #FFB097;
}

.message.success {
  background: rgba(168, 243, 155, 0.15);
  border-left-color: #A8F39B;
  color: #CFF6C0;
}

.records-section {
  width: 100%;
}

.records-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

thead {
  background: #256CFA;
}

th {
  padding: 1rem;
  text-align: left;
  color: var(--off-white);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

td {
  padding: 1rem;
  border-bottom: 1px solid rgba(37, 108, 250, 0.3);
  color: var(--off-white);
}

tbody tr:hover {
  background: rgba(37, 108, 250, 0.2);
  transition: background 0.3s ease;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status.checked-out {
  background: rgba(252, 131, 94, 0.2);
  color: #FFB097;
  border: 1px solid #FC835E;
}

.status.checked-in {
  background: rgba(168, 243, 155, 0.2);
  color: #CFF6C0;
  border: 1px solid #A8F39B;
}

.no-records {
  text-align: center;
  padding: 2rem;
  color: var(--off-white);
  font-size: 1rem;
}

@media (max-width: 768px) {
  header h1 {
    font-size: 1.8rem;
  }

  main {
    padding: 1.5rem 1rem;
  }

  section {
    padding: 1.5rem 1rem;
  }

  table {
    font-size: 0.85rem;
  }

  th,
  td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
