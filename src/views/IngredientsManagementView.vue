<template>
  <div class="ingredients-page">
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
              <li class="breadcrumb-item active text-muted" aria-current="page">Управление ингредиентами</li>
            </ol>
          </nav>
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h2 mb-2 d-flex align-items-center">
                <i class="bi bi-list-ul me-2 text-primary"></i>
                Управление ингредиентами
              </h1>
              <p class="text-muted mb-0">
                Всего ингредиентов: <span class="badge bg-primary">{{ Array.isArray(ingredients) ? ingredients.length : 0 }}</span>
                • Аллергенов: <span class="badge bg-danger">{{ allergenCount }}</span>
                • Обычных: <span class="badge bg-success">{{ normalCount }}</span>
              </p>
            </div>
            <div class="col-md-4 text-end">
              <button 
                @click="showCreateModal" 
                class="btn btn-primary"
                :disabled="isLoading"
              >
                <i class="bi bi-plus-circle me-1"></i>
                Добавить ингредиент
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Фильтры и поиск -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Поиск ингредиентов..."
                  v-model="searchTerm"
                  @input="filterIngredients"
                >
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select" v-model="filterType" @change="filterIngredients">
                <option value="">Все ингредиенты</option>
                <option value="allergen">Только аллергены</option>
                <option value="normal">Обычные ингредиенты</option>
              </select>
            </div>
            <div class="col-md-3">
              <div class="btn-group w-100" role="group">
                <button 
                  class="btn btn-outline-primary" 
                  @click="selectAll" 
                  :disabled="filteredIngredients.length === 0"
                >
                  <i class="bi bi-check-square"></i> Выбрать все
                </button>
                <div class="btn-group" role="group">
                  <button 
                    class="btn btn-outline-secondary dropdown-toggle" 
                    data-bs-toggle="dropdown"
                    :disabled="selectedIngredients.length === 0"
                  >
                    Действия ({{ selectedIngredients.length }})
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" @click="toggleSelectedAllergen(true)">
                      <i class="bi bi-exclamation-triangle text-danger"></i> Отметить как аллергены
                    </a></li>
                    <li><a class="dropdown-item" href="#" @click="toggleSelectedAllergen(false)">
                      <i class="bi bi-check-circle text-success"></i> Убрать статус аллергена
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
        <div class="col-md-4">
          <div class="card">
            <div class="card-body text-center">
              <i class="bi bi-list-ul display-6 text-primary mb-2"></i>
              <h5 class="card-title">{{ Array.isArray(ingredients) ? ingredients.length : 0 }}</h5>
              <p class="card-text text-muted">Всего ингредиентов</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body text-center">
              <i class="bi bi-exclamation-triangle display-6 text-danger mb-2"></i>
              <h5 class="card-title">{{ allergenCount }}</h5>
              <p class="card-text text-muted">Аллергенов</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body text-center">
              <i class="bi bi-check-circle display-6 text-success mb-2"></i>
              <h5 class="card-title">{{ normalCount }}</h5>
              <p class="card-text text-muted">Обычных</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="mt-3 text-muted">Загрузка ингредиентов...</p>
      </div>

      <!-- Таблица ингредиентов -->
      <div v-else-if="filteredIngredients.length > 0" class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">Список ингредиентов</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th width="50">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :checked="selectedIngredients.length === filteredIngredients.length && filteredIngredients.length > 0"
                        @change="toggleSelectAll"
                      >
                    </div>
                  </th>
                  <th>Название</th>
                  <th>Описание</th>
                  <th>Статус</th>
                  <th>Дата создания</th>
                  <th width="200">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ingredient in filteredIngredients" :key="ingredient.id">
                  <td>
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :value="ingredient.id"
                        v-model="selectedIngredients"
                      >
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-list-ul me-2 text-muted"></i>
                      <strong>{{ ingredient.name }}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="text-muted">{{ ingredient.description || 'Без описания' }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="ingredient.is_allergen ? 'bg-danger' : 'bg-success'">
                      <i class="bi" :class="ingredient.is_allergen ? 'bi-exclamation-triangle' : 'bi-check-circle'"></i>
                      {{ ingredient.is_allergen ? 'Аллерген' : 'Обычный' }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(ingredient.created_at) }}</small>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button 
                        class="btn btn-outline-primary btn-sm" 
                        @click="editIngredient(ingredient)"
                        title="Редактировать"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-outline-secondary btn-sm" 
                        @click="toggleAllergen(ingredient)"
                        :title="ingredient.is_allergen ? 'Убрать статус аллергена' : 'Отметить как аллерген'"
                      >
                        <i class="bi" :class="ingredient.is_allergen ? 'bi-check-circle' : 'bi-exclamation-triangle'"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger btn-sm" 
                        @click="deleteIngredient(ingredient)"
                        title="Удалить"
                      >
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

      <!-- Сообщение об отсутствии ингредиентов -->
      <div v-else class="text-center py-5">
        <i class="bi bi-list-ul display-1 text-muted mb-3"></i>
        <h4 class="text-muted">Ингредиенты не найдены</h4>
        <p class="text-muted">Измените параметры поиска или добавьте новый ингредиент</p>
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus-circle"></i> Добавить ингредиент
        </button>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования ингредиента -->
    <div class="modal fade" id="ingredientModal" tabindex="-1" ref="ingredientModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Редактирование ингредиента' : 'Создание нового ингредиента' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveIngredient">
              <div class="mb-3">
                <label class="form-label">Название *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="currentIngredient.name"
                  required
                  maxlength="255"
                >
              </div>
              
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea 
                  class="form-control" 
                  v-model="currentIngredient.description"
                  rows="3"
                  maxlength="500"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="is_allergen"
                    v-model="currentIngredient.is_allergen"
                  >
                  <label class="form-check-label" for="is_allergen">
                    <i class="bi bi-exclamation-triangle text-danger me-1"></i>
                    Является аллергеном
                  </label>
                </div>
                <small class="text-muted">Отметьте, если ингредиент может вызвать аллергическую реакцию</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Отмена
            </button>
            <button type="button" class="btn btn-primary" @click="saveIngredient" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Сохранить изменения' : 'Создать ингредиент' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// Интерфейс
interface Ingredient {
  id: number
  name: string
  description: string | null
  is_allergen: boolean
  created_at: string
  updated_at: string
}

// Реактивные данные
const ingredients = ref<Ingredient[]>([])
const filteredIngredients = ref<Ingredient[]>([])
const selectedIngredients = ref<number[]>([])
const searchTerm = ref('')
const filterType = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)

// Модальные окна
const ingredientModal = ref<HTMLElement>()

// Текущий ингредиент для редактирования
const currentIngredient = ref<Partial<Ingredient>>({
  name: '',
  description: null,
  is_allergen: false
})

// Вычисляемые свойства
const allergenCount = computed(() => 
  Array.isArray(ingredients.value) ? ingredients.value.filter(ingredient => ingredient.is_allergen).length : 0
)

const normalCount = computed(() => 
  Array.isArray(ingredients.value) ? ingredients.value.filter(ingredient => !ingredient.is_allergen).length : 0
)

// Методы
const loadIngredients = async () => {
  try {
    isLoading.value = true
    const data = await apiService.getIngredients()
    ingredients.value = Array.isArray(data) ? data : []
    filterIngredients()
  } catch (error) {
    console.error('Ошибка загрузки ингредиентов:', error)
    ingredients.value = []
    filterIngredients()
  } finally {
    isLoading.value = false
  }
}

const filterIngredients = () => {
  if (!Array.isArray(ingredients.value)) {
    filteredIngredients.value = []
    return
  }
  
  let filtered = ingredients.value

  // Поиск по названию
  if (searchTerm.value) {
    filtered = filtered.filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (ingredient.description && ingredient.description.toLowerCase().includes(searchTerm.value.toLowerCase()))
    )
  }

  // Фильтр по типу
  if (filterType.value === 'allergen') {
    filtered = filtered.filter(ingredient => ingredient.is_allergen)
  } else if (filterType.value === 'normal') {
    filtered = filtered.filter(ingredient => !ingredient.is_allergen)
  }

  filteredIngredients.value = filtered
}

const showCreateModal = async () => {
  isEditing.value = false
  currentIngredient.value = {
    name: '',
    description: null,
    is_allergen: false
  }
  
  const modal = await createBootstrapModal(ingredientModal.value!)
  modal.show()
}

const editIngredient = async (ingredient: Ingredient) => {
  isEditing.value = true
  currentIngredient.value = { ...ingredient }
  
  const modal = await createBootstrapModal(ingredientModal.value!)
  modal.show()
}

const saveIngredient = async () => {
  try {
    isSaving.value = true
    
    if (isEditing.value) {
      await apiService.updateIngredient(currentIngredient.value.id!, currentIngredient.value)
    } else {
      await apiService.createIngredient(currentIngredient.value)
    }
    
    // Закрываем модальное окно
    const modalElement = ingredientModal.value!
    const modal = window.bootstrap?.Modal?.getInstance(modalElement)
    if (modal) {
      modal.hide()
    } else {
      const closeBtn = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement
      closeBtn?.click()
    }
    
    await loadIngredients()
  } catch (error) {
    console.error('Ошибка сохранения ингредиента:', error)
  } finally {
    isSaving.value = false
  }
}

const deleteIngredient = async (ingredient: Ingredient) => {
  if (confirm(`Вы уверены, что хотите удалить ингредиент "${ingredient.name}"?`)) {
    try {
      await apiService.deleteIngredient(ingredient.id)
      await loadIngredients()
    } catch (error) {
      console.error('Ошибка удаления ингредиента:', error)
    }
  }
}

const toggleAllergen = async (ingredient: Ingredient) => {
  try {
    await apiService.updateIngredient(ingredient.id, { is_allergen: !ingredient.is_allergen })
    ingredient.is_allergen = !ingredient.is_allergen
  } catch (error) {
    console.error('Ошибка изменения статуса аллергена:', error)
  }
}

const selectAll = () => {
  if (Array.isArray(filteredIngredients.value)) {
    selectedIngredients.value = filteredIngredients.value.map(ingredient => ingredient.id)
  } else {
    selectedIngredients.value = []
  }
}

const toggleSelectAll = () => {
  if (selectedIngredients.value.length === filteredIngredients.value.length) {
    selectedIngredients.value = []
  } else {
    selectAll()
  }
}

const toggleSelectedAllergen = async (isAllergen: boolean) => {
  try {
    for (const ingredientId of selectedIngredients.value) {
      await apiService.updateIngredient(ingredientId, { is_allergen: isAllergen })
    }
    selectedIngredients.value = []
    await loadIngredients()
  } catch (error) {
    console.error('Ошибка массового изменения статуса аллергена:', error)
  }
}

const deleteSelected = async () => {
  if (confirm(`Вы уверены, что хотите удалить ${selectedIngredients.value.length} ингредиентов?`)) {
    try {
      for (const ingredientId of selectedIngredients.value) {
        await apiService.deleteIngredient(ingredientId)
      }
      selectedIngredients.value = []
      await loadIngredients()
    } catch (error) {
      console.error('Ошибка массового удаления:', error)
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// Инициализация
onMounted(async () => {
  await loadIngredients()
})
</script>

<style scoped>
.ingredients-page {
  min-height: 100vh;
}

.table th {
  background-color: var(--bs-light);
  font-weight: 600;
}

.table tbody tr:hover {
  background-color: var(--bs-light);
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.btn-group .btn {
  transition: all 0.2s ease;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);
}

.badge {
  font-size: 0.75rem;
}

.display-6 {
  font-size: 2rem;
}
</style>
