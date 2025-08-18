import { createApp } from "vue";
import goooHydrate from "./utils/goooHydrate";
import ThemeSwitcher from "./components/buttons/Theme-Switcher.vue";
import { sharedPinia } from "./utils/pinia";


goooHydrate('themeSwitcher', '#theme-switcher', () => {
    const app = createApp(ThemeSwitcher)
    app.use(sharedPinia)
    app.mount('#theme-switcher')

    return app;
})