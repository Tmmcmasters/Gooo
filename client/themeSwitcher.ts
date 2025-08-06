import { createApp } from "vue";
import goooHydrate from "./utils/goooHydrate";
import ThemeSwitcher from "./components/buttons/Theme-Switcher.vue";


goooHydrate('/gen/js/themeSwitcher.js', '#theme-switcher', () => {
    const app = createApp(ThemeSwitcher)
    app.mount('#theme-switcher')
})