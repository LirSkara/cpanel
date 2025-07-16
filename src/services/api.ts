import axios from 'axios'

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000, // Таймаут 5 секунд
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Добавляем перехватчик ответов для лучшей обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Логируем критические ошибки для отладки только в development
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.status, error.response?.data)
    }
    
    return Promise.reject(error)
  }
)

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
  detail: string | ValidationError[]
  status_code?: number
}

export interface ValidationError {
  type: string
  loc: (string | number)[]
  msg: string
  input?: any
  ctx?: any
  url?: string
}

export interface UsersResponse {
  users: User[]
  total: number
}

export interface Table {
  id: number
  number: number
  qr_code: string
  seats: number
  is_occupied: boolean
  is_active: boolean
  description: string | null
  location_id: number
  current_order_id: number | null
  created_at: string
  updated_at: string
}

export interface CreateTableData {
  number: number
  seats: number
  location_id: number
  description?: string
  is_active: boolean
}

export interface UpdateTableData {
  number?: number
  seats?: number
  location_id?: number
  description?: string
  is_active?: boolean
}

export interface TablesResponse {
  tables: Table[]
  total: number
}

export interface Location {
  id: number
  name: string
  description: string | null
  color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateLocationData {
  name: string
  description?: string
  color?: string
  is_active: boolean
}

export interface UpdateLocationData {
  name?: string
  description?: string
  color?: string
  is_active?: boolean
}

export interface LocationsResponse {
  locations: Location[]
  total: number
}

class ApiService {
  private baseURL = 'http://localhost:8000'

  getApiUrl(): string {
    return this.baseURL
  }

  // Форматирование ошибок валидации
  private formatValidationErrors(errors: ValidationError[]): string {
    const fieldTranslations: { [key: string]: string } = {
      'username': 'Имя пользователя',
      'password': 'Пароль',
      'full_name': 'Полное имя',
      'role': 'Роль',
      'phone': 'Телефон',
      'passport': 'Паспорт',
      'pin_code': 'PIN-код',
      'new_password': 'Новый пароль',
      'confirm_password': 'Подтверждение пароля'
    }

    const errorMessages = errors.map((err: ValidationError) => {
      const fieldName = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'поле'
      const translatedField = fieldTranslations[fieldName as string] || fieldName
      
      // Извлекаем сообщение об ошибке
      let message = err.msg
      
      // Обработка различных типов ошибок
      if (err.ctx && err.ctx.error) {
        if (typeof err.ctx.error === 'string') {
          message = err.ctx.error
        } else if (err.ctx.error.message) {
          message = err.ctx.error.message
        }
      }
      
      // Очищаем сообщение от "Value error, "
      if (message.startsWith('Value error, ')) {
        message = message.substring(13)
      }
      
      return `${translatedField}: ${message}`
    })

    return errorMessages.join('\n')
  }

  // Обработка ошибок API
  private handleApiError(error: any, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      // Обработка ошибки таймаута
      if (error.code === 'ECONNABORTED') {
        throw new Error('Время ожидания истекло. Попробуйте снова.')
      }
      
      // Обработка ошибок сети
      if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        throw new Error('Ошибка сети. Проверьте подключение к интернету.')
      }
      
      // Если есть response от сервера
      if (error.response) {
        const { status, data } = error.response
        
        // Новый формат ошибок - проверяем поле details
        if (data?.details && Array.isArray(data.details)) {
          const formattedErrors = this.formatValidationErrors(data.details)
          throw new Error(`Ошибки валидации:\n${formattedErrors}`)
        }
        
        // Новый формат ошибок - проверяем если details это объект с массивом
        if (data?.details && typeof data.details === 'object' && !Array.isArray(data.details)) {
          // Попробуем найти массив ошибок в объекте details
          if (data.details.errors && Array.isArray(data.details.errors)) {
            const formattedErrors = this.formatValidationErrors(data.details.errors)
            throw new Error(`Ошибки валидации:\n${formattedErrors}`)
          }
          // Если details содержит информацию об ошибках в другом формате
          if (data.details.validation_errors && Array.isArray(data.details.validation_errors)) {
            const formattedErrors = this.formatValidationErrors(data.details.validation_errors)
            throw new Error(`Ошибки валидации:\n${formattedErrors}`)
          }
          // Если details это просто объект с информацией об ошибке
          throw new Error(data.message || 'Ошибка валидации данных')
        }
        
        // Старый формат ошибок - проверяем поле detail
        if (data?.detail && Array.isArray(data.detail)) {
          const formattedErrors = this.formatValidationErrors(data.detail)
          throw new Error(`Ошибки валидации:\n${formattedErrors}`)
        }
        
        // Если есть message в новом формате
        if (data?.message && typeof data.message === 'string') {
          throw new Error(data.message)
        }
        
        // Обработка строковых ошибок (старый формат)
        if (data?.detail && typeof data.detail === 'string') {
          throw new Error(data.detail)
        }
        
        // Обработка по HTTP статусам
        switch (status) {
          case 400:
            throw new Error(data?.message || 'Неверные данные запроса')
          case 401:
            throw new Error('Не авторизован')
          case 403:
            throw new Error('Доступ запрещен')
          case 404:
            throw new Error('Ресурс не найден')
          case 422:
            throw new Error(data?.message || 'Ошибка валидации данных')
          case 500:
            throw new Error('Внутренняя ошибка сервера')
          default:
            throw new Error(data?.message || defaultMessage)
        }
      }
      
      // Если есть общее сообщение об ошибке
      if (error.message) {
        throw new Error(error.message)
      }
    }
    
    // Гарантированный throw в конце
    throw new Error(defaultMessage)
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
      const response = await api.get('/health/')
      return response.status === 200
    } catch (error) {
      console.error('Health check failed:', error)
      // Для checkHealth не выбрасываем исключение, просто возвращаем false
      return false
    }
  }

  // Вход в систему
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login/', {
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
      this.handleApiError(error, 'Неизвестная ошибка при входе в систему')
    }
  }

  // Получение информации о текущем пользователе
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me/')
      return response.data
    } catch (error) {
      console.error('Failed to get current user:', error)
      this.handleApiError(error, 'Не удалось получить информацию о пользователе')
    }
  }

  // Выход из системы
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/')
    } catch (error) {
      console.error('Logout failed:', error)
      // Для logout не выбрасываем исключение, так как локальный выход всё равно должен произойти
    }
  }

  // Получение списка пользователей (для админов)
  async getUsers(): Promise<UsersResponse> {
    try {
      const response = await api.get('/users/')
      console.log('Raw users response:', response.data)
      
      // Проверяем структуру ответа
      if (response.data && typeof response.data === 'object') {
        // Если данные приходят в формате { users: [...], total: number }
        if (response.data.users && Array.isArray(response.data.users)) {
          return response.data
        }
        // Если данные приходят как массив пользователей
        if (Array.isArray(response.data)) {
          return {
            users: response.data,
            total: response.data.length
          }
        }
      }
      
      throw new Error('Неверный формат данных от сервера')
    } catch (error) {
      console.error('Failed to get users:', error)
      this.handleApiError(error, 'Не удалось получить список пользователей')
    }
  }

  // Создание нового пользователя
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Очищаем пустые строки от необязательных полей
      const cleanedData = { ...userData }
      if (cleanedData.pin_code === '') {
        delete cleanedData.pin_code
      }
      if (cleanedData.phone === '') {
        delete cleanedData.phone
      }
      if (cleanedData.passport === '') {
        delete cleanedData.passport
      }
      
      console.log('Creating user with data:', cleanedData)
      
      // Создаем запрос с явным таймаутом
      const response = await api.post('/users/', cleanedData, {
        timeout: 30000 // 30 секунд
      })
      
      console.log('User created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create user:', error)
      this.handleApiError(error, 'Не удалось создать пользователя')
    }
  }

  // Обновление пользователя
  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    try {
      // Очищаем пустые строки от необязательных полей
      const cleanedData = { ...userData }
      if (cleanedData.pin_code === '') {
        delete cleanedData.pin_code
      }
      if (cleanedData.phone === '') {
        delete cleanedData.phone
      }
      if (cleanedData.passport === '') {
        delete cleanedData.passport
      }
      
      const response = await api.patch(`/users/${id}/`, cleanedData)
      return response.data
    } catch (error) {
      console.error('Failed to update user:', error)
      this.handleApiError(error, 'Не удалось обновить пользователя')
    }
  }

  // Удаление пользователя
  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}/`)
    } catch (error) {
      console.error('Failed to delete user:', error)
      this.handleApiError(error, 'Не удалось удалить пользователя')
    }
  }

  // Смена пароля пользователя
  async changeUserPassword(id: number, passwordData: ChangePasswordData): Promise<void> {
    try {
      await api.patch(`/users/${id}/password/`, passwordData)
    } catch (error) {
      console.error('Failed to change password:', error)
      this.handleApiError(error, 'Не удалось изменить пароль')
    }
  }

  // Получение статистики (для dashboard)
  async getDashboardStats(): Promise<any> {
    try {
      const response = await api.get('/dashboard/stats/')
      return response.data.data // Возвращаем данные из поля data
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      this.handleApiError(error, 'Не удалось получить статистику')
    }
  }

  // === МЕТОДЫ ДЛЯ РАБОТЫ С ЛОКАЦИЯМИ ===

  // Получение всех локаций
  async getLocations(): Promise<LocationsResponse> {
    try {
      const response = await api.get('/locations/')
      return response.data
    } catch (error) {
      console.error('Failed to get locations:', error)
      this.handleApiError(error, 'Не удалось получить список локаций')
    }
  }

  // Создание новой локации
  async createLocation(locationData: CreateLocationData): Promise<Location> {
    try {
      const response = await api.post('/locations/', locationData)
      return response.data
    } catch (error) {
      console.error('Failed to create location:', error)
      this.handleApiError(error, 'Не удалось создать локацию')
    }
  }

  // Обновление локации
  async updateLocation(id: number, locationData: UpdateLocationData): Promise<Location> {
    try {
      const response = await api.patch(`/locations/${id}/`, locationData)
      return response.data
    } catch (error) {
      console.error('Failed to update location:', error)
      this.handleApiError(error, 'Не удалось обновить локацию')
    }
  }

  // Получение столиков локации
  async getLocationTables(id: number): Promise<TablesResponse> {
    try {
      const response = await api.get(`/locations/${id}/tables/`)
      return response.data
    } catch (error) {
      console.error('Failed to get location tables:', error)
      this.handleApiError(error, 'Не удалось получить столики локации')
    }
  }

  // Синхронизация столиков локации
  async syncLocationTables(id: number): Promise<{ message: string }> {
    try {
      const response = await api.patch(`/locations/${id}/sync-tables/`)
      return response.data
    } catch (error) {
      console.error('Failed to sync location tables:', error)
      this.handleApiError(error, 'Не удалось синхронизировать столики локации')
    }
  }

  // Удаление локации
  async deleteLocation(id: number): Promise<void> {
    try {
      await api.delete(`/locations/${id}/`)
    } catch (error) {
      console.error('Failed to delete location:', error)
      this.handleApiError(error, 'Не удалось удалить локацию')
    }
  }

  // Проверка целостности данных локаций
  async checkLocationsIntegrity(): Promise<{ message: string; issues?: any[] }> {
    try {
      const response = await api.get('/locations/admin/integrity-check/')
      return response.data
    } catch (error) {
      console.error('Failed to check locations integrity:', error)
      this.handleApiError(error, 'Не удалось проверить целостность данных локаций')
    }
  }

  // Автоматическое исправление проблем локаций
  async autoFixLocations(): Promise<{ message: string; fixed?: any[] }> {
    try {
      const response = await api.post('/locations/admin/auto-fix/')
      return response.data
    } catch (error) {
      console.error('Failed to auto-fix locations:', error)
      this.handleApiError(error, 'Не удалось выполнить автоматическое исправление')
    }
  }

  // === МЕТОДЫ ДЛЯ РАБОТЫ СО СТОЛИКАМИ ===

  // Получение всех столиков
  async getTables(): Promise<TablesResponse> {
    try {
      const response = await api.get('/tables/')
      return response.data
    } catch (error) {
      console.error('Failed to get tables:', error)
      this.handleApiError(error, 'Не удалось получить список столиков')
    }
  }

  // Получение столика по ID
  async getTable(id: number): Promise<Table> {
    try {
      const response = await api.get(`/tables/${id}/`)
      return response.data
    } catch (error) {
      console.error('Failed to get table:', error)
      this.handleApiError(error, 'Не удалось получить столик')
    }
  }

  // Создание нового столика
  async createTable(tableData: CreateTableData): Promise<Table> {
    try {
      const response = await api.post('/tables/', tableData)
      return response.data
    } catch (error) {
      console.error('Failed to create table:', error)
      this.handleApiError(error, 'Не удалось создать столик')
    }
  }

  // Обновление столика
  async updateTable(id: number, tableData: UpdateTableData): Promise<Table> {
    try {
      const response = await api.patch(`/tables/${id}/`, tableData)
      return response.data
    } catch (error) {
      console.error('Failed to update table:', error)
      this.handleApiError(error, 'Не удалось обновить столик')
    }
  }

  // Удаление столика
  async deleteTable(id: number): Promise<void> {
    try {
      await api.delete(`/tables/${id}/`)
    } catch (error) {
      console.error('Failed to delete table:', error)
      this.handleApiError(error, 'Не удалось удалить столик')
    }
  }

  // Обновление статуса столика
  async updateTableStatus(id: number, is_occupied: boolean): Promise<Table> {
    try {
      const response = await api.patch(`/tables/${id}/status/`, { is_occupied })
      return response.data
    } catch (error) {
      console.error('Failed to update table status:', error)
      this.handleApiError(error, 'Не удалось обновить статус столика')
    }
  }

  // Получение QR-кода для столика
  async getTableQR(id: number): Promise<{ qr_code: string; qr_code_url: string }> {
    try {
      const response = await api.get(`/tables/${id}/qr/`)
      return response.data
    } catch (error) {
      console.error('Failed to get table QR code:', error)
      this.handleApiError(error, 'Не удалось получить QR-код столика')
    }
  }

  // Получение статуса синхронизации столика
  async getTableSyncStatus(id: number): Promise<{ sync_status: string; last_sync: string }> {
    try {
      const response = await api.get(`/tables/${id}/sync-status/`)
      return response.data
    } catch (error) {
      console.error('Failed to get table sync status:', error)
      this.handleApiError(error, 'Не удалось получить статус синхронизации столика')
    }
  }

  // Принудительная синхронизация столика
  async forceTableSync(id: number): Promise<{ message: string; sync_status: string }> {
    try {
      const response = await api.patch(`/tables/${id}/force-sync/`)
      return response.data
    } catch (error) {
      console.error('Failed to force table sync:', error)
      this.handleApiError(error, 'Не удалось принудительно синхронизировать столик')
    }
  }

  // Генерация QR-кода для столика (устаревший метод, заменен на getTableQR)
  async generateTableQR(id: number): Promise<string> {
    try {
      const response = await this.getTableQR(id)
      return response.qr_code_url
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      this.handleApiError(error, 'Не удалось сгенерировать QR-код')
    }
  }
}

export const apiService = new ApiService()
export default api
