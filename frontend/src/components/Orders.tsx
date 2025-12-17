import React, { useEffect, useMemo, useState } from 'react';
import ChannelList from './ChannelList';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import FooterBar from './FooterBar';
import { apiFetch } from '../utils/api';

interface OrdersProps {
  onNavigate?: (label: string) => void;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

type Order = {
  id: number;
  code: string;
  customer: string;
  product: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  channel: string;
};

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

const statusHoverColors: Record<OrderStatus, string> = {
  pending: 'hover:bg-[#ffe0e0] hover:text-[#c53030] cursor-pointer',
  processing: 'hover:bg-[#d4e8ff] cursor-pointer',
  shipped: 'hover:bg-[#d4fff0] cursor-pointer',
  completed: 'hover:bg-[#d4fff8] cursor-pointer',
  cancelled: 'hover:bg-[#ffc0c0] cursor-pointer',
};

const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({ total: 0, completed: 0, processing: 0, pending: 0 });

  const tokenEmail = getEmailFromToken();

  // Reset to first page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // Load orders with pagination/search/filter
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (search.trim()) params.append('q', search.trim());

        const resp = await apiFetch(`/orders?${params.toString()}`, { signal: controller.signal });
        if (!resp.ok) throw new Error('Không thể tải danh sách đơn hàng');
        const data = await resp.json();
        setOrders(data.items || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    }, 250); // light debounce for search

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [page, pageSize, search, statusFilter]);

  // Load summary counts (all/completed/processing/pending)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const statuses: (OrderStatus | 'all')[] = ['all', 'completed', 'processing', 'pending'];
        const results = await Promise.all(statuses.map(async (s) => {
          const params = new URLSearchParams({ page: '1', pageSize: '1' });
          if (s !== 'all') params.append('status', s);
          const resp = await apiFetch(`/orders?${params.toString()}`);
          if (!resp.ok) throw new Error('Không thể tải thống kê đơn hàng');
          const data = await resp.json();
          return { key: s, total: data.total || 0 };
        }));

        if (cancelled) return;
        setCounts({
          total: results.find((r) => r.key === 'all')?.total || 0,
          completed: results.find((r) => r.key === 'completed')?.total || 0,
          processing: results.find((r) => r.key === 'processing')?.total || 0,
          pending: results.find((r) => r.key === 'pending')?.total || 0,
        });
      } catch (err) {
        // Keep existing counts on failure
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filteredOrders = useMemo(() => orders, [orders]);

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
                  {loading && (
                    <div className="text-center text-[#737373] text-[13px] py-[16px]">Đang tải đơn hàng...</div>
                  )}
                  {error && (
                    <div className="text-center text-[#c53030] text-[13px] py-[16px]">{error}</div>
                  )}
                  {!loading && !error && filteredOrders.map((o) => (
                    <div key={o.id} className="grid grid-cols-7 items-center text-[13px] text-[#1f1f1f] px-[14px] py-[12px] border-t border-[#f0f0f0]">
                      <div className="font-semibold text-[#1a0330]">#{o.code}</div>
                      <div>{o.customer}</div>
                      <div>{o.product}</div>
                      <div>{o.channel}</div>
                      <div>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div>
                        <span className={`rounded-[12px] px-[10px] py-[4px] text-[12px] transition-all ${statusColors[o.status]} ${statusHoverColors[o.status]}`}>
                          {statusLabels[o.status]}
                        </span>
                      </div>
                      <div className="text-right font-semibold">{o.total.toLocaleString('vi-VN')} đ</div>
                    </div>
                  ))}
                  {!loading && !error && filteredOrders.length === 0 && (
                    <div className="text-center text-[#737373] text-[13px] py-[16px]">
                      {tokenEmail ? 'Không có đơn nào' : 'Vui lòng đăng nhập để xem đơn hàng'}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {total > 0 && (
                  <div className="flex items-center justify-between w-full text-[13px] text-[#404040]">
                    <span>Trang {page} / {totalPages}</span>
                    <div className="flex gap-[8px]">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`border border-[#d4d4d4] rounded-[8px] px-[10px] py-[6px] ${page === 1 ? 'text-[#bfbfbf] cursor-not-allowed' : 'hover:bg-[#f5f5f5]'}`}
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className={`border border-[#d4d4d4] rounded-[8px] px-[10px] py-[6px] ${page >= totalPages ? 'text-[#bfbfbf] cursor-not-allowed' : 'hover:bg-[#f5f5f5]'}`}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
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
