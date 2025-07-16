<template>
  <div class="categories-page">
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
              <li class="breadcrumb-item active text-muted" aria-current="page">Управление категориями</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-grid-3x3-gap me-2 text-primary"></i>
                Управление категориями
              </h1>
              <p class="text-muted mb-0">
                Всего категорий: <span class="badge bg-primary">{{ Array.isArray(categories) ? categories.length : 0 }}</span>
                • Активных: <span class="badge bg-success">{{ activeCategoriesCount }}</span>
                • Неактивных: <span class="badge bg-warning">{{ inactiveCategoriesCount }}</span>
                • Рекомендуемых: <span class="badge bg-info">{{ featuredCategoriesCount }}</span>
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
                  Добавить категорию
                </button>
                <button 
                  @click="sortCategories" 
                  class="btn btn-outline-secondary"
                  :disabled="loading || sortingCategories"
                  :title="'Пересортировать категории'"
                >
                  <i class="bi bi-arrow-up-down me-1"></i>
                  {{ sortingCategories ? 'Сортировка...' : 'Сортировать' }}
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
        <!-- Список категорий -->
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white">
              <div class="row align-items-center">
                <div class="col-md-4">
                  <h5 class="mb-0">
                    <i class="bi bi-grid-3x3-gap me-2"></i>
                    Список категорий
                  </h5>
                </div>
                <div class="col-md-8">
                  <div class="d-flex gap-2 align-items-center">
                    <!-- Массовые действия -->
                    <div v-if="selectedCategories.length > 0" class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-primary"
                        @click="bulkActivate"
                        :title="`Активировать ${selectedCategories.length} категорий`"
                      >
                        <i class="bi bi-check-circle me-1"></i>
                        Активировать ({{ selectedCategories.length }})
                      </button>
                      <button 
                        class="btn btn-outline-secondary"
                        @click="bulkDeactivate"
                        :title="`Деактивировать ${selectedCategories.length} категорий`"
                      >
                        <i class="bi bi-x-circle me-1"></i>
                        Деактивировать ({{ selectedCategories.length }})
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="bulkDelete"
                        :title="`Удалить ${selectedCategories.length} категорий`"
                      >
                        <i class="bi bi-trash me-1"></i>
                        Удалить ({{ selectedCategories.length }})
                      </button>
                    </div>
                    
                    <!-- Фильтры -->
                    <div class="d-flex gap-2 ms-auto">
                      <select v-model="statusFilter" class="form-select form-select-sm">
                        <option value="">Все статусы</option>
                        <option value="active">Активные</option>
                        <option value="inactive">Неактивные</option>
                      </select>
                      <select v-model="featuredFilter" class="form-select form-select-sm">
                        <option value="">Все</option>
                        <option value="featured">Рекомендуемые</option>
                        <option value="not-featured">Обычные</option>
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
                <p class="text-muted mt-2">Загрузка категорий...</p>
              </div>
              
              <div v-else-if="!Array.isArray(categories) || categories.length === 0" class="text-center py-5">
                <i class="bi bi-grid-3x3-gap text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">Категории не найдены</p>
                <button @click="showCreateModal = true" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-1"></i>
                  Добавить первую категорию
                </button>
              </div>
              
              <div v-else class="row">
                <div v-for="category in filteredCategories" :key="category.id" class="col-lg-4 col-md-6 mb-3">
                  <div class="card border-0 shadow-sm category-card" :class="getCategoryCardClass(category)">
                    <!-- Компактный заголовок -->
                    <div class="card-header d-flex justify-content-between align-items-center py-2">
                      <div class="d-flex align-items-center">
                        <div class="form-check me-2">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            :id="`category-${category.id}`"
                            v-model="selectedCategories"
                            :value="category.id"
                          >
                        </div>
                        <div 
                          class="category-color-indicator me-2"
                          :style="{ backgroundColor: category.color || '#6c757d' }"
                        ></div>
                        <strong class="fs-6">{{ category.name }}</strong>
                      </div>
                      <div class="d-flex gap-1">
                        <span v-if="category.featured" class="badge bg-warning text-dark badge-sm">
                          <i class="bi bi-star-fill"></i>
                        </span>
                        <span class="badge badge-sm" :class="getStatusBadgeClass(category.is_active)">
                          {{ category.is_active ? 'Активна' : 'Неактивна' }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Компактная информация -->
                    <div class="card-body py-2">
                      <div v-if="category.description" class="row g-2 mb-2">
                        <div class="col-12">
                          <small class="text-muted text-truncate d-block">{{ category.description }}</small>
                        </div>
                      </div>
                      
                      <div class="row g-2 mb-2">
                        <div class="col-6">
                          <div class="info-item-compact">
                            <i class="bi bi-cup-hot text-primary me-1"></i>
                            <span class="fw-bold">{{ getCategoryDishesCount(category.id) }}</span>
                            <small class="text-muted ms-1">блюд</small>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="info-item-compact">
                            <i class="bi bi-sort-numeric-down text-info me-1"></i>
                            <small class="text-muted">Порядок: {{ category.sort_order }}</small>
                          </div>
                        </div>
                      </div>
                      
                      <div class="row g-2 mb-2">
                        <div class="col-12">
                          <div class="info-item-compact">
                            <i class="bi bi-clock text-info me-1"></i>
                            <small class="text-truncate">{{ formatDate(category.updated_at) }}</small>
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
                          @click="viewCategoryDishes(category)"
                          :title="'Просмотреть блюда категории ' + category.name"
                        >
                          <i class="bi bi-cup-hot"></i>
                        </button>
                        
                        <button 
                          class="btn btn-sm btn-outline-secondary flex-fill"
                          @click="editCategory(category)"
                          :title="'Редактировать категорию ' + category.name"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        
                        <button 
                          class="btn btn-sm flex-fill"
                          :class="category.is_active ? 'btn-outline-warning' : 'btn-outline-success'"
                          @click="toggleCategoryStatus(category)"
                          :title="category.is_active ? 'Деактивировать категорию' : 'Активировать категорию'"
                        >
                          <i class="bi" :class="category.is_active ? 'bi-toggle-off' : 'bi-toggle-on'"></i>
                        </button>
                        
                        <button 
                          class="btn btn-sm flex-fill"
                          :class="category.featured ? 'btn-warning' : 'btn-outline-warning'"
                          @click="toggleCategoryFeatured(category)"
                          :title="category.featured ? 'Убрать из рекомендуемых' : 'Добавить в рекомендуемые'"
                        >
                          <i class="bi bi-star"></i>
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
                              <a class="dropdown-item" href="#" @click="changeCategoryOrder(category, 'up')">
                                <i class="bi bi-arrow-up me-2"></i>
                                Переместить вверх
                              </a>
                            </li>
                            <li>
                              <a class="dropdown-item" href="#" @click="changeCategoryOrder(category, 'down')">
                                <i class="bi bi-arrow-down me-2"></i>
                                Переместить вниз
                              </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                              <a class="dropdown-item text-danger" href="#" @click="deleteCategory(category)">
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

    <!-- Модальное окно создания категории -->
    <div v-if="showCreateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeCreateModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Добавить категорию
            </h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="validationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ validationErrors }}</pre>
            </div>
            
            <form @submit.prevent="createCategory">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Название категории</label>
                  <input 
                    v-model="newCategory.name" 
                    type="text" 
                    class="form-control"
                    required
                    placeholder="Горячие блюда"
                  >
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Цвет</label>
                  <input 
                    v-model="newCategory.color" 
                    type="color" 
                    class="form-control form-control-color"
                  >
                </div>
                
                <div class="col-12">
                  <label class="form-label">Описание</label>
                  <textarea 
                    v-model="newCategory.description" 
                    class="form-control"
                    rows="3"
                    placeholder="Описание категории"
                  ></textarea>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Изображение (URL)</label>
                  <input 
                    v-model="newCategory.image_url" 
                    type="url" 
                    class="form-control"
                    placeholder="https://example.com/image.jpg"
                  >
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Порядок сортировки</label>
                  <input 
                    v-model.number="newCategory.sort_order" 
                    type="number" 
                    class="form-control"
                    min="0"
                    :placeholder="getNextSortOrder()"
                  >
                </div>
                
                <div class="col-12">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <div class="form-check">
                        <input v-model="newCategory.is_active" class="form-check-input" type="checkbox" id="createActive">
                        <label class="form-check-label" for="createActive">
                          Активна
                        </label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-check">
                        <input v-model="newCategory.featured" class="form-check-input" type="checkbox" id="createFeatured">
                        <label class="form-check-label" for="createFeatured">
                          Рекомендуемая
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" @click="closeCreateModal" class="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="creatingCategory">
                  <i class="bi bi-plus-circle me-1"></i>
                  {{ creatingCategory ? 'Создание...' : 'Создать' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования категории -->
    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeEditModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Редактировать категорию
            </h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          
          <div class="modal-body">
            <!-- Блок для отображения ошибок валидации -->
            <div v-if="editValidationErrors" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ editValidationErrors }}</pre>
            </div>
            
            <form @submit.prevent="updateCategory">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Название категории</label>
                  <input 
                    v-model="editingCategory.name" 
                    type="text" 
                    class="form-control"
                    required
                  >
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Цвет</label>
                  <input 
                    v-model="editingCategory.color" 
                    type="color" 
                    class="form-control form-control-color"
                  >
                </div>
                
                <div class="col-12">
                  <label class="form-label">Описание</label>
                  <textarea 
                    v-model="editingCategory.description" 
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Изображение (URL)</label>
                  <input 
                    v-model="editingCategory.image_url" 
                    type="url" 
                    class="form-control"
                  >
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Порядок сортировки</label>
                  <input 
                    v-model.number="editingCategory.sort_order" 
                    type="number" 
                    class="form-control"
                    min="0"
                  >
                </div>
                
                <div class="col-12">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <div class="form-check">
                        <input v-model="editingCategory.is_active" class="form-check-input" type="checkbox" id="editActive">
                        <label class="form-check-label" for="editActive">
                          Активна
                        </label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-check">
                        <input v-model="editingCategory.featured" class="form-check-input" type="checkbox" id="editFeatured">
                        <label class="form-check-label" for="editFeatured">
                          Рекомендуемая
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" @click="closeEditModal" class="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary" :disabled="updatingCategory">
                  <i class="bi bi-check-circle me-1"></i>
                  {{ updatingCategory ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра блюд категории -->
    <div v-if="showDishesModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click="closeDishesModal">
      <div class="modal-dialog modal-dialog-centered modal-xl" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-cup-hot me-2"></i>
              Блюда категории "{{ selectedCategory?.name }}"
            </h5>
            <button type="button" class="btn-close" @click="closeDishesModal"></button>
          </div>
          
          <div class="modal-body">
            <div v-if="loadingDishes" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка блюд...</span>
              </div>
            </div>
            
            <div v-else-if="categoryDishes.length === 0" class="text-center py-4">
              <i class="bi bi-cup-hot text-muted" style="font-size: 2rem;"></i>
              <p class="text-muted mt-2">В данной категории нет блюд</p>
            </div>
            
            <div v-else class="row">
              <div v-for="dish in categoryDishes" :key="dish.id" class="col-md-4 mb-3">
                <div class="card border-0 shadow-sm">
                  <div v-if="dish.main_image_url" class="card-img-top-container">
                    <img :src="dish.main_image_url" class="card-img-top dish-image" :alt="dish.name">
                  </div>
                  <div class="card-body py-2">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <strong class="fs-6">{{ dish.name }}</strong>
                        <div v-if="dish.description" class="text-muted small text-truncate">{{ dish.description }}</div>
                      </div>
                      <span class="badge ms-2" :class="dish.is_available ? 'bg-success' : 'bg-secondary'">
                        {{ dish.is_available ? 'Доступно' : 'Недоступно' }}
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
import type { Category, CreateCategoryData, UpdateCategoryData, CategoryDish } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// Состояние компонента
const categories = ref<Category[]>([])
const categoryDishes = ref<CategoryDish[]>([])
const loading = ref(false)
const loadingDishes = ref(false)
const sortingCategories = ref(false)

// Фильтры
const statusFilter = ref('')
const featuredFilter = ref('')

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDishesModal = ref(false)

// Создание категории
const newCategory = ref<CreateCategoryData>({
  name: '',
  description: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
  color: '#007bff',
  featured: false
})
const creatingCategory = ref(false)
const validationErrors = ref<string>('')

// Редактирование категории
const editingCategory = ref<UpdateCategoryData>({})
const editingCategoryId = ref<number | null>(null)
const updatingCategory = ref(false)
const editValidationErrors = ref<string>('')

// Выбранная категория
const selectedCategory = ref<Category | null>(null)

// Массовые операции
const selectedCategories = ref<number[]>([])

// Вычисляемые свойства
const activeCategoriesCount = computed(() => 
  Array.isArray(categories.value) ? categories.value.filter(category => category.is_active).length : 0
)

const inactiveCategoriesCount = computed(() => 
  Array.isArray(categories.value) ? categories.value.filter(category => !category.is_active).length : 0
)

const featuredCategoriesCount = computed(() => 
  Array.isArray(categories.value) ? categories.value.filter(category => category.featured).length : 0
)

const filteredCategories = computed(() => {
  if (!Array.isArray(categories.value)) return []
  
  return categories.value.filter(category => {
    const matchesStatus = !statusFilter.value || 
      (statusFilter.value === 'active' && category.is_active) ||
      (statusFilter.value === 'inactive' && !category.is_active)
    
    const matchesFeatured = !featuredFilter.value ||
      (featuredFilter.value === 'featured' && category.featured) ||
      (featuredFilter.value === 'not-featured' && !category.featured)
    
    return matchesStatus && matchesFeatured
  }).sort((a, b) => a.sort_order - b.sort_order)
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

const getCategoryCardClass = (category: Category) => {
  return category.is_active ? 'category-active' : 'category-inactive'
}

const getCategoryDishesCount = (categoryId: number) => {
  // Здесь можно добавить логику подсчета блюд для категории
  // Пока возвращаем 0, так как у нас нет полной информации о блюдах
  return 0
}

const getNextSortOrder = () => {
  if (!Array.isArray(categories.value) || categories.value.length === 0) return '1'
  const maxOrder = Math.max(...categories.value.map(c => c.sort_order))
  return (maxOrder + 1).toString()
}

// Методы
const loadCategories = async () => {
  try {
    loading.value = true
    const result = await apiService.getCategories()
    categories.value = result.categories || result
  } catch (error) {
    console.error('Failed to load categories:', error)
    categories.value = []
  } finally {
    loading.value = false
  }
}

// Создание категории
const closeCreateModal = () => {
  showCreateModal.value = false
  validationErrors.value = ''
  newCategory.value = {
    name: '',
    description: '',
    image_url: '',
    sort_order: 0,
    is_active: true,
    color: '#007bff',
    featured: false
  }
}

const createCategory = async () => {
  try {
    creatingCategory.value = true
    validationErrors.value = ''
    
    // Устанавливаем порядок сортировки, если не указан
    if (!newCategory.value.sort_order) {
      newCategory.value.sort_order = parseInt(getNextSortOrder())
    }
    
    const category = await apiService.createCategory(newCategory.value)
    
    if (Array.isArray(categories.value)) {
      categories.value.push(category)
    } else {
      categories.value = [category]
    }
    
    closeCreateModal()
  } catch (error) {
    console.error('Failed to create category:', error)
    
    if (error instanceof Error) {
      validationErrors.value = error.message
    } else {
      validationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    creatingCategory.value = false
  }
}

// Редактирование категории
const editCategory = (category: Category) => {
  editingCategoryId.value = category.id
  editingCategory.value = {
    name: category.name,
    description: category.description || '',
    image_url: category.image_url || '',
    sort_order: category.sort_order,
    is_active: category.is_active,
    color: category.color || '#007bff',
    featured: category.featured
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editValidationErrors.value = ''
  editingCategory.value = {}
  editingCategoryId.value = null
}

const updateCategory = async () => {
  if (!editingCategoryId.value || !Array.isArray(categories.value)) return
  
  try {
    updatingCategory.value = true
    editValidationErrors.value = ''
    
    const updatedCategory = await apiService.updateCategory(editingCategoryId.value, editingCategory.value)
    
    const index = categories.value.findIndex(c => c.id === editingCategoryId.value)
    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Failed to update category:', error)
    
    if (error instanceof Error) {
      editValidationErrors.value = error.message
    } else {
      editValidationErrors.value = 'Произошла неизвестная ошибка'
    }
  } finally {
    updatingCategory.value = false
  }
}

// Просмотр блюд категории
const viewCategoryDishes = async (category: Category) => {
  selectedCategory.value = category
  showDishesModal.value = true
  
  try {
    loadingDishes.value = true
    const result = await apiService.getCategoryDishes(category.id)
    categoryDishes.value = result.dishes || result
  } catch (error) {
    console.error('Failed to load category dishes:', error)
    categoryDishes.value = []
  } finally {
    loadingDishes.value = false
  }
}

const closeDishesModal = () => {
  showDishesModal.value = false
  selectedCategory.value = null
  categoryDishes.value = []
}

// Дополнительные действия
const toggleCategoryStatus = async (category: Category) => {
  if (!Array.isArray(categories.value)) return
  
  try {
    const newStatus = !category.is_active
    const updatedCategory = await apiService.updateCategory(category.id, { is_active: newStatus })
    
    const index = categories.value.findIndex(c => c.id === category.id)
    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
  } catch (error) {
    console.error('Failed to toggle category status:', error)
  }
}

const toggleCategoryFeatured = async (category: Category) => {
  if (!Array.isArray(categories.value)) return
  
  try {
    const newFeatured = !category.featured
    const updatedCategory = await apiService.updateCategory(category.id, { featured: newFeatured })
    
    const index = categories.value.findIndex(c => c.id === category.id)
    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
  } catch (error) {
    console.error('Failed to toggle category featured:', error)
  }
}

const changeCategoryOrder = async (category: Category, direction: 'up' | 'down') => {
  if (!Array.isArray(categories.value)) return
  
  try {
    const newOrder = direction === 'up' ? category.sort_order - 1 : category.sort_order + 1
    const updatedCategory = await apiService.updateCategory(category.id, { sort_order: newOrder })
    
    const index = categories.value.findIndex(c => c.id === category.id)
    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
    
    // Обновляем данные для корректного отображения
    await loadCategories()
  } catch (error) {
    console.error('Failed to change category order:', error)
  }
}

const deleteCategory = async (category: Category) => {
  if (!Array.isArray(categories.value)) return
  
  if (!confirm(`Вы уверены, что хотите удалить категорию "${category.name}"?`)) return
  
  try {
    await apiService.deleteCategory(category.id)
    categories.value = categories.value.filter(c => c.id !== category.id)
  } catch (error) {
    console.error('Failed to delete category:', error)
  }
}

// Административные функции
const sortCategories = async () => {
  if (!Array.isArray(categories.value)) return
  
  try {
    sortingCategories.value = true
    
    // Пересортируем категории по порядку
    const sortedCategories = [...categories.value].sort((a, b) => a.sort_order - b.sort_order)
    
    // Обновляем порядок сортировки
    for (let i = 0; i < sortedCategories.length; i++) {
      const category = sortedCategories[i]
      if (category.sort_order !== i + 1) {
        await apiService.updateCategory(category.id, { sort_order: i + 1 })
      }
    }
    
    // Обновляем данные
    await loadCategories()
    
    alert('Сортировка категорий выполнена')
  } catch (error) {
    console.error('Failed to sort categories:', error)
    alert('Ошибка при сортировке категорий')
  } finally {
    sortingCategories.value = false
  }
}

// Массовые операции
const bulkActivate = async () => {
  if (!selectedCategories.value.length) return
  
  if (!confirm(`Вы уверены, что хотите активировать ${selectedCategories.value.length} категорий?`)) return
  
  try {
    const promises = selectedCategories.value.map(id => 
      apiService.updateCategory(id, { is_active: true })
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadCategories()
    selectedCategories.value = []
  } catch (error) {
    console.error('Failed to bulk activate categories:', error)
    alert('Ошибка при активации категорий')
  }
}

const bulkDeactivate = async () => {
  if (!selectedCategories.value.length) return
  
  if (!confirm(`Вы уверены, что хотите деактивировать ${selectedCategories.value.length} категорий?`)) return
  
  try {
    const promises = selectedCategories.value.map(id => 
      apiService.updateCategory(id, { is_active: false })
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadCategories()
    selectedCategories.value = []
  } catch (error) {
    console.error('Failed to bulk deactivate categories:', error)
    alert('Ошибка при деактивации категорий')
  }
}

const bulkDelete = async () => {
  if (!selectedCategories.value.length) return
  
  if (!confirm(`Вы уверены, что хотите удалить ${selectedCategories.value.length} категорий? Это действие нельзя отменить.`)) return
  
  try {
    const promises = selectedCategories.value.map(id => 
      apiService.deleteCategory(id)
    )
    await Promise.all(promises)
    
    // Обновляем данные
    await loadCategories()
    selectedCategories.value = []
  } catch (error) {
    console.error('Failed to bulk delete categories:', error)
    alert('Ошибка при удалении категорий')
  }
}

// Инициализация
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  await loadCategories()
})
</script>

<style scoped lang="scss">
@use '@/styles/views/categories-management';
</style>
