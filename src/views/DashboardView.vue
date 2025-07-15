<template>
  <div class="dashboard-page pt-2">
    <!-- Заголовок страницы -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dashboard-title">
            <i class="bi bi-speedometer2"></i>
            Панель управления
          </h1>
          <p class="dashboard-subtitle">
            Система: <span class="badge bg-success">Активна</span> •
            Время: {{ currentTime }} •
            Администратор: {{ authStore.userName }}
          </p>
        </div>
        <div class="header-right">
          <div class="user-info">
            <div class="user-avatar">
              <i class="bi bi-person-circle"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ authStore.userName }}</span>
              <span class="user-role">{{ authStore.userRole }}</span>
            </div>
          </div>
          <button 
            @click="handleLogout"
            class="logout-btn"
            :disabled="isLoggingOut"
          >
            <i class="bi bi-box-arrow-right"></i>
            {{ isLoggingOut ? 'Выход...' : 'Выйти' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="dashboard-main">
      <!-- Быстрые действия -->
      <section class="actions-section">
        <h2 class="section-title">Управление системой</h2>
        <div class="actions-grid">
          <!-- Управление пользователями -->
          <div class="action-card primary">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-people-fill"></i>
              </div>
              <div class="action-badge">
                <span class="badge-count">{{ stats.totalUsers }}</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Пользователи</h3>
              <p class="action-description">Управление сотрудниками и их правами доступа • Всего: {{ stats.totalUsers || 0 }}</p>
              <div class="action-features">
                <span class="feature-tag">Добавить</span>
                <span class="feature-tag">Редактировать</span>
                <span class="feature-tag">Смена пароля</span>
              </div>
            </div>
            <button @click="$router.push('/users')" class="action-btn primary">
              <i class="bi bi-arrow-right"></i>
              Управлять
            </button>
          </div>

          <!-- Управление столиками -->
          <div class="action-card success">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-table"></i>
              </div>
              <div class="action-badge">
                <span class="badge-count">{{ stats.activeTables }}</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Столики</h3>
              <p class="action-description">Настройка столиков и QR-кодов • Активных: {{ stats.activeTables || 0 }}</p>
              <div class="action-features">
                <span class="feature-tag">Добавить</span>
                <span class="feature-tag">Статус</span>
                <span class="feature-tag">QR-коды</span>
              </div>
            </div>
            <button class="action-btn success">
              <i class="bi bi-arrow-right"></i>
              Управлять
            </button>
          </div>

          <!-- Управление локациями -->
          <div class="action-card info">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-geo-alt-fill"></i>
              </div>
              <div class="action-badge">
                <span class="badge-count">{{ stats.totalLocations || 0 }}</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Локации</h3>
              <p class="action-description">Управление зонами и расположением столиков</p>
              <div class="action-features">
                <span class="feature-tag">Создать</span>
                <span class="feature-tag">Редактировать</span>
                <span class="feature-tag">Столики</span>
              </div>
            </div>
            <button class="action-btn info">
              <i class="bi bi-arrow-right"></i>
              Управлять
            </button>
          </div>

          <!-- Управление категориями -->
          <div class="action-card warning">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-grid-3x3-gap-fill"></i>
              </div>
              <div class="action-badge">
                <span class="badge-count">{{ stats.totalCategories || 0 }}</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Категории</h3>
              <p class="action-description">Создание и настройка категорий меню</p>
              <div class="action-features">
                <span class="feature-tag">Добавить</span>
                <span class="feature-tag">Редактировать</span>
                <span class="feature-tag">Сортировка</span>
              </div>
            </div>
            <button class="action-btn warning">
              <i class="bi bi-arrow-right"></i>
              Управлять
            </button>
          </div>

          <!-- Управление блюдами -->
          <div class="action-card danger">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-cup-hot-fill"></i>
              </div>
              <div class="action-badge">
                <span class="badge-count">{{ stats.totalDishes || 0 }}</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Блюда</h3>
              <p class="action-description">Управление меню, вариациями и доступностью</p>
              <div class="action-features">
                <span class="feature-tag">Добавить</span>
                <span class="feature-tag">Вариации</span>
                <span class="feature-tag">Доступность</span>
              </div>
            </div>
            <button class="action-btn danger">
              <i class="bi bi-arrow-right"></i>
              Управлять
            </button>
          </div>

          <!-- Управление заказами -->
          <div class="action-card secondary">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-receipt-cutoff"></i>
              </div>
              <div class="action-badge">
                <span class="badge-count">{{ stats.totalOrders }}</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Заказы</h3>
              <p class="action-description">Просмотр и управление заказами • Выручка: {{ formatMoney(stats.totalRevenue || 0) }}</p>
              <div class="action-features">
                <span class="feature-tag">Статус</span>
                <span class="feature-tag">Оплата</span>
                <span class="feature-tag">Отмена</span>
              </div>
            </div>
            <button class="action-btn secondary">
              <i class="bi bi-arrow-right"></i>
              Управлять
            </button>
          </div>

          <!-- Управление ингредиентами -->
          <div class="action-card success">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-leaf-fill"></i>
              </div>
              <div class="action-badge">
                <span class="badge-count">{{ stats.totalIngredients || 0 }}</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Ингредиенты</h3>
              <p class="action-description">Управление ингредиентами и аллергенами</p>
              <div class="action-features">
                <span class="feature-tag">Добавить</span>
                <span class="feature-tag">Аллергены</span>
                <span class="feature-tag">Состав</span>
              </div>
            </div>
            <button class="action-btn success">
              <i class="bi bi-arrow-right"></i>
              Управлять
            </button>
          </div>

          <!-- Способы оплаты -->
          <div class="action-card primary">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-credit-card-fill"></i>
              </div>
              <div class="action-badge">
                <span class="badge-count">{{ stats.totalPaymentMethods || 0 }}</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Способы оплаты</h3>
              <p class="action-description">Настройка методов оплаты</p>
              <div class="action-features">
                <span class="feature-tag">Добавить</span>
                <span class="feature-tag">Активность</span>
                <span class="feature-tag">Настройки</span>
              </div>
            </div>
            <button class="action-btn primary">
              <i class="bi bi-arrow-right"></i>
              Управлять
            </button>
          </div>

          <!-- Аналитика и отчеты -->
          <div class="action-card info">
            <div class="action-header">
              <div class="action-icon">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <div class="action-badge">
                <span class="badge-text">NEW</span>
              </div>
            </div>
            <div class="action-content">
              <h3 class="action-title">Аналитика</h3>
              <p class="action-description">Отчеты, статистика и аналитические данные • Заказов: {{ stats.totalOrders || 0 }}</p>
              <div class="action-features">
                <span class="feature-tag">Отчеты</span>
                <span class="feature-tag">Статистика</span>
                <span class="feature-tag">Графики</span>
              </div>
            </div>
            <button class="action-btn info">
              <i class="bi bi-arrow-right"></i>
              Просмотреть
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { formatMoney } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()

// Состояние компонента
const isLoggingOut = ref(false)
const currentTime = ref(new Date().toLocaleTimeString('ru-RU'))
const stats = ref({
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  activeTables: 0,
  totalLocations: 0,
  totalCategories: 0,
  totalDishes: 0,
  totalIngredients: 0,
  totalPaymentMethods: 0
})

// Обновление времени
let timeInterval: number

// Выход из системы
const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    isLoggingOut.value = false
  }
}

// Загрузка статистики
const loadStats = async () => {
  try {
    const data = await apiService.getDashboardStats()
    stats.value = data
  } catch (error) {
    console.error('Failed to load stats:', error)
    // Оставляем нулевые значения в случае ошибки
    stats.value = {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      activeTables: 0,
      totalLocations: 0,
      totalCategories: 0,
      totalDishes: 0,
      totalIngredients: 0,
      totalPaymentMethods: 0
    }
  }
}

// Инициализация
onMounted(async () => {
  // Проверяем авторизацию
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Запускаем таймер для обновления времени
  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('ru-RU')
  }, 1000)

  // Загружаем статистику
  await loadStats()
})

// Очистка при размонтировании
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/views/dashboard';
</style>
