<template>
  <div class="tables-page">
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
              <li class="breadcrumb-item active text-muted" aria-current="page">Управление столиками</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-table me-2 text-primary"></i>
                Управление столиками
              </h1>
              <p class="text-muted mb-0">
                Всего столиков: <span class="badge bg-primary">{{ Array.isArray(tables) ? tables.length : 0 }}</span>
                • Активных: <span class="badge bg-success">{{ activeTablesCount }}</span>
                • Неактивных: <span class="badge bg-warning">{{ inactiveTablesCount }}</span>
                • Занятых: <span class="badge bg-danger">{{ occupiedTablesCount }}</span>
              </p>
            </div>
            <div class="col-md-4 text-end">
              <button 
                @click="showCreateModal = true" 
                class="btn btn-primary fs-5"
                :disabled="loading"
              >
                <i class="bi bi-plus-circle me-1"></i>
                Добавить столик
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Основное содержимое -->
    <div class="container-fluid">
      <div class="row">
        <!-- Список столиков -->
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <h5 class="mb-0">
                    <i class="bi bi-table me-2"></i>
                    Список столиков
                  </h5>
                </div>
                <div class="col-md-6">
                  <div class="d-flex gap-2">
                    <select v-model="statusFilter" class="form-select form-select-sm">
                      <option value="">Все статусы</option>
                      <option value="available">Доступные</option>
                      <option value="occupied">Занятые</option>
                      <option value="inactive">Неактивные</option>
                    </select>
                    <select v-model="locationFilter" class="form-select form-select-sm">
                      <option value="">Все локации</option>
                      <option v-for="location in locations" :key="location.id" :value="location.id.toString()">
                        {{ location.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card-body">
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="text-muted mt-2">Загрузка столиков...</p>
              </div>
              
              <div v-else-if="!Array.isArray(tables) || tables.length === 0" class="text-center py-5">
                <i class="bi bi-table text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">Столики не найдены</p>
                <button @click="showCreateModal = true" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-1"></i>
                  Добавить первый столик
                </button>
              </div>
              
              <div v-else class="row">
                <div v-for="table in filteredTables" :key="table.id" class="col-lg-4 col-md-6 mb-4">
                  <div class="card h-100 border-0 shadow-sm table-card" :class="getTableCardClass(table)">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <div class="d-flex align-items-center">
                        <i class="bi bi-table me-2"></i>
                        <strong>Столик {{ table.number }}</strong>
                      </div>
                      <div class="d-flex gap-1">
                        <span class="badge" :class="getStatusBadgeClass(getTableStatus(table))">
                          {{ getStatusText(getTableStatus(table)) }}
                        </span>
                        <div class="dropdown">
                          <button 
                            class="btn btn-sm btn-outline-secondary" 
                            type="button" 
                            data-bs-toggle="dropdown"
                          >
                            <i class="bi bi-three-dots"></i>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                              <a class="dropdown-item" href="#" @click="editTable(table)">
                                <i class="bi bi-pencil me-2"></i>
                                Редактировать
                              </a>
                            </li>
                            <li>
                              <a class="dropdown-item" href="#" @click="generateQRCode(table)">
                                <i class="bi bi-qr-code me-2"></i>
                                QR-код
                              </a>
                            </li>
                            <li>
                              <a class="dropdown-item" href="#" @click="toggleTableStatus(table)">
                                <i class="bi bi-toggle-on me-2"></i>
                                {{ table.is_active ? 'Деактивировать' : 'Активировать' }}
                              </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                              <a class="dropdown-item text-danger" href="#" @click="deleteTable(table)">
                                <i class="bi bi-trash me-2"></i>
                                Удалить
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-6">
                          <div class="info-item">
                            <i class="bi bi-people-fill text-primary"></i>
                            <div>
                              <small class="text-muted">Мест</small>
                              <div class="fw-bold">{{ table.seats }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="info-item">
                            <i class="bi bi-geo-alt-fill text-success"></i>
                            <div>
                              <small class="text-muted">Локация</small>
                              <div class="fw-bold">{{ getLocationText(table.location_id) }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="info-item">
                            <i class="bi bi-info-circle text-info"></i>
                            <div>
                              <small class="text-muted">Описание</small>
                              <div class="text-truncate">{{ table.description || 'Нет описания' }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="info-item">
                            <i class="bi bi-clock text-warning"></i>
                            <div>
                              <small class="text-muted">Обновлено</small>
                              <div class="small">{{ formatDate(table.updated_at) }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания столика -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeCreateModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Добавить столик
            </h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="validationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ validationErrors }}</pre>
            </div>
            
            <form @submit.prevent="createTable">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Номер столика</label>
                  <input 
                    v-model.number="newTable.number" 
                    type="number" 
                    class="form-control"
                    min="1"
                    required
                    placeholder="1"
                  >
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Количество мест</label>
                  <input 
                    v-model.number="newTable.seats" 
                    type="number" 
                    class="form-control"
                    min="1"
                    max="20"
                    required
                    placeholder="4"
                  >
                </div>
                
                <div class="col-md-12">
                  <label class="form-label">Локация</label>
                  <select v-model.number="newTable.location_id" class="form-select" required>
                    <option value="0">Выберите локацию</option>
                    <option v-for="location in locations" :key="location.id" :value="location.id">
                      {{ location.name }}
                    </option>
                  </select>
                </div>
                
                <div class="col-12">
                  <label class="form-label">Описание</label>
                  <textarea 
                    v-model="newTable.description" 
                    class="form-control"
                    rows="3"
                    placeholder="Дополнительная информация о столике"
                  ></textarea>
                </div>
                
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="newTable.is_active" class="form-check-input" type="checkbox" id="createActive">
                    <label class="form-check-label" for="createActive">
                      Активен
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" @click="closeCreateModal" class="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="creatingTable">
                  <i class="bi bi-plus-circle me-1"></i>
                  {{ creatingTable ? 'Создание...' : 'Создать' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования столика -->
    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeEditModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Редактировать столик
            </h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="editValidationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ editValidationErrors }}</pre>
            </div>
            
            <form @submit.prevent="updateTable">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Номер столика</label>
                  <input 
                    v-model.number="editingTable.number" 
                    type="number" 
                    class="form-control"
                    min="1"
                    required
                  >
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Количество мест</label>
                  <input 
                    v-model.number="editingTable.seats" 
                    type="number" 
                    class="form-control"
                    min="1"
                    max="20"
                    required
                  >
                </div>
                
                <div class="col-md-12">
                  <label class="form-label">Локация</label>
                  <select v-model.number="editingTable.location_id" class="form-select" required>
                    <option v-for="location in locations" :key="location.id" :value="location.id">
                      {{ location.name }}
                    </option>
                  </select>
                </div>
                
                <div class="col-12">
                  <label class="form-label">Описание</label>
                  <textarea 
                    v-model="editingTable.description" 
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
                
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="editingTable.is_active" class="form-check-input" type="checkbox" id="editActive">
                    <label class="form-check-label" for="editActive">
                      Активен
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" @click="closeEditModal" class="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="updatingTable">
                  <i class="bi bi-check-circle me-1"></i>
                  {{ updatingTable ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно QR-кода -->
    <div v-if="showQRModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeQRModal">
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-qr-code me-2"></i>
              QR-код для столика {{ selectedTable?.number }}
            </h5>
            <button type="button" class="btn-close" @click="closeQRModal"></button>
          </div>
          
          <div class="modal-body text-center">
            <div class="qr-code-container mb-3">
              <div class="qr-placeholder">
                <i class="bi bi-qr-code" style="font-size: 8rem; color: #007bff;"></i>
              </div>
            </div>
            <p class="text-muted mb-3">
              Отсканируйте QR-код для доступа к меню столика
            </p>
            <div class="d-flex gap-2 justify-content-center">
              <button class="btn btn-primary" @click="downloadQR">
                <i class="bi bi-download me-1"></i>
                Скачать
              </button>
              <button class="btn btn-outline-primary" @click="printQR">
                <i class="bi bi-printer me-1"></i>
                Печать
              </button>
            </div>
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
import { apiService } from '@/services/api' // Используем реальный API

const router = useRouter()
const authStore = useAuthStore()

// Типы данных
interface Table {
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

interface CreateTableData {
  number: number
  seats: number
  location_id: number
  description?: string
  is_active: boolean
}

interface UpdateTableData {
  number?: number
  seats?: number
  location_id?: number
  description?: string
  is_active?: boolean
}

interface Location {
  id: number
  name: string
  description: string | null
  color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Состояние компонента
const tables = ref<Table[]>([])
const locations = ref<Location[]>([])
const loading = ref(false)
const loadingLocations = ref(false)

// Фильтры
const statusFilter = ref('')
const locationFilter = ref('')

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showQRModal = ref(false)

// Создание столика
const newTable = ref<CreateTableData>({
  number: 1,
  seats: 4,
  location_id: 0,
  description: '',
  is_active: true
})
const creatingTable = ref(false)
const validationErrors = ref<string>('')

// Редактирование столика
const editingTable = ref<UpdateTableData>({})
const editingTableId = ref<number | null>(null)
const updatingTable = ref(false)
const editValidationErrors = ref<string>('')

// QR-код
const selectedTable = ref<Table | null>(null)

// Вычисляемые свойства
const activeTablesCount = computed(() => 
  Array.isArray(tables.value) ? tables.value.filter(table => table.is_active && !table.is_occupied).length : 0
)

const inactiveTablesCount = computed(() => 
  Array.isArray(tables.value) ? tables.value.filter(table => !table.is_active).length : 0
)

const occupiedTablesCount = computed(() => 
  Array.isArray(tables.value) ? tables.value.filter(table => table.is_occupied).length : 0
)

const filteredTables = computed(() => {
  if (!Array.isArray(tables.value)) return []
  
  return tables.value.filter(table => {
    const matchesStatus = !statusFilter.value || getTableStatus(table) === statusFilter.value
    const matchesLocation = !locationFilter.value || table.location_id.toString() === locationFilter.value
    return matchesStatus && matchesLocation
  })
})

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

const getTableStatus = (table: Table) => {
  if (!table.is_active) return 'inactive'
  if (table.is_occupied) return 'occupied'
  return 'available'
}

const getStatusText = (status: string) => {
  const statusMap = {
    'available': 'Доступен',
    'occupied': 'Занят',
    'inactive': 'Неактивен'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getLocationText = (locationId: number) => {
  const location = locations.value.find(loc => loc.id === locationId)
  return location ? location.name : `Локация ${locationId}`
}

const getStatusBadgeClass = (status: string) => {
  const classMap = {
    'available': 'bg-success',
    'occupied': 'bg-danger',
    'inactive': 'bg-secondary'
  }
  return classMap[status as keyof typeof classMap] || 'bg-secondary'
}

const getTableCardClass = (table: Table) => {
  const status = getTableStatus(table)
  if (!table.is_active) return 'table-inactive'
  
  const classMap = {
    'available': 'table-available',
    'occupied': 'table-occupied'
  }
  return classMap[status as keyof typeof classMap] || ''
}

// Методы
const loadLocations = async () => {
  try {
    loadingLocations.value = true
    const result = await apiService.getLocations()
    locations.value = result.locations || result
  } catch (error) {
    console.error('Failed to load locations:', error)
    locations.value = []
  } finally {
    loadingLocations.value = false
  }
}

const loadTables = async () => {
  try {
    loading.value = true
    const result = await apiService.getTables()
    tables.value = result.tables || result
  } catch (error) {
    console.error('Failed to load tables:', error)
    tables.value = []
  } finally {
    loading.value = false
  }
}

// Создание столика
const closeCreateModal = () => {
  showCreateModal.value = false
  validationErrors.value = ''
  newTable.value = {
    number: 1,
    seats: 4,
    location_id: 0,
    description: '',
    is_active: true
  }
}

const createTable = async () => {
  try {
    creatingTable.value = true
    validationErrors.value = ''
    
    const table = await apiService.createTable(newTable.value)
    
    if (Array.isArray(tables.value)) {
      tables.value.push(table)
    } else {
      tables.value = [table]
    }
    
    closeCreateModal()
  } catch (error) {
    console.error('Failed to create table:', error)
    
    if (error instanceof Error) {
      validationErrors.value = error.message
    } else {
      validationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    creatingTable.value = false
  }
}

// Редактирование столика
const editTable = (table: Table) => {
  editingTableId.value = table.id
  editingTable.value = {
    number: table.number,
    seats: table.seats,
    location_id: table.location_id,
    description: table.description || '',
    is_active: table.is_active
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editValidationErrors.value = ''
  editingTable.value = {}
  editingTableId.value = null
}

const updateTable = async () => {
  if (!editingTableId.value || !Array.isArray(tables.value)) return
  
  try {
    updatingTable.value = true
    editValidationErrors.value = ''
    
    const updatedTable = await apiService.updateTable(editingTableId.value, editingTable.value)
    
    const index = tables.value.findIndex(t => t.id === editingTableId.value)
    if (index !== -1) {
      tables.value[index] = updatedTable
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Failed to update table:', error)
    
    if (error instanceof Error) {
      editValidationErrors.value = error.message
    } else {
      editValidationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    updatingTable.value = false
  }
}

// QR-код
const generateQRCode = (table: Table) => {
  selectedTable.value = table
  showQRModal.value = true
}

const closeQRModal = () => {
  showQRModal.value = false
  selectedTable.value = null
}

const downloadQR = async () => {
  if (!selectedTable.value) return
  
  try {
    const qrUrl = await apiService.generateTableQR(selectedTable.value.id)
    // Здесь должна быть логика скачивания QR-кода
    console.log('QR URL:', qrUrl)
  } catch (error) {
    console.error('Failed to download QR code:', error)
  }
}

const printQR = () => {
  if (!selectedTable.value) return
  // Здесь должна быть логика печати QR-кода
  console.log('Printing QR code for table:', selectedTable.value.number)
}

// Дополнительные действия
const toggleTableStatus = async (table: Table) => {
  if (!Array.isArray(tables.value)) return
  
  try {
    const newStatus = !table.is_active
    const updatedTable = await apiService.updateTable(table.id, { is_active: newStatus })
    
    const index = tables.value.findIndex(t => t.id === table.id)
    if (index !== -1) {
      tables.value[index] = updatedTable
    }
  } catch (error) {
    console.error('Failed to toggle table status:', error)
  }
}

const deleteTable = async (table: Table) => {
  if (!Array.isArray(tables.value)) return
  
  if (!confirm(`Вы уверены, что хотите удалить столик ${table.number}?`)) return
  
  try {
    await apiService.deleteTable(table.id)
    tables.value = tables.value.filter(t => t.id !== table.id)
  } catch (error) {
    console.error('Failed to delete table:', error)
  }
}

// Инициализация
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await Promise.all([loadLocations(), loadTables()])
})
</script>

<style scoped lang="scss">
@use '@/styles/views/tables-management';
</style>
