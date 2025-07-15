<template>
  <div class="users-management-page pt-2">
    <!-- Хлебные крошки и заголовок -->
    <div class="page-header">
      <nav class="breadcrumb">
        <router-link to="/dashboard" class="breadcrumb-item">
          <i class="bi bi-house"></i>
          Главная
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">Управление пользователями</span>
      </nav>
      
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i class="bi bi-people-fill"></i>
            Управление пользователями
          </h1>
          <p class="page-subtitle">
            Всего пользователей: <span class="badge bg-primary">{{ Array.isArray(users) ? users.length : 0 }}</span>
            • Активных: <span class="badge bg-success">{{ activeUsersCount }}</span>
            • На смене: <span class="badge bg-warning">{{ onShiftUsersCount }}</span>
          </p>
        </div>
        <div class="header-right">
          <button 
            @click="showCreateModal = true" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <i class="bi bi-plus-circle"></i>
            Добавить пользователя
          </button>
        </div>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
      <div class="filters-content">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск по имени или логину..."
            class="search-input"
          >
        </div>
        
        <div class="filter-controls">
          <select v-model="roleFilter" class="filter-select">
            <option value="">Все роли</option>
            <option value="admin">Администратор</option>
            <option value="waiter">Официант</option>
            <option value="kitchen">Кухня</option>
          </select>
          
          <select v-model="statusFilter" class="filter-select">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>
          
          <button @click="resetFilters" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-clockwise"></i>
            Сбросить
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица пользователей -->
    <div class="users-table-section">
      <div class="table-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <p>Загрузка пользователей...</p>
        </div>
        
        <div v-else-if="filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="bi bi-person-x"></i>
          </div>
          <h3>Пользователи не найдены</h3>
          <p>Попробуйте изменить параметры поиска или добавить нового пользователя</p>
        </div>
        
        <table v-else class="users-table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Смена</th>
              <th>Создан</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="user-info">
                <div class="user-avatar">
                  <i :class="getUserIcon(user.role)"></i>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.full_name }}</div>
                  <div class="user-username">@{{ user.username }}</div>
                  <div v-if="user.phone" class="user-phone">{{ user.phone }}</div>
                  <div v-if="user.last_login" class="user-last-login">
                    Последний вход: {{ formatDate(user.last_login) }}
                  </div>
                </div>
              </td>
              
              <td class="user-role">
                <span :class="getRoleBadgeClass(user.role)">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              
              <td class="user-status">
                <span :class="user.is_active ? 'status-badge active' : 'status-badge inactive'">
                  <i :class="user.is_active ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                  {{ user.is_active ? 'Активен' : 'Неактивен' }}
                </span>
              </td>
              
              <td class="user-shift">
                <span :class="user.shift_active ? 'status-badge shift-on' : 'status-badge shift-off'">
                  <i :class="user.shift_active ? 'bi bi-clock-fill' : 'bi bi-clock'"></i>
                  {{ user.shift_active ? 'На смене' : 'Не на смене' }}
                </span>
              </td>
              
              <td class="user-created">
                {{ formatDate(user.created_at) }}
              </td>
              
              <td class="user-actions">
                <div class="actions-menu">
                  <button 
                    @click="editUser(user)"
                    class="action-btn edit"
                    title="Редактировать"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  
                  <button 
                    @click="changePassword(user)"
                    class="action-btn password"
                    title="Сменить пароль"
                  >
                    <i class="bi bi-key"></i>
                  </button>
                  
                  <button 
                    @click="toggleUserStatus(user)"
                    :class="user.is_active ? 'action-btn disable' : 'action-btn enable'"
                    :title="user.is_active ? 'Деактивировать' : 'Активировать'"
                  >
                    <i :class="user.is_active ? 'bi bi-person-x' : 'bi bi-person-check'"></i>
                  </button>
                  
                  <button 
                    @click="deleteUser(user)"
                    class="action-btn delete"
                    title="Удалить"
                    :disabled="user.id === currentUser?.id"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модальное окно создания пользователя -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="bi bi-person-plus"></i>
            Добавить пользователя
          </h3>
          <button @click="closeCreateModal" class="modal-close">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <!-- Блок для отображения ошибок валидации -->
        <div v-if="validationErrors" class="validation-errors">
          <pre>{{ validationErrors }}</pre>
        </div>
        
        <form @submit.prevent="createUser" class="user-form">
          <div class="form-group">
            <label class="form-label">Полное имя</label>
            <input 
              v-model="newUser.full_name" 
              type="text" 
              class="form-control"
              required
              placeholder="Иван Иванов"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Логин</label>
            <input 
              v-model="newUser.username" 
              type="text" 
              class="form-control"
              required
              placeholder="ivan_ivanov"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Пароль</label>
            <input 
              v-model="newUser.password" 
              type="password" 
              class="form-control"
              required
              placeholder="••••••••"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Роль</label>
            <select v-model="newUser.role" class="form-control" required>
              <option value="">Выберите роль</option>
              <option value="admin">Администратор</option>
              <option value="waiter">Официант</option>
              <option value="kitchen">Кухня</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input 
              v-model="newUser.phone" 
              type="tel" 
              class="form-control"
              placeholder="+7 (999) 123-45-67"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Паспорт</label>
            <input 
              v-model="newUser.passport" 
              type="text" 
              class="form-control"
              placeholder="1234 567890"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">PIN-код</label>
            <input 
              v-model="newUser.pin_code" 
              type="text" 
              class="form-control"
              placeholder="1234"
              maxlength="4"
            >
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="newUser.is_active" type="checkbox">
              <span class="checkbox-mark"></span>
              Активен
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeCreateModal" class="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creatingUser">
              <i class="bi bi-plus-circle"></i>
              {{ creatingUser ? 'Создание...' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно редактирования пользователя -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="bi bi-pencil"></i>
            Редактировать пользователя
          </h3>
          <button @click="closeEditModal" class="modal-close">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <!-- Блок для отображения ошибок валидации -->
        <div v-if="editValidationErrors" class="validation-errors">
          <pre>{{ editValidationErrors }}</pre>
        </div>
        
        <form @submit.prevent="updateUser" class="user-form">
          <div class="form-group">
            <label class="form-label">Полное имя</label>
            <input 
              v-model="editingUser.full_name" 
              type="text" 
              class="form-control"
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Логин</label>
            <input 
              v-model="editingUser.username" 
              type="text" 
              class="form-control"
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Роль</label>
            <select v-model="editingUser.role" class="form-control" required>
              <option value="admin">Администратор</option>
              <option value="waiter">Официант</option>
              <option value="kitchen">Кухня</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input 
              v-model="editingUser.phone" 
              type="tel" 
              class="form-control"
              placeholder="+7 (999) 123-45-67"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Паспорт</label>
            <input 
              v-model="editingUser.passport" 
              type="text" 
              class="form-control"
              placeholder="1234 567890"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">PIN-код</label>
            <input 
              v-model="editingUser.pin_code" 
              type="text" 
              class="form-control"
              placeholder="1234"
              maxlength="4"
            >
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="editingUser.is_active" type="checkbox">
              <span class="checkbox-mark"></span>
              Активен
            </label>
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="editingUser.shift_active" type="checkbox">
              <span class="checkbox-mark"></span>
              На смене
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeEditModal" class="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="updatingUser">
              <i class="bi bi-check-circle"></i>
              {{ updatingUser ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно смены пароля -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="bi bi-key"></i>
            Смена пароля
          </h3>
          <button @click="closePasswordModal" class="modal-close">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <form @submit.prevent="updatePassword" class="user-form">
          <div class="form-group">
            <label class="form-label">Новый пароль</label>
            <input 
              v-model="passwordData.new_password" 
              type="password" 
              class="form-control"
              required
              placeholder="••••••••"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Подтвердите пароль</label>
            <input 
              v-model="passwordData.confirm_password" 
              type="password" 
              class="form-control"
              required
              placeholder="••••••••"
            >
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closePasswordModal" class="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="changingPassword">
              <i class="bi bi-key"></i>
              {{ changingPassword ? 'Изменение...' : 'Изменить пароль' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService, type User, type CreateUserData, type UpdateUserData, type ChangePasswordData, type UsersResponse } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// Состояние компонента
const users = ref<User[]>([])
const loading = ref(false)
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showPasswordModal = ref(false)

// Создание пользователя
const newUser = ref<CreateUserData>({
  username: '',
  password: '',
  full_name: '',
  role: 'waiter',
  is_active: true,
  phone: '',
  passport: '',
  pin_code: ''
})
const creatingUser = ref(false)
const validationErrors = ref<string>('')

// Редактирование пользователя
const editingUser = ref<UpdateUserData>({})
const editingUserId = ref<number | null>(null)
const updatingUser = ref(false)
const editValidationErrors = ref<string>('')

// Смена пароля
const passwordData = ref<ChangePasswordData>({
  new_password: '',
  confirm_password: ''
})
const passwordUserId = ref<number | null>(null)
const changingPassword = ref(false)

// Вычисляемые свойства
const currentUser = computed(() => authStore.user)

const activeUsersCount = computed(() => 
  Array.isArray(users.value) ? users.value.filter(user => user.is_active).length : 0
)

const onShiftUsersCount = computed(() => 
  Array.isArray(users.value) ? users.value.filter(user => user.shift_active).length : 0
)

const filteredUsers = computed(() => {
  if (!Array.isArray(users.value)) {
    return []
  }
  
  let filtered = users.value

  // Поиск по имени и логину
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.full_name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    )
  }

  // Фильтр по роли
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  // Фильтр по статусу
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(user => user.is_active)
  } else if (statusFilter.value === 'inactive') {
    filtered = filtered.filter(user => !user.is_active)
  }

  return filtered
})

// Утилиты
const getUserIcon = (role: string) => {
  switch (role) {
    case 'admin': return 'bi bi-shield-fill-check'
    case 'waiter': return 'bi bi-person-badge'
    case 'kitchen': return 'bi bi-cup-hot'
    default: return 'bi bi-person'
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Администратор'
    case 'waiter': return 'Официант'
    case 'kitchen': return 'Кухня'
    default: return role
  }
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin': return 'role-badge admin'
    case 'waiter': return 'role-badge waiter'
    case 'kitchen': return 'role-badge kitchen'
    default: return 'role-badge'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Методы
const loadUsers = async () => {
  try {
    loading.value = true
    const result: UsersResponse = await apiService.getUsers()
    
    // API возвращает объект с полем users
    if (result && Array.isArray(result.users)) {
      users.value = result.users
    } else {
      console.error('API returned unexpected data format:', result)
      users.value = []
    }
  } catch (error) {
    console.error('Failed to load users:', error)
    users.value = []
    // Здесь можно добавить уведомление об ошибке
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
}

// Создание пользователя
const closeCreateModal = () => {
  showCreateModal.value = false
  validationErrors.value = '' // Очищаем ошибки валидации
  newUser.value = {
    username: '',
    password: '',
    full_name: '',
    role: 'waiter',
    is_active: true,
    phone: '',
    passport: '',
    pin_code: ''
  }
}

const createUser = async () => {
  try {
    creatingUser.value = true
    validationErrors.value = '' // Очищаем предыдущие ошибки
    
    const user = await apiService.createUser(newUser.value)
    
    if (Array.isArray(users.value)) {
      users.value.push(user)
    } else {
      users.value = [user]
    }
    
    closeCreateModal()
  } catch (error) {
    console.error('Failed to create user:', error)
    
    if (error instanceof Error) {
      validationErrors.value = error.message
    } else {
      validationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    creatingUser.value = false
  }
}

// Редактирование пользователя
const editUser = (user: User) => {
  editingUserId.value = user.id
  editingUser.value = {
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    is_active: user.is_active,
    shift_active: user.shift_active,
    phone: user.phone || '',
    passport: user.passport || '',
    pin_code: user.pin_code || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editValidationErrors.value = '' // Очищаем ошибки валидации
  editingUser.value = {}
  editingUserId.value = null
}

const updateUser = async () => {
  if (!editingUserId.value || !Array.isArray(users.value)) return
  
  try {
    updatingUser.value = true
    editValidationErrors.value = '' // Очищаем предыдущие ошибки
    
    const updatedUser = await apiService.updateUser(editingUserId.value, editingUser.value)
    const index = users.value.findIndex(u => u.id === editingUserId.value)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    closeEditModal()
  } catch (error) {
    console.error('Failed to update user:', error)
    
    if (error instanceof Error) {
      editValidationErrors.value = error.message
    } else {
      editValidationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    updatingUser.value = false
  }
}

// Смена пароля
const changePassword = (user: User) => {
  passwordUserId.value = user.id
  passwordData.value = {
    new_password: '',
    confirm_password: ''
  }
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordData.value = {
    new_password: '',
    confirm_password: ''
  }
  passwordUserId.value = null
}

const updatePassword = async () => {
  if (!passwordUserId.value) return
  
  if (passwordData.value.new_password !== passwordData.value.confirm_password) {
    alert('Пароли не совпадают')
    return
  }
  
  try {
    changingPassword.value = true
    await apiService.changeUserPassword(passwordUserId.value, passwordData.value)
    closePasswordModal()
  } catch (error) {
    console.error('Failed to change password:', error)
    // Здесь можно добавить уведомление об ошибке
  } finally {
    changingPassword.value = false
  }
}

// Изменение статуса пользователя
const toggleUserStatus = async (user: User) => {
  if (!Array.isArray(users.value)) return
  
  try {
    const updatedUser = await apiService.updateUser(user.id, {
      is_active: !user.is_active
    })
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
  } catch (error) {
    console.error('Failed to toggle user status:', error)
    // Здесь можно добавить уведомление об ошибке
  }
}

// Удаление пользователя
const deleteUser = async (user: User) => {
  if (!Array.isArray(users.value)) return
  
  if (user.id === currentUser.value?.id) {
    alert('Нельзя удалить самого себя')
    return
  }
  
  if (!confirm(`Вы уверены, что хотите удалить пользователя "${user.full_name}"?`)) {
    return
  }
  
  try {
    await apiService.deleteUser(user.id)
    users.value = users.value.filter(u => u.id !== user.id)
  } catch (error) {
    console.error('Failed to delete user:', error)
    // Здесь можно добавить уведомление об ошибке
  }
}

// Инициализация
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await loadUsers()
})
</script>

<style scoped lang="scss">
@use '@/styles/views/users-management';
</style>
