import { createApp } from 'vue'
import Home, { type ServerCardProps } from './page/Home.vue'
import goooHydrate from './utils/goooHydrate'
import { sharedPinia } from './utils/pinia';

goooHydrate('home', '#home', (el) => {
    const serverProps: ServerCardProps = JSON.parse(document.querySelector('#serverProps')?.textContent ?? '{}');

    const app = createApp(Home, serverProps)
    app.use(sharedPinia)
    app.mount(el)
    return app;
})