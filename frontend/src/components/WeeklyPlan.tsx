import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const iconStory = 'https://www.figma.com/api/mcp/asset/59dd0928-945d-41b6-81c4-d3f9af212044';
const iconThread = 'https://www.figma.com/api/mcp/asset/ceb235f3-c1d6-4075-928a-f19d84b0979d';
const iconInstagram = 'https://www.figma.com/api/mcp/asset/c83a35ad-c31e-4571-902e-37dd80fe3758';

interface Task {
  id: number;
  title: string;
  channel: string;
  completed: boolean;
}

const WeeklyPlan: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch('/api/dashboard/weekly-plan')
      .then(async (res) => {
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleToggle = (id: number) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
    apiFetch(`/api/dashboard/weekly-plan/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => setError(true));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col w-full">
      {/* Header and Progress */}
      <div className="flex flex-col gap-[8px] px-[32px] py-0 w-full">
        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] leading-[24px] text-[#1a0330] w-full">
          Kế hoạch hàng tuần
        </p>
        <div className="bg-[#e5e5e5] flex flex-col h-[7px] rounded-[8px] w-full overflow-hidden">
          <div 
            className="bg-[#9a67ca] h-full rounded-[8px] transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-[#1a0330] tracking-[-0.28px] w-full">
          Hãy hoàn thành ít nhất 5 nhiệm vụ để hoàn tất kế hoạch này
        </p>
      </div>
      
      {/* Task List */}
      <div className="flex flex-col gap-[20px] px-0 py-[20px] w-full">
        {loading ? (
          <div className="text-gray-400 px-[71px]">Đang tải...</div>
        ) : error ? (
          <div className="text-red-400 px-[71px]">Lỗi tải dữ liệu</div>
        ) : (
          tasks.map((task) => {
            const iconSrc = task.channel === 'facebook'
              ? iconStory
              : task.channel === 'thread'
              ? iconThread
              : iconInstagram;

            return (
              <div key={task.id} className="flex items-center justify-between px-[71px] py-0 w-full">
                <div className="flex gap-[10px] items-center w-[569px]">
                  <div className="border border-[#391060] flex flex-col items-center justify-center px-[4px] py-[5px] rounded-[4px] shadow-[0px_0px_1.7px_0px_rgba(0,0,0,0.36)]">
                    <div className="w-[17px] h-[17px]">
                      <img src={iconSrc} alt="" className="w-full h-full" />
                    </div>
                  </div>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-normal text-[14px] leading-[22px] text-black">
                    {task.title}
                  </p>
                </div>
                <div className="flex items-center gap-[7px] w-[27px]">
                  <div 
                    className={`rounded-[4px] w-[27px] h-[27px] cursor-pointer flex items-center justify-center ${
                      task.completed ? 'bg-[#737373]' : 'border border-[#737373]'
                    }`}
                    onClick={() => handleToggle(task.id)}
                  >
                    {task.completed && (
                      <svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 7L7 12L17 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WeeklyPlan;
