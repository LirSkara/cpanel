import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

// Расширяем типы для meta
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: 'Вход в систему',
        requiresAuth: false
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: 'Панель управления',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersManagementView.vue'),
      meta: {
        title: 'Управление пользователями',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/tables',
      name: 'tables',
      component: () => import('@/views/TablesManagementView.vue'),
      meta: {
        title: 'Управление столиками',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/locations',
      name: 'locations',
      component: () => import('@/views/LocationsManagementView.vue'),
      meta: {
        title: 'Управление локациями',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoriesManagementView.vue'),
      meta: {
        title: 'Управление категориями',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/dishes',
      name: 'dishes',
      component: () => import('@/views/DishesManagementView.vue'),
      meta: {
        title: 'Управление блюдами',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/ingredients',
      name: 'ingredients',
      component: () => import('@/views/IngredientsManagementView.vue'),
      meta: {
        title: 'Управление ингредиентами',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/template',
      name: 'template',
      component: () => import('@/views/TemplatePageView.vue'),
      meta: {
        title: 'Шаблонная страница',
        requiresAuth: true,
        requiresAdmin: true
      }
    }
  ]
})

// Глобальный guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Устанавливаем заголовок страницы
  document.title = to.meta.title ? `${to.meta.title} - QRes OS 4` : 'QRes OS 4'
  
  // Проверяем требования авторизации
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Перенаправляем на страницу входа
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    // Проверяем валидность токена
    const isValid = await authStore.validateToken()
    if (!isValid) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    // Проверяем права админа, если требуется
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      console.error('Access denied: Admin role required')
      // Можно создать страницу с ошибкой 403 или перенаправить на login
      next({ name: 'login', query: { error: 'admin_required' } })
      return
    }
  }
  
  // Если пользователь авторизован и идет на страницу входа, перенаправляем на dashboard
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

export default router
