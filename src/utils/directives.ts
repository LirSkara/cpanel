import type { DirectiveBinding } from 'vue'

// Директива для обработки клика вне элемента
export const vClickOutside = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const handleClick = (e: Event) => {
      // Проверяем, что клик не внутри элемента
      if (!el.contains(e.target as Node)) {
        binding.value()
      }
    }

    // Сохраняем обработчик для последующего удаления
    ;(el as any)._clickOutside = handleClick
    
    // Добавляем обработчик с небольшой задержкой, чтобы не сработал сразу
    setTimeout(() => {
      document.addEventListener('click', handleClick)
    }, 0)
  },
  
  unmounted(el: HTMLElement) {
    // Удаляем обработчик при размонтировании
    const handler = (el as any)._clickOutside
    if (handler) {
      document.removeEventListener('click', handler)
      delete (el as any)._clickOutside
    }
  }
}
