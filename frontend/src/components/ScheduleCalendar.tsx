import React from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import ChannelList from './ChannelList';
import FooterBar from './FooterBar';
import { apiFetch } from '../utils/api';

const clockIcon = 'https://www.figma.com/api/mcp/asset/51898829-aa59-4fd4-a90d-2f61fff85a4e';
const fbIcon = 'https://www.figma.com/api/mcp/asset/add75e7d-4fc4-4f60-ba4a-2032d5b716f2';
const igIcon = 'https://www.figma.com/api/mcp/asset/4f75fd91-e820-4cbb-ac8f-555a81fb4a29';
const threadIcon = 'https://www.figma.com/api/mcp/asset/587c0f19-1a1d-4a55-b6f0-9c0602866e8b';

type SchedulePostProps = {
  onNavigate?: (label: string) => void;
  pendingCount?: number;
};

type Post = {
  id: number;
  title: string;
  status: string;
  scheduledAt?: string | null;
  content?: string;
};

const COLUMN_WIDTH = 156;

const daysOfWeek = [
  { label: 'Thứ hai', day: 1 },
  { label: 'Thứ ba', day: 2 },
  { label: 'Thứ tư', day: 3 },
  { label: 'Thứ năm', day: 4 },
  { label: 'Thứ sáu', day: 5 },
  { label: 'Thứ bảy', day: 6 },
  { label: 'Chủ nhật', day: 7 },
];

const ScheduleCalendar: React.FC<SchedulePostProps> = ({ onNavigate, pendingCount = 0 }) => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [currentWeek, setCurrentWeek] = React.useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());

  React.useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await apiFetch('/api/posts?status=SCHEDULED');
        if (!res.ok) throw new Error('Failed to load posts');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadPosts();
  }, []);

  const getWeekDates = () => {
    const start = new Date(currentWeek);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const getPostsForDate = (date: Date) => {
    return posts.filter((post) => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return { bg: 'bg-[#9cff7b]', text: 'text-[#2cb100]', label: 'Đã đăng' };
      case 'SCHEDULED':
        return { bg: 'bg-[#ff8e84]', text: 'text-[#db1a08]', label: 'Chưa đăng' };
      case 'DRAFT':
        return { bg: 'bg-[#e5e5e5]', text: 'text-[#1a0330]', label: 'Bản nháp' };
      default:
        return { bg: 'bg-[#e5e5e5]', text: 'text-[#737373]', label: status };
    }
  };

  const getWeekNumber = () => {
    const start = new Date(currentWeek);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    const firstWeek = new Date(start.getFullYear(), 0, 1);
    const daysToFirstWeek = firstWeek.getDay();
    const adjustedFirstDay = new Date(firstWeek.setDate(firstWeek.getDate() - daysToFirstWeek));
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const week = Math.ceil(((start.getTime() - adjustedFirstDay.getTime()) / millisecondsPerWeek) + 1);
    return week;
  };

  const monthYear = currentWeek.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const weekNumber = getWeekNumber();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarMonth);
    const days = [];

    // Days from previous month
    const prevMonthDays = getDaysInMonth(new Date(year, month - 1, 1));
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Days from next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex-1 flex w-full">
        <aside className="w-[336px] bg-white border-r border-[#d4d4d4] flex flex-col">
          <ChannelList />
          <Sidebar activeLabel="Lịch đăng" onSelect={onNavigate} pendingCount={pendingCount} />
        </aside>
        <main className="flex-1 flex flex-col w-[1104px]">
          <TopNav pendingCount={pendingCount} />
          <div className="flex flex-col px-[21px] pb-[30px]">
            {/* Header with title and date picker */}
            <div className="flex items-start justify-between pt-4 pb-[30px] border-b border-[#d4d4d4]">
              <div className="flex flex-col gap-[10px]">
                <h1 className="text-[20px] font-bold leading-[28px] text-black">Lịch đăng bài</h1>
                <p className="text-[14px] leading-[22px] text-black">
                  Kiểm tra và quản lý lịch trình hoạt động của thương hiệu
                </p>
              </div>

              {/* Date picker */}
              <div className="relative">
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="px-4 py-2 border border-[#737373] rounded-[8px] text-[14px] text-[#737373] hover:bg-[#f5f5f5] flex items-center gap-2 whitespace-nowrap"
                >
                  Tuần {weekNumber}, {monthYear}
                  <span>▼</span>
                </button>
                {showMonthPicker && (
                  <div className="absolute top-full right-0 mt-2 bg-[#2a2a2a] border border-[#737373] rounded-[8px] shadow-lg p-4 z-10">
                    {/* Month/Year header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => {
                          const prev = new Date(calendarMonth);
                          prev.setMonth(prev.getMonth() - 1);
                          setCalendarMonth(prev);
                        }}
                        className="text-[#9a9a9a] hover:text-white text-[20px]"
                      >
                        ▲
                      </button>
                      <div className="text-center flex-1">
                        <div className="text-[#e5e5e5] text-[14px] font-semibold">
                          {calendarMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const next = new Date(calendarMonth);
                          next.setMonth(next.getMonth() + 1);
                          setCalendarMonth(next);
                        }}
                        className="text-[#9a9a9a] hover:text-white text-[20px]"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['H', 'B', 'T', 'N', 'S', 'B', 'C'].map((day) => (
                        <div key={day} className="w-8 h-8 flex items-center justify-center text-[#9a9a9a] text-[12px] font-semibold">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((dayObj, idx) => {
                        const isToday =
                          dayObj.isCurrentMonth &&
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayObj.day).toDateString() ===
                            new Date().toDateString();
                        const isSelected =
                          dayObj.isCurrentMonth &&
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayObj.day).toDateString() ===
                            currentWeek.toDateString();

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (dayObj.isCurrentMonth) {
                                const selected = new Date(
                                  calendarMonth.getFullYear(),
                                  calendarMonth.getMonth(),
                                  dayObj.day
                                );
                                setCurrentWeek(selected);
                                setShowMonthPicker(false);
                              }
                            }}
                            className={`w-8 h-8 flex items-center justify-center text-[12px] rounded-[4px] transition-colors ${
                              !dayObj.isCurrentMonth
                                ? 'text-[#505050]'
                                : isSelected
                                ? 'bg-[#5ab1f5] text-white font-semibold'
                                : isToday
                                ? 'border border-[#5ab1f5] text-[#5ab1f5] font-semibold'
                                : 'text-[#e5e5e5] hover:bg-[#404040]'
                            }`}
                          >
                            {dayObj.day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-2 justify-between mt-4 pt-4 border-t border-[#505050]">
                      <button
                        onClick={() => {
                          const today = new Date();
                          setCalendarMonth(today);
                          setCurrentWeek(today);
                          setShowMonthPicker(false);
                        }}
                        className="text-[#5ab1f5] text-[12px] font-semibold hover:text-[#7bc4f9]"
                      >
                        Hôm nay
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="mt-[30px]">
            <div className="border border-[#d4d4d4] rounded-[16px] overflow-hidden bg-white">
              {/* Days header */}
              <div className="flex border-b border-[#d4d4d4] bg-white">
                {daysOfWeek.map((day, idx) => {
                  const date = weekDates[idx];
                  return (
                    <div
                      key={day.label}
                      style={{ width: `${COLUMN_WIDTH}px` }}
                      className={`flex flex-col gap-[10px] items-center justify-center py-[9px] border-[#d4d4d4] hover:bg-[#f3e8ff] transition-colors ${
                        idx > 0 ? 'border-l' : ''
                      }`}
                    >
                      <p className="text-[16px] font-semibold text-black">{day.label}</p>
                      <div className="bg-[#7037a5] text-white text-[16px] font-semibold rounded-full w-[32px] h-[32px] flex items-center justify-center">
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar grid */}
              <div className="flex bg-white min-h-[517px]" style={{ width: `${COLUMN_WIDTH * 7}px` }}>
                {weekDates.map((date, idx) => {
                  const dayPosts = getPostsForDate(date);
                  return (
                    <div
                      key={idx}
                      style={{ width: `${COLUMN_WIDTH}px` }}
                      className={`relative bg-white border-[#d4d4d4] hover:bg-[#f9f5ff] transition-colors ${
                        idx > 0 ? 'border-l' : ''
                      }`}
                    >
                      <div className="p-1 flex flex-col gap-2">
                        {dayPosts.map((post, pIdx) => {
                          const statusStyle = getStatusColor(post.status);
                          const time = post.scheduledAt
                            ? new Date(post.scheduledAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '12:30';

                          return (
                            <div
                              key={post.id}
                              className={`bg-white rounded-[8px] shadow-[0px_5px_13.3px_0px_rgba(0,0,0,0.25)] w-[134px] border border-[#e5e5e5]`}
                              style={{ marginTop: pIdx * 90 + 'px' }}
                            >
                              <div className="bg-[#f9f5ff] flex items-center justify-between px-[7px] py-[4px] rounded-t-[8px]">
                                <div className="flex items-center gap-[3.843px]">
                                  <img
                                    src={clockIcon}
                                    alt="time"
                                    className="w-[15.372px] h-[15.372px]"
                                  />
                                  <span
                                    className={`text-[12px] text-black`}
                                  >
                                    {time}
                                  </span>
                                </div>
                                <div className="w-[18px] h-[19px]">
                                  <img
                                    src={
                                      post.content?.includes('Facebook')
                                        ? fbIcon
                                        : post.content?.includes('Instagram')
                                        ? igIcon
                                        : threadIcon
                                    }
                                    alt="platform"
                                    className="w-full h-full"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-[10px] p-[12px]">
                                <p
                                  className={`text-[14px] leading-[22px] w-[122px] text-black`}
                                >
                                  {post.title}
                                </p>
                                <div
                                  className={`border border-solid px-[7px] py-[4px] rounded-[8px] w-fit ${statusStyle.bg}`}
                                  style={{
                                    borderColor:
                                      post.status === 'DRAFT' ? '#d4d4d4' : 'currentColor',
                                  }}
                                >
                                  <span className={`text-[12px] ${statusStyle.text}`}>
                                    {statusStyle.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-[5.764px]">
                                  <div className="w-[4px] h-[4px] bg-[#391060] rounded-full"></div>
                                  <span
                                    className={`text-[12px] text-[#7037a5]`}
                                  >
                                    {post.content?.includes('Story')
                                      ? 'Story'
                                      : post.content?.includes('Reel')
                                      ? 'Reel'
                                      : 'Bài đăng'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          </div>
        </main>
      </div>
      <FooterBar />
    </div>
  );
};

export default ScheduleCalendar;
