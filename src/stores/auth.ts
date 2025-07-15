import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type LoginCredentials, type LoginResponse, type User } from '@/services/api'
import { safeJsonParse } from '@/utils/format'

export const useAuthStore = defineStore('auth', () => {
  // Состояние
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Геттеры
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.full_name || user.value?.username || null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Загрузка данных из localStorage при инициализации
  const loadFromStorage = () => {
    const savedToken = localStorage.getItem('qres_auth_token')
    const savedUser = localStorage.getItem('qres_auth_user')
    
    if (savedToken) {
      token.value = savedToken
      user.value = safeJsonParse(savedUser, null)
      
      if (user.value) {
        apiService.setAuthToken(savedToken)
      } else {
        // Если пользователь не найден, очищаем токен
        clearStorage()
      }
    }
  }

  // Сохранение данных в localStorage
  const saveToStorage = (authToken: string, userData: User) => {
    localStorage.setItem('qres_auth_token', authToken)
    localStorage.setItem('qres_auth_user', JSON.stringify(userData))
  }

  // Очистка localStorage
  const clearStorage = () => {
    localStorage.removeItem('qres_auth_token')
    localStorage.removeItem('qres_auth_user')
  }

  // Вход в систему
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      const response: LoginResponse = await apiService.login(credentials)
      
      // Сохраняем токен и устанавливаем его в API сервисе
      token.value = response.access_token
      apiService.setAuthToken(response.access_token)
      
      // Получаем информацию о пользователе
      const userData = await apiService.getCurrentUser()
      user.value = userData
      
      // Сохраняем в localStorage
      saveToStorage(response.access_token, userData)
      
      return true
    } catch (err) {
      // Очищаем токен при ошибке
      token.value = null
      apiService.removeAuthToken()
      
      error.value = err instanceof Error ? err.message : 'Ошибка входа в систему'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Выход из системы
  const logout = async () => {
    try {
      // Пытаемся выйти через API
      if (token.value) {
        await apiService.logout()
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Очищаем локальные данные в любом случае
      token.value = null
      user.value = null
      error.value = null
      
      // Удаляем токен из API сервиса
      apiService.removeAuthToken()
      
      // Очищаем localStorage
      clearStorage()
    }
  }

  // Проверка валидности токена
  const validateToken = async (): Promise<boolean> => {
    if (!token.value) return false

    try {
      const currentUser = await apiService.getCurrentUser()
      user.value = currentUser
      return true
    } catch (error) {
      console.error('Token validation failed:', error)
      // Токен недействителен, выходим
      await logout()
      return false
    }
  }

  // Обновление данных пользователя
  const refreshUser = async () => {
    if (!token.value) return

    try {
      const currentUser = await apiService.getCurrentUser()
      user.value = currentUser
      saveToStorage(token.value, currentUser)
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  // Проверка прав доступа
  const hasRole = (role: string): boolean => {
    return user.value?.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return user.value ? roles.includes(user.value.role) : false
  }

  // Инициализация (загрузка из localStorage)
  loadFromStorage()

  return {
    // Состояние
    user,
    token,
    isLoading,
    error,
    
    // Геттеры
    isAuthenticated,
    userRole,
    userName,
    isAdmin,
    
    // Методы
    login,
    logout,
    validateToken,
    refreshUser,
    hasRole,
    hasAnyRole,
    loadFromStorage
  }
})
