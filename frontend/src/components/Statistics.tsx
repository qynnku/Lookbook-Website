import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChannelList from './ChannelList';
import TopNav from './TopNav';
import FooterBar from './FooterBar';
import { apiFetch } from '../utils/api';

// Suggestion/Notification images
const imgSuggestion = "https://www.figma.com/api/mcp/asset/c1c09258-06cb-451b-a4b9-9403978ffe87";
const imgNotification1 = "https://www.figma.com/api/mcp/asset/e0a6a52a-b49b-41fb-bac6-a33ac4643f97";
const imgNotification2 = "https://www.figma.com/api/mcp/asset/6a7603b0-1be6-497d-b5ff-e0e5d6d5c518";

// Social media logos
const logoInstagram = "https://www.figma.com/api/mcp/asset/ee2b4d05-71b0-4df4-93a0-ce1edbd96483";
const logoFacebook = "https://www.figma.com/api/mcp/asset/5b45c4c2-ff6b-496b-96f9-1ce1e17f0b99";
const logoThreads = "https://www.figma.com/api/mcp/asset/84ede330-13ad-449c-8276-ead08790ef81";

// Arrow icon
const iconArrowUp = "https://www.figma.com/api/mcp/asset/6955eff9-cf2b-4e2d-9884-be2fbf252cf0";

type StatisticsProps = {
  onNavigate?: (label: string) => void;
};

const Statistics: React.FC<StatisticsProps> = ({ onNavigate }) => {
  const [platform, setPlatform] = useState('all');
  const [timeRange, setTimeRange] = useState('year');
  const [metric, setMetric] = useState('views');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch analytics data when filters change
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/statistics/analytics?platform=${platform}&timeRange=${timeRange}&metric=${metric}`);
        const data = await res.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [platform, timeRange, metric]);

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
                  {/* Filter Controls */}
                  <div className="flex gap-[12px] items-center mb-[20px]">
                    {/* Nền tảng */}
                    <div className="relative">
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="border border-[rgba(128,128,128,0.5)] px-[11px] py-[6px] rounded-[14.629px] font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-[#061d22] tracking-[-0.0012px] bg-white cursor-pointer appearance-none pr-[30px]"
                      >
                        <option value="all">Tất cả nền tảng</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="threads">Threads</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                      </select>
                      <div className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1L6 6L11 1" stroke="#061d22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Thời gian */}
                    <div className="relative">
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border border-[rgba(128,128,128,0.5)] px-[11px] py-[6px] rounded-[14.629px] font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-[#061d22] tracking-[-0.0012px] bg-white cursor-pointer appearance-none pr-[30px]"
                      >
                        <option value="7days">7 ngày qua</option>
                        <option value="30days">30 ngày qua</option>
                        <option value="3months">3 tháng qua</option>
                        <option value="6months">6 tháng qua</option>
                        <option value="year">1 năm qua</option>
                        <option value="custom">Tùy chỉnh</option>
                      </select>
                      <div className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1L6 6L11 1" stroke="#061d22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Lọc (Metric) */}
                    <div className="relative">
                      <select
                        value={metric}
                        onChange={(e) => setMetric(e.target.value)}
                        className="border border-[rgba(128,128,128,0.5)] px-[11px] py-[6px] rounded-[14.629px] font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-[#061d22] tracking-[-0.0012px] bg-white cursor-pointer appearance-none pr-[30px]"
                      >
                        <option value="views">Lượt xem</option>
                        <option value="likes">Lượt thích</option>
                        <option value="comments">Bình luận</option>
                        <option value="shares">Chia sẻ</option>
                        <option value="follows">Theo dõi</option>
                        <option value="engagement">Tương tác</option>
                        <option value="reach">Tất cả</option>
                      </select>
                      <div className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1L6 6L11 1" stroke="#061d22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="flex items-center justify-center h-[280px] text-[#737373]">
                    {loading ? (
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px]">Đang tải dữ liệu...</p>
                    ) : analyticsData ? (
                      <div className="w-full h-full p-4">
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] text-[#737373] mb-2">
                          Hiển thị {
                            metric === 'views' ? 'Lượt xem' :
                            metric === 'likes' ? 'Lượt thích' :
                            metric === 'comments' ? 'Bình luận' :
                            metric === 'shares' ? 'Chia sẻ' :
                            metric === 'follows' ? 'Theo dõi' :
                            metric === 'engagement' ? 'Tương tác' : 'Tất cả'
                          } - {platform === 'all' ? 'Tất cả nền tảng' : platform.charAt(0).toUpperCase() + platform.slice(1)} - {
                            timeRange === '7days' ? '7 ngày qua' :
                            timeRange === '30days' ? '30 ngày qua' :
                            timeRange === '3months' ? '3 tháng qua' :
                            timeRange === '6months' ? '6 tháng qua' :
                            timeRange === 'year' ? '1 năm qua' : 'Tùy chỉnh'
                          }
                        </p>
                        <div className="font-['Plus_Jakarta_Sans',sans-serif] text-[10px] text-[#a3a3a3]">
                          Nền tảng: {Object.keys(analyticsData).filter(k => !['metric', 'timeRange'].includes(k)).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px]">Không có dữ liệu</p>
                    )}
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
                    <div className="h-[68px] rounded-[8px] w-[62px] flex-shrink-0">
                      <img src={imgNotification1} alt="" className="w-full h-full object-cover rounded-[8px]" />
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px] w-full">
                        <span className="font-bold">Thảo Nguyên</span> và <span className="font-bold">100 tài khoản khác</span> đã bày tỏ cảm xúc về bài đăng của bạn
                      </p>
                    </div>
                    <img src={logoInstagram} alt="Instagram" className="w-[26px] h-[26px] flex-shrink-0" />
                  </div>
                  
                  {/* Notification 2 */}
                  <div className="flex gap-[10px] items-center w-full">
                    <div className="h-[68px] rounded-[8px] w-[62px] flex-shrink-0">
                      <img src={imgNotification2} alt="" className="w-full h-full object-cover rounded-[8px]" />
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-black tracking-[-0.0012px] w-full">
                        <span className="font-bold">Nguyenpham_01</span>, <span className="font-bold">unni035</span> và <span className="font-bold">100 tài khoản khác</span> đã bày tỏ cảm xúc về bài đăng của bạn
                      </p>
                    </div>
                    <img src={logoFacebook} alt="Facebook" className="w-[25px] h-[25px] flex-shrink-0" />
                  </div>
                </div>

                {/* Follower Counts */}
                <div className="flex gap-[17px] items-start shadow-[1.829px_1.829px_54.86px_0px_rgba(6,29,34,0.07)]">
                  {/* Facebook */}
                  <div className="bg-white flex flex-col h-[227px] items-start px-[16px] py-[20px] rounded-[8px]">
                    <div className="flex flex-col gap-[24px] items-center justify-center w-full">
                      <img src={logoFacebook} alt="Facebook" className="w-[65px] h-[66px] object-contain" />
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
                      <div className="bg-[#080808] flex items-center justify-center p-[4px] rounded-[8px] w-[66px] h-[66px]">
                        <img src={logoThreads} alt="Threads" className="w-full h-full object-contain" />
                      </div>
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
                      <img src={logoInstagram} alt="Instagram" className="w-[65px] h-[65px] object-contain" />
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
