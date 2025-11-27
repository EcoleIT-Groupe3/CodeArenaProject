import { useState } from 'react';
import HomePage from './pages/HomePage';
import ProblemsPage from './pages/ProblemsPage';
import SubmissionPage from './pages/SubmissionPage';
import ContestsPage from './pages/ContestsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'problems':
        return <ProblemsPage onNavigate={handleNavigate} />;
      case 'submission':
        return <SubmissionPage onNavigate={handleNavigate} />;
      case 'contests':
        return <ContestsPage onNavigate={handleNavigate} />;
      case 'leaderboard':
        return <LeaderboardPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
