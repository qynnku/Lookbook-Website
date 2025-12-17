import React, { useEffect, useState } from 'react';
import ChannelList from './ChannelList';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import FooterBar from './FooterBar';
import { apiFetch } from '../utils/api';

type SettingsProps = {
  onNavigate?: (label: string) => void;
  pendingCount?: number;
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
};

const Settings: React.FC<SettingsProps> = ({ onNavigate, pendingCount = 0 }) => {
  const [activeTab, setActiveTab] = useState<'team' | 'general'>('team');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'user' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return 'user';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'user';
    } catch {
      return 'user';
    }
  };

  const isAdmin = getUserRole() === 'admin';

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeam();
    }
  }, [activeTab]);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const resp = await apiFetch('/team');
      if (!resp.ok) throw new Error('Failed to load team');
      const data = await resp.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setError('');
    setTempPassword('');
    try {
      const resp = await apiFetch('/team/invite', {
        method: 'POST',
        body: JSON.stringify(inviteForm),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || 'Failed to invite');
      }
      const data = await resp.json();
      setTempPassword(data.tempPassword);
      setInviteForm({ email: '', name: '', role: 'user' });
      loadTeam();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Xác nhận xóa thành viên này?')) return;
    try {
      const resp = await apiFetch(`/team/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Failed to remove member');
      loadTeam();
    } catch (err) {
      alert('Không thể xóa thành viên');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex-1 flex w-full">
        <aside className="w-[336px] bg-white border-r border-[#d4d4d4] flex flex-col">
          <ChannelList />
          <Sidebar activeLabel="Cài đặt" onSelect={onNavigate} pendingCount={pendingCount} />
        </aside>

        <main className="flex-1 flex flex-col w-[1104px]">
          <TopNav pendingCount={pendingCount} />
          
          <div className="flex-1 overflow-y-auto bg-white px-[30px] py-[20px]">
            <h1 className="text-[20px] font-bold text-black mb-4">Cài đặt</h1>
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-[#d4d4d4] mb-6">
              <button
                onClick={() => setActiveTab('team')}
                className={`px-4 py-2 text-[14px] font-semibold transition-colors ${
                  activeTab === 'team'
                    ? 'text-[#9a67ca] border-b-2 border-[#9a67ca]'
                    : 'text-[#737373] hover:text-[#1a0330]'
                }`}
              >
                Quản lý thành viên
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 text-[14px] font-semibold transition-colors ${
                  activeTab === 'general'
                    ? 'text-[#9a67ca] border-b-2 border-[#9a67ca]'
                    : 'text-[#737373] hover:text-[#1a0330]'
                }`}
              >
                Chung
              </button>
            </div>

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="flex flex-col gap-4">
                {isAdmin && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 bg-[#9a67ca] text-white rounded-[8px] text-[14px] font-semibold hover:bg-[#8856b8]"
                    >
                      ➕ Thêm thành viên
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="text-center text-[#737373] py-8">Đang tải...</div>
                ) : (
                  <div className="bg-white border border-[#d4d4d4] rounded-[12px] overflow-hidden">
                    <div className="grid grid-cols-5 bg-[#fafafa] px-4 py-3 text-[13px] font-semibold text-[#404040]">
                      <div>Tên</div>
                      <div>Email</div>
                      <div>Vai trò</div>
                      <div>Trạng thái</div>
                      {isAdmin && <div>Thao tác</div>}
                    </div>
                    {members.map((member) => (
                      <div key={member.id} className="grid grid-cols-5 items-center px-4 py-3 text-[13px] border-t border-[#f0f0f0]">
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-[#737373]">{member.email}</div>
                        <div>
                          <span className={`px-2 py-1 rounded-[6px] text-[12px] ${
                            member.role === 'admin' ? 'bg-[#e5d7ff] text-[#9a67ca]' : 'bg-[#f5f5f5] text-[#737373]'
                          }`}>
                            {member.role === 'admin' ? 'Admin' : 'Cộng tác viên'}
                          </span>
                        </div>
                        <div>
                          {member.verified ? (
                            <span className="text-[#2cb100]">✓ Đã xác nhận</span>
                          ) : (
                            <span className="text-[#b76b00]">⏳ Chưa xác nhận</span>
                          )}
                        </div>
                        {isAdmin && (
                          <div>
                            {member.role !== 'admin' && (
                              <button
                                onClick={() => handleRemove(member.id)}
                                className="text-[#c53030] hover:underline text-[12px]"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="text-[14px] text-[#737373]">
                Các cài đặt chung sẽ có ở đây...
              </div>
            )}
          </div>
        </main>
      </div>

      <FooterBar />

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-[12px] shadow-lg w-full max-w-[500px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4d4d4]">
              <h3 className="text-[18px] font-semibold">Thêm thành viên</h3>
              <button onClick={() => { setShowInviteModal(false); setTempPassword(''); setError(''); }} className="text-[#737373] hover:text-black">Đóng</button>
            </div>
            
            <form onSubmit={handleInvite} className="px-6 py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="border border-[#d4d4d4] rounded-[8px] px-3 py-2 text-[14px]"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold">Tên</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="border border-[#d4d4d4] rounded-[8px] px-3 py-2 text-[14px]"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold">Vai trò</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="border border-[#d4d4d4] rounded-[8px] px-3 py-2 text-[14px]"
                >
                  <option value="user">Cộng tác viên</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <div className="text-[#c53030] text-[13px]">{error}</div>}
              
              {tempPassword && (
                <div className="bg-[#e7fff3] border border-[#2cb100] rounded-[8px] px-4 py-3">
                  <p className="text-[13px] text-[#138a53] mb-2">✓ Đã thêm thành viên thành công!</p>
                  <p className="text-[12px] text-[#404040]">Mật khẩu tạm: <strong className="font-mono">{tempPassword}</strong></p>
                  <p className="text-[11px] text-[#737373] mt-1">Vui lòng gửi mật khẩu này cho thành viên.</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowInviteModal(false); setTempPassword(''); setError(''); }}
                  className="px-4 py-2 border border-[#d4d4d4] rounded-[8px] text-[14px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 bg-[#9a67ca] text-white rounded-[8px] text-[14px] font-semibold hover:bg-[#8856b8] disabled:opacity-50"
                >
                  {inviteLoading ? 'Đang thêm...' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
