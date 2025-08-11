import { createApp } from "vue";
import goooHydrate from "./utils/goooHydrate";
import ThemeSwitcher from "./components/buttons/Theme-Switcher.vue";
import { createPinia } from "pinia";


goooHydrate('/gen/js/themeSwitcher.js', '#theme-switcher', () => {
    const app = createApp(ThemeSwitcher)
    app.use(createPinia())
    app.mount('#theme-switcher')
})