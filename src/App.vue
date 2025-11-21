<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CheckoutData } from '@/services/googleSheetsService'

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
    // Lazy load the service only when needed
    const { sendCheckoutToSheet } = await import('@/services/googleSheetsService')

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

    clearMessages()
  } catch (error) {
    errorMessage.value = `Error: ${error instanceof Error ? error.message : String(error)}`
    console.error('Checkout error:', error)
    clearMessages()
  } finally {
    isLoading.value = false
  }
}

// Clear messages after 5 seconds
const clearMessages = () => {
  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 5000)
}
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
  background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23FBFBFB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 24px;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--near-black) 0%, var(--dark-blue) 100%);
}

header {
  padding: 2rem 1.5rem 1rem;
  text-align: center;
}

header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--off-white);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(90deg, var(--lime-green), var(--light-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--light-blue);
  font-weight: 300;
  opacity: 0.8;
}

main {
  flex-grow: 1;
  padding: 1rem 1.5rem 3rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

section {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

section h2 {
  font-size: 1.25rem;
  color: var(--off-white);
  margin-bottom: 2rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.5px;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--light-blue);
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

input,
select {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.2);
  color: var(--off-white);
  font-family: 'SUSE Mono', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 4px rgba(3, 55, 160, 0.2);
  background: rgba(0, 0, 0, 0.4);
}

input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 16px;
  font-family: 'SUSE Mono', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
}

.btn-primary {
  background: var(--lime-green);
  color: var(--near-black);
  width: 100%;
  box-shadow: 0 4px 12px rgba(168, 243, 155, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 243, 155, 0.3);
  filter: brightness(1.1);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  box-shadow: none;
}

.message {
  padding: 1rem 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.error {
  background: rgba(252, 131, 94, 0.1);
  border: 1px solid rgba(252, 131, 94, 0.3);
  color: var(--grapefruit);
}

.message.success {
  background: rgba(168, 243, 155, 0.1);
  border: 1px solid rgba(168, 243, 155, 0.3);
  color: var(--lime-green);
}

@media (max-width: 480px) {
  header h1 {
    font-size: 1.75rem;
  }

  main {
    padding: 1rem;
  }

  section {
    padding: 1.5rem;
    border-radius: 20px;
  }

  input, select, .btn {
    padding: 0.875rem 1rem;
    font-size: 16px; /* Prevents iOS zoom on focus */
  }
}
</style>
