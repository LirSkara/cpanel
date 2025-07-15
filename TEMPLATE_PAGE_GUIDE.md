# Шаблонная страница для QRes OS 4 Control Panel

## Описание

`TemplatePageView.vue` - это универсальная шаблонная страница, созданная на основе `UsersManagementView.vue`. Она предоставляет стандартную структуру для создания новых страниц управления в панели администрирования.

## Структура шаблона

### Основные компоненты:

1. **Заголовок страницы** (`page-header`)
   - Хлебные крошки
   - Название страницы с иконкой
   - Статистика (количество элементов, активных/неактивных)
   - Кнопка добавления

2. **Фильтры и поиск** (`filters-section`)
   - Поле поиска
   - Выпадающие списки фильтров
   - Кнопка сброса фильтров

3. **Таблица данных** (`items-table-section`)
   - Загрузка данных
   - Пустое состояние
   - Таблица с сортировкой
   - Действия для каждой строки

4. **Модальные окна**
   - Создание нового элемента
   - Редактирование существующего элемента

## Как использовать шаблон

### 1. Скопируйте файлы

```bash
# Скопируйте Vue компонент
cp src/views/TemplatePageView.vue src/views/YourNewPageView.vue

# Скопируйте стили
cp src/styles/views/_template-page.scss src/styles/views/_your-new-page.scss
```

### 2. Обновите основные параметры

В файле `YourNewPageView.vue`:

```vue
<template>
  <div class="your-new-page pt-2">
    <!-- Обновите хлебные крошки -->
    <span class="breadcrumb-item active">Ваша новая страница</span>
    
    <!-- Обновите заголовок -->
    <h1 class="page-title">
      <i class="bi bi-your-icon"></i>
      Ваша новая страница
    </h1>
    
    <!-- Обновите статистику -->
    <p class="page-subtitle">
      Всего записей: <span class="badge bg-primary">{{ items.length }}</span>
    </p>
    
    <!-- Обновите кнопку -->
    <button @click="showCreateModal = true" class="btn btn-primary">
      <i class="bi bi-plus-circle"></i>
      Добавить запись
    </button>
  </div>
</template>
```

### 3. Настройте типы данных

```typescript
// Замените интерфейс Item на ваш тип данных
interface YourDataType {
  id: number
  name: string
  // ... другие поля
}

// Обновите интерфейсы для создания и обновления
interface CreateYourDataType {
  name: string
  // ... другие поля
}

interface UpdateYourDataType {
  name?: string
  // ... другие поля
}
```

### 4. Настройте API вызовы

```typescript
// Замените примеры вызовов на реальные API методы
const loadItems = async () => {
  try {
    loading.value = true
    const result = await apiService.getYourData()
    items.value = result.data || result
  } catch (error) {
    console.error('Failed to load items:', error)
  } finally {
    loading.value = false
  }
}

const createItem = async () => {
  try {
    const item = await apiService.createYourData(newItem.value)
    items.value.push(item)
  } catch (error) {
    // обработка ошибки
  }
}
```

### 5. Обновите фильтры и поиск

```typescript
// Настройте фильтры под ваши данные
const filteredItems = computed(() => {
  let filtered = items.value

  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }

  // Фильтры
  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.category === categoryFilter.value)
  }

  return filtered
})
```

### 6. Настройте таблицу

```vue
<template>
  <table class="items-table">
    <thead>
      <tr>
        <th>Название</th>
        <th>Категория</th>
        <th>Статус</th>
        <th>Дата создания</th>
        <th>Действия</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in filteredItems" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.category }}</td>
        <td>
          <span :class="item.is_active ? 'status-badge active' : 'status-badge inactive'">
            {{ item.is_active ? 'Активен' : 'Неактивен' }}
          </span>
        </td>
        <td>{{ formatDate(item.created_at) }}</td>
        <td>
          <div class="actions-menu">
            <button @click="editItem(item)" class="action-btn edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button @click="deleteItem(item)" class="action-btn delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### 7. Настройте формы

```vue
<template>
  <!-- Форма создания -->
  <form @submit.prevent="createItem" class="item-form">
    <div class="form-group">
      <label class="form-label">Название</label>
      <input 
        v-model="newItem.name" 
        type="text" 
        class="form-control"
        required
        placeholder="Введите название"
      >
    </div>
    <!-- ... другие поля -->
  </form>
</template>
```

### 8. Обновите стили

В файле `_your-new-page.scss`:

```scss
@use '../variables';

.your-new-page {
  // ... скопируйте стили из _template-page.scss
  // и обновите имена классов
}
```

### 9. Добавьте в роутер

```typescript
// src/router/index.ts
{
  path: '/your-page',
  name: 'your-page',
  component: () => import('@/views/YourNewPageView.vue'),
  meta: {
    title: 'Ваша новая страница',
    requiresAuth: true,
    requiresAdmin: true
  }
}
```

### 10. Обновите импорт стилей

```vue
<style scoped lang="scss">
@use '@/styles/views/your-new-page';
</style>
```

## Особенности шаблона

### Адаптивность
- Таблица автоматически адаптируется под мобильные устройства
- Фильтры переносятся в колонку на узких экранах
- Модальные окна адаптируются под размер экрана

### Состояния загрузки
- Спиннер при загрузке данных
- Блокировка кнопок во время операций
- Показ ошибок валидации

### Валидация
- Клиентская валидация форм
- Показ серверных ошибок
- Подтверждение удаления

### Доступность
- Семантические HTML элементы
- Поддержка клавиатуры
- Подсказки для кнопок

## Полезные утилиты

### Форматирование даты
```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
```

### Получение иконки по категории
```typescript
const getItemIcon = (category: string) => {
  switch (category) {
    case 'category1': return 'bi bi-folder-fill'
    case 'category2': return 'bi bi-file-earmark-fill'
    default: return 'bi bi-circle-fill'
  }
}
```

### Получение класса бейджа
```typescript
const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case 'category1': return 'category-badge category1'
    case 'category2': return 'category-badge category2'
    default: return 'category-badge'
  }
}
```

## Рекомендации

1. **Именование**: Используйте описательные имена для переменных и методов
2. **Типизация**: Всегда определяйте типы данных TypeScript
3. **Обработка ошибок**: Предусмотрите обработку всех возможных ошибок
4. **Загрузка**: Показывайте состояние загрузки для всех асинхронных операций
5. **Валидация**: Реализуйте как клиентскую, так и серверную валидацию
6. **Доступность**: Используйте семантические элементы и подсказки

Этот шаблон обеспечивает единообразный интерфейс для всех страниц управления и значительно ускоряет разработку новых функций.
