import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChannelList from './ChannelList';
import TopNav from './TopNav';
import FooterBar from './FooterBar';

// Suggestion/Notification images
const imgSuggestion = "https://www.figma.com/api/mcp/asset/c6a426bd-77d0-483a-b3da-96eacf154871";
const imgNotification1 = "https://www.figma.com/api/mcp/asset/87767cc8-b7b8-48be-8aa9-02f72cfe1ab4";
const imgNotification2 = "https://www.figma.com/api/mcp/asset/872ec0d4-de62-4760-8a15-6ba77028621a";

// Social media logos
const logoInstagram = "https://www.figma.com/api/mcp/asset/dcfdee23-0f91-4dfc-99a6-4575ee0c08a0";
const logoFacebook = "https://www.figma.com/api/mcp/asset/dcab943f-27c5-4ea7-9904-bcf91efebb48";
const logoThreads = "https://www.figma.com/api/mcp/asset/6ac25568-db6f-4ffb-a848-64d920568ea9";

// Arrow icon
const iconArrowUp = "https://www.figma.com/api/mcp/asset/34117fe0-200a-4969-ab87-f3309a6f7693";

type StatisticsProps = {
  onNavigate?: (label: string) => void;
};

const Statistics: React.FC<StatisticsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'platform' | 'orders'>('platform');

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Main Layout */}
      <div className="flex-1 flex w-full">
        {/* Combined Sidebar and Channel List */}
        <aside className="w-[336px] bg-white border-r border-[#d4d4d4] flex flex-col">
          <ChannelList />
          <Sidebar activeLabel="Thống kê" onSelect={onNavigate} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col w-[1104px]">
          <TopNav />

          {/* Tabs */}
          <div className="border-b border-[#d4d4d4] flex h-[60px] items-center w-full">
            <button
              onClick={() => setActiveTab('platform')}
              className={`flex items-center justify-center h-full px-[20px] w-[186px] border-r border-[#d4d4d4] transition-colors ${
                activeTab === 'platform' ? 'bg-[#e5e5e5]' : 'bg-white hover:bg-[#f5f5f5]'
              }`}
            >
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
                Nền tảng
              </p>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-center h-full px-[15px] w-[186px] border-r border-[#d4d4d4] transition-colors ${
                activeTab === 'orders' ? 'bg-[#e5e5e5]' : 'bg-white hover:bg-[#f5f5f5]'
              }`}
            >
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
                Đơn hàng
              </p>
            </button>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="flex flex-col items-center pb-[30px] pt-[10px] px-0 w-full">
            <div className="flex flex-col items-start pl-[21px] pr-[50px] py-0 w-full">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black tracking-[0.004px]">
                Thống kê và phân tích số liệu
              </p>
            </div>
            
            <div className="flex gap-[30px] items-start px-[30px] py-[18px] w-full">
              {/* Left Column - Charts */}
              <div className="flex flex-col gap-[30px] items-start w-[655.572px]">
                {/* Post Engagement Chart */}
                <div className="bg-white h-[374.874px] rounded-[20.826px] shadow-[1.829px_1.829px_54.86px_0px_rgba(6,29,34,0.1)] w-full p-[20px] relative">
                  <div className="flex justify-between items-start mb-[20px]">
                    <div></div>
                    <div className="flex gap-[18px] items-center">
                      <div className="flex gap-[9px] items-center">
                        <div className="flex gap-[3.657px] items-center">
                          <div className="bg-[#7037a5] rounded-[1.829px] w-[11.886px] h-[11.886px]" />
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-[#061d22] tracking-[-0.0012px]">
                            Instagram
                          </p>
                        </div>
                        <div className="flex gap-[3.657px] items-center">
                          <div className="bg-[#1a0330] rounded-[1.829px] w-[11.886px] h-[11.886px]" />
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-[#061d22] tracking-[-0.0012px]">
                            Facebook
                          </p>
                        </div>
                      </div>
                      <div className="border border-[rgba(128,128,128,0.5)] flex items-center justify-center px-[11px] py-[6px] rounded-[14.629px]">
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-[#061d22] tracking-[-0.0012px]">
                          Year
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="flex items-center justify-center h-[280px] text-[#737373]">
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px]">
                      Biểu đồ phân tích lượt tương tác
                    </p>
                  </div>
                </div>

                {/* Business Performance Chart */}
                <div className="bg-white flex gap-[37px] h-[227px] items-center px-[44px] py-[30px] rounded-[20px] shadow-[2.346px_2.346px_58.661px_0px_rgba(6,29,34,0.1)] w-[656px]">
                  <div className="flex flex-col gap-[22px] items-start rounded-[20px]">
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#061d22] w-[162px]">
                      Hiệu quả kinh doanh
                    </p>
                    <div className="flex flex-col gap-[3.657px] items-center justify-center w-full">
                      <div className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-[#061d22] tracking-[0.004px]">
                        8.06%
                      </div>
                      <div className="flex flex-col gap-[18.287px] items-center justify-center">
                        <div className="bg-[rgba(215,255,202,0.2)] border border-[#2cb100] flex gap-[2.743px] items-center justify-center px-[8px] py-[4px] rounded-[8px]">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#2cb100]">
                            1.2%
                          </p>
                          <img src={iconArrowUp} alt="" className="w-[18.287px] h-[18.287px]" />
                        </div>
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-[#808080] tracking-[-0.0012px]">
                          Tháng này
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bar chart placeholder */}
                  <div className="flex gap-[29px] items-end">
                    <div className="bg-[rgba(201,203,205,0.3)] h-[68.574px] rounded-[10.972px] w-[30.173px]" />
                    <div className="bg-[rgba(201,203,205,0.3)] h-[116.119px] rounded-[10.972px] w-[30.173px]" />
                    <div className="bg-[rgba(201,203,205,0.3)] h-[91.433px] rounded-[10.972px] w-[30.173px]" />
                    <div className="bg-gradient-to-br from-[rgba(154,103,202,0.24)] to-[rgba(154,103,202,1)] h-[139.892px] rounded-[10.972px] w-[30.173px]" />
                    <div className="bg-[rgba(201,203,205,0.3)] h-[104.233px] rounded-[10.972px] w-[30.173px]" />
                    <div className="bg-[rgba(201,203,205,0.3)] h-[66.746px] rounded-[10.972px] w-[30.173px]" />
                  </div>
                </div>
              </div>

              {/* Right Column - Suggestions & Notifications */}
              <div className="flex flex-col gap-[26px] items-start flex-1">
                {/* Suggestions */}
                <div className="bg-white flex flex-col gap-[10px] items-start px-[30px] py-[18px] rounded-[18px] shadow-[1.829px_1.829px_54.86px_0px_rgba(6,29,34,0.1)] w-full">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
                    Gợi ý
                  </p>
                  <div className="flex gap-[10px] items-center w-full">
                    <div className="h-[68px] rounded-[8px] w-[62px]">
                      <img src={imgSuggestion} alt="" className="w-full h-full object-cover rounded-[8px]" />
                    </div>
                    <div className="flex flex-col gap-[10px] items-start flex-1">
                      <div className="flex items-center justify-between w-full">
                        <div className="bg-[#e4e4ff] flex items-center justify-center px-[4px] py-0 rounded-[6px]">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px]">
                            Instagram
                          </p>
                        </div>
                        <img src={iconArrowUp} alt="" className="w-[18.287px] h-[18.287px]" />
                      </div>
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px]">
                        Bạn muốn tiết kiệm thời gian và tăng lượng khách truy cập?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white flex flex-col gap-[10px] items-start px-[30px] py-[16px] rounded-[18px] shadow-[1.829px_1.829px_54.86px_0px_rgba(6,29,34,0.1)] w-full">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-black">
                    Thông báo
                  </p>
                  
                  {/* Notification 1 */}
                  <div className="flex gap-[10px] items-center w-full">
                    <div className="h-[68px] rounded-[8px] w-[62px]">
                      <img src={imgNotification1} alt="" className="w-full h-full object-cover rounded-[8px]" />
                    </div>
                    <div className="flex flex-col items-start w-[187px]">
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px]">
                        <span className="font-bold">Thảo Nguyên</span> và <span className="font-bold">100 tài khoản khác</span> đã bày tỏ cảm xúc về bài đăng của bạn
                      </p>
                    </div>
                    <img src={logoInstagram} alt="Instagram" className="w-[26px] h-[26px]" />
                  </div>
                  
                  {/* Notification 2 */}
                  <div className="flex items-center justify-between w-full">
                    <div className="h-[68px] rounded-[8px] w-[62px]">
                      <img src={imgNotification2} alt="" className="w-full h-full object-cover rounded-[8px]" />
                    </div>
                    <div className="flex flex-col items-start w-[187px]">
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px]">
                        <span className="font-bold">Nguyenpham_01</span>, <span className="font-bold">unni035</span> và <span className="font-bold">100 tài khoản khác</span> đã bày tỏ cảm xúc về bài đăng của bạn
                      </p>
                    </div>
                    <img src={logoFacebook} alt="Facebook" className="w-[25px] h-[25px]" />
                  </div>
                </div>

                {/* Follower Counts */}
                <div className="flex gap-[17px] items-start shadow-[1.829px_1.829px_54.86px_0px_rgba(6,29,34,0.07)]">
                  {/* Facebook */}
                  <div className="bg-white flex flex-col h-[227px] items-start px-[16px] py-[20px] rounded-[8px]">
                    <div className="flex flex-col gap-[24px] items-center justify-center w-full">
                      <img src={logoFacebook} alt="Facebook" className="w-[65px] h-[66px]" />
                      <div className="flex flex-col gap-[10px] items-start">
                        <div className="flex flex-col items-start">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black tracking-[0.004px]">
                            11,1K
                          </p>
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px]">
                            Lượt theo dõi
                          </p>
                        </div>
                        <div className="bg-[rgba(215,255,202,0.2)] border border-[#2cb100] flex gap-[2.743px] items-center justify-center px-[8px] py-[4px] rounded-[8px]">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#2cb100]">
                            1.2%
                          </p>
                          <img src={iconArrowUp} alt="" className="w-[18.287px] h-[18.287px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Threads */}
                  <div className="bg-white flex flex-col h-[227px] items-start px-[16px] py-[20px] rounded-[8px]">
                    <div className="flex flex-col gap-[24px] items-center justify-center w-full">
                      <img src={logoThreads} alt="Threads" className="w-[66px] h-[66px]" />
                      <div className="flex flex-col gap-[10px] items-start">
                        <div className="flex flex-col items-start">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black tracking-[0.004px]">
                            11,1K
                          </p>
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px]">
                            Lượt theo dõi
                          </p>
                        </div>
                        <div className="bg-[rgba(215,255,202,0.2)] border border-[#2cb100] flex gap-[2.743px] items-center justify-center px-[8px] py-[4px] rounded-[8px] w-full">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#2cb100]">
                            1.2%
                          </p>
                          <img src={iconArrowUp} alt="" className="w-[18.287px] h-[18.287px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="bg-white flex flex-col h-[227px] items-start px-[16px] py-[20px] rounded-[8px]">
                    <div className="flex flex-col gap-[24px] items-center justify-center w-full">
                      <img src={logoInstagram} alt="Instagram" className="w-[65px] h-[65px]" />
                      <div className="flex flex-col gap-[10px] items-start">
                        <div className="flex flex-col items-start">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black tracking-[0.004px]">
                            11,1K
                          </p>
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px]">
                            Lượt theo dõi
                          </p>
                        </div>
                        <div className="bg-[rgba(215,255,202,0.2)] border border-[#2cb100] flex gap-[2.743px] items-center justify-center px-[8px] py-[4px] rounded-[8px]">
                          <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#2cb100]">
                            1.2%
                          </p>
                          <img src={iconArrowUp} alt="" className="w-[18.287px] h-[18.287px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <FooterBar />
    </div>
  );
};

export default Statistics;
