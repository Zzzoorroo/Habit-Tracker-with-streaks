# Quick Start Commands

## For New Projects (Step-by-Step)

```bash
# 1. Create Vite React TypeScript project
npm create vite@latest habit-tracker -- --template react-ts
cd habit-tracker

# 2. Install base dependencies
npm install

# 3. Install required dependencies
npm install react-router-dom date-fns nanoid clsx

# 4. Install Tailwind CSS and dependencies
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

# 5. Create folder structure
cd src
mkdir pages components store utils styles
cd ..

# 6. Run development server
npm run dev

# 7. Build for production
npm run build
```

## For This Repository

```bash
# Clone the repository
git clone https://github.com/Zzzoorroo/Habit-Tracker-with-streaks.git
cd Habit-Tracker-with-streaks

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Dependencies Installed

### Production
- react ^19.2.0
- react-dom ^19.2.0
- react-router-dom ^7.11.0
- date-fns ^4.1.0
- nanoid ^5.1.6
- clsx ^2.1.1

### Development
- vite ^7.2.4
- typescript ~5.9.3
- tailwindcss ^4.1.18
- @tailwindcss/postcss ^4.1.18
- postcss ^8.5.6
- autoprefixer ^10.4.23
- eslint ^9.39.1
- @vitejs/plugin-react ^5.1.1

## Key Configuration Files

- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration with safelist
- `postcss.config.js` - PostCSS plugins configuration
- `tsconfig.json` - TypeScript base configuration
- `tsconfig.app.json` - TypeScript app configuration
- `eslint.config.js` - ESLint configuration

## Folder Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components for routing
├── store/           # State management and types
├── utils/           # Utility functions
├── styles/          # Additional CSS files
├── App.tsx          # Main app with routing
├── main.tsx         # Application entry
└── index.css        # Tailwind directives
```
