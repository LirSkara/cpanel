<template>
  <div class="template-page pt-2">
    <!-- Хлебные крошки и заголовок -->
    <div class="page-header">
      <nav class="breadcrumb">
        <router-link to="/dashboard" class="breadcrumb-item">
          <i class="bi bi-house"></i>
          Главная
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">Шаблонная страница</span>
      </nav>
      
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i class="bi bi-layout-text-window-reverse"></i>
            Шаблонная страница
          </h1>
          <p class="page-subtitle">
            Всего элементов: <span class="badge bg-primary">{{ Array.isArray(items) ? items.length : 0 }}</span>
            • Активных: <span class="badge bg-success">{{ activeItemsCount }}</span>
            • Неактивных: <span class="badge bg-warning">{{ inactiveItemsCount }}</span>
          </p>
        </div>
        <div class="header-right">
          <button 
            @click="showCreateModal = true" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <i class="bi bi-plus-circle"></i>
            Добавить элемент
          </button>
        </div>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="filters-section">
      <div class="filters-content">
        <div class="search-box">
          <i class="bi bi-search search-icon"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск по названию..."
            class="search-input"
          >
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="search-clear"
            type="button"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div class="filter-controls">
          <div class="filter-select">
            <select v-model="categoryFilter">
              <option value="">Все категории</option>
              <option value="category1">Категория 1</option>
              <option value="category2">Категория 2</option>
              <option value="category3">Категория 3</option>
            </select>
          </div>
          
          <div class="filter-select">
            <select v-model="statusFilter">
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
          
          <button 
            @click="resetFilters" 
            class="btn btn-outline-secondary"
            :disabled="!hasActiveFilters"
          >
            <i class="bi bi-arrow-clockwise"></i>
            Сбросить
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица элементов -->
    <div class="items-table-section">
      <div class="table-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <p>Загрузка элементов...</p>
        </div>
        
        <div v-else-if="filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="bi bi-inbox"></i>
          </div>
          <h3>Элементы не найдены</h3>
          <p>Попробуйте изменить параметры поиска или добавить новый элемент</p>
        </div>
        
        <table v-else class="items-table">
          <thead>
            <tr>
              <th>Элемент</th>
              <th>Категория</th>
              <th>Статус</th>
              <th>Создан</th>
              <th>Обновлен</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id" class="item-row">
              <td class="item-info">
                <div class="item-icon">
                  <i :class="getItemIcon(item.category)"></i>
                </div>
                <div class="item-details">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-description">{{ item.description }}</div>
                </div>
              </td>
              
              <td class="item-category">
                <span :class="getCategoryBadgeClass(item.category)">
                  {{ getCategoryLabel(item.category) }}
                </span>
              </td>
              
              <td class="item-status">
                <span :class="item.is_active ? 'status-badge active' : 'status-badge inactive'">
                  <i :class="item.is_active ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
                  {{ item.is_active ? 'Активен' : 'Неактивен' }}
                </span>
              </td>
              
              <td class="item-created">
                {{ formatDate(item.created_at) }}
              </td>
              
              <td class="item-updated">
                {{ formatDate(item.updated_at) }}
              </td>
              
              <td class="item-actions">
                <div class="actions-menu">
                  <button 
                    @click="editItem(item)"
                    class="action-btn edit"
                    title="Редактировать"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  
                  <button 
                    @click="toggleItemStatus(item)"
                    :class="item.is_active ? 'action-btn disable' : 'action-btn enable'"
                    :title="item.is_active ? 'Деактивировать' : 'Активировать'"
                  >
                    <i :class="item.is_active ? 'bi bi-toggle-on' : 'bi bi-toggle-off'"></i>
                  </button>
                  
                  <button 
                    @click="deleteItem(item)"
                    class="action-btn delete"
                    title="Удалить"
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

    <!-- Модальное окно создания элемента -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="bi bi-plus-circle"></i>
            Добавить элемент
          </h3>
          <button @click="closeCreateModal" class="modal-close">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <!-- Блок для отображения ошибок валидации -->
        <div v-if="validationErrors" class="validation-errors">
          <pre>{{ validationErrors }}</pre>
        </div>
        
        <form @submit.prevent="createItem" class="item-form">
          <div class="form-group">
            <label class="form-label">Название</label>
            <input 
              v-model="newItem.name" 
              type="text" 
              class="form-control"
              required
              placeholder="Введите название"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea 
              v-model="newItem.description" 
              class="form-control"
              rows="3"
              placeholder="Введите описание"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Категория</label>
            <select v-model="newItem.category" class="form-control" required>
              <option value="">Выберите категорию</option>
              <option value="category1">Категория 1</option>
              <option value="category2">Категория 2</option>
              <option value="category3">Категория 3</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="newItem.is_active" type="checkbox">
              <span class="checkbox-mark"></span>
              Активен
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeCreateModal" class="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creatingItem">
              <i class="bi bi-plus-circle"></i>
              {{ creatingItem ? 'Создание...' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно редактирования элемента -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="bi bi-pencil"></i>
            Редактировать элемент
          </h3>
          <button @click="closeEditModal" class="modal-close">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <!-- Блок для отображения ошибок валидации -->
        <div v-if="editValidationErrors" class="validation-errors">
          <pre>{{ editValidationErrors }}</pre>
        </div>
        
        <form @submit.prevent="updateItem" class="item-form">
          <div class="form-group">
            <label class="form-label">Название</label>
            <input 
              v-model="editingItem.name" 
              type="text" 
              class="form-control"
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea 
              v-model="editingItem.description" 
              class="form-control"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Категория</label>
            <select v-model="editingItem.category" class="form-control" required>
              <option value="category1">Категория 1</option>
              <option value="category2">Категория 2</option>
              <option value="category3">Категория 3</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="editingItem.is_active" type="checkbox">
              <span class="checkbox-mark"></span>
              Активен
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeEditModal" class="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="updatingItem">
              <i class="bi bi-check-circle"></i>
              {{ updatingItem ? 'Сохранение...' : 'Сохранить' }}
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
// import { apiService } from '@/services/api' // Раскомментируйте при интеграции с API

const router = useRouter()
const authStore = useAuthStore()

// Типы данных (замените на реальные типы вашего API)
interface Item {
  id: number
  name: string
  description: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CreateItemData {
  name: string
  description: string
  category: string
  is_active: boolean
}

interface UpdateItemData {
  name?: string
  description?: string
  category?: string
  is_active?: boolean
}

// Состояние компонента
const items = ref<Item[]>([])
const loading = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)

// Создание элемента
const newItem = ref<CreateItemData>({
  name: '',
  description: '',
  category: '',
  is_active: true
})
const creatingItem = ref(false)
const validationErrors = ref<string>('')

// Редактирование элемента
const editingItem = ref<UpdateItemData>({})
const editingItemId = ref<number | null>(null)
const updatingItem = ref(false)
const editValidationErrors = ref<string>('')

// Вычисляемые свойства
const activeItemsCount = computed(() => 
  Array.isArray(items.value) ? items.value.filter(item => item.is_active).length : 0
)

const inactiveItemsCount = computed(() => 
  Array.isArray(items.value) ? items.value.filter(item => !item.is_active).length : 0
)

const filteredItems = computed(() => {
  if (!Array.isArray(items.value)) {
    return []
  }
  
  let filtered = items.value

  // Поиск по названию
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }

  // Фильтр по категории
  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.category === categoryFilter.value)
  }

  // Фильтр по статусу
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(item => item.is_active)
  } else if (statusFilter.value === 'inactive') {
    filtered = filtered.filter(item => !item.is_active)
  }

  return filtered
})

// Проверка активных фильтров
const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || categoryFilter.value || statusFilter.value)
})

// Утилиты
const getItemIcon = (category: string) => {
  switch (category) {
    case 'category1': return 'bi bi-folder-fill'
    case 'category2': return 'bi bi-file-earmark-fill'
    case 'category3': return 'bi bi-gear-fill'
    default: return 'bi bi-circle-fill'
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'category1': return 'Категория 1'
    case 'category2': return 'Категория 2'
    case 'category3': return 'Категория 3'
    default: return category
  }
}

const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case 'category1': return 'category-badge category1'
    case 'category2': return 'category-badge category2'
    case 'category3': return 'category-badge category3'
    default: return 'category-badge'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Методы
const loadItems = async () => {
  try {
    loading.value = true
    // Здесь должен быть вызов API
    // const result = await apiService.getItems()
    // items.value = result.items || result

    // Пример данных для демонстрации
    items.value = [
      {
        id: 1,
        name: 'Элемент 1',
        description: 'Описание элемента 1',
        category: 'category1',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Элемент 2',
        description: 'Описание элемента 2',
        category: 'category2',
        is_active: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z'
      }
    ]
  } catch (error) {
    console.error('Failed to load items:', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
}

// Методы для поиска
const clearSearch = () => {
  searchQuery.value = ''
}

// Создание элемента
const closeCreateModal = () => {
  showCreateModal.value = false
  validationErrors.value = ''
  newItem.value = {
    name: '',
    description: '',
    category: '',
    is_active: true
  }
}

const createItem = async () => {
  try {
    creatingItem.value = true
    validationErrors.value = ''
    
    // Здесь должен быть вызов API
    // const item = await apiService.createItem(newItem.value)
    
    // Пример создания элемента
    const item: Item = {
      id: Date.now(),
      name: newItem.value.name,
      description: newItem.value.description,
      category: newItem.value.category,
      is_active: newItem.value.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    if (Array.isArray(items.value)) {
      items.value.push(item)
    } else {
      items.value = [item]
    }
    
    closeCreateModal()
  } catch (error) {
    console.error('Failed to create item:', error)
    
    if (error instanceof Error) {
      validationErrors.value = error.message
    } else {
      validationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    creatingItem.value = false
  }
}

// Редактирование элемента
const editItem = (item: Item) => {
  editingItemId.value = item.id
  editingItem.value = {
    name: item.name,
    description: item.description,
    category: item.category,
    is_active: item.is_active
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editValidationErrors.value = ''
  editingItem.value = {}
  editingItemId.value = null
}

const updateItem = async () => {
  if (!editingItemId.value || !Array.isArray(items.value)) return
  
  try {
    updatingItem.value = true
    editValidationErrors.value = ''
    
    // Здесь должен быть вызов API
    // const updatedItem = await apiService.updateItem(editingItemId.value, editingItem.value)
    
    // Пример обновления элемента
    const index = items.value.findIndex(i => i.id === editingItemId.value)
    if (index !== -1) {
      items.value[index] = {
        ...items.value[index],
        ...editingItem.value,
        updated_at: new Date().toISOString()
      }
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Failed to update item:', error)
    
    if (error instanceof Error) {
      editValidationErrors.value = error.message
    } else {
      editValidationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    updatingItem.value = false
  }
}

// Изменение статуса элемента
const toggleItemStatus = async (item: Item) => {
  if (!Array.isArray(items.value)) return
  
  try {
    // Здесь должен быть вызов API
    // const updatedItem = await apiService.updateItem(item.id, {
    //   is_active: !item.is_active
    // })
    
    // Пример изменения статуса
    const index = items.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      items.value[index] = {
        ...items.value[index],
        is_active: !item.is_active,
        updated_at: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Failed to toggle item status:', error)
  }
}

// Удаление элемента
const deleteItem = async (item: Item) => {
  if (!Array.isArray(items.value)) return
  
  if (!confirm(`Вы уверены, что хотите удалить элемент "${item.name}"?`)) {
    return
  }
  
  try {
    // Здесь должен быть вызов API
    // await apiService.deleteItem(item.id)
    
    // Пример удаления элемента
    items.value = items.value.filter(i => i.id !== item.id)
  } catch (error) {
    console.error('Failed to delete item:', error)
  }
}

// Инициализация
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await loadItems()
})
</script>

<style scoped lang="scss">
@use '@/styles/views/template-page';
</style>
