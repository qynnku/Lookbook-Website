import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChannelList from './ChannelList';
import TopNav from './TopNav';
import FooterBar from './FooterBar';

const Livestream: React.FC<{ onNavigate?: (label: string) => void }> = ({ onNavigate }) => {
  const [isLiveToggle, setIsLiveToggle] = useState(false);
  const [isEventToggle, setIsEventToggle] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-[64px] h-[32px] rounded-full border border-[#d4d4d4] px-[4px] transition-all duration-200 flex items-center ${
        checked ? 'bg-[#7037a5] border-[#7037a5] justify-end' : 'bg-[#e5e5e5] justify-start'
      }`}
      aria-pressed={checked}
    >
      <span className="w-[26px] h-[26px] rounded-full bg-white shadow" />
    </button>
  );

  const Card = ({
    title,
    lines,
    checked,
    onToggle,
  }: {
    title: string;
    lines: string[];
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex flex-col justify-between bg-white border-2 border-[#7037a5] rounded-[12px] px-[20px] py-[30px] w-full min-h-[425px]">
      <div className="flex flex-col gap-[14px]">
        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black">{title}</p>
        {lines.map((line, idx) => (
          <p
            key={idx}
            className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-black tracking-[-0.32px]"
          >
            {line}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-[18px] items-center">
        <Toggle checked={checked} onChange={onToggle} />
        <button className="px-[32px] py-[12px] rounded-[28px] border border-black bg-white font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px]">
          Phát trực tiếp ngay
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex-1 flex w-full">
        <aside className="w-[336px] bg-white border-r border-[#d4d4d4] flex flex-col">
          <ChannelList />
          <Sidebar activeLabel="Livestream" onSelect={onNavigate} />
        </aside>

        <main className="flex-1 flex flex-col w-[1104px]">
          <TopNav />

          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-[1104px] w-full mx-auto px-[30px] py-[18px] flex flex-col gap-[24px]">
              <div className="pl-[21px] pr-[50px]">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black">Livestream</p>
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#737373]">
                Chọn cách bạn muốn phát trực tiếp
              </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px] w-full px-[30px]">
              <Card
                title="Phát trực tiếp"
                lines={[
                  'Phát trực tiếp một mình hoặc cùng người khác',
                  'Chọn nơi phát video trực tiếp',
                ]}
                checked={isLiveToggle}
                onToggle={() => setIsLiveToggle((v) => !v)}
              />
              <Card
                title="Tạo sự kiện phát trực tiếp"
                lines={[
                  'Tạo trước một sự kiện để chia sẻ với đối tượng',
                  'Bạn và người xem sẽ nhận được lời nhắc trước khi bạn phát trực tiếp',
                ]}
                checked={isEventToggle}
                onToggle={() => setIsEventToggle((v) => !v)}
              />
            </div>
              <div className="px-[30px] w-full">
                <div className="border border-[#7037a5] rounded-[8px] p-[12px] flex gap-[10px] bg-white w-full justify-center items-center">
                  <button className="bg-white border border-[#e5e5e5] rounded-[8px] px-[20px] py-[6px] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-black">
                    Đang phát trực tiếp
                  </button>
                  <button className="bg-[#f5f5f5] border border-[#e5e5e5] rounded-[8px] px-[20px] py-[6px] font-['Plus_Jakarta_Sans',sans-serif] font-medium text-[14px] text-black">
                    Lịch phát trực tiếp tiếp theo
                  </button>
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

export default Livestream;
