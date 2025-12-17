import React from 'react';

const FooterBar: React.FC = () => (
  <div 
    className="h-[213px] w-full relative"
    style={{
      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.2) 100%), linear-gradient(-77.33456624391894deg, rgba(115, 77, 151, 1) 5.0809%, rgba(76, 51, 100, 1) 90.124%)'
    }}
  >
    <div className="flex flex-col items-start px-[34px] py-[20px] w-full">
      <div className="flex flex-col gap-[18px] items-center justify-center w-[1372px]">
        <div className="flex gap-[167px] h-[133px] items-center w-full">
          {/* Logo */}
          <div className="flex h-[133px] items-center justify-center p-[10px]">
            <p style={{ fontFamily: 'PoetsenOne', fontSize: '30px', fontWeight: 400, lineHeight: 'normal', color: '#f7eeff' }}>
              Bonjour
            </p>
          </div>
          
          {/* Three Columns */}
          <div className="flex gap-[56px]">
            {/* Về chúng tôi */}
            <div className="flex flex-col gap-[17px] w-[263px]">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#e4d4d2]">
                Về chúng tôi
              </p>
              <div className="flex flex-col gap-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#fdf7f3]">
                <p>Sự phát triển của ứng dụng</p>
                <p>Sứ mệnh của tiệm</p>
                <p>Tầm nhìn và kết quả mong đợi</p>
              </div>
            </div>
            
            {/* Chính sách */}
            <div className="flex flex-col gap-[17px] w-[263px]">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#e4d4d2]">
                Chính sách
              </p>
              <div className="flex flex-col gap-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#fdf7f3]">
                <p>Dịch vụ chăm sóc khách hàng</p>
                <p>Ưu đãi cho đối tác</p>
                <p>Mở rộng kết nối</p>
              </div>
            </div>
            
            {/* Liên hệ */}
            <div className="flex flex-col gap-[17px] w-[347px]">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#e4d4d2]">
                Liên hệ
              </p>
              <div className="flex flex-col gap-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#fdf7f3]">
                <p>Bonjour@gmail.com</p>
                <p>Trụ sở chính: 23 Hai Bà Trưng, Quận 1, TP.HCM</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#e4d4d2] text-right">
          Copyright © 2020. All rights reserved.
        </p>
      </div>
    </div>
  </div>
);

export default FooterBar;
