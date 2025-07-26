import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Home from './page/Home.vue'
import goooHydrate from './utils/goooHydrate'

goooHydrate('/gen/js/home.js', '#home', () => {
    const initialDataElement = document.getElementById('home-initial-data')
    const initialData = initialDataElement ? JSON.parse(initialDataElement.textContent ?? '{}') : {}
    const app = createApp(Home, { initialData })
    app.use(createPinia())
    app.mount('#home')
})