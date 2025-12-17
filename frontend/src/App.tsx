import React from 'react';

import OverviewDashboard from './components/OverviewDashboard';
import CreatePost from './components/CreatePost';
import ScheduleCalendar from './components/ScheduleCalendar';
import Lookbook from './components/Lookbook';
import Livestream from './components/Livestream';
import Statistics from './components/Statistics';
import Orders from './components/Orders';
import Login from './components/Login';
import { apiFetch } from './utils/api';

type PageKey = 'overview' | 'create-post' | 'schedule' | 'lookbook' | 'livestream' | 'statistics' | 'orders';

function App() {
  const [loggedIn, setLoggedIn] = React.useState(() => !!localStorage.getItem('token'));
  const [page, setPage] = React.useState<PageKey>('overview');
  const [pendingCount, setPendingCount] = React.useState(0);

  const handleLogin = () => setLoggedIn(true);

  // Fetch pending count whenever logged in state changes
  React.useEffect(() => {
    if (!loggedIn) {
      setPendingCount(0);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const resp = await apiFetch('/api/orders?page=1&pageSize=1&status=pending');
        if (!resp.ok) throw new Error('Failed to fetch pending count');
        const data = await resp.json();
        if (!cancelled) setPendingCount(data.total || 0);
      } catch (err) {
        // Silently fail, keep existing count
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);
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
    if (label === 'Thống kê') {
      setPage('statistics');
    }
    if (label === 'Quản lý đơn hàng') {
      setPage('orders');
    }
  };

  if (!loggedIn) return <Login onLogin={handleLogin} />;
  
  if (page === 'create-post') return <CreatePost onNavigate={handleNavigate} pendingCount={pendingCount} />;
  if (page === 'schedule') return <ScheduleCalendar onNavigate={handleNavigate} pendingCount={pendingCount} />;
  if (page === 'lookbook') return <Lookbook onNavigate={handleNavigate} pendingCount={pendingCount} />;
  if (page === 'livestream') return <Livestream onNavigate={handleNavigate} pendingCount={pendingCount} />;
  if (page === 'statistics') return <Statistics onNavigate={handleNavigate} pendingCount={pendingCount} />;
  if (page === 'orders') return <Orders onNavigate={handleNavigate} pendingCount={pendingCount} setPendingCount={setPendingCount} />;
  return <OverviewDashboard onNavigate={handleNavigate} pendingCount={pendingCount} />;
}

export default App;
