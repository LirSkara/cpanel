<template>
  <div class="orders-page">
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
              <li class="breadcrumb-item active text-muted" aria-current="page">Управление заказами</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-receipt-cutoff me-2 text-primary"></i>
                Управление заказами
              </h1>
              <p class="text-muted mb-0">
                Всего заказов: <span class="badge bg-primary">{{ stats.total_orders || 0 }}</span>
                • В обработке: <span class="badge bg-warning">{{ stats.pending_orders || 0 }}</span>
                • Завершенных: <span class="badge bg-success">{{ stats.completed_orders || 0 }}</span>
                • Отмененных: <span class="badge bg-danger">{{ stats.cancelled_orders || 0 }}</span>
                • Выручка: <span class="badge bg-info">{{ formatMoney(stats.total_revenue || 0) }}</span>
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
                  Новый заказ
                </button>
                <button 
                  @click="loadOrders()" 
                  class="btn btn-outline-secondary"
                  :disabled="loading"
                  title="Обновить список заказов"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  {{ loading ? 'Загрузка...' : 'Обновить' }}
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
        <!-- Список заказов -->
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white">
              <div class="row align-items-center">
                <div class="col-md-4">
                  <h5 class="mb-0">
                    <i class="bi bi-receipt-cutoff me-2"></i>
                    Список заказов
                  </h5>
                </div>
                <div class="col-md-8">
                  <div class="d-flex gap-2 align-items-center">
                    <!-- Фильтры -->
                    <div class="d-flex gap-2 ms-auto">
                      <select v-model="statusFilter" class="form-select form-select-sm" @change="loadOrders()">
                        <option value="">Все статусы</option>
                        <option value="pending">В обработке</option>
                        <option value="ready">Готов</option>
                        <option value="served">Подан</option>
                        <option value="dining">За столом</option>
                        <option value="completed">Завершен</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                      <select v-model="typeFilter" class="form-select form-select-sm" @change="loadOrders()">
                        <option value="">Все типы</option>
                        <option value="dine_in">В зале</option>
                        <option value="takeaway">На вынос</option>
                        <option value="delivery">Доставка</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card-body p-0">
              <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="text-muted mt-2">Загрузка заказов...</p>
              </div>
              
              <div v-else-if="!Array.isArray(orders) || orders.length === 0" class="text-center py-5">
                <i class="bi bi-receipt-cutoff text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">Заказы не найдены</p>
                <button @click="showCreateModal = true" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-1"></i>
                  Создать первый заказ
                </button>
              </div>
              
              <div v-else class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="border-0">№ Заказа</th>
                      <th class="border-0">Столик</th>
                      <th class="border-0">Тип</th>
                      <th class="border-0">Официант</th>
                      <th class="border-0">Сумма</th>
                      <th class="border-0">Статус</th>
                      <th class="border-0">Оплата</th>
                      <th class="border-0">Время</th>
                      <th class="border-0">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="order in orders" :key="order.id" :class="getOrderRowClass(order)">
                      <td>
                        <div class="d-flex align-items-center">
                          <strong>#{{ order.id }}</strong>
                          <span v-if="order.customer_name" class="ms-2 text-muted small">
                            {{ order.customer_name }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span v-if="order.table_id" class="badge bg-light text-dark">
                          Столик {{ order.table_id }}
                        </span>
                        <span v-else-if="order.table_name" class="badge bg-light text-dark">
                          {{ order.table_name }}
                        </span>
                        <span v-else class="text-muted">—</span>
                      </td>
                      <td>
                        <span class="badge" :class="getOrderTypeBadgeClass(order.order_type)">
                          {{ getOrderTypeText(order.order_type) }}
                        </span>
                      </td>
                      <td>
                        <span v-if="order.waiter_id" class="text-truncate">
                          {{ order.waiter_name || `Официант ${order.waiter_id}` }}
                        </span>
                        <span v-else class="text-muted">—</span>
                      </td>
                      <td>
                        <strong>{{ formatMoney(order.total_price) }}</strong>
                        <div v-if="order.items?.length" class="text-muted small">
                          {{ order.items.length }} поз.
                        </div>
                      </td>
                      <td>
                        <span class="badge" :class="getStatusBadgeClass(order.status)">
                          {{ getStatusText(order.status) }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="getPaymentStatusBadgeClass(order.payment_status)">
                          {{ getPaymentStatusText(order.payment_status) }}
                        </span>
                        <div v-if="order.payment_method_name" class="text-muted small">
                          {{ order.payment_method_name }}
                        </div>
                      </td>
                      <td>
                        <div class="text-muted small">
                          {{ formatDateTime(order.created_at) }}
                        </div>
                      </td>
                      <td>
                        <button 
                          class="btn btn-outline-primary btn-sm"
                          @click="viewOrder(order)"
                          title="Просмотреть заказ"
                        >
                          <i class="bi bi-eye me-1"></i>
                          Просмотреть
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Пагинация -->
              <div v-if="totalPages > 1" class="card-footer bg-white">
                <nav aria-label="Навигация по страницам">
                  <ul class="pagination pagination-sm justify-content-center mb-0">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="loadOrders(currentPage - 1)">
                        <i class="bi bi-chevron-left"></i>
                      </a>
                    </li>
                    <li 
                      v-for="page in visiblePages" 
                      :key="page" 
                      class="page-item" 
                      :class="{ active: page === currentPage }"
                    >
                      <a class="page-link" href="#" @click.prevent="loadOrders(page)">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <a class="page-link" href="#" @click.prevent="loadOrders(currentPage + 1)">
                        <i class="bi bi-chevron-right"></i>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания заказа -->
    <div class="modal fade" :class="{ show: showCreateModal }" tabindex="-1" :style="{ display: showCreateModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Создать новый заказ
            </h5>
            <button type="button" class="btn-close" @click="showCreateModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted">Функция создания заказов будет доступна в следующих версиях системы.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра заказа -->
    <div class="modal fade" :class="{ show: showViewModal }" tabindex="-1" :style="{ display: showViewModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-xl">
        <div class="modal-content order-modal" v-if="selectedOrder">
          <div class="modal-header bg-gradient-primary text-white border-0">
            <div class="d-flex align-items-center">
              <div class="order-icon me-3">
                <i class="bi bi-receipt-cutoff"></i>
              </div>
              <div>
                <h5 class="modal-title mb-0">Заказ #{{ selectedOrder.id }}</h5>
                <small class="opacity-75">{{ formatDateTime(selectedOrder.created_at) }}</small>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="showViewModal = false"></button>
          </div>
          
          <div class="modal-body p-0">
            <!-- Статус и общая информация -->
            <div class="order-status-bar p-3 border-bottom">
              <div class="row align-items-center">
                <div class="col-md-4">
                  <div class="status-item">
                    <small class="text-muted d-block">Статус заказа</small>
                    <span class="badge fs-6 px-3 py-2" :class="getStatusBadgeClass(selectedOrder.status)">
                      <i class="bi bi-circle-fill me-1" style="font-size: 0.6rem;"></i>
                      {{ getStatusText(selectedOrder.status) }}
                    </span>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="status-item">
                    <small class="text-muted d-block">Оплата</small>
                    <span class="badge fs-6 px-3 py-2" :class="getPaymentStatusBadgeClass(selectedOrder.payment_status)">
                      <i class="bi bi-credit-card me-1"></i>
                      {{ getPaymentStatusText(selectedOrder.payment_status) }}
                    </span>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="total-amount">
                    <small class="text-muted d-block">Общая сумма</small>
                    <h4 class="mb-0 text-success fw-bold">{{ formatMoney(selectedOrder.total_price) }}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div class="row g-0">
              <!-- Информация о заказе -->
              <div class="col-md-6 border-end">
                <div class="p-4">
                  <h6 class="text-primary mb-3 fw-bold">
                    <i class="bi bi-info-circle me-2"></i>
                    Информация о заказе
                  </h6>
                  
                  <div class="order-info-grid">
                    <div class="info-item mb-3">
                      <div class="info-label">
                        <i class="bi bi-tag text-muted me-2"></i>
                        <small class="text-muted">Тип заказа</small>
                      </div>
                      <div class="info-value">
                        <span class="badge" :class="getOrderTypeBadgeClass(selectedOrder.order_type)">
                          <i class="bi me-1" :class="getOrderTypeIcon(selectedOrder.order_type)"></i>
                          {{ getOrderTypeText(selectedOrder.order_type) }}
                        </span>
                      </div>
                    </div>

                    <div v-if="selectedOrder.table_name || selectedOrder.table_id" class="info-item mb-3">
                      <div class="info-label">
                        <i class="bi bi-house text-muted me-2"></i>
                        <small class="text-muted">Столик</small>
                      </div>
                      <div class="info-value">
                        <span class="badge bg-light text-dark">
                          <i class="bi bi-table me-1"></i>
                          {{ selectedOrder.table_name || `Столик ${selectedOrder.table_id}` }}
                        </span>
                      </div>
                    </div>

                    <div v-if="selectedOrder.waiter_name || selectedOrder.waiter_id" class="info-item mb-3">
                      <div class="info-label">
                        <i class="bi bi-person text-muted me-2"></i>
                        <small class="text-muted">Официант</small>
                      </div>
                      <div class="info-value">
                        {{ selectedOrder.waiter_name || `Официант ${selectedOrder.waiter_id}` }}
                      </div>
                    </div>

                    <div v-if="selectedOrder.customer_name" class="info-item mb-3">
                      <div class="info-label">
                        <i class="bi bi-person-circle text-muted me-2"></i>
                        <small class="text-muted">Клиент</small>
                      </div>
                      <div class="info-value">
                        {{ selectedOrder.customer_name }}
                      </div>
                    </div>

                    <div v-if="selectedOrder.customer_phone" class="info-item mb-3">
                      <div class="info-label">
                        <i class="bi bi-telephone text-muted me-2"></i>
                        <small class="text-muted">Телефон</small>
                      </div>
                      <div class="info-value">
                        <a :href="`tel:${selectedOrder.customer_phone}`" class="text-decoration-none">
                          {{ selectedOrder.customer_phone }}
                        </a>
                      </div>
                    </div>

                    <div v-if="selectedOrder.delivery_address" class="info-item mb-3">
                      <div class="info-label">
                        <i class="bi bi-geo-alt text-muted me-2"></i>
                        <small class="text-muted">Адрес доставки</small>
                      </div>
                      <div class="info-value">
                        {{ selectedOrder.delivery_address }}
                      </div>
                    </div>

                    <div v-if="selectedOrder.payment_method_name" class="info-item mb-3">
                      <div class="info-label">
                        <i class="bi bi-credit-card text-muted me-2"></i>
                        <small class="text-muted">Способ оплаты</small>
                      </div>
                      <div class="info-value">
                        {{ selectedOrder.payment_method_name }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Состав заказа -->
              <div class="col-md-6">
                <div class="p-4">
                  <h6 class="text-primary mb-3 fw-bold">
                    <i class="bi bi-list-ul me-2"></i>
                    Состав заказа
                    <span v-if="selectedOrder.items?.length" class="badge bg-light text-dark ms-2">
                      {{ selectedOrder.items.length }} позиций
                    </span>
                  </h6>
                  
                  <div v-if="selectedOrder.items?.length" class="order-items">
                    <div 
                      v-for="item in selectedOrder.items" 
                      :key="item.id"
                      class="order-item-card mb-3"
                    >
                      <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                          <h6 class="mb-1">{{ item.dish_name }}</h6>
                          <div class="d-flex align-items-center text-muted small">
                            <span class="quantity-badge me-2">{{ item.quantity }} шт.</span>
                            <span>× {{ formatMoney(item.unit_price) }}</span>
                          </div>
                          <div v-if="item.notes" class="item-notes mt-1">
                            <small class="text-muted">
                              <i class="bi bi-chat-dots me-1"></i>
                              {{ item.notes }}
                            </small>
                          </div>
                        </div>
                        <div class="text-end">
                          <div class="item-total fw-bold">
                            {{ formatMoney(item.total_price) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Итоговые суммы -->
                    <div class="order-totals mt-4 pt-3 border-top">
                      <div class="d-flex justify-content-between fw-bold fs-5 text-success">
                        <span>Итого:</span>
                        <span>{{ formatMoney(selectedOrder.total_price) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="text-center py-4">
                    <i class="bi bi-basket text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mt-2 mb-0">Состав заказа не загружен</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer bg-light border-0">
            <button type="button" class="btn btn-outline-secondary" @click="showViewModal = false">
              <i class="bi bi-x-circle me-1"></i>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно оплаты -->
    <div class="modal fade" :class="{ show: showPaymentModal }" tabindex="-1" :style="{ display: showPaymentModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content" v-if="selectedOrder">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-credit-card me-2"></i>
              Оплата заказа #{{ selectedOrder.id }}
            </h5>
            <button type="button" class="btn-close" @click="showPaymentModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted">Функция оплаты заказов будет доступна в следующих версиях системы.</p>
            <p><strong>Сумма к оплате:</strong> {{ formatMoney(selectedOrder.total_price) }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showPaymentModal = false">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop для модальных окон -->
    <div 
      v-if="showCreateModal || showViewModal || showPaymentModal" 
      class="modal-backdrop fade show"
      @click="closeAllModals"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiService, type Order, type OrderStats } from '@/services/api'
import { formatMoney, formatDateTime } from '@/utils/format'

const router = useRouter()

// Состояние компонента
const loading = ref(false)
const orders = ref<Order[]>([])
const stats = ref<OrderStats>({
  total_orders: 0,
  pending_orders: 0,
  completed_orders: 0,
  cancelled_orders: 0,
  total_revenue: 0,
  average_order_value: 0,
  orders_by_status: {},
  orders_by_type: {}
})

// Пагинация
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(20)

// Фильтры
const statusFilter = ref('')
const typeFilter = ref('')

// Модальные окна
const showCreateModal = ref(false)
const showViewModal = ref(false)
const showPaymentModal = ref(false)
const selectedOrder = ref<Order | null>(null)

// Вычисляемые свойства
const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push(-1) // ellipsis
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1) // ellipsis
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push(-1) // ellipsis
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push(-1) // ellipsis
      pages.push(total)
    }
  }
  
  return pages
})

// Методы
const loadOrders = async (page: number = 1) => {
  try {
    loading.value = true
    
    const response = await apiService.getOrders(
      page,
      perPage.value,
      statusFilter.value || undefined,
      typeFilter.value || undefined
    )
    
    orders.value = response.orders
    currentPage.value = response.page
    totalPages.value = Math.ceil(response.total / response.per_page)
  } catch (error) {
    console.error('Failed to load orders:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const data = await apiService.getOrdersStats()
    stats.value = data
  } catch (error) {
    console.error('Failed to load orders stats:', error)
  }
}

const viewOrder = async (order: Order) => {
  try {
    // Загружаем полную информацию о заказе
    selectedOrder.value = await apiService.getOrder(order.id)
    showViewModal.value = true
  } catch (error) {
    console.error('Failed to load order details:', error)
    selectedOrder.value = order
    showViewModal.value = true
  }
}

const updateOrderStatus = async (order: Order, status: Order['status']) => {
  try {
    await apiService.updateOrderStatus(order.id, { status })
    
    // Обновляем заказ в списке
    const index = orders.value.findIndex(o => o.id === order.id)
    if (index !== -1) {
      orders.value[index].status = status
    }
    
    // Обновляем статистику
    await loadStats()
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}

const deleteOrder = async (order: Order) => {
  if (!confirm(`Вы уверены, что хотите удалить заказ #${order.id}?`)) {
    return
  }
  
  try {
    await apiService.deleteOrder(order.id)
    
    // Удаляем заказ из списка
    const index = orders.value.findIndex(o => o.id === order.id)
    if (index !== -1) {
      orders.value.splice(index, 1)
    }
    
    // Обновляем статистику
    await loadStats()
  } catch (error) {
    console.error('Failed to delete order:', error)
  }
}

const showPayment = (order: Order) => {
  selectedOrder.value = order
  showPaymentModal.value = true
}

const closeAllModals = () => {
  showCreateModal.value = false
  showViewModal.value = false
  showPaymentModal.value = false
  selectedOrder.value = null
}

// Вспомогательные методы для отображения
const getOrderRowClass = (order: Order) => {
  const classes = []
  const normalizedStatus = order.status?.toLowerCase()
  
  if (normalizedStatus === 'cancelled') {
    classes.push('table-danger')
  } else if (normalizedStatus === 'completed') {
    classes.push('table-success')
  } else if (normalizedStatus === 'pending') {
    classes.push('table-warning')
  }
  
  return classes.join(' ')
}

const getOrderTypeBadgeClass = (type: Order['order_type']) => {
  const normalizedType = type?.toLowerCase() as Order['order_type']
  const classes = {
    'dine_in': 'bg-primary',
    'takeaway': 'bg-info',
    'delivery': 'bg-warning'
  }
  return classes[normalizedType] || 'bg-secondary'
}

const getOrderTypeText = (type: Order['order_type']) => {
  const normalizedType = type?.toLowerCase() as Order['order_type']
  const texts = {
    'dine_in': 'В зале',
    'takeaway': 'На вынос', 
    'delivery': 'Доставка'
  }
  return texts[normalizedType] || `Неизвестный тип: ${type}`
}

const getOrderTypeIcon = (type: Order['order_type']) => {
  const normalizedType = type?.toLowerCase() as Order['order_type']
  const icons = {
    'dine_in': 'bi-house',
    'takeaway': 'bi-bag',
    'delivery': 'bi-truck'
  }
  return icons[normalizedType] || 'bi-question-circle'
}

const getStatusBadgeClass = (status: Order['status']) => {
  const normalizedStatus = status?.toLowerCase() as Order['status']
  const classes = {
    'pending': 'bg-warning text-dark',
    'ready': 'bg-info',
    'served': 'bg-primary',
    'dining': 'bg-secondary',
    'completed': 'bg-success',
    'cancelled': 'bg-danger'
  }
  return classes[normalizedStatus] || 'bg-secondary'
}

const getStatusText = (status: Order['status']) => {
  const normalizedStatus = status?.toLowerCase() as Order['status']
  const texts = {
    'pending': 'В обработке',
    'ready': 'Готов',
    'served': 'Подан',
    'dining': 'За столом',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  }
  return texts[normalizedStatus] || `Неизвестный статус: ${status}`
}

const getPaymentStatusBadgeClass = (status: Order['payment_status']) => {
  const normalizedStatus = status?.toLowerCase() as Order['payment_status']
  const classes = {
    'unpaid': 'bg-warning text-dark',
    'paid': 'bg-success',
    'refunded': 'bg-danger'
  }
  return classes[normalizedStatus] || 'bg-secondary'
}

const getPaymentStatusText = (status: Order['payment_status']) => {
  const normalizedStatus = status?.toLowerCase() as Order['payment_status']
  const texts = {
    'unpaid': 'Не оплачен',
    'paid': 'Оплачен',
    'refunded': 'Возврат'
  }
  return texts[normalizedStatus] || `Неизвестный статус оплаты: ${status}`
}

// Инициализация
onMounted(async () => {
  await Promise.all([
    loadOrders(),
    loadStats()
  ])
})
</script>

<style scoped lang="scss">
@use '@/styles/views/orders-management';

.orders-page {
  min-height: 100vh;
  background: var(--qres-gradient-primary);
  position: relative;
  padding-bottom: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }

  .container-fluid {
    position: relative;
    z-index: 1;
  }
}

.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}

.modal {
  &.show {
    display: block !important;
  }
}

.dropdown-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
}

.page-link {
  color: #6c757d;
  
  &:hover {
    color: #495057;
  }
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

// Стили для модального окна заказа
.order-modal {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  .modal-header {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #ff4757 100%);
    padding: 1.5rem;
    border: none;

    .order-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
    }
  }

  .order-status-bar {
    background: #f8f9fa;
    
    .status-item {
      text-align: center;
      
      @media (max-width: 768px) {
        text-align: left;
        margin-bottom: 1rem;
      }
    }

    .total-amount {
      h4 {
        font-size: 1.75rem;
      }
    }
  }

  .order-info-grid {
    .info-item {
      .info-label {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        
        small {
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .info-value {
        font-weight: 500;
        color: #495057;
      }
    }
  }

  .order-items {
    max-height: 400px;
    overflow-y: auto;
    
    .order-item-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid #e9ecef;
      transition: all 0.2s ease;

      &:hover {
        background: #e9ecef;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      h6 {
        color: #495057;
        font-weight: 600;
      }

      .quantity-badge {
        background: #667eea;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .item-total {
        color: #28a745;
        font-size: 1.1rem;
      }

      .item-notes {
        background: rgba(255, 193, 7, 0.1);
        border-left: 3px solid #ffc107;
        padding: 0.5rem;
        margin-top: 0.5rem;
        border-radius: 0 6px 6px 0;
      }
    }
  }

  .order-totals {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1rem;

    .d-flex {
      &:last-child {
        border-top: 2px solid #28a745;
        padding-top: 0.75rem;
        margin-top: 0.75rem;
      }
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .order-modal {
    .modal-dialog {
      margin: 0.5rem;
    }

    .order-status-bar {
      .row > .col-md-4 {
        margin-bottom: 1rem;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .row.g-0 > .col-md-6 {
      &.border-end {
        border-right: none !important;
        border-bottom: 1px solid #dee2e6;
      }
    }
  }
}
</style>
