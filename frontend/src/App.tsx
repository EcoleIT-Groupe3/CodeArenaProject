import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ProblemsPage from './pages/ProblemsPage';
import SubmissionPage from './pages/SubmissionPage';
import ContestsPage from './pages/ContestsPage';
import ContestRoomPage from './pages/ContestRoomPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [contestId, setContestId] = useState<string | undefined>();

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    if (page === 'contest-room' && id) {
      setContestId(id);
    }
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
      case 'contest-room':
        return <ContestRoomPage onNavigate={handleNavigate} contestId={contestId} />;
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

  return (
    <AuthProvider>
      {renderPage()}
    </AuthProvider>
  );
}

export default App;
