import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Home, { type ServerCardProps } from './page/Home.vue'
import goooHydrate from './utils/goooHydrate'

goooHydrate('/gen/js/home.js', '#home', () => {
    const serverProps: ServerCardProps = JSON.parse(document.querySelector('#serverProps')?.textContent ?? '{}');

    const app = createApp(Home, serverProps)
    app.use(createPinia())
    app.mount('#home')
})