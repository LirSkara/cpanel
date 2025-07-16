<template>
  <div class="payment-methods-page">
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
              <li class="breadcrumb-item active text-muted" aria-current="page">Управление способами оплаты</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-credit-card me-2 text-primary"></i>
                Управление способами оплаты
              </h1>
              <p class="text-muted mb-0">
                Всего способов оплаты: <span class="badge bg-primary">{{ Array.isArray(paymentMethods) ? paymentMethods.length : 0 }}</span>
                • Активных: <span class="badge bg-success">{{ activePaymentMethodsCount }}</span>
                • Неактивных: <span class="badge bg-warning">{{ inactivePaymentMethodsCount }}</span>
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
                  Добавить способ оплаты
                </button>
                <button 
                  @click="loadActivePaymentMethods" 
                  class="btn btn-outline-info"
                  :disabled="loading"
                  :title="'Показать только активные'"
                >
                  <i class="bi bi-check-circle me-1"></i>
                  Активные
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
        <!-- Список способов оплаты -->
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white">
              <div class="row align-items-center">
                <div class="col-md-4">
                  <h5 class="mb-0">
                    <i class="bi bi-credit-card me-2"></i>
                    Список способов оплаты
                  </h5>
                </div>
                <div class="col-md-8">
                  <div class="d-flex gap-2 align-items-center">
                    <!-- Массовые действия -->
                    <div v-if="selectedPaymentMethods.length > 0" class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-primary"
                        @click="bulkActivate"
                        :title="`Активировать ${selectedPaymentMethods.length} способов оплаты`"
                      >
                        <i class="bi bi-check-circle me-1"></i>
                        Активировать ({{ selectedPaymentMethods.length }})
                      </button>
                      <button 
                        class="btn btn-outline-secondary"
                        @click="bulkDeactivate"
                        :title="`Деактивировать ${selectedPaymentMethods.length} способов оплаты`"
                      >
                        <i class="bi bi-x-circle me-1"></i>
                        Деактивировать ({{ selectedPaymentMethods.length }})
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="bulkDelete"
                        :title="`Удалить ${selectedPaymentMethods.length} способов оплаты`"
                      >
                        <i class="bi bi-trash me-1"></i>
                        Удалить ({{ selectedPaymentMethods.length }})
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
                        class="btn btn-outline-secondary btn-sm"
                        @click="loadPaymentMethods"
                        :disabled="loading"
                        :title="'Обновить данные'"
                      >
                        <i class="bi bi-arrow-clockwise me-1"></i>
                        Обновить
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
                <p class="text-muted mt-2">Загрузка способов оплаты...</p>
              </div>
              
              <div v-else-if="!Array.isArray(paymentMethods) || paymentMethods.length === 0" class="text-center py-5">
                <i class="bi bi-credit-card text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">Способы оплаты не найдены</p>
                <button @click="showCreateModal = true" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-1"></i>
                  Добавить первый способ оплаты
                </button>
              </div>
              
              <div v-else class="row">
                <div v-for="method in filteredPaymentMethods" :key="method.id" class="col-lg-4 col-md-6 mb-3">
                  <div class="card border-0 shadow-sm payment-method-card" :class="getPaymentMethodCardClass(method)">
                    <!-- Компактный заголовок -->
                    <div class="card-header d-flex justify-content-between align-items-center py-2">
                      <div class="d-flex align-items-center">
                        <div class="form-check me-2">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            :id="`method-${method.id}`"
                            v-model="selectedPaymentMethods"
                            :value="method.id"
                          >
                        </div>
                        <div class="payment-method-icon me-2">
                          <i class="bi bi-credit-card text-primary"></i>
                        </div>
                        <strong class="fs-6">{{ method.name }}</strong>
                      </div>
                      <span class="badge badge-sm" :class="getStatusBadgeClass(method.is_active)">
                        {{ method.is_active ? 'Активен' : 'Неактивен' }}
                      </span>
                    </div>
                    
                    <!-- Компактная информация -->
                    <div class="card-body py-2">
                      <div class="row g-2 mb-2">
                        <div class="col-6">
                          <div class="info-item-compact">
                            <i class="bi bi-calendar-plus text-success me-1"></i>
                            <small class="text-truncate">{{ formatDate(method.created_at) }}</small>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="info-item-compact">
                            <i class="bi bi-clock text-info me-1"></i>
                            <small class="text-truncate">{{ formatDate(method.updated_at) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Кнопки действий -->
                    <div class="card-footer bg-transparent border-top-0 py-2">
                      <div class="d-flex gap-1 flex-wrap">
                        <!-- Основные действия -->
                        <button 
                          class="btn btn-sm btn-outline-secondary flex-fill"
                          @click="editPaymentMethod(method)"
                          :title="'Редактировать способ оплаты ' + method.name"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        
                        <button 
                          class="btn btn-sm flex-fill"
                          :class="method.is_active ? 'btn-outline-warning' : 'btn-outline-success'"
                          @click="togglePaymentMethodStatus(method)"
                          :title="method.is_active ? 'Деактивировать способ оплаты' : 'Активировать способ оплаты'"
                        >
                          <i class="bi" :class="method.is_active ? 'bi-toggle-off' : 'bi-toggle-on'"></i>
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
                              <a class="dropdown-item" href="#" @click="viewPaymentMethodDetails(method)">
                                <i class="bi bi-eye me-2"></i>
                                Просмотреть детали
                              </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                              <a class="dropdown-item text-danger" href="#" @click="deletePaymentMethod(method)">
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

    <!-- Модальное окно создания способа оплаты -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeCreateModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Добавить способ оплаты
            </h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="validationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ validationErrors }}</pre>
            </div>
            
            <form @submit.prevent="createPaymentMethod">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Название способа оплаты</label>
                  <input 
                    v-model="newPaymentMethod.name" 
                    type="text" 
                    class="form-control"
                    required
                    placeholder="Например: Наличные, Карта, Онлайн оплата"
                  >
                </div>
                
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="newPaymentMethod.is_active" class="form-check-input" type="checkbox" id="createActive">
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
                <button type="submit" class="btn btn-primary" :disabled="creatingPaymentMethod">
                  <i class="bi bi-plus-circle me-1"></i>
                  {{ creatingPaymentMethod ? 'Создание...' : 'Создать' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования способа оплаты -->
    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeEditModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Редактировать способ оплаты
            </h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="editValidationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ editValidationErrors }}</pre>
            </div>
            
            <form @submit.prevent="updatePaymentMethod">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Название способа оплаты</label>
                  <input 
                    v-model="editingPaymentMethod.name" 
                    type="text" 
                    class="form-control"
                    required
                  >
                </div>
                
                <div class="col-12">
                  <div class="form-check">
                    <input v-model="editingPaymentMethod.is_active" class="form-check-input" type="checkbox" id="editActive">
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
                <button type="submit" class="btn btn-primary" :disabled="updatingPaymentMethod">
                  <i class="bi bi-check-circle me-1"></i>
                  {{ updatingPaymentMethod ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра деталей способа оплаты -->
    <div v-if="showDetailsModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeDetailsModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-eye me-2"></i>
              Детали способа оплаты "{{ selectedPaymentMethod?.name }}"
            </h5>
            <button type="button" class="btn-close" @click="closeDetailsModal"></button>
          </div>
          
          <div class="modal-body">
            <div v-if="selectedPaymentMethod" class="row g-3">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">
                      <i class="bi bi-info-circle me-2"></i>
                      Основная информация
                    </h6>
                    <dl class="row">
                      <dt class="col-sm-4">ID:</dt>
                      <dd class="col-sm-8">{{ selectedPaymentMethod.id }}</dd>
                      
                      <dt class="col-sm-4">Название:</dt>
                      <dd class="col-sm-8">{{ selectedPaymentMethod.name }}</dd>
                      
                      <dt class="col-sm-4">Статус:</dt>
                      <dd class="col-sm-8">
                        <span class="badge" :class="getStatusBadgeClass(selectedPaymentMethod.is_active)">
                          {{ selectedPaymentMethod.is_active ? 'Активен' : 'Неактивен' }}
                        </span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">
                      <i class="bi bi-clock me-2"></i>
                      Временные метки
                    </h6>
                    <dl class="row">
                      <dt class="col-sm-4">Создано:</dt>
                      <dd class="col-sm-8">{{ formatDate(selectedPaymentMethod.created_at) }}</dd>
                      
                      <dt class="col-sm-4">Изменено:</dt>
                      <dd class="col-sm-8">{{ formatDate(selectedPaymentMethod.updated_at) }}</dd>
                    </dl>
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
interface PaymentMethod {
  id: number
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CreatePaymentMethodData {
  name: string
  is_active: boolean
}

interface UpdatePaymentMethodData {
  name?: string
  is_active?: boolean
}

// Состояние компонента
const paymentMethods = ref<PaymentMethod[]>([])
const loading = ref(false)

// Фильтры
const statusFilter = ref('')

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)

// Создание способа оплаты
const newPaymentMethod = ref<CreatePaymentMethodData>({
  name: '',
  is_active: true
})
const creatingPaymentMethod = ref(false)
const validationErrors = ref<string>('')

// Редактирование способа оплаты
const editingPaymentMethod = ref<UpdatePaymentMethodData>({})
const editingPaymentMethodId = ref<number | null>(null)
const updatingPaymentMethod = ref(false)
const editValidationErrors = ref<string>('')

// Выбранный способ оплаты
const selectedPaymentMethod = ref<PaymentMethod | null>(null)

// Массовые операции
const selectedPaymentMethods = ref<number[]>([])

// Вычисляемые свойства
const activePaymentMethodsCount = computed(() => 
  Array.isArray(paymentMethods.value) ? paymentMethods.value.filter(method => method.is_active).length : 0
)

const inactivePaymentMethodsCount = computed(() => 
  Array.isArray(paymentMethods.value) ? paymentMethods.value.filter(method => !method.is_active).length : 0
)

const filteredPaymentMethods = computed(() => {
  if (!Array.isArray(paymentMethods.value)) return []
  
  return paymentMethods.value.filter(method => {
    const matchesStatus = !statusFilter.value || 
      (statusFilter.value === 'active' && method.is_active) ||
      (statusFilter.value === 'inactive' && !method.is_active)
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

const getPaymentMethodCardClass = (method: PaymentMethod) => {
  return method.is_active ? 'method-active' : 'method-inactive'
}

// Методы
const loadPaymentMethods = async () => {
  try {
    loading.value = true
    console.log('Loading payment methods...')
    const result = await apiService.getPaymentMethods()
    console.log('Payment methods loaded:', result)
    // Извлекаем массив из поля payment_methods
    paymentMethods.value = (result as any).payment_methods || result
    console.log('Payment methods set:', paymentMethods.value)
  } catch (error) {
    console.error('Failed to load payment methods:', error)
    paymentMethods.value = []
  } finally {
    loading.value = false
  }
}

const loadActivePaymentMethods = async () => {
  try {
    loading.value = true
    const result = await apiService.getActivePaymentMethods()
    // Извлекаем массив из поля payment_methods
    paymentMethods.value = (result as any).payment_methods || result
  } catch (error) {
    console.error('Failed to load active payment methods:', error)
    paymentMethods.value = []
  } finally {
    loading.value = false
  }
}

// Создание способа оплаты
const closeCreateModal = () => {
  showCreateModal.value = false
  validationErrors.value = ''
  newPaymentMethod.value = {
    name: '',
    is_active: true
  }
}

const createPaymentMethod = async () => {
  try {
    creatingPaymentMethod.value = true
    validationErrors.value = ''
    
    const method = await apiService.createPaymentMethod(newPaymentMethod.value)
    
    if (Array.isArray(paymentMethods.value)) {
      paymentMethods.value.push(method)
    } else {
      paymentMethods.value = [method]
    }
    
    closeCreateModal()
  } catch (error) {
    console.error('Failed to create payment method:', error)
    
    if (error instanceof Error) {
      validationErrors.value = error.message
    } else {
      validationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    creatingPaymentMethod.value = false
  }
}

// Редактирование способа оплаты
const editPaymentMethod = (method: PaymentMethod) => {
  editingPaymentMethodId.value = method.id
  editingPaymentMethod.value = {
    name: method.name,
    is_active: method.is_active
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editValidationErrors.value = ''
  editingPaymentMethod.value = {}
  editingPaymentMethodId.value = null
}

const updatePaymentMethod = async () => {
  if (!editingPaymentMethodId.value || !Array.isArray(paymentMethods.value)) return
  
  try {
    updatingPaymentMethod.value = true
    editValidationErrors.value = ''
    
    const updatedMethod = await apiService.updatePaymentMethod(editingPaymentMethodId.value, editingPaymentMethod.value)
    
    const index = paymentMethods.value.findIndex(m => m.id === editingPaymentMethodId.value)
    if (index !== -1) {
      paymentMethods.value[index] = updatedMethod
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Failed to update payment method:', error)
    
    if (error instanceof Error) {
      editValidationErrors.value = error.message
    } else {
      editValidationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    updatingPaymentMethod.value = false
  }
}

// Просмотр деталей способа оплаты
const viewPaymentMethodDetails = (method: PaymentMethod) => {
  selectedPaymentMethod.value = method
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedPaymentMethod.value = null
}

// Дополнительные действия
const togglePaymentMethodStatus = async (method: PaymentMethod) => {
  if (!Array.isArray(paymentMethods.value)) return
  
  try {
    const newStatus = !method.is_active
    const updatedMethod = await apiService.updatePaymentMethod(method.id, { is_active: newStatus })
    
    const index = paymentMethods.value.findIndex(m => m.id === method.id)
    if (index !== -1) {
      paymentMethods.value[index] = updatedMethod
    }
  } catch (error) {
    console.error('Failed to toggle payment method status:', error)
  }
}

const deletePaymentMethod = async (method: PaymentMethod) => {
  if (!Array.isArray(paymentMethods.value)) return
  
  if (!confirm(`Вы уверены, что хотите удалить способ оплаты "${method.name}"?`)) return
  
  try {
    await apiService.deletePaymentMethod(method.id)
    paymentMethods.value = paymentMethods.value.filter(m => m.id !== method.id)
  } catch (error) {
    console.error('Failed to delete payment method:', error)
  }
}

// Массовые операции
const bulkActivate = async () => {
  if (!selectedPaymentMethods.value.length) return
  
  if (!confirm(`Вы уверены, что хотите активировать ${selectedPaymentMethods.value.length} способов оплаты?`)) return
  
  try {
    const promises = selectedPaymentMethods.value.map(id => 
      apiService.updatePaymentMethod(id, { is_active: true })
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadPaymentMethods()
    selectedPaymentMethods.value = []
  } catch (error) {
    console.error('Failed to bulk activate payment methods:', error)
    alert('Ошибка при активации способов оплаты')
  }
}

const bulkDeactivate = async () => {
  if (!selectedPaymentMethods.value.length) return
  
  if (!confirm(`Вы уверены, что хотите деактивировать ${selectedPaymentMethods.value.length} способов оплаты?`)) return
  
  try {
    const promises = selectedPaymentMethods.value.map(id => 
      apiService.updatePaymentMethod(id, { is_active: false })
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadPaymentMethods()
    selectedPaymentMethods.value = []
  } catch (error) {
    console.error('Failed to bulk deactivate payment methods:', error)
    alert('Ошибка при деактивации способов оплаты')
  }
}

const bulkDelete = async () => {
  if (!selectedPaymentMethods.value.length) return
  
  if (!confirm(`Вы уверены, что хотите удалить ${selectedPaymentMethods.value.length} способов оплаты? Это действие нельзя отменить.`)) return
  
  try {
    const promises = selectedPaymentMethods.value.map(id => 
      apiService.deletePaymentMethod(id)
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadPaymentMethods()
    selectedPaymentMethods.value = []
  } catch (error) {
    console.error('Failed to bulk delete payment methods:', error)
    alert('Ошибка при удалении способов оплаты')
  }
}

// Инициализация
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await loadPaymentMethods()
})
</script>

<style scoped lang="scss">
@use '@/styles/views/payment-methods-management';
</style>
