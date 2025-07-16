<template>
  <div class="locations-page">
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
              <li class="breadcrumb-item active text-muted" aria-current="page">Управление локациями</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-geo-alt me-2 text-primary"></i>
                Управление локациями
              </h1>
              <p class="text-muted mb-0">
                Всего локаций: <span class="badge bg-primary">{{ Array.isArray(locations) ? locations.length : 0 }}</span>
                • Активных: <span class="badge bg-success">{{ activeLocationsCount }}</span>
                • Неактивных: <span class="badge bg-warning">{{ inactiveLocationsCount }}</span>
              </p>
            </div>
            <div class="col-md-4 text-end">
              <div class="btn-group">
                <button 
                  @click="showCreateModal = true" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <i class="bi bi-plus-circle me-1"></i>
                  Добавить локацию
                </button>
                <button 
                  @click="checkIntegrity" 
                  class="btn btn-outline-warning"
                  :disabled="loading || checkingIntegrity"
                  :title="'Проверить целостность данных'"
                >
                  <i class="bi bi-shield-check me-1"></i>
                  {{ checkingIntegrity ? 'Проверка...' : 'Проверить' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Основное содержимое -->
    <div class="container-fluid">
      <div class="row">
        <!-- Список локаций -->
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white">
              <div class="row align-items-center">
                <div class="col-md-4">
                  <h5 class="mb-0">
                    <i class="bi bi-geo-alt me-2"></i>
                    Список локаций
                  </h5>
                </div>
                <div class="col-md-8">
                  <div class="d-flex gap-2 align-items-center">
                    <!-- Массовые действия -->
                    <div v-if="selectedLocations.length > 0" class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-primary"
                        @click="bulkActivate"
                        :title="`Активировать ${selectedLocations.length} локаций`"
                      >
                        <i class="bi bi-check-circle me-1"></i>
                        Активировать ({{ selectedLocations.length }})
                      </button>
                      <button 
                        class="btn btn-outline-secondary"
                        @click="bulkDeactivate"
                        :title="`Деактивировать ${selectedLocations.length} локаций`"
                      >
                        <i class="bi bi-x-circle me-1"></i>
                        Деактивировать ({{ selectedLocations.length }})
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="bulkDelete"
                        :title="`Удалить ${selectedLocations.length} локаций`"
                      >
                        <i class="bi bi-trash me-1"></i>
                        Удалить ({{ selectedLocations.length }})
                      </button>
                    </div>
                    
                    <!-- Фильтры -->
                    <div class="d-flex gap-2 ms-auto">
                      <select v-model="statusFilter" class="form-select form-select-sm">
                        <option value="">Все статусы</option>
                        <option value="active">Активные</option>
                        <option value="inactive">Неактивные</option>
                      </select>
                      <button 
                        class="btn btn-outline-primary btn-sm"
                        @click="autoFix"
                        :disabled="autoFixing"
                        :title="'Автоматическое исправление проблем'"
                      >
                        <i class="bi bi-wrench me-1"></i>
                        {{ autoFixing ? 'Исправление...' : 'Авто-исправление' }}
                      </button>
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
                <p class="text-muted mt-2">Загрузка локаций...</p>
              </div>
              
              <div v-else-if="!Array.isArray(locations) || locations.length === 0" class="text-center py-5">
                <i class="bi bi-geo-alt text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">Локации не найдены</p>
                <button @click="showCreateModal = true" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-1"></i>
                  Добавить первую локацию
                </button>
              </div>
              
              <div v-else class="row">
                <div v-for="location in filteredLocations" :key="location.id" class="col-lg-4 col-md-6 mb-3">
                  <div class="card border-0 shadow-sm location-card" :class="getLocationCardClass(location)">
                    <!-- Компактный заголовок -->
                    <div class="card-header d-flex justify-content-between align-items-center py-2">
                      <div class="d-flex align-items-center">
                        <div class="form-check me-2">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            :id="`location-${location.id}`"
                            v-model="selectedLocations"
                            :value="location.id"
                          >
                        </div>
                        <div 
                          class="location-color-indicator me-2"
                          :style="{ backgroundColor: location.color || '#6c757d' }"
                        ></div>
                        <strong class="fs-6">{{ location.name }}</strong>
                      </div>
                      <span class="badge badge-sm" :class="getStatusBadgeClass(location.is_active)">
                        {{ location.is_active ? 'Активна' : 'Неактивна' }}
                      </span>
                    </div>
                    
                    <!-- Компактная информация -->
                    <div class="card-body py-2">
                      <div v-if="location.description" class="row g-2 mb-2">
                        <div class="col-12">
                          <small class="text-muted text-truncate d-block">{{ location.description }}</small>
                        </div>
                      </div>
                      
                      <div class="row g-2 mb-2">
                        <div class="col-6">
                          <div class="info-item-compact">
                            <i class="bi bi-table text-primary me-1"></i>
                            <span class="fw-bold">{{ getLocationTablesCount(location.id) }}</span>
                            <small class="text-muted ms-1">столиков</small>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="info-item-compact">
                            <i class="bi bi-clock text-info me-1"></i>
                            <small class="text-truncate">{{ formatDate(location.updated_at) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Кнопки действий -->
                    <div class="card-footer bg-transparent border-top-0 py-2">
                      <div class="d-flex gap-1 flex-wrap">
                        <!-- Основные действия -->
                        <button 
                          class="btn btn-sm btn-outline-primary flex-fill"
                          @click="viewLocationTables(location)"
                          :title="'Просмотреть столики локации ' + location.name"
                        >
                          <i class="bi bi-table"></i>
                        </button>
                        
                        <button 
                          class="btn btn-sm btn-outline-secondary flex-fill"
                          @click="editLocation(location)"
                          :title="'Редактировать локацию ' + location.name"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        
                        <button 
                          class="btn btn-sm flex-fill"
                          :class="location.is_active ? 'btn-outline-warning' : 'btn-outline-success'"
                          @click="toggleLocationStatus(location)"
                          :title="location.is_active ? 'Деактивировать локацию' : 'Активировать локацию'"
                        >
                          <i class="bi" :class="location.is_active ? 'bi-toggle-off' : 'bi-toggle-on'"></i>
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
                              <a class="dropdown-item" href="#" @click="syncLocationTables(location)">
                                <i class="bi bi-arrow-clockwise me-2"></i>
                                Синхронизировать столики
                              </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                              <a class="dropdown-item text-danger" href="#" @click="deleteLocation(location)">
                                <i class="bi bi-trash me-2"></i>
                                Удалить
                              </a>
                            </li>
                          </ul>
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

    <!-- Модальное окно создания локации -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeCreateModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Добавить локацию
            </h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="validationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ validationErrors }}</pre>
            </div>
            
            <form @submit.prevent="createLocation">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Название локации</label>
                  <input 
                    v-model="newLocation.name" 
                    type="text" 
                    class="form-control"
                    required
                    placeholder="Основной зал"
                  >
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Цвет</label>
                  <input 
                    v-model="newLocation.color" 
                    type="color" 
                    class="form-control form-control-color"
                  >
                </div>
                
                <div class="col-12">
                  <label class="form-label">Описание</label>
                  <textarea 
                    v-model="newLocation.description" 
                    class="form-control"
                    rows="3"
                    placeholder="Дополнительная информация о локации"
                  ></textarea>
                </div>
                
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="newLocation.is_active" class="form-check-input" type="checkbox" id="createActive">
                    <label class="form-check-label" for="createActive">
                      Активна
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" @click="closeCreateModal" class="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="creatingLocation">
                  <i class="bi bi-plus-circle me-1"></i>
                  {{ creatingLocation ? 'Создание...' : 'Создать' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования локации -->
    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeEditModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Редактировать локацию
            </h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="editValidationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ editValidationErrors }}</pre>
            </div>
            
            <form @submit.prevent="updateLocation">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Название локации</label>
                  <input 
                    v-model="editingLocation.name" 
                    type="text" 
                    class="form-control"
                    required
                  >
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Цвет</label>
                  <input 
                    v-model="editingLocation.color" 
                    type="color" 
                    class="form-control form-control-color"
                  >
                </div>
                
                <div class="col-12">
                  <label class="form-label">Описание</label>
                  <textarea 
                    v-model="editingLocation.description" 
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
                
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="editingLocation.is_active" class="form-check-input" type="checkbox" id="editActive">
                    <label class="form-check-label" for="editActive">
                      Активна
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" @click="closeEditModal" class="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="updatingLocation">
                  <i class="bi bi-check-circle me-1"></i>
                  {{ updatingLocation ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра столиков локации -->
    <div v-if="showTablesModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeTablesModal">
      <div class="modal-dialog modal-dialog-centered modal-xl" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-table me-2"></i>
              Столики локации "{{ selectedLocation?.name }}"
            </h5>
            <button type="button" class="btn-close" @click="closeTablesModal"></button>
          </div>
          
          <div class="modal-body">
            <div v-if="loadingTables" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка столиков...</span>
              </div>
            </div>
            
            <div v-else-if="locationTables.length === 0" class="text-center py-4">
              <i class="bi bi-table text-muted" style="font-size: 2rem;"></i>
              <p class="text-muted mt-2">В данной локации нет столиков</p>
            </div>
            
            <div v-else class="row">
              <div v-for="table in locationTables" :key="table.id" class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm">
                  <div class="card-body py-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Столик {{ table.number }}</strong>
                        <div class="text-muted small">{{ table.seats }} мест</div>
                      </div>
                      <span class="badge" :class="table.is_active ? 'bg-success' : 'bg-secondary'">
                        {{ table.is_active ? 'Активен' : 'Неактивен' }}
                      </span>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// Типы данных
interface Location {
  id: number
  name: string
  description: string | null
  color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CreateLocationData {
  name: string
  description?: string
  color?: string
  is_active: boolean
}

interface UpdateLocationData {
  name?: string
  description?: string
  color?: string
  is_active?: boolean
}

interface Table {
  id: number
  number: number
  seats: number
  is_active: boolean
  is_occupied: boolean
  location_id: number
}

// Состояние компонента
const locations = ref<Location[]>([])
const locationTables = ref<Table[]>([])
const loading = ref(false)
const loadingTables = ref(false)
const checkingIntegrity = ref(false)
const autoFixing = ref(false)

// Фильтры
const statusFilter = ref('')

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showTablesModal = ref(false)

// Создание локации
const newLocation = ref<CreateLocationData>({
  name: '',
  description: '',
  color: '#007bff',
  is_active: true
})
const creatingLocation = ref(false)
const validationErrors = ref<string>('')

// Редактирование локации
const editingLocation = ref<UpdateLocationData>({})
const editingLocationId = ref<number | null>(null)
const updatingLocation = ref(false)
const editValidationErrors = ref<string>('')

// Выбранная локация
const selectedLocation = ref<Location | null>(null)

// Массовые операции
const selectedLocations = ref<number[]>([])

// Вычисляемые свойства
const activeLocationsCount = computed(() => 
  Array.isArray(locations.value) ? locations.value.filter(location => location.is_active).length : 0
)

const inactiveLocationsCount = computed(() => 
  Array.isArray(locations.value) ? locations.value.filter(location => !location.is_active).length : 0
)

const filteredLocations = computed(() => {
  if (!Array.isArray(locations.value)) return []
  
  return locations.value.filter(location => {
    const matchesStatus = !statusFilter.value || 
      (statusFilter.value === 'active' && location.is_active) ||
      (statusFilter.value === 'inactive' && !location.is_active)
    return matchesStatus
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

const getStatusBadgeClass = (isActive: boolean) => {
  return isActive ? 'bg-success' : 'bg-secondary'
}

const getLocationCardClass = (location: Location) => {
  return location.is_active ? 'location-active' : 'location-inactive'
}

const getLocationTablesCount = (locationId: number) => {
  // Здесь можно добавить логику подсчета столиков для локации
  // Пока возвращаем 0, так как у нас нет полной информации о столиках
  return 0
}

// Методы
const loadLocations = async () => {
  try {
    loading.value = true
    const result = await apiService.getLocations()
    locations.value = result.locations || result
  } catch (error) {
    console.error('Failed to load locations:', error)
    locations.value = []
  } finally {
    loading.value = false
  }
}

// Создание локации
const closeCreateModal = () => {
  showCreateModal.value = false
  validationErrors.value = ''
  newLocation.value = {
    name: '',
    description: '',
    color: '#007bff',
    is_active: true
  }
}

const createLocation = async () => {
  try {
    creatingLocation.value = true
    validationErrors.value = ''
    
    const location = await apiService.createLocation(newLocation.value)
    
    if (Array.isArray(locations.value)) {
      locations.value.push(location)
    } else {
      locations.value = [location]
    }
    
    closeCreateModal()
  } catch (error) {
    console.error('Failed to create location:', error)
    
    if (error instanceof Error) {
      validationErrors.value = error.message
    } else {
      validationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    creatingLocation.value = false
  }
}

// Редактирование локации
const editLocation = (location: Location) => {
  editingLocationId.value = location.id
  editingLocation.value = {
    name: location.name,
    description: location.description || '',
    color: location.color || '#007bff',
    is_active: location.is_active
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editValidationErrors.value = ''
  editingLocation.value = {}
  editingLocationId.value = null
}

const updateLocation = async () => {
  if (!editingLocationId.value || !Array.isArray(locations.value)) return
  
  try {
    updatingLocation.value = true
    editValidationErrors.value = ''
    
    const updatedLocation = await apiService.updateLocation(editingLocationId.value, editingLocation.value)
    
    const index = locations.value.findIndex(l => l.id === editingLocationId.value)
    if (index !== -1) {
      locations.value[index] = updatedLocation
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Failed to update location:', error)
    
    if (error instanceof Error) {
      editValidationErrors.value = error.message
    } else {
      editValidationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    updatingLocation.value = false
  }
}

// Просмотр столиков локации
const viewLocationTables = async (location: Location) => {
  selectedLocation.value = location
  showTablesModal.value = true
  
  try {
    loadingTables.value = true
    const result = await apiService.getLocationTables(location.id)
    locationTables.value = result.tables || result
  } catch (error) {
    console.error('Failed to load location tables:', error)
    locationTables.value = []
  } finally {
    loadingTables.value = false
  }
}

const closeTablesModal = () => {
  showTablesModal.value = false
  selectedLocation.value = null
  locationTables.value = []
}

// Дополнительные действия
const toggleLocationStatus = async (location: Location) => {
  if (!Array.isArray(locations.value)) return
  
  try {
    const newStatus = !location.is_active
    const updatedLocation = await apiService.updateLocation(location.id, { is_active: newStatus })
    
    const index = locations.value.findIndex(l => l.id === location.id)
    if (index !== -1) {
      locations.value[index] = updatedLocation
    }
  } catch (error) {
    console.error('Failed to toggle location status:', error)
  }
}

const syncLocationTables = async (location: Location) => {
  if (!confirm(`Вы уверены, что хотите синхронизировать столики локации "${location.name}"?`)) return
  
  try {
    await apiService.syncLocationTables(location.id)
    alert('Синхронизация столиков выполнена успешно')
  } catch (error) {
    console.error('Failed to sync location tables:', error)
    alert('Ошибка при синхронизации столиков')
  }
}

const deleteLocation = async (location: Location) => {
  if (!Array.isArray(locations.value)) return
  
  if (!confirm(`Вы уверены, что хотите удалить локацию "${location.name}"?`)) return
  
  try {
    await apiService.deleteLocation(location.id)
    locations.value = locations.value.filter(l => l.id !== location.id)
  } catch (error) {
    console.error('Failed to delete location:', error)
  }
}

// Административные функции
const checkIntegrity = async () => {
  try {
    checkingIntegrity.value = true
    const result = await apiService.checkLocationsIntegrity()
    alert(result.message || 'Проверка целостности выполнена')
  } catch (error) {
    console.error('Failed to check integrity:', error)
    alert('Ошибка при проверке целостности')
  } finally {
    checkingIntegrity.value = false
  }
}

const autoFix = async () => {
  if (!confirm('Вы уверены, что хотите выполнить автоматическое исправление проблем?')) return
  
  try {
    autoFixing.value = true
    const result = await apiService.autoFixLocations()
    alert(result.message || 'Автоматическое исправление выполнено')
    
    // Обновляем данные после исправления
    await loadLocations()
  } catch (error) {
    console.error('Failed to auto-fix:', error)
    alert('Ошибка при автоматическом исправлении')
  } finally {
    autoFixing.value = false
  }
}

// Массовые операции
const bulkActivate = async () => {
  if (!selectedLocations.value.length) return
  
  if (!confirm(`Вы уверены, что хотите активировать ${selectedLocations.value.length} локаций?`)) return
  
  try {
    const promises = selectedLocations.value.map(id => 
      apiService.updateLocation(id, { is_active: true })
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadLocations()
    selectedLocations.value = []
  } catch (error) {
    console.error('Failed to bulk activate locations:', error)
    alert('Ошибка при активации локаций')
  }
}

const bulkDeactivate = async () => {
  if (!selectedLocations.value.length) return
  
  if (!confirm(`Вы уверены, что хотите деактивировать ${selectedLocations.value.length} локаций?`)) return
  
  try {
    const promises = selectedLocations.value.map(id => 
      apiService.updateLocation(id, { is_active: false })
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadLocations()
    selectedLocations.value = []
  } catch (error) {
    console.error('Failed to bulk deactivate locations:', error)
    alert('Ошибка при деактивации локаций')
  }
}

const bulkDelete = async () => {
  if (!selectedLocations.value.length) return
  
  if (!confirm(`Вы уверены, что хотите удалить ${selectedLocations.value.length} локаций? Это действие нельзя отменить.`)) return
  
  try {
    const promises = selectedLocations.value.map(id => 
      apiService.deleteLocation(id)
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadLocations()
    selectedLocations.value = []
  } catch (error) {
    console.error('Failed to bulk delete locations:', error)
    alert('Ошибка при удалении локаций')
  }
}

// Инициализация
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await loadLocations()
})
</script>

<style scoped lang="scss">
@use '@/styles/views/locations-management';
</style>
