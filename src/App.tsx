// Main App component with routing
import { type FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HabitsProvider } from './store/useHabitsStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import About from './pages/About';

const App: FC = () => {
  return (
    <HabitsProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </Router>
    </HabitsProvider>
  );
};

export default App;
