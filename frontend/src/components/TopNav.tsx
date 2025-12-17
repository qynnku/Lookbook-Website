import React from 'react';

type TopNavProps = {
  active?: 'platform' | 'orders';
};

const TopNav: React.FC<TopNavProps> = ({ active = 'platform' }) => (
  <div className="border-b border-[#d4d4d4] flex h-[86px] items-center px-0 py-[10px] w-full">
    <button
      className={`border-l border-r border-[#d4d4d4] flex items-center justify-center px-[20px] py-[30px] w-[186px] transition-colors duration-300 cursor-pointer ${
        active === 'platform' ? 'bg-[#e5e5e5]' : 'bg-white hover:bg-[#f8f8f8]'
      }`}
    >
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
        Nền tảng
      </p>
    </button>
    <button
      className={`border-r border-[#d4d4d4] flex items-center justify-center px-[15px] py-[30px] w-[186px] transition-colors duration-300 cursor-pointer ${
        active === 'orders' ? 'bg-[#e5e5e5]' : 'bg-white hover:bg-[#f8f8f8]'
      }`}
    >
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
        Đơn hàng
      </p>
    </button>
  </div>
);

export default TopNav;
