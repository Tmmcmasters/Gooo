import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Home from './page/Home.vue'
import goooHydrate from './utils/goooHydrate'

// type PageHydrationConfig = {
//     mountPoint: string
//     hydrate: () => void
// }

// declare global {
//     interface Window {
//         pageRegistry: Map<string, PageHydrationConfig>
//     }
// }

// // Global registry for page hydration
// window.pageRegistry = window.pageRegistry || new Map()

goooHydrate('/gen/js/home.js', '#home', () => {
    console.log('Hydrating home.js for path:', window.location.pathname)
    const initialDataElement = document.getElementById('home-initial-data')
    const initialData = initialDataElement ? JSON.parse(initialDataElement.textContent ?? '{}') : {}
    const app = createApp(Home, { initialData })
    app.use(createPinia())
    app.mount('#home')
    console.log('Vue app mounted on #home')
})

// // Register page hydration config
// window.pageRegistry.set('/gen/js/home.js', {
//     mountPoint: '#home',
//     hydrate: () => {
//         console.log('Hydrating home.js for path:', window.location.pathname)
//         const initialDataElement = document.getElementById('home-initial-data')
//         const initialData = initialDataElement ? JSON.parse(initialDataElement.textContent ?? '{}') : {}
//         const app = createApp(Home, { initialData })
//         app.use(createPinia())
//         app.mount('#home')
//         console.log('Vue app mounted on #home')
//     }
// })

// console.log('home.js executed for path: ', window.location.pathname);
// window.pageRegistry.get('/gen/js/home.js')?.hydrate()


// const app = createApp(Home)

// app.use(createPinia())

// app.mount('#home')
