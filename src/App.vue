<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CheckoutData } from '@/services/googleSheetsService'

// Configuration - Set these environment variables
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || ''

// Theme state
const isDarkMode = ref(true)

// Form state
const personName = ref('')
const deviceType = ref<'Google Pixel' | 'Apple iPhone' | 'Mac Mini'>('Google Pixel')
const deviceId = ref('')
const status = ref<'checked-out' | 'checked-in'>('checked-out')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Recent devices state
interface RecentDevice {
  id: string
  personName: string
  deviceType: 'Google Pixel' | 'Apple iPhone' | 'Mac Mini'
  deviceId: string
  checkoutTime: string
}
const recentDevices = ref<RecentDevice[]>([])

// Device options
const deviceTypes = ['Google Pixel', 'Apple iPhone', 'Mac Mini'] as const
const statusOptions = ['checked-out', 'checked-in'] as const

// Validation
const isFormValid = computed(() => {
  return personName.value.trim() !== '' && deviceId.value.trim() !== ''
})

// Theme management
const THEME_STORAGE_KEY = 'theme-preference'

const initializeTheme = () => {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored) {
    isDarkMode.value = stored === 'dark'
  } else {
    // Fall back to system preference
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

const applyTheme = () => {
  const html = document.documentElement
  if (isDarkMode.value) {
    html.classList.remove('light-mode')
  } else {
    html.classList.add('light-mode')
  }
  localStorage.setItem(THEME_STORAGE_KEY, isDarkMode.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
}

// LocalStorage management
const STORAGE_KEY = 'device-checkout-history'
const MAX_RECENT_DEVICES = 5

const loadRecentDevices = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      recentDevices.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading recent devices:', error)
  }
}

const saveRecentDevices = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentDevices.value))
  } catch (error) {
    console.error('Error saving recent devices:', error)
  }
}

const addRecentDevice = (data: CheckoutData) => {
  const recentDevice: RecentDevice = {
    id: `${data.deviceId}-${Date.now()}`,
    personName: data.personName,
    deviceType: data.deviceType,
    deviceId: data.deviceId,
    checkoutTime: data.checkoutTime,
  }

  recentDevices.value.unshift(recentDevice)

  if (recentDevices.value.length > MAX_RECENT_DEVICES) {
    recentDevices.value = recentDevices.value.slice(0, MAX_RECENT_DEVICES)
  }

  saveRecentDevices()
}

const removeRecentDevice = (id: string) => {
  recentDevices.value = recentDevices.value.filter(device => device.id !== id)
  saveRecentDevices()
}

const quickCheckIn = async (device: RecentDevice) => {
  if (!SPREADSHEET_ID) {
    errorMessage.value = 'Spreadsheet ID is not configured.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { sendCheckoutToSheet } = await import('@/services/googleSheetsService')

    const now = new Date()
    const checkoutTime = now.toLocaleString()

    const data: CheckoutData = {
      personName: device.personName,
      deviceType: device.deviceType,
      deviceId: device.deviceId,
      checkoutTime,
      status: 'checked-in',
    }

    await sendCheckoutToSheet(SPREADSHEET_ID, data)

    successMessage.value = `${device.deviceType} #${device.deviceId} checked in successfully!`
    removeRecentDevice(device.id)
    clearMessages()
  } catch (error) {
    errorMessage.value = `Error checking in device: ${error instanceof Error ? error.message : String(error)}`
    console.error('Check-in error:', error)
    clearMessages()
  } finally {
    isLoading.value = false
  }
}

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

    // Save to recent devices if checking out
    if (status.value === 'checked-out') {
      addRecentDevice(data)
    }

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

// Load recent devices on mount
onMounted(() => {
  initializeTheme()
  loadRecentDevices()
})
</script>

<template>
  <div class="app-container">
    <header>
      <div class="header-content">
        <div class="header-title">
          <h1>Device Checkout System</h1>
          <p class="subtitle">Check in and out mobile devices for testing</p>
        </div>
      </div>
    </header>

    <button class="theme-toggle" :aria-label="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`" @click="toggleTheme">
      <span class="theme-icon">{{ isDarkMode ? '💡' : '🌙' }}</span>
    </button>

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
            <input id="person-name" v-model="personName" type="text" placeholder="Enter your name" required />
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
            <input id="device-id" v-model="deviceId" type="text" placeholder="Enter device number" required />
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

      <!-- Recent Devices Section -->
      <section v-if="recentDevices.length > 0" class="recent-devices-section">
        <h2>Recently Checked Out</h2>
        <div class="devices-list">
          <div v-for="device in recentDevices" :key="device.id" class="device-card">
            <div class="device-info">
              <div class="device-name">{{ device.deviceType }} #{{ device.deviceId }}</div>
              <div class="device-person">{{ device.personName }}</div>
              <div class="device-time">{{ device.checkoutTime }}</div>
            </div>
            <button type="button" :disabled="isLoading" @click="quickCheckIn(device)" class="btn btn-check-in">
              Check In
            </button>
          </div>
        </div>
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
  background: var(--bg-primary);
}

header {
  padding: 2rem 1.5rem 1rem;
  background: var(--header-bg);
  border-bottom: 2px solid rgba(168, 243, 155, 0.3);
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.header-title {
  text-align: center;
  flex: 1;
}

header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
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
  color: var(--text-secondary);
  font-weight: 300;
  opacity: 0.8;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 2px solid rgba(168, 243, 155, 0.3);
  border-radius: 12px;
  padding: 0.25rem 0.375rem;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 100;
  height: 2rem;
  width: 2rem;
}

.theme-toggle:hover {
  border-color: rgba(168, 243, 155, 0.6);
  background: rgba(168, 243, 155, 0.1);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  vertical-align: middle;
}

main {
  flex-grow: 1;
  padding: 1rem 1.5rem 3rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

section h2 {
  font-size: 1.25rem;
  color: var(--text-primary);
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
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

input,
select {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-family: 'SUSE Mono', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 4px rgba(3, 55, 160, 0.3);
  background: var(--input-bg);
}

input::placeholder {
  color: rgba(255, 255, 255, 0.7);
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
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Recent Devices Styles */
.recent-devices-section {
  background: var(--section-bg) !important;
  border: 1.5px solid var(--section-border) !important;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.device-card:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: var(--primary-blue);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.device-info {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--lime-green);
  margin-bottom: 0.25rem;
}

.device-person {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.device-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.btn-check-in {
  padding: 0.75rem 1.25rem;
  background: var(--grapefruit);
  color: var(--off-white);
  font-size: 0.85rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(252, 131, 94, 0.2);
  margin-top: 0;
}

.btn-check-in:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 8px 16px rgba(252, 131, 94, 0.3);
}

.btn-check-in:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  box-shadow: none;
}

/* Tablet and Desktop Styles */
@media (min-width: 768px) {
  main {
    max-width: 900px;
    padding: 2rem 2rem 6rem;
  }

  section {
    padding: 3rem;
    border-radius: 28px;
  }

  .form-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .form-section>h2 {
    grid-column: 1 / -1;
  }

  .form-section form {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .form-section .btn {
    grid-column: 1 / -1;
    margin-top: 0.5rem;
  }

  .devices-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .device-card {
    flex-direction: column;
    align-items: stretch;
  }

  .device-info {
    flex-grow: 1;
  }

  .btn-check-in {
    width: 100%;
    margin-top: 1rem;
  }

  .theme-toggle {
    top: 2rem;
    right: 2rem;
    font-size: 1.25rem;
    padding: 0.5rem 0.75rem;
  }
}

/* Large Desktop */
@media (min-width: 1024px) {
  main {
    max-width: 1200px;
  }

  .devices-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  header {
    padding: 1.5rem 1rem 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
  }

  .header-title {
    width: 100%;
  }

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

  input,
  select,
  .btn {
    padding: 0.875rem 1rem;
    font-size: 16px;
    /* Prevents iOS zoom on focus */
  }

  .device-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-check-in {
    width: 100%;
  }
}
</style>
