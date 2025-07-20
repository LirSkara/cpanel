<template>
  <div class="analytics-page">
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
              <li class="breadcrumb-item active text-muted" aria-current="page">Аналитика</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-graph-up me-2 text-primary"></i>
                Аналитика
              </h1>
              <p class="text-muted mb-0">
                Статистика и аналитика работы ресторана за сегодня
              </p>
            </div>
            <div class="col-md-4 text-end">
              <div class="btn-group">
                <button 
                  @click="loadAllStats()" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  {{ loading ? 'Загрузка...' : 'Обновить' }}
                </button>
                <button 
                  class="btn btn-outline-secondary"
                  :disabled="loading"
                  title="Экспорт отчета"
                >
                  <i class="bi bi-download me-1"></i>
                  Экспорт
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Основное содержимое -->
    <div class="container-fluid">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="text-muted mt-2">Загрузка аналитики...</p>
      </div>

      <div v-else class="row">
        <!-- Основная статистика -->
        <div class="col-12 mb-4">
          <div class="row g-3">
            <!-- Заказы -->
            <div class="col-lg-3 col-md-6">
              <div class="card stats-card border-0 h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <div class="stats-icon bg-primary bg-gradient rounded-3 me-3">
                      <i class="bi bi-receipt text-white"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="card-title text-muted mb-1">Заказы сегодня</h6>
                      <h3 class="mb-0">{{ stats?.orders?.today || 0 }}</h3>
                      <small class="text-success">
                        <i class="bi bi-arrow-up me-1"></i>
                        Всего: {{ stats?.orders?.total || 0 }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Выручка -->
            <div class="col-lg-3 col-md-6">
              <div class="card stats-card border-0 h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <div class="stats-icon bg-success bg-gradient rounded-3 me-3">
                      <i class="bi bi-currency-dollar text-white"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="card-title text-muted mb-1">Выручка сегодня</h6>
                      <h3 class="mb-0">{{ formatMoney(stats?.orders?.revenue_today || 0) }}</h3>
                      <small class="text-info">
                        Средний чек: {{ formatMoney(stats?.orders?.average_order_value || 0) }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Столики -->
            <div class="col-lg-3 col-md-6">
              <div class="card stats-card border-0 h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <div class="stats-icon bg-warning bg-gradient rounded-3 me-3">
                      <i class="bi bi-table text-white"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="card-title text-muted mb-1">Занятые столики</h6>
                      <h3 class="mb-0">{{ stats?.tables?.occupied || 0 }}/{{ stats?.tables?.total || 0 }}</h3>
                      <small class="text-warning">
                        Оборачиваемость: {{ (stats?.performance?.table_turnover_rate || 0).toFixed(1) }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Персонал -->
            <div class="col-lg-3 col-md-6">
              <div class="card stats-card border-0 h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center">
                    <div class="stats-icon bg-info bg-gradient rounded-3 me-3">
                      <i class="bi bi-people text-white"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="card-title text-muted mb-1">Активный персонал</h6>
                      <h3 class="mb-0">{{ (stats?.users?.active_waiters || 0) + (stats?.users?.active_kitchen || 0) }}</h3>
                      <small class="text-info">
                        Официанты: {{ stats?.users?.active_waiters || 0 }} | Кухня: {{ stats?.users?.active_kitchen || 0 }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Графики и подробная статистика -->
        <div class="col-lg-8 mb-4">
          <div class="card border-0 h-100">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-graph-up me-2"></i>
                Продажи по часам
              </h5>
            </div>
            <div class="card-body">
              <div v-if="stats?.sales_by_hour?.length" class="chart-container">
                <canvas ref="salesChart" width="800" height="300"></canvas>
              </div>
              <div v-else class="text-center py-4">
                <i class="bi bi-graph-up text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted mt-2">Данные о продажах отсутствуют</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Топ блюда -->
        <div class="col-lg-4 mb-4">
          <div class="card border-0 h-100">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-star me-2"></i>
                Популярные блюда
              </h5>
            </div>
            <div class="card-body">
              <div v-if="stats?.top_dishes?.length" class="top-dishes-list">
                <div 
                  v-for="(dish, index) in stats.top_dishes.slice(0, 5)" 
                  :key="dish.dish_id"
                  class="top-dish-item d-flex align-items-center mb-3"
                >
                  <div class="dish-rank me-3">
                    <span class="badge" :class="getRankBadgeClass(index)">{{ index + 1 }}</span>
                  </div>
                  <div class="flex-grow-1">
                    <h6 class="mb-1">{{ dish.dish_name }}</h6>
                    <small class="text-muted">{{ dish.orders_count }} заказов</small>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold text-success">{{ formatMoney(dish.revenue) }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="bi bi-star text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted mt-2">Данные о популярных блюдах отсутствуют</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Статистика заказов -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 h-100">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-pie-chart me-2"></i>
                Статистика заказов
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-6">
                  <div class="stat-item text-center">
                    <div class="stat-value text-warning">{{ stats?.orders?.pending || 0 }}</div>
                    <div class="stat-label">В обработке</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-item text-center">
                    <div class="stat-value text-success">{{ stats?.orders?.completed || 0 }}</div>
                    <div class="stat-label">Завершенных</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-item text-center">
                    <div class="stat-value text-danger">{{ stats?.orders?.cancelled || 0 }}</div>
                    <div class="stat-label">Отмененных</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="stat-item text-center">
                    <div class="stat-value text-info">{{ stats?.dishes?.available || 0 }}</div>
                    <div class="stat-label">Доступно блюд</div>
                  </div>
                </div>
              </div>

              <!-- Типы заказов -->
              <div class="mt-4">
                <h6 class="text-muted mb-3">Типы заказов</h6>
                <div class="order-types">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span><i class="bi bi-house me-2"></i>В зале</span>
                    <span class="fw-bold">{{ stats?.orders_by_type?.dine_in || 0 }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span><i class="bi bi-bag me-2"></i>На вынос</span>
                    <span class="fw-bold">{{ stats?.orders_by_type?.takeaway || 0 }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-truck me-2"></i>Доставка</span>
                    <span class="fw-bold">{{ stats?.orders_by_type?.delivery || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Производительность -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 h-100">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-speedometer2 me-2"></i>
                Производительность
              </h5>
            </div>
            <div class="card-body">
              <div class="performance-metrics">
                <div class="metric-item mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">Среднее время приготовления</span>
                    <span class="fw-bold">{{ stats?.performance?.average_cooking_time || 0 }} мин</span>
                  </div>
                  <div class="progress mt-1" style="height: 4px;">
                    <div class="progress-bar bg-primary" style="width: 75%"></div>
                  </div>
                </div>

                <div class="metric-item mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">Среднее время обслуживания</span>
                    <span class="fw-bold">{{ stats?.performance?.average_service_time || 0 }} мин</span>
                  </div>
                  <div class="progress mt-1" style="height: 4px;">
                    <div class="progress-bar bg-success" style="width: 60%"></div>
                  </div>
                </div>

                <div class="metric-item mb-4">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">Оборачиваемость столов</span>
                    <span class="fw-bold">{{ (stats?.performance?.table_turnover_rate || 0).toFixed(1) }}</span>
                  </div>
                  <div class="progress mt-1" style="height: 4px;">
                    <div class="progress-bar bg-warning" style="width: 45%"></div>
                  </div>
                </div>

                <!-- Пиковые часы -->
                <div v-if="stats?.performance?.peak_hours?.length">
                  <h6 class="text-muted mb-2">Пиковые часы</h6>
                  <div class="peak-hours">
                    <span 
                      v-for="hour in stats.performance.peak_hours" 
                      :key="hour"
                      class="badge bg-light text-dark me-1 mb-1"
                    >
                      {{ hour }}:00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Способы оплаты -->
        <div class="col-12 mb-4">
          <div class="card border-0">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-credit-card me-2"></i>
                Способы оплаты
              </h5>
            </div>
            <div class="card-body">
              <div v-if="stats?.payment_methods?.length" class="row g-3">
                <div 
                  v-for="method in stats.payment_methods" 
                  :key="method.method_name"
                  class="col-lg-3 col-md-6"
                >
                  <div class="payment-method-card">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">{{ method.method_name }}</h6>
                        <small class="text-muted">{{ method.orders_count }} заказов</small>
                      </div>
                      <div class="text-end">
                        <div class="fw-bold text-success">{{ formatMoney(method.revenue) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="bi bi-credit-card text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted mt-2">Данные о способах оплаты отсутствуют</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { apiService, type DashboardStats } from '@/services/api'
import { formatMoney } from '@/utils/format'

const router = useRouter()

// Состояние компонента
const loading = ref(false)
const stats = ref<DashboardStats | null>(null)
const salesChart = ref<HTMLCanvasElement>()

// Методы
const loadAllStats = async () => {
  try {
    loading.value = true
    const data = await apiService.getDashboardStats()
    stats.value = data
    
    // Создаем график после обновления DOM
    await nextTick()
    createSalesChart()
  } catch (error) {
    console.error('Failed to load analytics:', error)
  } finally {
    loading.value = false
  }
}

const createSalesChart = () => {
  if (!salesChart.value || !stats.value?.sales_by_hour?.length) return

  const ctx = salesChart.value.getContext('2d')
  if (!ctx) return

  // Очищаем canvas
  ctx.clearRect(0, 0, salesChart.value.width, salesChart.value.height)

  const data = stats.value.sales_by_hour
  const width = salesChart.value.width
  const height = salesChart.value.height
  const padding = 60

  // Настройки графика
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Находим максимальные значения
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const maxOrders = Math.max(...data.map(d => d.orders_count))

  // Рисуем оси
  ctx.strokeStyle = '#e9ecef'
  ctx.lineWidth = 1

  // Горизонтальные линии
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Вертикальные линии
  const stepX = chartWidth / (data.length - 1)
  for (let i = 0; i < data.length; i++) {
    const x = padding + stepX * i
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
  }

  // Рисуем линию выручки
  ctx.strokeStyle = '#28a745'
  ctx.lineWidth = 3
  ctx.beginPath()

  data.forEach((point, index) => {
    const x = padding + stepX * index
    const y = height - padding - (point.revenue / maxRevenue) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Рисуем точки
  data.forEach((point, index) => {
    const x = padding + stepX * index
    const y = height - padding - (point.revenue / maxRevenue) * chartHeight
    
    ctx.fillStyle = '#28a745'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })

  // Подписи по оси X (часы)
  ctx.fillStyle = '#6c757d'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  
  data.forEach((point, index) => {
    const x = padding + stepX * index
    ctx.fillText(`${point.hour}:00`, x, height - padding + 20)
  })

  // Подписи по оси Y (выручка)
  ctx.textAlign = 'right'
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
    const value = maxRevenue - (maxRevenue / 5) * i
    ctx.fillText(formatMoney(value), padding - 10, y + 4)
  }
}

const getRankBadgeClass = (index: number) => {
  const classes = ['bg-warning', 'bg-secondary', 'bg-light text-dark']
  return classes[index] || 'bg-light text-dark'
}

// Инициализация
onMounted(async () => {
  await loadAllStats()
})
</script>

<style scoped lang="scss">
@use '@/styles/views/analytics';

.analytics-page {
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

.stats-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .stats-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }
}

.card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  width: 100%;
  height: 300px;

  canvas {
    border-radius: 8px;
  }
}

.top-dish-item {
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(248, 249, 250, 0.8);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(233, 236, 239, 0.8);
  }

  .dish-rank {
    .badge {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
  }
}

.stat-item {
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6c757d;
    font-weight: 500;
  }
}

.order-types {
  .bi {
    color: #6c757d;
  }
}

.performance-metrics {
  .metric-item {
    .progress {
      border-radius: 2px;
    }
  }
}

.peak-hours {
  .badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}

.payment-method-card {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(248, 249, 250, 0.8);
  border: 1px solid rgba(222, 226, 230, 0.5);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(233, 236, 239, 0.8);
    transform: translateY(-1px);
  }
}

// Адаптивность
@media (max-width: 768px) {
  .analytics-page {
    .container-fluid {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .stats-card {
      margin-bottom: 1rem;
    }

    .chart-container {
      height: 250px;
    }
  }
}
</style>
