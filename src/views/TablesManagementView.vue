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
                <div class="col-md-4">
                  <h5 class="mb-0">
                    <i class="bi bi-table me-2"></i>
                    Список столиков
                  </h5>
                </div>
                <div class="col-md-8">
                  <div class="d-flex gap-2 align-items-center">
                    <!-- Массовые действия -->
                    <div v-if="selectedTables.length > 0" class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-primary"
                        @click="bulkActivate"
                        :title="`Активировать ${selectedTables.length} столиков`"
                      >
                        <i class="bi bi-check-circle me-1"></i>
                        Активировать ({{ selectedTables.length }})
                      </button>
                      <button 
                        class="btn btn-outline-secondary"
                        @click="bulkDeactivate"
                        :title="`Деактивировать ${selectedTables.length} столиков`"
                      >
                        <i class="bi bi-x-circle me-1"></i>
                        Деактивировать ({{ selectedTables.length }})
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="bulkDelete"
                        :title="`Удалить ${selectedTables.length} столиков`"
                      >
                        <i class="bi bi-trash me-1"></i>
                        Удалить ({{ selectedTables.length }})
                      </button>
                    </div>
                    
                    <!-- Фильтры -->
                    <div class="d-flex gap-2 ms-auto">
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
                <div v-for="table in filteredTables" :key="table.id" class="col-lg-3 col-md-4 col-sm-6 mb-3">
                  <div class="card border-0 shadow-sm table-card" :class="getTableCardClass(table)">
                    <!-- Компактный заголовок -->
                    <div class="card-header d-flex justify-content-between align-items-center py-2">
                      <div class="d-flex align-items-center">
                        <div class="form-check me-2">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            :id="`table-${table.id}`"
                            v-model="selectedTables"
                            :value="table.id"
                          >
                        </div>
                        <i class="bi bi-table me-2"></i>
                        <strong class="fs-6">Столик {{ table.number }}</strong>
                      </div>
                      <span class="badge badge-sm" :class="getStatusBadgeClass(getTableStatus(table))">
                        {{ getStatusText(getTableStatus(table)) }}
                      </span>
                    </div>
                    
                    <!-- Компактная информация -->
                    <div class="card-body py-2">
                      <div class="row g-2 mb-2">
                        <div class="col-6">
                          <div class="info-item-compact">
                            <i class="bi bi-people-fill text-primary me-1"></i>
                            <span class="fw-bold">{{ table.seats }}</span>
                            <small class="text-muted ms-1">мест</small>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="info-item-compact">
                            <i class="bi bi-geo-alt-fill text-success me-1"></i>
                            <small class="text-truncate">{{ getLocationText(table.location_id) }}</small>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="table.current_order_id" class="row g-2 mb-2">
                        <div class="col-12">
                          <div class="current-order-compact">
                            <i class="bi bi-receipt me-1"></i>
                            <small class="fw-bold">Заказ #{{ table.current_order_id }}</small>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="table.description" class="row g-2 mb-2">
                        <div class="col-12">
                          <small class="text-muted text-truncate d-block">{{ table.description }}</small>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Кнопки действий -->
                    <div class="card-footer bg-transparent border-top-0 py-2">
                      <div class="d-flex gap-1 flex-wrap">
                        <!-- Основные действия -->
                        <button 
                          class="btn btn-sm btn-outline-primary flex-fill"
                          @click="viewTableQR(table)"
                          :title="'QR-код столика ' + table.number"
                        >
                          <i class="bi bi-qr-code"></i>
                        </button>
                        
                        <button 
                          class="btn btn-sm btn-outline-secondary flex-fill"
                          @click="editTable(table)"
                          :title="'Редактировать столик ' + table.number"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        
                        <button 
                          class="btn btn-sm flex-fill"
                          :class="table.is_occupied ? 'btn-outline-success' : 'btn-outline-warning'"
                          @click="toggleTableOccupancy(table)"
                          :title="table.is_occupied ? 'Освободить столик' : 'Занять столик'"
                        >
                          <i class="bi" :class="table.is_occupied ? 'bi-person-dash' : 'bi-person-plus'"></i>
                        </button>
                        
                        <div class="dropdown">
                          <button 
                            class="btn btn-sm btn-outline-secondary dropdown-toggle-split" 
                            type="button" 
                            data-bs-toggle="dropdown"
                            :title="'Дополнительные действия'"
                          >
                            <i class="bi bi-three-dots"></i>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                              <a class="dropdown-item" href="#" @click="checkSyncStatus(table)">
                                <i class="bi bi-arrow-clockwise me-2"></i>
                                Статус синхронизации
                              </a>
                            </li>
                            <li>
                              <a class="dropdown-item" href="#" @click="forceSync(table)">
                                <i class="bi bi-cloud-arrow-up me-2"></i>
                                Принудительная синхронизация
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
                      
                      <!-- Время обновления -->
                      <div class="mt-2">
                        <small class="text-muted">
                          <i class="bi bi-clock me-1"></i>
                          {{ formatDate(table.updated_at) }}
                        </small>
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
            <div v-if="loadingQR" class="qr-code-container mb-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка QR-кода...</span>
              </div>
            </div>
            
            <div v-else-if="qrCodeData" class="qr-code-container mb-3">
              <img :src="qrCodeData.qr_code_url" alt="QR код" class="img-fluid" style="max-width: 300px;">
              <div class="mt-2">
                <small class="text-muted">QR-код: {{ qrCodeData.qr_code }}</small>
              </div>
            </div>
            
            <div v-else class="qr-code-container mb-3">
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Не удалось загрузить QR-код
              </div>
            </div>
            
            <p class="text-muted mb-3">
              Отсканируйте QR-код для доступа к меню столика
            </p>
            
            <div class="d-flex gap-2 justify-content-center">
              <button class="btn btn-primary" @click="downloadQR" :disabled="!qrCodeData">
                <i class="bi bi-download me-1"></i>
                Скачать
              </button>
              <button class="btn btn-outline-primary" @click="printQR" :disabled="!qrCodeData">
                <i class="bi bi-printer me-1"></i>
                Печать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно статуса синхронизации -->
    <div v-if="showSyncModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeSyncModal">
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Статус синхронизации столика {{ selectedTable?.number }}
            </h5>
            <button type="button" class="btn-close" @click="closeSyncModal"></button>
          </div>
          
          <div class="modal-body">
            <div v-if="loadingSyncStatus" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка статуса...</span>
              </div>
            </div>
            
            <div v-else-if="syncStatusData" class="text-center">
              <div class="mb-3">
                <span class="badge fs-6" :class="getSyncStatusBadgeClass(syncStatusData.sync_status)">
                  {{ getSyncStatusText(syncStatusData.sync_status) }}
                </span>
              </div>
              
              <div class="row">
                <div class="col-12">
                  <div class="info-item">
                    <i class="bi bi-clock text-info"></i>
                    <div>
                      <small class="text-muted">Последняя синхронизация</small>
                      <div class="fw-bold">{{ formatDate(syncStatusData.last_sync) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-3">
                <button class="btn btn-primary" @click="performForceSync" :disabled="forcingSyncStatus">
                  <i class="bi bi-cloud-arrow-up me-1"></i>
                  {{ forcingSyncStatus ? 'Синхронизация...' : 'Принудительная синхронизация' }}
                </button>
              </div>
            </div>
            
            <div v-else class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Не удалось загрузить статус синхронизации
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
const showSyncModal = ref(false)

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
const qrCodeData = ref<{ qr_code: string; qr_code_url: string } | null>(null)
const loadingQR = ref(false)

// Статус синхронизации
const syncStatusData = ref<{ sync_status: string; last_sync: string } | null>(null)
const loadingSyncStatus = ref(false)
const forcingSyncStatus = ref(false)

// Массовые операции
const selectedTables = ref<number[]>([])

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

const getSyncStatusText = (status: string) => {
  const statusMap = {
    'synced': 'Синхронизирован',
    'pending': 'Ожидает синхронизации',
    'failed': 'Ошибка синхронизации',
    'in_progress': 'Синхронизация в процессе'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getSyncStatusBadgeClass = (status: string) => {
  const classMap = {
    'synced': 'bg-success',
    'pending': 'bg-warning',
    'failed': 'bg-danger',
    'in_progress': 'bg-info'
  }
  return classMap[status as keyof typeof classMap] || 'bg-secondary'
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
const viewTableQR = async (table: Table) => {
  selectedTable.value = table
  showQRModal.value = true
  
  try {
    loadingQR.value = true
    qrCodeData.value = await apiService.getTableQR(table.id)
  } catch (error) {
    console.error('Failed to load QR code:', error)
    qrCodeData.value = null
  } finally {
    loadingQR.value = false
  }
}

const closeQRModal = () => {
  showQRModal.value = false
  selectedTable.value = null
  qrCodeData.value = null
}

const downloadQR = async () => {
  if (!selectedTable.value || !qrCodeData.value) return
  
  try {
    // Создаем временную ссылку для скачивания
    const link = document.createElement('a')
    link.href = qrCodeData.value.qr_code_url
    link.download = `table-${selectedTable.value.number}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Failed to download QR code:', error)
  }
}

const printQR = () => {
  if (!selectedTable.value || !qrCodeData.value) return
  
  // Создаем новое окно для печати
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>QR-код столика ${selectedTable.value.number}</title>
          <style>
            body { text-align: center; padding: 20px; font-family: Arial, sans-serif; }
            img { max-width: 300px; }
            h1 { margin-bottom: 20px; }
            p { margin-top: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Столик ${selectedTable.value.number}</h1>
          <img src="${qrCodeData.value.qr_code_url}" alt="QR код">
          <p>Отсканируйте QR-код для доступа к меню</p>
          <p>QR-код: ${qrCodeData.value.qr_code}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

// Дополнительные действия
const toggleTableOccupancy = async (table: Table) => {
  if (!Array.isArray(tables.value)) return
  
  try {
    const newOccupancy = !table.is_occupied
    const updatedTable = await apiService.updateTableStatus(table.id, newOccupancy)
    
    const index = tables.value.findIndex(t => t.id === table.id)
    if (index !== -1) {
      tables.value[index] = updatedTable
    }
  } catch (error) {
    console.error('Failed to toggle table occupancy:', error)
  }
}

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

const checkSyncStatus = async (table: Table) => {
  selectedTable.value = table
  showSyncModal.value = true
  
  try {
    loadingSyncStatus.value = true
    syncStatusData.value = await apiService.getTableSyncStatus(table.id)
  } catch (error) {
    console.error('Failed to get sync status:', error)
    syncStatusData.value = null
  } finally {
    loadingSyncStatus.value = false
  }
}

const closeSyncModal = () => {
  showSyncModal.value = false
  selectedTable.value = null
  syncStatusData.value = null
}

const performForceSync = async () => {
  if (!selectedTable.value) return
  
  try {
    forcingSyncStatus.value = true
    const result = await apiService.forceTableSync(selectedTable.value.id)
    
    // Обновляем статус синхронизации
    syncStatusData.value = {
      sync_status: result.sync_status,
      last_sync: new Date().toISOString()
    }
    
    // Показываем уведомление об успехе
    alert(result.message || 'Синхронизация выполнена успешно')
  } catch (error) {
    console.error('Failed to force sync:', error)
    alert('Ошибка при выполнении синхронизации')
  } finally {
    forcingSyncStatus.value = false
  }
}

const forceSync = async (table: Table) => {
  if (!confirm(`Вы уверены, что хотите принудительно синхронизировать столик ${table.number}?`)) return
  
  try {
    const result = await apiService.forceTableSync(table.id)
    alert(result.message || 'Синхронизация выполнена успешно')
    
    // Обновляем данные таблицы
    await loadTables()
  } catch (error) {
    console.error('Failed to force sync:', error)
    alert('Ошибка при выполнении синхронизации')
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

// Массовые операции
const bulkActivate = async () => {
  if (!selectedTables.value.length) return
  
  if (!confirm(`Вы уверены, что хотите активировать ${selectedTables.value.length} столиков?`)) return
  
  try {
    const promises = selectedTables.value.map(id => 
      apiService.updateTable(id, { is_active: true })
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadTables()
    selectedTables.value = []
  } catch (error) {
    console.error('Failed to bulk activate tables:', error)
    alert('Ошибка при активации столиков')
  }
}

const bulkDeactivate = async () => {
  if (!selectedTables.value.length) return
  
  if (!confirm(`Вы уверены, что хотите деактивировать ${selectedTables.value.length} столиков?`)) return
  
  try {
    const promises = selectedTables.value.map(id => 
      apiService.updateTable(id, { is_active: false })
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadTables()
    selectedTables.value = []
  } catch (error) {
    console.error('Failed to bulk deactivate tables:', error)
    alert('Ошибка при деактивации столиков')
  }
}

const bulkDelete = async () => {
  if (!selectedTables.value.length) return
  
  if (!confirm(`Вы уверены, что хотите удалить ${selectedTables.value.length} столиков? Это действие нельзя отменить.`)) return
  
  try {
    const promises = selectedTables.value.map(id => 
      apiService.deleteTable(id)
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadTables()
    selectedTables.value = []
  } catch (error) {
    console.error('Failed to bulk delete tables:', error)
    alert('Ошибка при удалении столиков')
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
