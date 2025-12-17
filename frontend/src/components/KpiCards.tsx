import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

interface Kpi {
  key: string;
  title: string;
  value: string;
  changePercent: number;
  changeText: string;
  loading: boolean;
  error: boolean;
}

const kpiList = [
  { key: 'newReach', title: 'Tiếp cận khách hàng mới' },
  { key: 'postViews', title: 'Lượt xem bài đăng' },
  { key: 'pageVisits', title: 'Lượt truy cập trang' },
  { key: 'contentPerformanceScore', title: 'Hiệu suất nội dung' },
];

const KpiCards: React.FC = () => {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch('/api/dashboard/summary')
      .then(async (res) => {
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setKpis(kpiList.map((k) => {
          const changePercent = data[k.key]?.changePercent ?? 0;
          const value = data[k.key]?.value ?? 0;
          const changeValue = Math.abs(Math.round(changePercent * value / 100));
          const changeSign = changePercent > 0 ? '+' : changePercent < 0 ? '' : '';
          return {
            key: k.key,
            title: k.title,
            value: value.toLocaleString(),
            changePercent: changePercent,
            changeText: `${changeSign}${changeValue} hôm nay`,
            loading: false,
            error: false,
          };
        }));
        setLoading(false);
      })
      .catch((err) => {
        console.error('KPI fetch error:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-wrap gap-[78px] items-start justify-between px-[10px] py-[30px] w-full">
      {kpiList.map((k) => {
        const kpi = kpis.find((item) => item.key === k.key);
        const isPositive = kpi && kpi.changePercent > 0;
        const isNegative = kpi && kpi.changePercent < 0;
        
        return (
          <div
            key={k.key}
            className="bg-white border border-[#d4d4d4] flex flex-col gap-[18px] h-[125px] items-center justify-center px-[26px] py-[16px] rounded-[16px] shadow-[0px_0px_4.6px_0px_rgba(0,0,0,0.16)] w-[239px]"
          >
            <div className="flex items-center w-full">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[16px] leading-[24px] text-[#404040] tracking-[-0.32px]">
                {k.title}
              </p>
            </div>
            
            <div className="flex items-center justify-between w-full">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[18px] leading-[26px] text-black">
                {loading ? '...' : kpi?.value ?? '--'}
              </p>
              <div className="w-[21.433px] h-[21.433px]" />
            </div>
            
            <div className="flex gap-[10px] items-end w-full">
              {!loading && kpi && (
                <>
                  <div className={`bg-white border flex gap-[4px] items-center p-[4px] rounded-[8px] ${
                    isPositive ? 'border-[#2cb100]' : 'border-[#db1a08]'
                  }`}>
                    <div className="w-[10.717px] h-[10.717px]" />
                    <p className={`font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[16px] tracking-[0.0024px] ${
                      isPositive ? 'text-[#2cb100]' : 'text-[#db1a08]'
                    }`}>
                      {Math.abs(kpi.changePercent)}%
                    </p>
                  </div>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[12px] leading-[18px] text-[#737373] tracking-[-0.0012px]">
                    {kpi.changeText}
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiCards;
