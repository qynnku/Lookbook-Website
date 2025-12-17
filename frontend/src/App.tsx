import React from 'react';

import OverviewDashboard from './components/OverviewDashboard';
import CreatePost from './components/CreatePost';
import ScheduleCalendar from './components/ScheduleCalendar';
import Lookbook from './components/Lookbook';
import Livestream from './components/Livestream';
import Login from './components/Login';

type PageKey = 'overview' | 'create-post' | 'schedule' | 'lookbook' | 'livestream';

function App() {
  const [loggedIn, setLoggedIn] = React.useState(() => !!localStorage.getItem('token'));
  const [page, setPage] = React.useState<PageKey>('overview');

  const handleLogin = () => setLoggedIn(true);
  const handleNavigate = (label: string) => {
    if (label === 'Tạo bài đăng') {
      setPage('create-post');
    }
    if (label === 'Tổng quan') {
      setPage('overview');
    }
    if (label === 'Lịch đăng') {
      setPage('schedule');
    }
    if (label === 'Lookbook') {
      setPage('lookbook');
    }
    if (label === 'Livestream') {
      setPage('livestream');
    }
  };

  if (!loggedIn) return <Login onLogin={handleLogin} />;
  
  if (page === 'create-post') return <CreatePost onNavigate={handleNavigate} />;
  if (page === 'schedule') return <ScheduleCalendar onNavigate={handleNavigate} />;
  if (page === 'lookbook') return <Lookbook onNavigate={handleNavigate} />;
  if (page === 'livestream') return <Livestream onNavigate={handleNavigate} />;
  return <OverviewDashboard onNavigate={handleNavigate} />;
}

export default App;
