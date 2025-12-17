import React, { useMemo, useState } from 'react';
import ChannelList from './ChannelList';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import FooterBar from './FooterBar';

interface OrdersProps {
  onNavigate?: (label: string) => void;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

type Order = {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: OrderStatus;
  total: number;
  channel: string;
};

const mockOrders: Order[] = [
  { id: '#OD-1023', customer: 'Nguyễn Lan', product: 'Gói Lookbook Luxury', date: '2025-12-14', status: 'processing', total: 3200000, channel: 'Facebook' },
  { id: '#OD-1022', customer: 'Trần Minh', product: 'Gói Livestream Pro', date: '2025-12-13', status: 'pending', total: 2100000, channel: 'Instagram' },
  { id: '#OD-1021', customer: 'Phạm Thu', product: 'Gói Social Boost', date: '2025-12-12', status: 'completed', total: 1200000, channel: 'Threads' },
  { id: '#OD-1020', customer: 'Lê Hoàng', product: 'Gói Lookbook Basic', date: '2025-12-12', status: 'shipped', total: 950000, channel: 'TikTok' },
  { id: '#OD-1019', customer: 'Vũ Thảo', product: 'Gói Sự kiện mini', date: '2025-12-11', status: 'cancelled', total: 680000, channel: 'Facebook' },
  { id: '#OD-1018', customer: 'Đào Hạnh', product: 'Gói Nội dung Premium', date: '2025-12-10', status: 'completed', total: 2450000, channel: 'Instagram' },
  { id: '#OD-1017', customer: 'Bùi Nam', product: 'Gói Social Boost', date: '2025-12-09', status: 'processing', total: 1150000, channel: 'YouTube' },
];

function getEmailFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-[#fff7e6] text-[#b76b00]',
  processing: 'bg-[#e7f1ff] text-[#1a56db]',
  shipped: 'bg-[#e7fff3] text-[#138a53]',
  completed: 'bg-[#e6fffb] text-[#0f766e]',
  cancelled: 'bg-[#ffe6e6] text-[#c53030]',
};

const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const canViewData = getEmailFromToken() === 'admin@dottie.vn';

  const filteredOrders = useMemo(() => {
    if (!canViewData) return [];
    return mockOrders.filter((o) => {
      const matchText = `${o.id} ${o.customer} ${o.product} ${o.channel}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' ? true : o.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [search, statusFilter, canViewData]);

  const counts = useMemo(() => {
    if (!canViewData) return { total: 0, completed: 0, processing: 0, pending: 0 };
    const total = mockOrders.length;
    const completed = mockOrders.filter((o) => o.status === 'completed').length;
    const processing = mockOrders.filter((o) => o.status === 'processing').length;
    const pending = mockOrders.filter((o) => o.status === 'pending').length;
    return { total, completed, processing, pending };
  }, [canViewData]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex-1 flex w-full">
        <aside className="w-[336px] bg-white border-r border-[#d4d4d4] flex flex-col">
          <ChannelList />
          <Sidebar activeLabel="Quản lý đơn hàng" onSelect={onNavigate} />
        </aside>

        <main className="flex-1 flex flex-col w-[1104px]">
          <TopNav active="orders" />

          <div className="flex-1 overflow-y-auto bg-white">
            <div className="flex flex-col items-center pb-[30px] pt-[10px] px-0 w-full">
              <div className="flex flex-col items-start pl-[21px] pr-[50px] py-0 w-full">
                <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] leading-[28px] text-black tracking-[0.004px]">
                  Quản lý đơn hàng
                </p>
              </div>

              <div className="flex flex-col gap-[18px] items-start px-[30px] py-[18px] w-full">
                {/* Summary cards */}
                <div className="grid grid-cols-4 gap-[16px] w-full">
                  <div className="bg-white border border-[#d4d4d4] rounded-[12px] px-[16px] py-[14px] shadow-[0px_0px_4.6px_0px_rgba(0,0,0,0.1)]">
                    <p className="text-[#404040] text-[13px] mb-[6px]">Tổng đơn</p>
                    <p className="text-[20px] font-semibold text-black">{counts.total}</p>
                  </div>
                  <div className="bg-white border border-[#d4d4d4] rounded-[12px] px-[16px] py-[14px] shadow-[0px_0px_4.6px_0px_rgba(0,0,0,0.1)]">
                    <p className="text-[#404040] text-[13px] mb-[6px]">Hoàn tất</p>
                    <p className="text-[20px] font-semibold text-black">{counts.completed}</p>
                  </div>
                  <div className="bg-white border border-[#d4d4d4] rounded-[12px] px-[16px] py-[14px] shadow-[0px_0px_4.6px_0px_rgba(0,0,0,0.1)]">
                    <p className="text-[#404040] text-[13px] mb-[6px]">Đang xử lý</p>
                    <p className="text-[20px] font-semibold text-black">{counts.processing}</p>
                  </div>
                  <div className="bg-white border border-[#d4d4d4] rounded-[12px] px-[16px] py-[14px] shadow-[0px_0px_4.6px_0px_rgba(0,0,0,0.1)]">
                    <p className="text-[#404040] text-[13px] mb-[6px]">Chờ xử lý</p>
                    <p className="text-[20px] font-semibold text-black">{counts.pending}</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-[12px] items-center w-full">
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm theo mã, khách hàng, sản phẩm"
                      className="border border-[#d4d4d4] rounded-[12px] px-[12px] py-[10px] w-[260px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#9a67ca]"
                    />
                  </div>
                  <div className="flex gap-[8px] items-center text-[13px] text-[#404040]">
                    <span>Trạng thái:</span>
                    <div className="flex gap-[8px] flex-wrap">
                      {(['all','pending','processing','shipped','completed','cancelled'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s === 'all' ? 'all' : s)}
                          className={`rounded-[20px] border px-[12px] py-[6px] text-[12px] transition-colors ${
                            statusFilter === s ? 'bg-[#e5d7ff] border-[#9a67ca] text-[#1a0330]' : 'bg-white border-[#d4d4d4] text-[#404040] hover:bg-[#f5f5f5]'
                          }`}
                        >
                          {s === 'all' ? 'Tất cả' : statusLabels[s as OrderStatus]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-[#d4d4d4] rounded-[12px] w-full overflow-hidden shadow-[0px_0px_4.6px_0px_rgba(0,0,0,0.1)]">
                  <div className="grid grid-cols-7 bg-[#fafafa] text-[13px] text-[#404040] font-semibold px-[14px] py-[12px]">
                    <div>Mã đơn</div>
                    <div>Khách hàng</div>
                    <div>Sản phẩm</div>
                    <div>Kênh</div>
                    <div>Ngày</div>
                    <div>Trạng thái</div>
                    <div className="text-right">Tổng</div>
                  </div>
                  {filteredOrders.map((o) => (
                    <div key={o.id} className="grid grid-cols-7 items-center text-[13px] text-[#1f1f1f] px-[14px] py-[12px] border-t border-[#f0f0f0]">
                      <div className="font-semibold text-[#1a0330]">{o.id}</div>
                      <div>{o.customer}</div>
                      <div>{o.product}</div>
                      <div>{o.channel}</div>
                      <div>{o.date}</div>
                      <div>
                        <span className={`rounded-[12px] px-[10px] py-[4px] text-[12px] ${statusColors[o.status]}`}>
                          {statusLabels[o.status]}
                        </span>
                      </div>
                      <div className="text-right font-semibold">{o.total.toLocaleString('vi-VN')} đ</div>
                    </div>
                  ))}
                  {filteredOrders.length === 0 && (
                    <div className="text-center text-[#737373] text-[13px] py-[16px]">
                      {canViewData ? 'Không có đơn nào' : 'Tài khoản này chưa có dữ liệu đơn hàng'}
                    </div>
                  )}
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

export default Orders;
