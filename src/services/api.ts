import axios from 'axios'

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Интерфейсы для типизации
export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface User {
  id: number
  username: string
  full_name: string
  email?: string
  role: string
  is_active: boolean
}

export interface ApiError {
  detail: string
  status_code?: number
}

class ApiService {
  private baseURL = 'http://localhost:8000'

  getApiUrl(): string {
    return this.baseURL
  }

  // Установка токена авторизации
  setAuthToken(token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Удаление токена авторизации
  removeAuthToken() {
    delete api.defaults.headers.common['Authorization']
  }

  // Проверка здоровья API
  async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get('/health')
      return response.status === 200
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  // Вход в систему
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      })

      if (response.data.access_token) {
        this.setAuthToken(response.data.access_token)
        return response.data
      } else {
        throw new Error('Неверные учетные данные')
      }
    } catch (error) {
      console.error('Login failed:', error)
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 'Ошибка входа в систему'
        throw new Error(errorMessage)
      }
      
      throw new Error('Неизвестная ошибка при входе в систему')
    }
  }

  // Получение информации о текущем пользователе
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      console.error('Failed to get current user:', error)
      throw new Error('Не удалось получить информацию о пользователе')
    }
  }

  // Выход из системы
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout failed:', error)
      // Не выбрасываем ошибку, так как локальный выход всё равно должен произойти
    }
  }

  // Получение списка пользователей (для админов)
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users')
      return response.data
    } catch (error) {
      console.error('Failed to get users:', error)
      throw new Error('Не удалось получить список пользователей')
    }
  }

  // Получение статистики (для dashboard)
  async getDashboardStats(): Promise<any> {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data.data // Возвращаем данные из поля data
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      throw new Error('Не удалось получить статистику')
    }
  }
}

export const apiService = new ApiService()
export default api
