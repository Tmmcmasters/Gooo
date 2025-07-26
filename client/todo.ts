import { createApp } from "vue";
import goooHydrate from "./utils/goooHydrate";
import Todo from "./page/Todo.vue";


goooHydrate('/gen/js/todo.js', '#todo', () => {
    console.log('Hydrating todo.js for path:', window.location.pathname)
    const app = createApp(Todo)
    app.mount('#todo')
    console.log('Vue app mounted on #todo')
})