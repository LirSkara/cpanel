<template>
  <div class="template-page">
    <!-- Хлебные крошки и заголовок -->
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0 mb-4 p-3">
        <div class="card-body">
          <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item">
                <router-link to="/dashboard" class="text-decoration-none text-dark">
                  <i class="bi bi-house me-1"></i>
                  Главная
                </router-link>
              </li>
              <li class="breadcrumb-item active text-muted" aria-current="page">Шаблонная страница</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-layout-text-window-reverse me-2 text-primary"></i>
                Шаблонная страница
              </h1>
              <p class="text-muted mb-0">
                Всего элементов: <span class="badge bg-primary">{{ Array.isArray(items) ? items.length : 0 }}</span>
                • Активных: <span class="badge bg-success">{{ activeItemsCount }}</span>
                • Неактивных: <span class="badge bg-warning">{{ inactiveItemsCount }}</span>
              </p>
            </div>
            <div class="col-md-4 text-end">
              <button 
                @click="showCreateModal = true" 
                class="btn btn-primary fs-5"
                :disabled="loading"
              >
                <i class="bi bi-plus-circle me-1"></i>
                Добавить элемент
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания элемента -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeCreateModal">
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Добавить элемент
            </h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="validationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ validationErrors }}</pre>
            </div>
            
            <form @submit.prevent="createItem">
              <div class="mb-3">
                <label class="form-label">Название</label>
                <input 
                  v-model="newItem.name" 
                  type="text" 
                  class="form-control"
                  required
                  placeholder="Введите название"
                >
              </div>
              
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea 
                  v-model="newItem.description" 
                  class="form-control"
                  rows="3"
                  placeholder="Введите описание"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Категория</label>
                <select v-model="newItem.category" class="form-select" required>
                  <option value="">Выберите категорию</option>
                  <option value="category1">Категория 1</option>
                  <option value="category2">Категория 2</option>
                  <option value="category3">Категория 3</option>
                </select>
              </div>
              
              <div class="mb-3">
                <div class="form-check">
                  <input v-model="newItem.is_active" class="form-check-input" type="checkbox" id="createActive">
                  <label class="form-check-label" for="createActive">
                    Активен
                  </label>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="closeCreateModal" class="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="creatingItem">
                  <i class="bi bi-plus-circle me-1"></i>
                  {{ creatingItem ? 'Создание...' : 'Создать' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования элемента -->
    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeEditModal">
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Редактировать элемент
            </h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="editValidationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ editValidationErrors }}</pre>
            </div>
            
            <form @submit.prevent="updateItem">
              <div class="mb-3">
                <label class="form-label">Название</label>
                <input 
                  v-model="editingItem.name" 
                  type="text" 
                  class="form-control"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea 
                  v-model="editingItem.description" 
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Категория</label>
                <select v-model="editingItem.category" class="form-select" required>
                  <option value="category1">Категория 1</option>
                  <option value="category2">Категория 2</option>
                  <option value="category3">Категория 3</option>
                </select>
              </div>
              
              <div class="mb-3">
                <div class="form-check">
                  <input v-model="editingItem.is_active" class="form-check-input" type="checkbox" id="editActive">
                  <label class="form-check-label" for="editActive">
                    Активен
                  </label>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="closeEditModal" class="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="updatingItem">
                  <i class="bi bi-check-circle me-1"></i>
                  {{ updatingItem ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
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

// Утилиты
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
      },
      {
        id: 3,
        name: 'Элемент 3',
        description: 'Описание элемента 3',
        category: 'category3',
        is_active: true,
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-03T00:00:00Z'
      },
      {
        id: 4,
        name: 'Элемент 4',
        description: 'Описание элемента 4',
        category: 'category1',
        is_active: false,
        created_at: '2025-01-04T00:00:00Z',
        updated_at: '2025-01-04T00:00:00Z'
      },
      {
        id: 5,
        name: 'Элемент 5',
        description: 'Описание элемента 5',
        category: 'category2',
        is_active: true,
        created_at: '2025-01-05T00:00:00Z',
        updated_at: '2025-01-05T00:00:00Z'
      }
    ]
  } catch (error) {
    console.error('Failed to load items:', error)
    items.value = []
  } finally {
    loading.value = false
  }
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
