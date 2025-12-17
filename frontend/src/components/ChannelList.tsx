import React, { useState } from 'react';

const iconFacebook = "https://www.figma.com/api/mcp/asset/58e859a8-ac65-4c51-9d17-1c9b55cc5bca";
const iconInstagram = "https://www.figma.com/api/mcp/asset/1551a6d5-0050-4867-a6ce-09e55199f580";
const iconThread = "https://www.figma.com/api/mcp/asset/44088be7-c800-433b-90c7-44dd3807c16e";

const channels = [
  { type: 'facebook', name: 'Facebook', icon: iconFacebook },
  { type: 'instagram', name: 'Instagram', icon: iconInstagram },
  { type: 'thread', name: 'Thread', icon: iconThread },
];

const ChannelList: React.FC = () => {
  const [selected, setSelected] = useState('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { email: payload.email, role: payload.role || 'user' };
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const userInfo = getUserInfo();

  return (
    <div className="flex flex-col gap-[10px] w-full">
      {/* Header */}
      <div className="bg-white border-b border-[#d4d4d4] flex h-[86px] items-center justify-between px-[10px] w-full">
        <p style={{ fontFamily: 'PoetsenOne', fontSize: '30px', fontWeight: 400, lineHeight: 'normal', color: '#9A67CA' }}>
          Bonjour
        </p>
        
        {/* Profile Menu */}
        {userInfo && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-[40px] h-[40px] rounded-full bg-[#9A67CA] flex items-center justify-center text-white font-semibold text-[16px] hover:bg-[#8856b8] transition-colors"
            >
              {userInfo.email[0].toUpperCase()}
            </button>
            
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-[#d4d4d4] rounded-[12px] shadow-lg min-w-[220px] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#f0f0f0]">
                  <p className="text-[14px] font-semibold text-[#1a0330] truncate">{userInfo.email}</p>
                  <p className="text-[12px] text-[#737373] mt-1">
                    {userInfo.role === 'admin' ? 'Quản trị viên' : 'Cộng tác viên'}
                  </p>
                </div>
                
                <div className="py-2">
                  <button
                    className="w-full px-4 py-2 text-left text-[14px] text-[#1a0330] hover:bg-[#f5f5f5] flex items-center gap-2"
                    onClick={() => {/* TODO: Tìm người dùng */}}
                  >
                    <span>👤</span>
                    <span>Tìm người dùng</span>
                  </button>
                  
                  {userInfo.role === 'admin' && (
                    <button
                      className="w-full px-4 py-2 text-left text-[14px] text-[#1a0330] hover:bg-[#f5f5f5] flex items-center gap-2"
                      onClick={() => {/* TODO: Thêm thành viên */}}
                    >
                      <span>➕</span>
                      <span>Thêm thành viên</span>
                    </button>
                  )}
                  
                  <button
                    className="w-full px-4 py-2 text-left text-[14px] text-[#c53030] hover:bg-[#ffe6e6] flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* All Channels Section */}
      <div className="flex flex-col gap-[8px] w-[310px] px-[13px]">
        <div className="bg-white flex gap-[4px] items-center p-[10px] w-full">
          <div className="flex flex-col gap-[2px]">
            <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1a0330]">
              Tất cả các kênh
            </p>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#737373]">
              Ruyich
            </p>
          </div>
        </div>
        
        {/* Social Media Channels */}
        <div className="flex flex-col gap-[11px]">
          <button 
            className="bg-white flex gap-[4px] items-center p-[10px] w-full"
            onClick={() => setSelected('facebook')}
          >
            <div className="flex items-end px-0 py-[4px]">
              <div className="w-[14px] h-[14px]">
                <img src={iconFacebook} alt="Facebook" className="w-full h-full" />
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1a0330] text-left">
              Facebook
            </p>
          </button>
          
          <div className="bg-white flex gap-[4px] items-center p-[10px] w-full">
            <div className="flex items-end px-0 py-[4px]">
              <div className="w-[14px] h-[14px]">
                <img src={iconInstagram} alt="Instagram" className="w-full h-full" />
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1a0330]">
              Instagram
            </p>
          </div>
          
          <div className="bg-white flex gap-[4px] items-center p-[10px] w-full">
            <div className="flex items-end px-0 py-[4px]">
              <div className="bg-[#080808] flex items-center justify-center p-[1px] rounded-[2px] w-[16px]">
                <div className="w-[14px] h-[14px]">
                  <img src={iconThread} alt="Thread" className="w-full h-full" />
                </div>
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1a0330]">
              Thread
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
