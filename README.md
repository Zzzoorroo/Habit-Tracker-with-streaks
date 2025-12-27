# Habit Tracker with Streaks

A modern habit tracker built with React, TypeScript, and Tailwind CSS. Features include streak tracking, badges, monthly heatmap, and theme switching.

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Date Handling:** date-fns
- **Utilities:** clsx, nanoid

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Habit-Tracker-with-streaks
```

### Step 2: Install Dependencies

```bash
npm install
```

The project includes the following dependencies:
- `react-router-dom` - Client-side routing
- `date-fns` - Date utility functions
- `nanoid` - Unique ID generation
- `clsx` - Conditional CSS classes
- `tailwindcss` - Utility-first CSS framework

### Step 3: Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 4: Build for Production

```bash
npm run build
```

### Step 5: Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── HabitCard.tsx
│   └── ThemeToggle.tsx
├── pages/           # Page components
│   └── Dashboard.tsx
├── store/           # State management
│   ├── types.ts
│   └── habitStore.ts
├── utils/           # Utility functions
│   ├── classNames.ts
│   └── dateUtils.ts
├── styles/          # CSS files
│   ├── index.css
│   └── App.css
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles with Tailwind directives
```

## Features

- ✅ Habit tracking with daily completion
- 🔥 Streak calculation
- 🏆 Badge system
- 📅 Monthly heatmap visualization
- 🌓 Light/Dark theme switcher
- 💾 Local storage persistence

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Configuration Files

- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration

## Development

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Tailwind CSS** for styling
- **Local Storage** for data persistence

Start building your features in the `src/` directory following the established folder structure.
