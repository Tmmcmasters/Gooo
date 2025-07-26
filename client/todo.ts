import { createApp } from "vue";
import goooHydrate from "./utils/goooHydrate";
import Todo from "./page/Todo.vue";


goooHydrate('/gen/js/todo.js', '#todo', () => {
    const app = createApp(Todo)
    app.mount('#todo')
})