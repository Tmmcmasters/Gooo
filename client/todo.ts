import { createApp } from "vue";
import goooHydrate from "./utils/goooHydrate";
import Todo from "./page/Todo.vue";
import { sharedPinia } from "./utils/pinia";


goooHydrate('todo', '#todo', (el) => {
    const app = createApp(Todo)
    app.use(sharedPinia);
    app.mount(el)

    return app;
})