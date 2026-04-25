/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { UserProfile, HealthLog } from '../types';
import { Droplet, Moon, Activity, Flame, MessageSquare, Sparkles } from 'lucide-react';
import { getHealthAdvice } from '../services/geminiService';
import { motion } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
  logs: HealthLog[];
}

export default function Dashboard({ profile, logs }: DashboardProps) {
  const [advice, setAdvice] = useState<string[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Calculate today's stats
  const today = new Date().setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(log => new Date(log.timestamp).setHours(0, 0, 0, 0) === today);

  const waterTotal = todayLogs.filter(l => l.type === 'water').reduce((acc, curr) => acc + curr.value, 0);
  const caloriesTotal = todayLogs.filter(l => l.type === 'food').reduce((acc, curr) => acc + curr.value, 0);
  const sleepLog = logs.filter(l => l.type === 'sleep').sort((a, b) => b.timestamp - a.timestamp)[0];
  const sleepHours = sleepLog ? sleepLog.value : 0;

  useEffect(() => {
    async function fetchAdvice() {
      setLoadingAdvice(true);
      const advices = await getHealthAdvice(profile, logs);
      setAdvice(advices);
      setLoadingAdvice(false);
    }
    fetchAdvice();
  }, [profile, logs.length]);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Chào buổi sáng, {profile.name}</h2>
        <p className="text-slate-500 mt-1">Dưới đây là tóm tắt sức khỏe của bạn.</p>
      </section>

      {/* Progress Cards */}
      <section className="grid grid-cols-2 gap-5">
        <StatCard 
          icon={<Droplet size={18} />} 
          label="Lượng nước" 
          value={waterTotal} 
          goal={profile.goals.water} 
          unit="ml" 
          theme="blue"
        />
        <StatCard 
          icon={<Flame size={18} />} 
          label="Năng lượng" 
          value={caloriesTotal} 
          goal={2500} 
          unit="kcal" 
          theme="orange"
        />
        <StatCard 
          icon={<Moon size={18} />} 
          label="Giấc ngủ" 
          value={sleepHours} 
          goal={profile.goals.sleep} 
          unit="giờ" 
          theme="indigo"
        />
        <StatCard 
          icon={<Activity size={18} />} 
          label="Vận động" 
          value={todayLogs.filter(l => l.type === 'activity').reduce((acc, curr) => acc + curr.value, 0)} 
          goal={60} 
          unit="phút" 
          theme="emerald"
        />
      </section>

      {/* AI Advice */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles size={20} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold">Gợi ý từ Vital AI</h3>
          </div>
          {loadingAdvice ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-white/10 rounded w-5/6"></div>
              <div className="h-3 bg-white/10 rounded w-4/6"></div>
            </div>
          ) : (
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <ul className="space-y-4">
                {advice.map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-xs text-slate-300 leading-relaxed flex gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Hoạt động gần đây</h3>
          <button className="text-xs font-bold text-emerald-600 hover:emerald-700 transition-colors uppercase tracking-widest">
            Xem thêm
          </button>
        </div>
        <div className="space-y-4">
          {todayLogs.length === 0 ? (
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-400">Bạn chưa có hoạt động nào hôm nay.</p>
            </div>
          ) : (
            todayLogs.slice(-4).reverse().map((log) => (
              <div key={log.id} className="group flex items-center gap-5 bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-emerald-100 hover:shadow-md transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                   {getIcon(log.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 capitalize">{getTypeLabel(log.type)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">{log.value} {log.unit}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, goal, unit, theme }: any) {
  const percentage = Math.min(Math.round((value / goal) * 100), 100);
  const themes: any = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };
  
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-lg hover:shadow-slate-200/50 transition-all">
      <div className="flex justify-between items-start mb-6">
        <span className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${themes[theme]}`}>
          {icon}
        </span>
        <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-tight ${percentage >= 100 ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
          {percentage}%
        </span>
      </div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 px-1">{label}</p>
      <div className="flex items-baseline gap-1 px-1">
        <span className="text-2xl font-black text-slate-800">{value.toLocaleString()}</span>
        <span className="text-slate-400 text-xs font-bold whitespace-nowrap italic">/ {goal}{unit}</span>
      </div>
      <div className="w-full bg-slate-50 h-2 mt-5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full rounded-full ${themes[theme].split(' ')[1].replace('text', 'bg')}`}
        />
      </div>
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case 'water': return <Droplet size={18} className="text-blue-500" />;
    case 'food': return <Flame size={18} className="text-orange-500" />;
    case 'activity': return <Activity size={18} className="text-green-500" />;
    case 'sleep': return <Moon size={18} className="text-purple-500" />;
    default: return <Activity size={18} />;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'water': return 'Uống nước';
    case 'food': return 'Bữa ăn';
    case 'activity': return 'Vận động';
    case 'sleep': return 'Giấc ngủ';
    case 'weight': return 'Cân nặng';
    default: return type;
  }
}
