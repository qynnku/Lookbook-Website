import React from 'react';

const iconOverview = "https://www.figma.com/api/mcp/asset/e0627c3e-9758-454e-8863-67b11abf3f81";
const iconCreate = "https://www.figma.com/api/mcp/asset/19e04852-eb8d-414b-aadb-0d5be1200a95";
const iconSchedule = "https://www.figma.com/api/mcp/asset/231849fb-88f6-4080-9520-f88feb9d72c3";
const iconLookbook = "https://www.figma.com/api/mcp/asset/f737e9d9-13db-4c0b-a639-02bf230f152d";
const iconLivestream = "https://www.figma.com/api/mcp/asset/fb025079-df25-4566-b644-1aa93aa68720";
const iconStats = "https://www.figma.com/api/mcp/asset/6a18666c-4342-4302-9a7f-bd8e2da45f63";
const iconOrders = "https://www.figma.com/api/mcp/asset/21427c16-59d5-44fa-83a7-8f5c17a40f4f";
const iconSettings = "https://www.figma.com/api/mcp/asset/eb408627-520b-4a68-8a72-348e5ac8631f";

const menu = [
  { label: 'Tổng quan', icon: iconOverview },
  { label: 'Tạo bài đăng', icon: iconCreate },
  { label: 'Lịch đăng', icon: iconSchedule },
  { label: 'Lookbook', icon: iconLookbook },
  { label: 'Livestream', icon: iconLivestream },
  { label: 'Thống kê', icon: iconStats },
  { label: 'Quản lý đơn hàng', icon: iconOrders },
  { label: 'Cài đặt', icon: iconSettings },
];

type SidebarProps = {
  activeLabel?: string;
  onSelect?: (label: string) => void;
  pendingCount?: number;
};

const Sidebar: React.FC<SidebarProps> = ({ activeLabel = 'Tổng quan', onSelect, pendingCount = 0 }) => (
  <div className="flex flex-col gap-[10px] items-center px-0 py-[18px] w-full">
    <div className="bg-white flex items-center px-[40px] py-0 w-full">
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#404040]">
        MENU
      </p>
    </div>
    <div className="flex flex-col gap-[4px] items-start w-[245px]">
      {menu.map((item) => (
        <button
          key={item.label}
          onClick={() => onSelect?.(item.label)}
          className={`relative flex gap-[10px] items-center px-[12px] py-[10px] rounded-[10px] w-full text-left transition-colors duration-300 ${
            item.label === activeLabel
              ? 'bg-[#fbf7ff] border border-black font-["Plus_Jakarta_Sans",sans-serif] font-semibold text-[14px] leading-[22px] text-[#1a0330]'
              : 'font-["Plus_Jakarta_Sans",sans-serif] font-normal text-[14px] leading-[22px] text-[#1a0330] hover:bg-[#f5f5f5]'
          }`}
        >
          <div className="w-[20px] h-[20px]">
            <img src={item.icon} alt="" className="w-full h-full" />
          </div>
          <span>{item.label}</span>
          {item.label === 'Quản lý đơn hàng' && pendingCount > 0 && (
            <span className="absolute top-[-6px] right-[-6px] min-w-[18px] h-[18px] px-[5px] rounded-full bg-[#e02424] text-white text-[11px] leading-[18px] text-center shadow">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
);

export default Sidebar;
