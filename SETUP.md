# Step-by-Step Setup Guide

This guide provides detailed commands to create a Vite React TypeScript project with all dependencies from scratch.

## Step 1: Create Vite React TypeScript Project

```bash
# Navigate to your desired directory
cd /path/to/your/projects

# Create a new Vite project with React TypeScript template
npm create vite@latest habit-tracker -- --template react-ts

# Navigate into the project
cd habit-tracker
```

## Step 2: Install Base Dependencies

```bash
# Install the base dependencies
npm install
```

## Step 3: Install Required Dependencies

```bash
# Install routing, date handling, and utility libraries
npm install react-router-dom date-fns nanoid clsx
```

Packages installed:
- `react-router-dom` - Declarative routing for React applications
- `date-fns` - Modern JavaScript date utility library
- `nanoid` - Tiny, secure, URL-friendly unique string ID generator
- `clsx` - Utility for constructing className strings conditionally

## Step 4: Install Tailwind CSS

```bash
# Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
```

## Step 5: Configure Tailwind CSS

Create `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `postcss.config.js`:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

## Step 6: Setup Tailwind in CSS

Create/update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Step 7: Create Folder Structure

```bash
# Create the recommended folder structure
cd src
mkdir pages components store utils styles

# Move existing CSS files to styles folder (if any)
mv index.css styles/ 2>/dev/null || true
mv App.css styles/ 2>/dev/null || true

# Create index.css with Tailwind directives
cat > index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cd ..
```

## Final Folder Structure

```
src/
├── components/       # Reusable UI components
│   ├── HabitCard.tsx
│   └── ThemeToggle.tsx
├── pages/           # Page components for routing
│   └── Dashboard.tsx
├── store/           # State management and data persistence
│   ├── types.ts
│   └── habitStore.ts
├── utils/           # Utility functions
│   ├── classNames.ts
│   └── dateUtils.ts
├── styles/          # Additional CSS files
│   ├── App.css
│   └── index.css
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
└── index.css        # Global styles with Tailwind
```

## Step 8: Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Step 9: Build for Production

```bash
npm run build
```

## Step 10: Preview Production Build

```bash
npm run preview
```

## Package.json Scripts

Your `package.json` should include these scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## Installed Dependencies

### Production Dependencies
- `react` - UI library
- `react-dom` - React renderer for web
- `react-router-dom` - Routing library
- `date-fns` - Date utilities
- `nanoid` - ID generator
- `clsx` - Classname utility

### Development Dependencies
- `vite` - Build tool
- `typescript` - Type checking
- `@vitejs/plugin-react` - React plugin for Vite
- `tailwindcss` - CSS framework
- `postcss` - CSS processor
- `autoprefixer` - PostCSS plugin
- `@tailwindcss/postcss` - Tailwind PostCSS plugin
- `eslint` - Code linting
- Various TypeScript and ESLint type definitions

## Next Steps

Start building your habit tracker features:
1. Create habit models in `src/store/types.ts`
2. Implement state management in `src/store/habitStore.ts`
3. Build UI components in `src/components/`
4. Create page views in `src/pages/`
5. Add utility functions in `src/utils/`
6. Style with Tailwind CSS classes

## Clean and Minimal

This setup provides:
- ✅ Modern React with TypeScript
- ✅ Fast development with Vite HMR
- ✅ Utility-first styling with Tailwind
- ✅ Client-side routing with React Router
- ✅ Organized folder structure
- ✅ Production-ready build configuration
- ✅ Code quality with ESLint

Happy coding! 🚀
