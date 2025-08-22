import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import Vueform from '@vueform/vueform'
import vueformConfig from './../vueform.config'

const app = createApp(App)
app.component('VueDatePicker', VueDatePicker)

app.use(Vueform, vueformConfig)

const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')