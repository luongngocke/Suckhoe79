/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HealthLog, UserProfile } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

interface StatisticsProps {
  logs: HealthLog[];
  profile: UserProfile;
}

export default function Statistics({ logs, profile }: StatisticsProps) {
  // Prep data for Weight chart
  const weightData = logs
    .filter(l => l.type === 'weight')
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(l => ({
      date: format(l.timestamp, 'dd/MM'),
      value: l.value
    }));

  // Prep data for Water (last 7 days)
  const last7Days = eachDayOfInterval({
    start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  const waterData = last7Days.map(date => {
    const dayLogs = logs.filter(l => l.type === 'water' && isSameDay(new Date(l.timestamp), date));
    return {
      date: format(date, 'EE', { locale: vi }),
      value: dayLogs.reduce((acc, curr) => acc + curr.value, 0)
    };
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Số liệu chi tiết</h2>
        <p className="text-slate-500 mt-1">Phân tích hành trình sức khỏe của bạn.</p>
      </section>

      {/* Weight Trend */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-lg font-bold text-slate-800">Biến động cân nặng</h3>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đơn vị: kg</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                hide 
                domain={['dataMin - 1', 'dataMax + 1']} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '12px' }}
                itemStyle={{ fontWeight: '800', color: '#1e293b', fontSize: '12px' }}
                labelStyle={{ display: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Water consumption */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-lg font-bold text-slate-800">Lượng nước uống</h3>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đơn vị: ml</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                 cursor={{ fill: '#f8fafc', radius: 12 }}
                 contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '12px' }}
                 itemStyle={{ fontWeight: '800', color: '#1e293b', fontSize: '12px' }}
                 labelStyle={{ display: 'none' }}
              />
              <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={32}>
                {waterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value >= profile.goals.water ? '#10b981' : '#cbd5e1'} 
                    className="transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Summary insights */}
      <div className="grid grid-cols-2 gap-5">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Cân nặng thấp nhất</p>
           <p className="text-2xl font-black text-slate-800">
             {weightData.length > 0 ? Math.min(...weightData.map(d => d.value)) : '-'} <span className="text-xs font-bold text-slate-400">kg</span>
           </p>
         </div>
         <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Mục tiêu nước</p>
           <p className="text-2xl font-black text-emerald-400">
             {waterData.filter(d => d.value >= profile.goals.water).length} <span className="text-xs font-bold text-slate-500">/ 7 ngày</span>
           </p>
         </div>
      </div>
    </div>
  );
}
