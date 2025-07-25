6. Optional: Generate Page Scripts
   To further reduce boilerplate, you could use a script to generate page .js files based on a template. For example, a Node.js script to create home.js, todo.js, etc.:

javascript

Collapse

Wrap

Run

```js
// scripts/generate-page.js
const fs = require('fs')
const path = require('path')

const pages = [
{ name: 'home', component: 'Home', mountPoint: '#home', initialDataId: 'home-initial-data' },
{ name: 'todo', component: 'Todo', mountPoint: '#todo', initialDataId: 'todo-initial-data' },
]

const template = (page) => `
import { hydratePage } from '../utils/hydratePage'
import ${page.component} from './page/${page.component}.vue'

hydratePage({
scriptSrc: '/gen/js/${page.name}.js',
  component: ${page.component},
  mountPoint: '${page.mountPoint}',
initialDataId: '${page.initialDataId}',
})
`

pages.forEach((page) => {
fs.writeFileSync(
path.join(\_\_dirname, `../gen/js/${page.name}.js`),
template(page),
'utf8'
)
console.log(`Generated ${page.name}.js`)
})
```

Run with:
<code>
node scripts/generate-page.js
</code>

This generates home.js, todo.js, etc., ensuring consistency. Update your build process (e.g., package.json scripts) to run this before Vite builds.
