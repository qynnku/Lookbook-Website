import React from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import ChannelList from './ChannelList';
import FooterBar from './FooterBar';
import { apiFetch } from '../utils/api';

const tagIcon = 'https://www.figma.com/api/mcp/asset/e3326a09-2edb-4c74-bb07-fba9628fb6fd';
const addIcon = 'https://www.figma.com/api/mcp/asset/f6b0c2bd-617d-4bc4-9be8-d257b036522d';

const columns = [
  { title: 'Nháp', status: 'DRAFT' },
  { title: 'Lên lịch', status: 'SCHEDULED' },
  { title: 'Đã đăng', status: 'PUBLISHED' },
];

type Post = {
  id: number;
  title: string;
  status: string;
  tags?: string | null;
  content?: string;
  media?: string | null;
  platforms?: string | null;
  scheduledAt?: string | null;
};

type CreatePostProps = {
  onNavigate?: (label: string) => void;
  pendingCount?: number;
};

const CreatePost: React.FC<CreatePostProps> = ({ onNavigate, pendingCount = 0 }) => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [selected, setSelected] = React.useState<Post | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState({ title: '', content: '', tags: '', status: 'DRAFT', scheduledAt: '', platforms: '' });
  const [media, setMedia] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [selectedTag, setSelectedTag] = React.useState<string>('');
  const [showTagMenu, setShowTagMenu] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());
  const [showPlatformMenu, setShowPlatformMenu] = React.useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const platforms = ['Facebook', 'TikTok', 'Instagram', 'Threads', 'X', 'LinkedIn', 'YouTube'];

  const loadPosts = React.useCallback(async () => {
    try {
      const url = selectedTag ? `/api/posts?tag=${encodeURIComponent(selectedTag)}` : '/api/posts';
      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  }, [selectedTag]);

  const loadTags = async () => {
    try {
      const res = await apiFetch('/api/posts/tags');
      if (!res.ok) throw new Error('Failed to load tags');
      const data = await res.json();
      setAvailableTags(data);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    loadPosts();
    loadTags();
  }, [loadPosts]);

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

    const prevMonthDays = getDaysInMonth(new Date(year, month - 1, 1));
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const getHoursForDate = (date: string) => {
    if (!date) return [];
    const baseDate = new Date(date);
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const d = new Date(baseDate);
      d.setHours(i, 0, 0, 0);
      hours.push(d);
    }
    return hours;
  };

  const parseScheduledDate = () => {
    if (!form.scheduledAt) return { date: '', time: '' };
    const [date, time] = form.scheduledAt.split('T');
    return { date, time: time?.slice(0, 5) || '00:00' };
  };

  const selectPost = (post: Post) => {
    setSelected(post);
    setForm({
      title: post.title,
      content: post.content || '',
      tags: post.tags || '',
      status: post.status,
      scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : '',
      platforms: post.platforms || '',
    });
    setSelectedPlatforms(post.platforms?.split(',').filter(Boolean) || []);
    setMedia(post.media || null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setMedia(data.url);
    } catch (err) {
      console.error(err);
      alert('Tải lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isCreating) {
        // Create new post
        const res = await apiFetch('/api/posts', {
          method: 'POST',
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            tags: form.tags,
            media,
            status: form.status,
            scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
            platforms: selectedPlatforms.join(','),
          }),
        });
        if (!res.ok) throw new Error('Create failed');
        const created = await res.json();
        setPosts((prev) => [created, ...prev]);
        setIsCreating(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        loadTags();
      } else if (selected) {
        // Update existing post
        const res = await apiFetch(`/api/posts/${selected.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            tags: form.tags,
            media,
            status: form.status,
            scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
            platforms: selectedPlatforms.join(','),
          }),
        });
        if (!res.ok) throw new Error('Save failed');
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setSelected(updated);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        loadTags();
      }
    } catch (err) {
      console.error(err);
      alert(isCreating ? 'Tạo bài viết thất bại' : 'Lưu bài viết thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!form.title || !form.content) {
      alert('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    if (!form.scheduledAt) {
      alert('Vui lòng chọn ngày giờ để lên lịch');
      setShowDatePicker(true);
      return;
    }
    setSaving(true);
    try {
      if (isCreating) {
        const res = await apiFetch('/api/posts', {
          method: 'POST',
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            tags: form.tags,
            media,
            status: 'SCHEDULED',
            scheduledAt: new Date(form.scheduledAt).toISOString(),
            platforms: selectedPlatforms.join(','),
          }),
        });
        if (!res.ok) throw new Error('Schedule create failed');
        const created = await res.json();
        setPosts((prev) => [created, ...prev]);
        setIsCreating(false);
        setSelected(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        loadTags();
      } else if (selected) {
        const res = await apiFetch(`/api/posts/${selected.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            tags: form.tags,
            media,
            status: 'SCHEDULED',
            scheduledAt: new Date(form.scheduledAt).toISOString(),
            platforms: selectedPlatforms.join(','),
          }),
        });
        if (!res.ok) throw new Error('Schedule update failed');
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setSelected(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        loadTags();
      }
      setShowDatePicker(false);
      onNavigate?.('Lịch đăng');
    } catch (err) {
      console.error(err);
      alert('Lên lịch thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelected(null);
    setForm({ title: '', content: '', tags: '', status: 'DRAFT', scheduledAt: '' });
    setMedia(null);
  };

  const handleCloseModal = () => {
    setIsCreating(false);
    setSelected(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex-1 flex w-full">
        <aside className="w-[336px] bg-white border-r border-[#d4d4d4] flex flex-col">
          <ChannelList />
          <Sidebar activeLabel="Tạo bài đăng" onSelect={onNavigate} pendingCount={pendingCount} />
        </aside>
        <main className="flex-1 flex flex-col w-[1104px]">
          <TopNav pendingCount={pendingCount} />
          <div className="flex flex-col px-[32px] pb-[30px] gap-4">
            <div className="flex flex-col gap-1 pt-4">
              <h1 className="text-[20px] font-bold leading-[28px] text-black">Bài đăng</h1>
              <div className="bg-[#a5a5e5] h-[4px] rounded-[3px] w-full" />
            </div>

            <div className="flex items-center justify-between pr-[18px]">
              <div className="flex items-center gap-2">
                {selectedTag && (
                  <div className="flex items-center gap-2 bg-[#f5f5f5] px-3 py-2 rounded-[8px] text-[14px]">
                    <span>Lọc: {selectedTag}</span>
                    <button
                      onClick={() => setSelectedTag('')}
                      className="text-[#7c7c7c] hover:text-black"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="relative">
                  <button
                    onClick={() => setShowTagMenu(!showTagMenu)}
                    className="border border-black rounded-[8px] px-[20px] py-[10px] flex items-center gap-[8px] text-[14px] leading-[22px] hover:bg-gray-50"
                  >
                    <img src={tagIcon} alt="Tag" className="w-4 h-4" />
                    <span>Tag</span>
                  </button>
                  {showTagMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-[#d4d4d4] rounded-[8px] shadow-lg min-w-[200px] z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setSelectedTag('');
                            setShowTagMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-[14px] hover:bg-gray-50"
                        >
                          Tất cả
                        </button>
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSelectedTag(tag);
                              setShowTagMenu(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-[14px] hover:bg-gray-50 ${
                              selectedTag === tag ? 'bg-[#f5f5f5] font-semibold' : ''
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                        {availableTags.length === 0 && (
                          <div className="px-4 py-2 text-[14px] text-[#7c7c7c]">Chưa có tag</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCreateNew}
                  className="border border-black rounded-[8px] px-[20px] py-[10px] flex items-center gap-[10px] text-[14px] leading-[22px] hover:bg-gray-50"
                >
                  <img src={addIcon} alt="Tạo bài viết" className="w-4 h-4" />
                  <span>Tạo bài viết</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-[32px] justify-between w-full">
              {columns.map((col, idx) => {
                const columnPosts = posts.filter((p) => p.status === col.status);
                return (
                  <div
                    key={`${col.title}-${idx}`}
                    className="border border-[#737373] rounded-[17px] bg-[#f5f5f5] px-[12px] py-[14px] w-[320px] flex flex-col gap-[18px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[4px]">
                        <span className="text-[18px] font-extrabold text-black">{col.title}</span>
                        <span className="text-[14px] text-black">({columnPosts.length})</span>
                      </div>
                      <img src={addIcon} alt="Add" className="w-4 h-4" />
                    </div>

                    {columnPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => selectPost(post)}
                        className="bg-white border border-[#d4d4d4] rounded-[8px] h-[80px] flex items-center justify-between px-[16px] text-[14px] text-black cursor-pointer hover:border-black"
                      >
                        <span className="pr-2 truncate max-w-[180px]">{post.title}</span>
                        {post.tags ? (
                          <span className="text-[12px] text-[#7c7c7c] truncate max-w-[90px] text-right">{post.tags}</span>
                        ) : null}
                      </div>
                    ))}

                    {columnPosts.length === 0 && (
                      <div className="bg-white border border-dashed border-[#d4d4d4] rounded-[8px] h-[80px] flex items-center justify-center px-[20px] text-[13px] text-[#737373]">
                        Chưa có bài
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
      <FooterBar />

      {(selected || isCreating) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-[12px] shadow-lg w-full max-w-[640px] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-[#d4d4d4]">
              <h2 className="text-[18px] font-semibold text-black">
                {isCreating ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'}
              </h2>
              <button className="text-[#7c7c7c]" onClick={handleCloseModal}>Đóng</button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">

            <label className="flex flex-col gap-2 text-[14px] text-black">
              Tiêu đề
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="border border-[#d4d4d4] rounded-[8px] px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-2 text-[14px] text-black">
              Nội dung
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={6}
                className="border border-[#d4d4d4] rounded-[8px] px-3 py-2"
              />
            </label>

            <div className="grid grid-cols-2 gap-4 text-[14px] text-black">
              <label className="flex flex-col gap-2">
                Tag
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="border border-[#d4d4d4] rounded-[8px] px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                Trạng thái
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="border border-[#d4d4d4] rounded-[8px] px-3 py-2"
                >
                  <option value="DRAFT">Nháp</option>
                  <option value="SCHEDULED">Lên lịch</option>
                  <option value="PUBLISHED">Đã đăng</option>
                </select>
              </label>
              <div className="flex flex-col gap-2 relative">
                <label className="text-[14px] text-black">Nền tảng</label>
                <button
                  type="button"
                  onClick={() => setShowPlatformMenu(!showPlatformMenu)}
                  className="border border-[#d4d4d4] rounded-[8px] px-3 py-2 text-left text-[14px] bg-white hover:border-black"
                >
                  {selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'Chọn nền tảng'}
                </button>
                {showPlatformMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-[#d4d4d4] rounded-[8px] shadow-lg z-50 w-full">
                    <div className="py-2">
                      {platforms.map((platform) => (
                        <label
                          key={platform}
                          className={`w-full px-4 py-2 text-left text-[14px] flex items-center gap-2 hover:bg-gray-50 cursor-pointer ${
                            selectedPlatforms.includes(platform) ? 'bg-[#f5f5f5] font-semibold' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform)}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSelectedPlatforms = e.target.checked
                                ? [...selectedPlatforms, platform]
                                : selectedPlatforms.filter((p) => p !== platform);
                              setSelectedPlatforms(newSelectedPlatforms);
                              setForm((prev) => ({
                                ...prev,
                                platforms: newSelectedPlatforms.join(','),
                              }));
                            }}
                            className="cursor-pointer"
                          />
                          {platform}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] text-black">Lên lịch (tùy chọn)</label>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="border border-[#d4d4d4] rounded-[8px] px-3 py-2 text-left text-[14px] bg-white hover:border-black"
                >
                  {form.scheduledAt ? new Date(form.scheduledAt).toLocaleString('vi-VN') : 'Chọn ngày giờ'}
                </button>

                {showDatePicker && (
                  <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}>
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-[#d4d4d4] rounded-[12px] p-6 bg-[#2a2a2a] shadow-2xl z-50 w-80" onClick={(e) => e.stopPropagation()}>
                      {/* Header */}
                      <div className="text-[14px] font-semibold text-[#e5e5e5] mb-4">Lịch đăng (tùy chọn)</div>

                    {/* Selected date/time display */}
                    <div className="bg-[#1a1a1a] rounded-[8px] px-3 py-2 mb-4 text-[14px] text-[#e5e5e5]">
                      {form.scheduledAt ? new Date(form.scheduledAt).toLocaleString('vi-VN') : 'Chưa chọn'}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Calendar */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <button
                            type="button"
                            onClick={() => {
                              const prev = new Date(calendarMonth);
                              prev.setMonth(prev.getMonth() - 1);
                              setCalendarMonth(prev);
                            }}
                            className="text-[#9a9a9a] hover:text-[#e5e5e5] text-[16px]"
                          >
                            ▲
                          </button>
                          <div className="text-[12px] font-semibold text-[#e5e5e5]">
                            {calendarMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Date(calendarMonth);
                              next.setMonth(next.getMonth() + 1);
                              setCalendarMonth(next);
                            }}
                            className="text-[#9a9a9a] hover:text-[#e5e5e5] text-[16px]"
                          >
                            ▼
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['H', 'B', 'T', 'N', 'S', 'B', 'C'].map((day) => (
                            <div key={day} className="w-6 h-6 flex items-center justify-center text-[10px] font-semibold text-[#9a9a9a]">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarDays().map((dayObj, idx) => {
                            const scheduledDate = parseScheduledDate().date;
                            const isSelected =
                              dayObj.isCurrentMonth &&
                              scheduledDate ===
                                `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  if (dayObj.isCurrentMonth) {
                                    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
                                    const time = parseScheduledDate().time || '00:00';
                                    setForm((prev) => ({
                                      ...prev,
                                      scheduledAt: `${dateStr}T${time}:00`,
                                    }));
                                  }
                                }}
                                className={`w-6 h-6 flex items-center justify-center text-[10px] rounded-[4px] transition-colors ${
                                  !dayObj.isCurrentMonth
                                    ? 'text-[#505050]'
                                    : isSelected
                                    ? 'bg-[#9a67ca] text-white font-semibold'
                                    : 'text-[#e5e5e5] hover:bg-[#404040]'
                                }`}
                              >
                                {dayObj.day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time */}
                      <div>
                        <div className="text-[12px] font-semibold text-[#e5e5e5] mb-2">Giờ</div>
                        <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto pr-2">
                          {getHoursForDate(parseScheduledDate().date || new Date().toISOString().split('T')[0]).map(
                            (hour, idx) => {
                              const timeStr = hour.toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                              const isSelected =
                                form.scheduledAt &&
                                new Date(form.scheduledAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }) === timeStr;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    const dateStr = parseScheduledDate().date || new Date().toISOString().split('T')[0];
                                    setForm((prev) => ({
                                      ...prev,
                                      scheduledAt: `${dateStr}T${timeStr}:00`,
                                    }));
                                  }}
                                  className={`px-2 py-1 text-[12px] rounded-[4px] transition-colors text-left ${
                                    isSelected
                                      ? 'bg-[#9a67ca] text-white font-semibold'
                                      : 'text-[#e5e5e5] hover:bg-[#404040]'
                                  }`}
                                >
                                  {timeStr}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#505050]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowDatePicker(false);
                        }}
                        className="w-full px-3 py-2 text-[12px] font-semibold text-[#e5e5e5] bg-[#9a67ca] rounded-[6px] hover:bg-[#a878d8]"
                      >
                        Đóng
                      </button>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-[14px] text-black">
              <label>Hình ảnh / Video</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="border border-black rounded-[8px] px-4 py-2 text-[14px] hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading ? 'Đang tải...' : 'Chọn tệp'}
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="border border-black rounded-[8px] px-4 py-2 text-[14px] hover:bg-gray-50 disabled:opacity-50"
                >
                  📷 Chụp ảnh
                </button>
                {media && (
                  <button
                    type="button"
                    onClick={() => setMedia(null)}
                    className="text-red-600 text-[14px] underline"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              {media && (
                <div className="mt-2 border border-[#d4d4d4] rounded-[8px] p-2">
                  {media.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img src={media} alt="Preview" className="max-h-[200px] rounded" />
                  ) : (
                    <video src={media} controls className="max-h-[200px] rounded" />
                  )}
                </div>
              )}
            </div>
            </div>

            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#d4d4d4]">
              <button
                className="px-4 py-2 rounded-[8px] border border-[#d4d4d4] text-[14px]"
                onClick={handleCloseModal}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded-[8px] border border-black text-[14px] hover:bg-gray-50 disabled:opacity-50"
                onClick={handleSchedule}
                disabled={saving}
              >
                Lên lịch
              </button>
              <button
                className="px-4 py-2 rounded-[8px] bg-black text-white text-[14px]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (isCreating ? 'Đang tạo...' : 'Đang lưu...') : (isCreating ? 'Tạo' : 'Lưu')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 flex items-end justify-center pb-10 pointer-events-none">
          <div className="bg-black text-white text-[14px] px-4 py-2 rounded-[10px] shadow-md pointer-events-auto">
            {isCreating ? 'Đã tạo bài viết thành công!' : 'Đã lưu bài viết thành công!'}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
