# _Gooo_<sup>("goo")</sup>

![Gooo Logo](https://raw.githubusercontent.com/Tmmcmasters/Gooo/refs/heads/main/static/assets/img/goo_resized.webp)

_Gooo_<sup>("goo")</sup> (also known as **Groov** or **Glue**) is a powerful and flexible toolkit for developing modern web applications using **Go**, **Templ**, **Vue 3**, and **Echo**. It is designed to streamline the developer experience with features like router prefetching, Vue HMR (Hot Module Replacement), Go live reloading, and Tailwind CSS live reloading. The toolkit is fully customizable, allowing developers to tailor it to their specific needs while maintaining a rapid development workflow.

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

- **Vue 3 Integration**: Leverage the power of Vue 3 with Vite for a fast and modern front-end development experience.
- **Templ for Go**: Use Templ to create type-safe, performant server-side rendered templates in Go.
- **Echo Framework**: Utilize the lightweight and fast Echo web framework for building robust Go backends.
- **Hot Reloading**:
  - Vue HMR for instant front-end updates.
  - Go live reloading for seamless backend development.
  - Tailwind CSS live reloading for real-time styling updates.
- **Router Prefetching**: Improve performance with intelligent router prefetching for faster page loads.
- **Customizable**: Fully customizable setup to adapt to various project requirements.
- **TypeScript Support**: Enhanced type safety for Vue components with `vue-tsc` and Volar.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Go** (v1.18 or higher)
- **Vite** (for front-end tooling)
- **VSCode** with the **Volar** extension (recommended, disable Vetur if installed)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Tmmcmasters/Gooo.git
   cd Gooo
   ```

2. Install front-end dependencies:

   ```bash
   npm install
   ```

3. Set up the Go backend:
   Ensure your Go environment is configured, and install any required Go dependencies (e.g., Templ, Echo):
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

For questions, issues, or suggestions, please open an issue on the [GitHub repository](https://github.com/Tmmcmasters/Gooo) or contact the maintainer at [your-contact-info] (update with your preferred contact method).

---

© 2025 Tmmcmasters. Built with _Gooo_<sup>("goo")</sup>.
