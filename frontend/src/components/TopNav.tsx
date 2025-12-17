import React from 'react';

const TopNav: React.FC = () => (
  <div className="border-b border-[#d4d4d4] flex h-[86px] items-center px-0 py-[10px] w-full">
    <button className="bg-[#e5e5e5] border-l border-r border-[#d4d4d4] flex items-center justify-center px-[20px] py-[30px] w-[186px] transition-colors duration-300 hover:bg-[#dcdcdc] cursor-pointer">
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
        Nền tảng
      </p>
    </button>
    <button className="bg-white border-r border-[#d4d4d4] flex items-center justify-center px-[15px] py-[30px] w-[186px] transition-colors duration-300 hover:bg-[#f8f8f8] cursor-pointer">
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
        Đơn hàng
      </p>
    </button>
  </div>
);

export default TopNav;
