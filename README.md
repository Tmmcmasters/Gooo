# _Gooo_<sup>("goo")</sup>

<img src="https://raw.githubusercontent.com/Tmmcmasters/Gooo/refs/heads/main/static/assets/img/goo_resized.webp" alt="Gooo Logo" width="200">

_Gooo_<sup>("goo")</sup> is a powerful and flexible toolkit for developing modern web applications using **Go**, **Templ**, **Vue 3**, and **Echo**. It is designed to enhance the developer experience with features like router prefetching, Vue HMR (Hot Module Replacement), Go live reloading, and Tailwind CSS live reloading. The toolkit is fully customizable, allowing developers to tailor it to their specific needs while maintaining a rapid development workflow. You can change anything

The code is delivered as-is directly from the [Tmmcmasters/Gooo](https://github.com/Tmmcmasters/Gooo) repository.

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

1. Clone the repository:

   ```bash
   git clone https://github.com/Tmmcmasters/Gooo.git
   cd Gooo
   ```

2. Install Templ CLI:

   ```bash
   go install github.com/a-h/templ/cmd/templ@latest
   ```

3. Install Front-end dependencies:

   ```bash
   npm install
   ```

4. Go mod tidy for good fortune
   ```bash
   go mod tidy
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
├── client/                 # Vue 3 front-end code (Vite-based)
├── static/                 # Static assets (e.g., images)
│   └── assets/img/goo_resized.webp
├── main.go                 # Go backend entry point
├── templates/              # Templ files for server-side rendering
├── go.mod                  # Go module dependencies
├── package.json            # Node.js dependencies and scripts
└── README.md               # This file
```

## Configuration

- **Vite Configuration**: Customize the Vite setup by editing `vite.config.js`. Refer to the [Vite Configuration Reference](https://vitejs.dev/config/) for details.
- **TypeScript Support**: Use `vue-tsc` for type checking in `.vue` files. Ensure Volar is installed in VSCode for proper TypeScript support.
- **Tailwind CSS**: Tailwind is pre-configured for live reloading. Modify `tailwind.config.js` to customize styles.
- **Echo Routes**: Define server routes in the Go backend using the Echo framework.

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
