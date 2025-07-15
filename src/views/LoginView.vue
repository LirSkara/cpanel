<template>
  <div class="login-page">
    <!-- Фоновая секция на всю ширину -->
    <div class="background-section">
      <!-- Индикатор соединения по центру сверху -->
      <div
        class="connection-status"
        :class="connectionClass"
        :title="`API: ${apiUrl} • Нажмите для проверки`"
        @click="checkConnection"
      >
        <i :class="connectionIcon"></i>
        <span>{{ connectionText }}</span>
      </div>

      <!-- Левая часть с брендингом -->
      <div class="qres-login-brand-content">
        <div class="qres-login-brand-header">
          <div class="qres-login-brand-logo">
            <i class="bi bi-gear-fill"></i>
          </div>
          <h1 class="qres-login-brand-title">QRes OS 4</h1>
          <h2 class="qres-login-brand-subtitle">Панель управления</h2>
          <p class="qres-login-brand-description">
            Мощная система управления рестораном.
            Контроль, аналитика, настройки.
          </p>
        </div>

        <div class="qres-login-brand-features">
          <div class="qres-login-feature-item">
            <div class="qres-login-feature-icon">
              <i class="bi bi-people-fill"></i>
            </div>
            <div class="qres-login-feature-text">
              <h4>Управление персоналом</h4>
              <p>Контроль сотрудников и ролей</p>
            </div>
          </div>

          <div class="qres-login-feature-item">
            <div class="qres-login-feature-icon">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <div class="qres-login-feature-text">
              <h4>Аналитика</h4>
              <p>Отчеты и статистика</p>
            </div>
          </div>

          <div class="qres-login-feature-item">
            <div class="qres-login-feature-icon">
              <i class="bi bi-gear-wide-connected"></i>
            </div>
            <div class="qres-login-feature-text">
              <h4>Настройки</h4>
              <p>Конфигурация системы</p>
            </div>
          </div>
        </div>

        <div class="qres-login-brand-footer">
          <p class="qres-login-version-info">Версия {{ appVersion }} • © 2025 QRes Technologies</p>
        </div>
      </div>

      <!-- Форма входа поверх фона -->
      <div class="login-form-card">
        <div class="form-content">
          <!-- Заголовок формы -->
          <div class="login-form-header">
            <h3 class="login-form-title">Вход в систему</h3>
            <p class="login-form-subtitle">Введите свои учетные данные для доступа к панели управления</p>
          </div>

          <!-- Форма входа по паролю -->
          <div class="login-form">
            <form @submit.prevent="handlePasswordLogin">
              <!-- Поле логина -->
              <div class="qres-form-group">
                <label class="qres-form-label">Логин</label>
                <div class="qres-form-input-group">
                  <div class="qres-input-icon">
                    <i class="bi bi-person-fill"></i>
                  </div>
                  <input
                    v-model="username"
                    type="text"
                    class="qres-form-control"
                    placeholder="Введите логин"
                    required
                    autocomplete="username"
                  />
                </div>
              </div>

              <!-- Поле пароля -->
              <div class="qres-form-group">
                <label class="qres-form-label">Пароль</label>
                <div class="qres-form-input-group">
                  <div class="qres-input-icon">
                    <i class="bi bi-lock-fill"></i>
                  </div>
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="qres-form-control"
                    placeholder="Введите пароль"
                    required
                    autocomplete="current-password"
                  />
                  <button
                    @click="showPassword = !showPassword"
                    type="button"
                    class="password-toggle"
                  >
                    <i :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Кнопка входа -->
              <button
                type="submit"
                class="btn-submit"
                :disabled="!username || !password || isLoading"
              >
                <span v-if="isLoading" class="spinner"></span>
                <i v-else class="bi bi-box-arrow-in-right"></i>
                <span>{{ isLoading ? 'Вход...' : 'Войти' }}</span>
              </button>
            </form>
          </div>

          <!-- Сообщение об ошибке -->
          <div v-if="error" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Состояние формы
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const appVersion = ref('1.0.0')

// Состояние соединения
const isConnected = ref(false)
const connectionError = ref('')
const apiUrl = computed(() => apiService.getApiUrl())

// PIN-клавиатура - удалено

// Состояние соединения
const connectionClass = computed(() =>
  isConnected.value ? 'connected' : 'disconnected'
)

const connectionIcon = computed(() =>
  isConnected.value ? 'bi-wifi' : 'bi-wifi-off'
)

const connectionText = computed(() => {
  if (isConnected.value) {
    return 'Соединение с сервером установлено'
  } else {
    if (connectionError.value.includes('AbortError') || connectionError.value.includes('timeout')) {
      return '⏱️ Превышен таймаут (Обратитесь в техническую поддержку)'
    } else if (connectionError.value.includes('CORS')) {
      return 'Ошибка CORS (Обратитесь в техническую поддержку)'
    } else if (connectionError.value.includes('fetch') || connectionError.value.includes('NetworkError')) {
      return 'Сервер недоступен (Обратитесь в техническую поддержку)'
    } else {
      return 'Нет соединения с сервером (Обратитесь в техническую поддержку)'
    }
  }
})

// Методы входа - убираем PIN-методы

const handlePasswordLogin = async () => {
  try {
    isLoading.value = true
    error.value = ''

    // Реальный вход через API
    const success = await authStore.login({
      username: username.value,
      password: password.value
    })

    if (success) {
      // Перенаправляем на dashboard или на страницу из redirect
      const redirectPath = (route.query.redirect as string) || '/dashboard'
      router.push(redirectPath)
    } else {
      error.value = authStore.error || 'Ошибка входа в систему'
    }
    
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Ошибка входа в систему'
  } finally {
    isLoading.value = false
    // Очищаем пароль после попытки входа
    password.value = ''
  }
}

// Проверка соединения с сервером
const checkConnection = async () => {
  try {
    const isHealthy = await apiService.checkHealth()
    isConnected.value = isHealthy
    connectionError.value = isHealthy ? '' : 'Сервер недоступен'
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    isConnected.value = false
    connectionError.value = errorMessage
  }
}

// Инициализация
onMounted(async () => {
  // Если уже авторизован, перенаправляем на dashboard
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
    return
  }

  // Проверяем error в query параметрах
  if (route.query.error === 'admin_required') {
    error.value = 'Для доступа к панели управления требуется роль администратора'
  }

  // Проверяем соединение
  checkConnection()

  // Периодически проверяем соединение
  setInterval(checkConnection, 10000)
})
</script>

<style scoped lang="scss">
@use '@/styles/views/login';
</style>
