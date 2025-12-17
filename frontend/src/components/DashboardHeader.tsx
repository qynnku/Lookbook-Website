import React from 'react';

const bannerImg = "https://www.figma.com/api/mcp/asset/ce528877-75d7-4f92-b2ee-bbe319c44373";
const avatarImg = "https://www.figma.com/api/mcp/asset/35647c34-0211-4f4f-81b4-8761dca1b9e3";

const DashboardHeader: React.FC = () => (
  <div className="flex flex-col h-[551px] items-center px-0 py-[10px] w-full">
    {/* Header Text */}
    <div className="flex flex-col gap-[4px] px-[21px] py-[18px] text-black w-full">
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] tracking-[0.004px]">
        Chào, Dottie
      </p>
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] tracking-[-0.28px]">
        Hãy cùng xem qua tổng quan của tuần này!
      </p>
    </div>
    
    {/* Banner Image */}
    <div className="h-[348px] relative w-full">
      <img 
        src={bannerImg} 
        alt="Cherished Dot Banner" 
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    </div>
    
    {/* Profile Section */}
    <div className="flex flex-col gap-[4px] px-[291px] py-[18px] w-full relative">
      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[30px] leading-[48px] text-black">
        Dottie
      </p>
      <div className="flex gap-[20px]">
        <div className="flex items-center gap-[4px]">
          <div className="flex items-end px-0 py-[8px]">
            <div className="w-[4px] h-[4px] rounded-full bg-black" />
          </div>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-black tracking-[-0.28px]">
            100K lượt thích
          </p>
        </div>
        <div className="flex items-center gap-[4px]">
          <div className="flex items-end px-0 py-[8px]">
            <div className="w-[4px] h-[4px] rounded-full bg-black" />
          </div>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-black tracking-[-0.28px]">
            150K lượt theo dõi
          </p>
        </div>
      </div>
      
      {/* Avatar - positioned absolutely */}
      <div className="absolute left-[119px] top-[-61px] w-[158px] h-[158px]">
        <img 
          src={avatarImg} 
          alt="Dottie" 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    </div>
  </div>
);

export default DashboardHeader;
