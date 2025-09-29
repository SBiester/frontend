import './assets/main.css'
import '@vueform/vueform/dist/vueform.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import Vueform from '@vueform/vueform'
import vueformConfig from './../vueform.config'

const app = createApp(App)

app.use(Vueform, vueformConfig)

const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
