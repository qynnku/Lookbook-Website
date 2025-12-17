import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  threads: '#000000',
  tiktok: '#EE1D52',
  youtube: '#FF0000',
};

function toChartData(analytics: any, platform: string) {
  const keys = Object.keys(analytics).filter((k) => !['metric', 'timeRange'].includes(k));
  const firstKey = platform === 'all' ? keys[0] : platform;
  const base = analytics[firstKey] || [];
  return base.map((pt: any, idx: number) => {
    const row: any = { label: pt.label };
    keys.forEach((k) => {
      const arr = analytics[k] || [];
      const v = arr[idx]?.value ?? null;
      row[k] = v;
    });
    return row;
  });
}

const AnalyticsChart: React.FC<{ data: any; platform: string }> = ({ data, platform }) => {
  if (!data) return null;
  const chartData = toChartData(data, platform);
  const series = Object.keys(data).filter((k) => !['metric', 'timeRange'].includes(k));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ left: 8, right: 16, top: 10, bottom: 0 }}>
        <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        {platform === 'all' ? <Legend /> : null}
        {series.map((s) => (
          <Line
            key={s}
            type="monotone"
            dataKey={s}
            stroke={PLATFORM_COLORS[s] || '#0ea5e9'}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsChart;
