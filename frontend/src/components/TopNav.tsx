import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

type TopNavProps = {
  active?: 'platform' | 'orders';
  pendingCount?: number;
};

type BrandInfo = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

type UserToken = {
  email: string;
  role: string;
  brandId: number;
};

const TopNav: React.FC<TopNavProps> = ({ active = 'platform', pendingCount = 0 }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [userToken, setUserToken] = useState<UserToken | null>(null);

  useEffect(() => {
    const fetchBrandInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Extract user info from token
        const payload = JSON.parse(atob(token.split('.')[1])) as UserToken;
        setUserToken(payload);
        
        // Fetch brand info from API
        const brand = await apiFetch('/brand', { method: 'GET' });
        setBrandInfo(brand);
      } catch (err) {
        console.error('Failed to fetch brand info:', err);
      }
    };
    fetchBrandInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const getAvatarDisplay = () => {
    if (brandInfo?.avatarUrl) {
      return (
        <img 
          src={brandInfo.avatarUrl} 
          alt="Brand" 
          className="w-full h-full rounded-full object-cover"
        />
      );
    }
    // Fallback to initials
    const initials = brandInfo?.name?.[0]?.toUpperCase() || userToken?.email?.[0]?.toUpperCase() || '?';
    return (
      <span className="text-white font-semibold text-[16px]">
        {initials}
      </span>
    );
  };

  if (!userToken) return null;

  return (
    <div className="border-b border-[#d4d4d4] flex h-[86px] items-center justify-between px-0 py-[10px] w-full">
      <div className="flex items-center w-full">
        <button
          className={`relative border-l border-r border-[#d4d4d4] flex items-center justify-center px-[20px] py-[30px] w-[186px] transition-colors duration-300 cursor-pointer ${
            active === 'platform' ? 'bg-[#e5e5e5]' : 'bg-white hover:bg-[#f8f8f8]'
          }`}
        >
          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
            Nền tảng
          </p>
        </button>
        <button
          className={`relative border-r border-[#d4d4d4] flex items-center justify-center px-[15px] py-[30px] w-[186px] transition-colors duration-300 cursor-pointer ${
            active === 'orders' ? 'bg-[#e5e5e5]' : 'bg-white hover:bg-[#f8f8f8]'
          }`}
        >
          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
            Đơn hàng
          </p>
          {pendingCount > 0 && (
            <span className="absolute top-[6px] right-[6px] min-w-[18px] h-[18px] px-[5px] rounded-full bg-[#e02424] text-white text-[11px] leading-[18px] text-center shadow">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Profile Menu (Top Right) */}
      <div className="relative px-4">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-[44px] h-[44px] rounded-full bg-[#9A67CA] flex items-center justify-center hover:bg-[#8856b8] transition-colors overflow-hidden"
        >
          {getAvatarDisplay()}
        </button>
        
        {showProfileMenu && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-[#d4d4d4] rounded-[12px] shadow-lg min-w-[240px] z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f0f0f0]">
              <p className="text-[14px] font-semibold text-[#1a0330] truncate">{userToken.email}</p>
              <p className="text-[12px] text-[#737373] mt-1">
                {userToken.role === 'admin' ? 'Quản trị viên' : 'Cộng tác viên'}
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
              
              {userToken.role === 'admin' && (
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
    </div>
  );
