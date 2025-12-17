
import React from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import ChannelList from './ChannelList';
import DashboardHeader from './DashboardHeader';
import KpiCards from './KpiCards';
import WeeklyPlan from './WeeklyPlan';
import FooterBar from './FooterBar';

type OverviewDashboardProps = {
  onNavigate?: (label: string) => void;
};

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => (
  <div className="min-h-screen flex flex-col bg-white font-['Plus_Jakarta_Sans',sans-serif]">
    {/* Main Layout */}
    <div className="flex-1 flex w-full">
      {/* Combined Sidebar and Channel List */}
      <aside className="w-[336px] bg-white border-r border-[#d4d4d4] flex flex-col">
        <ChannelList />
        <Sidebar activeLabel="Tổng quan" onSelect={onNavigate} />
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col w-[1104px]">
        <TopNav />
        <DashboardHeader />
        <KpiCards />
        <WeeklyPlan />
      </main>
    </div>
    {/* Footer */}
    <FooterBar />
  </div>
);

export default OverviewDashboard;
