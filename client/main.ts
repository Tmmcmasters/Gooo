import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Home from './page/Home.vue'

const app = createApp(Home)

app.use(createPinia())

app.mount('#app')
