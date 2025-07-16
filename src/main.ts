import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import * as bootstrap from 'bootstrap'

// Стили
import './styles/main.scss'

// Добавляем Bootstrap в глобальный объект window
declare global {
  interface Window {
    bootstrap: any
  }
}

window.bootstrap = bootstrap as any

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
