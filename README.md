# _Gooo_<sup>("goo")</sup>

<img src="https://raw.githubusercontent.com/Tmmcmasters/Gooo/refs/heads/main/static/assets/img/goo_resized.webp" alt="Gooo Logo" width="200">

_Gooo_<sup>("goo")</sup> is a powerful and flexible toolkit for developing modern web applications using **Go**, **Templ**, **Vue 3**, and **Echo**. It is designed to enhance the developer experience with features like router prefetching, Vue HMR (Hot Module Replacement), Go live reloading, and Tailwind CSS live reloading. The toolkit is fully customizable, allowing developers to tailor it to their specific needs while maintaining a rapid development workflow. You can change anything

The code is delivered as-is directly from the [Tmmcmasters/Gooo](https://github.com/Tmmcmasters/Gooo) repository. Just execute the terminal script following the instructions. The terminal script that is run is get-gooo which is from this repository. See [Get-Gooo](https://github.com/Tmmcmasters/Get-Gooo)

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Vue 3 Integration**: Leverage the power of Vue 3 Composition API with Vite for a fast and modern front-end development experience.
- **Templ for Go**: Use Templ to create type-safe, performant server-side rendered templates in Go.
- **Echo Framework**: Utilize the lightweight and fast Echo web framework for building robust Go backends.
- **Hot Reloading**:
  - Vue HMR for instant front-end updates.
  - Go live reloading for seamless backend.
  - Templ Proxy Live reloading for server-side templates.
  - Tailwind CSS live reloading for real-time styling updates.
- **Router Prefetching**: Improve performance with intelligent router prefetching for faster page loads with GoooLink.
- **Tailwind CSS**: Utilize Tailwind CSS for styling and responsive design.
- **Shadcn-Vue**: Utilize Shadcn-vue(out of the box) for a modern and accessible UI library or whatever you want.
- **Customizable**: Fully customizable setup to adapt to various project requirements.
- **TypeScript Support**: Out of the box with Vite and Vue Single File Components.
- **Linting and Formatting**: Built-in support for ESLint and Prettier for code quality and formatting.
- **Included Dockerfile**: A ready-to-run Dockerfile for easy deployment.
- **Included Makefile**: A ready-to-run Makefile for easy development and deployment.
- **Included Env Script/Files**: A customizable ready-to-run env script for easy deployment.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v22+ recommended)
- **npm**
- **Go**
- **Templ** (For the server side templates)
- **Make** (for development and deployment)

### Installation

1. **Download and Run the [Get-Gooo](https://github.com/Tmmcmasters/Get-Gooo) script**:

   **For Linux/MacOS**

   ```bash
   curl -L -o get-gooo https://github.com/Tmmcmasters/Get-Gooo/raw/refs/heads/main/get-gooo
   chmod +x get-gooo
   ./get-gooo
   ```

   **For Windows**

   ```powershell
   Invoke-WebRequest -Uri https://github.com/Tmmcmasters/Get-Gooo/raw/refs/heads/main/get-gooo.exe -OutFile get-gooo.exe
   .\get-gooo.exe
   ```

2. Install Templ CLI:

   ```bash
   go install github.com/a-h/templ/cmd/templ@latest
   ```

3. Install Front-end dependencies:

   ```bash
   npm install
   ```

4. Run `go mod tidy` for good fortune

   ```bash
   go mod tidy
   ```

5. Generate environment variables

   ```bash
   make build-gen-envs
   make gen-envs
   ```

6. Run locally

   ```bash
   make run
   ```

### Development Workflow

1. **Start the development server**:
   Run the following command to start the Vite development server with Vue HMR and Tailwind CSS live reloading:

   ```bash
   npm run dev
   ```

2. **Run the Go backend**:
   Start the Go server with live reloading (using a tool like `air` for Go live reloading, if configured):

   ```bash
   go run main.go
   ```

3. **Build for production**:
   Compile and minify the front-end assets for production:

   ```bash
   npm run build
   ```

4. **Lint the code**:
   Check and fix code quality issues with ESLint:
   ```bash
   npm run lint
   ```

## Project Structure

```
Gooo/
├── .github/
├── .vscode/
├── client/
│   ├── components/         # Vue components
│   ├── composables/        # Vue composable functions
│   ├── layout/             # Vue layout templates
│   ├── lib/                # Vue library functions
│   ├── page/               # Vue page templates
│   ├── stores/             # Vue pinia stores
│   ├── utils/              # Vue utility functions
│   ├── home.ts             # Vue home page entrypoint
│   ├── themeSwitcher.ts    # Vue theme switcher entrypoint
│   └── todos.ts            # Vue todo page entrypoint
├── constants/
├── gen/                    # Vite generated files
│── generate-envs/          # Generates env files go script
│── generate-manifest/      # Generates manifest files go script
│── handlers/               # Server-side handlers for API
│── helpers/                # Helper functions
│── inject-tailwind/        # Injects Tailwind CSS into template files
├── node_modules/
├── server/                 # Backend server-side-templates
│   ├── components/         # General components
│   ├── generated/          # Auto-generated templates
│   ├── icons/              # Icon components
│   ├── layout/             # Layout templates for server
│   ├── pages/              # Server-side pages templates
│   └── utility/            # Utility templates for server
├── static/                 # Static assets like favicon.ico
├── tmp/
│   └── main
├── .air.toml
├── .editorconfig
├── .env.dev                # Actual dev env file that is read
├── .env.dev2               # Template dev env file
├── .env.prod
├── .env.prod2
├── .gitattributes
├── .gitignore
├── Dockerfile
├── env.d.ts
├── eslint.config.js
├── go.mod
├── go.sum
├── LICENSE
├── Makefile
├── notes.md
├── package.json
├── package-lock.json
├── railway.json
├── README.md
├── tailwind.css
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts

```

## Configuration

- **No Special Configs** for now
- **Vite Configuration**: Customize the Vite setup by editing `vite.config.ts`. Refer to the [Vite Configuration Reference](https://vitejs.dev/config/) for details.
- **Tailwind CSS**: Tailwind is pre-configured for live reloading. Modify `tailwind.css` to customize styles.
- **Echo Routes**: Define server routes in the Go backend using the Echo framework. Check main.go for examples.
- **Dockerfile**: Use the provided Dockerfile for deployment. Adjust as you see fit.
- **Makefile**: Use the provided Makefile for development and deployment. Adjust as you see fit.
- **.air.toml**: Customize the Air configuration for Go live reloading. Refer to the [Air Configuration Reference](https://github.com/air-verse/air) for details.
- **components.json**: The components for shadcn-vue.
- **.j2 env files**: Customize the environment variables and then run the gen-env command in the Makefile.
- **.prettierrc.json**: Customize the Prettier configuration. Refer to the [Prettier Configuration Reference](https://prettier.io/docs/en/configuration.html) for details.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure your code follows the project's linting rules and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions, issues, or suggestions, please open an issue on the [GitHub repository](https://github.com/Tmmcmasters/Gooo).

---

© 2025 Timothy McMasters. Built with _Gooo_<sup>("goo")</sup>.
