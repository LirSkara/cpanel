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
  role: 'admin' | 'waiter' | 'kitchen'
  is_active: boolean
  shift_active: boolean
  phone?: string
  passport?: string
  avatar_url?: string
  pin_code?: string
  created_by_id?: number
  last_login?: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  username: string
  password: string
  full_name: string
  role: 'admin' | 'waiter' | 'kitchen'
  is_active: boolean
  phone?: string
  passport?: string
  pin_code?: string
}

export interface UpdateUserData {
  username?: string
  full_name?: string
  role?: 'admin' | 'waiter' | 'kitchen'
  is_active?: boolean
  shift_active?: boolean
  phone?: string
  passport?: string
  pin_code?: string
}

export interface ChangePasswordData {
  new_password: string
  confirm_password: string
}

export interface ApiError {
  detail: string
  status_code?: number
}

export interface UsersResponse {
  users: User[]
  total: number
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
  async getUsers(): Promise<UsersResponse> {
    try {
      const response = await api.get('/users')
      return response.data
    } catch (error) {
      console.error('Failed to get users:', error)
      throw new Error('Не удалось получить список пользователей')
    }
  }

  // Создание нового пользователя
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      console.error('Failed to create user:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 'Ошибка создания пользователя'
        throw new Error(errorMessage)
      }
      throw new Error('Не удалось создать пользователя')
    }
  }

  // Обновление пользователя
  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    try {
      const response = await api.patch(`/users/${id}`, userData)
      return response.data
    } catch (error) {
      console.error('Failed to update user:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 'Ошибка обновления пользователя'
        throw new Error(errorMessage)
      }
      throw new Error('Не удалось обновить пользователя')
    }
  }

  // Удаление пользователя
  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`)
    } catch (error) {
      console.error('Failed to delete user:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 'Ошибка удаления пользователя'
        throw new Error(errorMessage)
      }
      throw new Error('Не удалось удалить пользователя')
    }
  }

  // Смена пароля пользователя
  async changeUserPassword(id: number, passwordData: ChangePasswordData): Promise<void> {
    try {
      await api.patch(`/users/${id}/password`, passwordData)
    } catch (error) {
      console.error('Failed to change password:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 'Ошибка смены пароля'
        throw new Error(errorMessage)
      }
      throw new Error('Не удалось изменить пароль')
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
