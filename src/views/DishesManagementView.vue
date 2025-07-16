<template>
  <div class="dishes-page">
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
              <li class="breadcrumb-item active text-muted" aria-current="page">Управление блюдами</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-egg-fried me-2 text-primary"></i>
                Управление блюдами
              </h1>
              <p class="text-muted mb-0">
                Всего блюд: <span class="badge bg-primary">{{ Array.isArray(dishes) ? dishes.length : 0 }}</span>
                • Доступных: <span class="badge bg-success">{{ availableDishes }}</span>
                • Популярных: <span class="badge bg-warning">{{ popularDishes }}</span>
                • Категорий: <span class="badge bg-info">{{ Array.isArray(categories) ? categories.length : 0 }}</span>
              </p>
            </div>
            <div class="col-md-4 text-end">
              <div class="btn-group me-2">
                <button 
                  class="btn btn-outline-secondary btn-sm" 
                  @click="toggleView"
                  :class="{ active: viewType === 'grid' }"
                >
                  <i class="bi bi-grid-3x3-gap"></i>
                </button>
                <button 
                  class="btn btn-outline-secondary btn-sm" 
                  @click="toggleView"
                  :class="{ active: viewType === 'list' }"
                >
                  <i class="bi bi-list-ul"></i>
                </button>
              </div>
              <button 
                @click="showCreateModal" 
                class="btn btn-primary"
                :disabled="isLoading"
              >
                <i class="bi bi-plus-circle me-1"></i>
                Добавить блюдо
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Фильтры и поиск -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Поиск блюд..."
                  v-model="searchTerm"
                  @input="filterDishes"
                >
              </div>
            </div>
            <div class="col-md-2">
              <select class="form-select" v-model="filterCategory" @change="filterDishes">
                <option value="">Все категории</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" v-model="filterDepartment" @change="filterDishes">
                <option value="">Все отделы</option>
                <option value="bar">Бар</option>
                <option value="cold">Холодный цех</option>
                <option value="hot">Горячий цех</option>
                <option value="dessert">Десерты</option>
                <option value="grill">Гриль</option>
                <option value="bakery">Выпечка</option>
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" v-model="filterAvailability" @change="filterDishes">
                <option value="">Все блюда</option>
                <option value="available">Доступные</option>
                <option value="unavailable">Недоступные</option>
                <option value="popular">Популярные</option>
              </select>
            </div>
            <div class="col-md-3">
              <div class="btn-group w-100" role="group">
                <button 
                  class="btn btn-outline-primary" 
                  @click="selectAll" 
                  :disabled="filteredDishes.length === 0"
                >
                  <i class="bi bi-check-square"></i> Выбрать все
                </button>
                <div class="btn-group" role="group">
                  <button 
                    class="btn btn-outline-secondary dropdown-toggle" 
                    data-bs-toggle="dropdown"
                    :disabled="selectedDishes.length === 0"
                  >
                    Действия ({{ selectedDishes.length }})
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" @click="toggleSelectedAvailability(true)">
                      <i class="bi bi-check-circle text-success"></i> Сделать доступными
                    </a></li>
                    <li><a class="dropdown-item" href="#" @click="toggleSelectedAvailability(false)">
                      <i class="bi bi-x-circle text-danger"></i> Сделать недоступными
                    </a></li>
                    <li><a class="dropdown-item" href="#" @click="toggleSelectedPopular(true)">
                      <i class="bi bi-star text-warning"></i> Отметить популярными
                    </a></li>
                    <li><a class="dropdown-item" href="#" @click="toggleSelectedPopular(false)">
                      <i class="bi bi-star text-muted"></i> Убрать из популярных
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" @click="deleteSelected">
                      <i class="bi bi-trash"></i> Удалить выбранные
                    </a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <i class="bi bi-egg-fried display-6 text-primary mb-2"></i>
              <h5 class="card-title">{{ Array.isArray(dishes) ? dishes.length : 0 }}</h5>
              <p class="card-text text-muted">Всего блюд</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <i class="bi bi-check-circle display-6 text-success mb-2"></i>
              <h5 class="card-title">{{ availableDishes }}</h5>
              <p class="card-text text-muted">Доступных</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <i class="bi bi-star-fill display-6 text-warning mb-2"></i>
              <h5 class="card-title">{{ popularDishes }}</h5>
              <p class="card-text text-muted">Популярных</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card">
            <div class="card-body text-center">
              <i class="bi bi-collection display-6 text-info mb-2"></i>
              <h5 class="card-title">{{ Array.isArray(categories) ? categories.length : 0 }}</h5>
              <p class="card-text text-muted">Категорий</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="mt-3 text-muted">Загрузка блюд...</p>
      </div>

      <!-- Список блюд -->
      <div v-else-if="filteredDishes.length > 0" class="row">
        <div 
          v-for="dish in filteredDishes" 
          :key="dish.id"
          :class="viewType === 'grid' ? 'col-md-6 col-lg-4' : 'col-12'"
          class="mb-4"
        >
          <div class="card dish-card" :class="{ 'dish-available': dish.is_available, 'dish-unavailable': !dish.is_available }">
            <div class="card-header d-flex align-items-center">
              <div class="form-check me-3">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :id="`dish-${dish.id}`"
                  :value="dish.id"
                  v-model="selectedDishes"
                >
              </div>
              <div class="dish-image-container me-3" v-if="dish.main_image_url">
                <img :src="dish.main_image_url" :alt="dish.name" class="dish-image">
              </div>
              <div class="dish-placeholder me-3" v-else>
                <i class="bi bi-image"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-title mb-1">{{ dish.name }}</h6>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span class="badge" :class="getCategoryBadgeClass(dish.category_id)">
                    {{ getCategoryName(dish.category_id) }}
                  </span>
                  <span class="badge" :class="getDepartmentBadgeClass(dish.department)">
                    {{ getDepartmentName(dish.department) }}
                  </span>
                  <span v-if="dish.is_popular" class="badge bg-warning">
                    <i class="bi bi-star-fill"></i> Популярное
                  </span>
                </div>
              </div>
            </div>
            
            <div class="card-body">
              <div class="row">
                <div class="col-12 mb-2">
                  <p class="card-text text-muted small">{{ dish.description }}</p>
                </div>
                <div class="col-6">
                  <div class="info-item-compact mb-2">
                    <i class="bi bi-clock text-muted me-2"></i>
                    <span>{{ dish.cooking_time || 'Не указано' }} мин</span>
                  </div>
                  <div class="info-item-compact mb-2">
                    <i class="bi bi-speedometer2 text-muted me-2"></i>
                    <span>{{ dish.weight || 'Не указано' }} г</span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-item-compact mb-2">
                    <i class="bi bi-fire text-muted me-2"></i>
                    <span>{{ dish.calories || 'Не указано' }} ккал</span>
                  </div>
                  <div class="info-item-compact mb-2">
                    <i class="bi bi-hash text-muted me-2"></i>
                    <span>{{ dish.code || 'Нет кода' }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-2" v-if="dish.ingredients">
                <small class="text-muted">
                  <i class="bi bi-list-ul me-1"></i>
                  {{ dish.ingredients }}
                </small>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-outline-success btn-sm" 
                    @click="toggleAvailability(dish)"
                    :class="{ 'btn-success': dish.is_available }"
                  >
                    <i class="bi" :class="dish.is_available ? 'bi-check-circle' : 'bi-x-circle'"></i>
                    {{ dish.is_available ? 'Доступно' : 'Недоступно' }}
                  </button>
                  <button 
                    class="btn btn-outline-info btn-sm" 
                    @click="viewVariations(dish)"
                  >
                    <i class="bi bi-collection"></i>
                    Вариации
                  </button>
                </div>
                <div class="dropdown">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" @click="editDish(dish)">
                      <i class="bi bi-pencil"></i> Редактировать
                    </a></li>
                    <li><a class="dropdown-item" href="#" @click="duplicateDish(dish)">
                      <i class="bi bi-copy"></i> Дублировать
                    </a></li>
                    <li><a class="dropdown-item" href="#" @click="togglePopular(dish)">
                      <i class="bi bi-star"></i> {{ dish.is_popular ? 'Убрать из популярных' : 'Отметить популярным' }}
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" @click="deleteDish(dish)">
                      <i class="bi bi-trash"></i> Удалить
                    </a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Сообщение об отсутствии блюд -->
      <div v-else class="text-center py-5">
        <i class="bi bi-egg-fried display-1 text-muted mb-3"></i>
        <h4 class="text-muted">Блюда не найдены</h4>
        <p class="text-muted">Измените параметры поиска или добавьте новое блюдо</p>
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle"></i> Добавить блюдо
        </button>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования блюда -->
    <div class="modal fade" id="dishModal" tabindex="-1" ref="dishModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Редактирование блюда' : 'Создание нового блюда' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDish">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Название *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="currentDish.name"
                      required
                      maxlength="255"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Код блюда</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="currentDish.code"
                      placeholder="Например: DISH001"
                    >
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Категория *</label>
                    <select class="form-select" v-model="currentDish.category_id" required>
                      <option value="">Выберите категорию</option>
                      <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Отдел *</label>
                    <select class="form-select" v-model="currentDish.department" required>
                      <option value="">Выберите отдел</option>
                      <option value="bar">Бар</option>
                      <option value="cold">Холодный цех</option>
                      <option value="hot">Горячий цех</option>
                      <option value="dessert">Десерты</option>
                      <option value="grill">Гриль</option>
                      <option value="bakery">Выпечка</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Описание *</label>
                <textarea 
                  class="form-control" 
                  v-model="currentDish.description"
                  rows="3"
                  required
                  maxlength="500"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label class="form-label">URL изображения</label>
                <input 
                  type="url" 
                  class="form-control" 
                  v-model="currentDish.main_image_url"
                  placeholder="https://example.com/image.jpg"
                >
              </div>
              
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Время приготовления (мин)</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="currentDish.cooking_time"
                      min="0"
                      max="300"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Вес (г)</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="currentDish.weight"
                      min="0"
                      step="0.1"
                    >
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Калории (ккал)</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="currentDish.calories"
                      min="0"
                    >
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Ингредиенты</label>
                <textarea 
                  class="form-control" 
                  v-model="currentDish.ingredients"
                  rows="2"
                  placeholder="Список ингредиентов через запятую"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Порядок сортировки</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model="currentDish.sort_order"
                  min="0"
                >
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="is_available"
                      v-model="currentDish.is_available"
                    >
                    <label class="form-check-label" for="is_available">
                      Доступно для заказа
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="is_popular"
                      v-model="currentDish.is_popular"
                    >
                    <label class="form-check-label" for="is_popular">
                      Популярное блюдо
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Отмена
            </button>
            <button type="button" class="btn btn-primary" @click="saveDish" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Сохранить изменения' : 'Создать блюдо' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно управления вариациями -->
    <div class="modal fade" id="variationsModal" tabindex="-1" ref="variationsModal">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Вариации блюда: {{ selectedDish?.name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex justify-content-between mb-3">
              <h6>Список вариаций</h6>
              <button class="btn btn-primary btn-sm" @click="showCreateVariationModal">
                <i class="bi bi-plus-circle"></i> Добавить вариацию
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Цена</th>
                    <th>Вес</th>
                    <th>Калории</th>
                    <th>По умолчанию</th>
                    <th>Доступно</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="variation in variations" :key="variation.id">
                    <td>{{ variation.name }}</td>
                    <td>{{ variation.price }} ₽</td>
                    <td>{{ variation.weight || 'Не указано' }} г</td>
                    <td>{{ variation.calories || 'Не указано' }} ккал</td>
                    <td>
                      <span class="badge" :class="variation.is_default ? 'bg-primary' : 'bg-secondary'">
                        {{ variation.is_default ? 'Да' : 'Нет' }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" :class="variation.is_available ? 'bg-success' : 'bg-danger'">
                        {{ variation.is_available ? 'Да' : 'Нет' }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary btn-sm" @click="editVariation(variation)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" @click="deleteVariation(variation)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { apiService } from '@/services/api'

// Объявляем bootstrap для TypeScript
declare global {
  interface Window {
    bootstrap: any
  }
}

// Функция для безопасного создания модала
const createBootstrapModal = (element: HTMLElement) => {
  return new Promise<any>((resolve, reject) => {
    const checkBootstrap = () => {
      if (window.bootstrap && window.bootstrap.Modal) {
        resolve(new window.bootstrap.Modal(element))
      } else {
        setTimeout(checkBootstrap, 100)
      }
    }
    checkBootstrap()
  })
}

// Интерфейсы
interface Dish {
  id: number
  name: string
  description: string
  code: string | null
  main_image_url: string | null
  is_available: boolean
  sort_order: number
  is_popular: boolean
  category_id: number
  cooking_time: number | null
  weight: number | null
  calories: number | null
  ingredients: string | null
  department: 'bar' | 'cold' | 'hot' | 'dessert' | 'grill' | 'bakery'
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  color: string | null
}

interface Variation {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  weight: number | null
  calories: number | null
  is_default: boolean
  is_available: boolean
  sort_order: number
  dish_id: number
  sku: string | null
  created_at: string
  updated_at: string
}

// Реактивные данные
const dishes = ref<Dish[]>([])
const categories = ref<Category[]>([])
const variations = ref<Variation[]>([])
const filteredDishes = ref<Dish[]>([])
const selectedDishes = ref<number[]>([])
const searchTerm = ref('')
const filterCategory = ref('')
const filterDepartment = ref('')
const filterAvailability = ref('')
const viewType = ref<'grid' | 'list'>('grid')
const isLoading = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const selectedDish = ref<Dish | null>(null)

// Модальные окна
const dishModal = ref<HTMLElement>()
const variationsModal = ref<HTMLElement>()

// Текущее блюдо для редактирования
const currentDish = ref<Partial<Dish>>({
  name: '',
  description: '',
  code: null,
  main_image_url: null,
  is_available: true,
  sort_order: 0,
  is_popular: false,
  category_id: 0,
  cooking_time: null,
  weight: null,
  calories: null,
  ingredients: null,
  department: 'hot'
})

// Вычисляемые свойства
const availableDishes = computed(() => 
  Array.isArray(dishes.value) ? dishes.value.filter(dish => dish.is_available).length : 0
)

const popularDishes = computed(() => 
  Array.isArray(dishes.value) ? dishes.value.filter(dish => dish.is_popular).length : 0
)

// Методы
const loadDishes = async () => {
  try {
    isLoading.value = true
    const data = await apiService.getDishes()
    dishes.value = Array.isArray(data) ? data : []
    filterDishes()
  } catch (error) {
    console.error('Ошибка загрузки блюд:', error)
    dishes.value = []
    filterDishes()
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    const data = await apiService.getCategories()
    categories.value = data.categories || []
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
  }
}

const filterDishes = () => {
  if (!Array.isArray(dishes.value)) {
    filteredDishes.value = []
    return
  }
  
  let filtered = dishes.value

  // Поиск по названию
  if (searchTerm.value) {
    filtered = filtered.filter(dish => 
      dish.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Фильтр по категории
  if (filterCategory.value) {
    filtered = filtered.filter(dish => dish.category_id === parseInt(filterCategory.value))
  }

  // Фильтр по отделу
  if (filterDepartment.value) {
    filtered = filtered.filter(dish => dish.department === filterDepartment.value)
  }

  // Фильтр по доступности
  if (filterAvailability.value === 'available') {
    filtered = filtered.filter(dish => dish.is_available)
  } else if (filterAvailability.value === 'unavailable') {
    filtered = filtered.filter(dish => !dish.is_available)
  } else if (filterAvailability.value === 'popular') {
    filtered = filtered.filter(dish => dish.is_popular)
  }

  filteredDishes.value = filtered
}

const toggleView = () => {
  viewType.value = viewType.value === 'grid' ? 'list' : 'grid'
}

const showCreateModal = async () => {
  isEditing.value = false
  currentDish.value = {
    name: '',
    description: '',
    code: null,
    main_image_url: null,
    is_available: true,
    sort_order: 0,
    is_popular: false,
    category_id: 0,
    cooking_time: null,
    weight: null,
    calories: null,
    ingredients: null,
    department: 'hot'
  }
  
  const modal = await createBootstrapModal(dishModal.value!)
  modal.show()
}

const editDish = async (dish: Dish) => {
  isEditing.value = true
  currentDish.value = { ...dish }
  
  const modal = await createBootstrapModal(dishModal.value!)
  modal.show()
}

const saveDish = async () => {
  try {
    isSaving.value = true
    
    if (isEditing.value) {
      await apiService.updateDish(currentDish.value.id!, currentDish.value)
    } else {
      await apiService.createDish(currentDish.value)
    }
    
    // Безопасное получение инстанса модала
    const modalElement = dishModal.value!
    const modal = window.bootstrap?.Modal?.getInstance(modalElement)
    if (modal) {
      modal.hide()
    } else {
      // Попробуем скрыть модал через data-bs-dismiss
      const closeBtn = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement
      closeBtn?.click()
    }
    
    await loadDishes()
  } catch (error) {
    console.error('Ошибка сохранения блюда:', error)
  } finally {
    isSaving.value = false
  }
}

const deleteDish = async (dish: Dish) => {
  if (confirm(`Вы уверены, что хотите удалить блюдо "${dish.name}"?`)) {
    try {
      await apiService.deleteDish(dish.id)
      await loadDishes()
    } catch (error) {
      console.error('Ошибка удаления блюда:', error)
    }
  }
}

const duplicateDish = async (dish: Dish) => {
  const duplicatedDish = {
    ...dish,
    name: `${dish.name} (копия)`,
    code: null
  }
  // Удаляем поля, которые не должны копироваться
  const { id, created_at, updated_at, ...dishData } = duplicatedDish
  
  try {
    await apiService.createDish(dishData)
    await loadDishes()
  } catch (error) {
    console.error('Ошибка дублирования блюда:', error)
  }
}

const toggleAvailability = async (dish: Dish) => {
  try {
    await apiService.updateDishAvailability(dish.id, !dish.is_available)
    dish.is_available = !dish.is_available
  } catch (error) {
    console.error('Ошибка изменения доступности:', error)
  }
}

const togglePopular = async (dish: Dish) => {
  try {
    await apiService.updateDish(dish.id, { is_popular: !dish.is_popular })
    dish.is_popular = !dish.is_popular
  } catch (error) {
    console.error('Ошибка изменения популярности:', error)
  }
}

const selectAll = () => {
  if (Array.isArray(filteredDishes.value)) {
    selectedDishes.value = filteredDishes.value.map(dish => dish.id)
  } else {
    selectedDishes.value = []
  }
}

const toggleSelectedAvailability = async (isAvailable: boolean) => {
  try {
    for (const dishId of selectedDishes.value) {
      await apiService.updateDishAvailability(dishId, isAvailable)
    }
    selectedDishes.value = []
    await loadDishes()
  } catch (error) {
    console.error('Ошибка массового изменения доступности:', error)
  }
}

const toggleSelectedPopular = async (isPopular: boolean) => {
  try {
    for (const dishId of selectedDishes.value) {
      await apiService.updateDish(dishId, { is_popular: isPopular })
    }
    selectedDishes.value = []
    await loadDishes()
  } catch (error) {
    console.error('Ошибка массового изменения популярности:', error)
  }
}

const deleteSelected = async () => {
  if (confirm(`Вы уверены, что хотите удалить ${selectedDishes.value.length} блюд?`)) {
    try {
      for (const dishId of selectedDishes.value) {
        await apiService.deleteDish(dishId)
      }
      selectedDishes.value = []
      await loadDishes()
    } catch (error) {
      console.error('Ошибка массового удаления:', error)
    }
  }
}

const viewVariations = async (dish: Dish) => {
  try {
    selectedDish.value = dish
    const data = await apiService.getDishVariations(dish.id)
    variations.value = data
    
    const modal = await createBootstrapModal(variationsModal.value!)
    modal.show()
  } catch (error) {
    console.error('Ошибка загрузки вариаций:', error)
  }
}

const showCreateVariationModal = () => {
  // Здесь будет логика создания вариации
  console.log('Создание вариации')
}

const editVariation = (variation: Variation) => {
  // Здесь будет логика редактирования вариации
  console.log('Редактирование вариации:', variation)
}

const deleteVariation = async (variation: Variation) => {
  if (confirm(`Вы уверены, что хотите удалить вариацию "${variation.name}"?`)) {
    try {
      await apiService.deleteDishVariation(selectedDish.value!.id, variation.id)
      await viewVariations(selectedDish.value!)
    } catch (error) {
      console.error('Ошибка удаления вариации:', error)
    }
  }
}

// Вспомогательные методы
const getCategoryName = (categoryId: number) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Без категории'
}

const getCategoryBadgeClass = (categoryId: number) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? 'bg-primary' : 'bg-secondary'
}

const getDepartmentName = (department: string) => {
  const departments: Record<string, string> = {
    bar: 'Бар',
    cold: 'Холодный цех',
    hot: 'Горячий цех',
    dessert: 'Десерты',
    grill: 'Гриль',
    bakery: 'Выпечка'
  }
  return departments[department] || department
}

const getDepartmentBadgeClass = (department: string) => {
  const classes: Record<string, string> = {
    bar: 'bg-info',
    cold: 'bg-primary',
    hot: 'bg-danger',
    dessert: 'bg-warning',
    grill: 'bg-success',
    bakery: 'bg-secondary'
  }
  return classes[department] || 'bg-secondary'
}

// Инициализация
onMounted(async () => {
  await Promise.all([loadDishes(), loadCategories()])
})
</script>
