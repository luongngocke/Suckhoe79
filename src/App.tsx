/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Droplet, 
  Activity, 
  Moon, 
  User as UserIcon, 
  Plus, 
  BarChart3,
  Home,
  MessageSquare,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, HealthLog } from './types';
import Dashboard from './components/Dashboard';
import Logging from './components/Logging';
import Statistics from './components/Statistics';
import Profile from './components/Profile';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Người dùng",
  age: 25,
  weight: 70,
  height: 170,
  gender: 'other',
  goals: {
    weight: 65,
    water: 2500,
    sleep: 8
  },
  notifications: {
    waterReminder: true,
    usageAlert: true
  },
  contacts: []
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'log' | 'profile'>('home');
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('vitaltrack_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new fields exist for backward compatibility
        if (!parsed.notifications) parsed.notifications = DEFAULT_PROFILE.notifications;
        if (!parsed.contacts) parsed.contacts = [];
        return parsed;
      }
    } catch (e) {
      console.error("Error loading profile from localStorage:", e);
    }
    return DEFAULT_PROFILE;
  });
  const [logs, setLogs] = useState<HealthLog[]>(() => {
    try {
      const saved = localStorage.getItem('vitaltrack_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading logs from localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vitaltrack_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('vitaltrack_logs', JSON.stringify(logs));
  }, [logs]);

  // Notification Logic
  useEffect(() => {
    let sessionStartTime = Date.now();
    let usageAlertTriggered = false;

    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      
      // 1. Water Reminder (Every 5 minutes between 8am and 8pm)
      if (profile.notifications.waterReminder && hours >= 8 && hours <= 20) {
        if (now.getMinutes() % 5 === 0) {
          sendNotification("VitalTrack Reminder", "Đã đến lúc uống thêm một ly nước rồi bạn ơi! 💧 (Nhắc mỗi 5 phút)");
        }
      }

      // 2. Usage Alert (After 10 minutes)
      if (profile.notifications.usageAlert && !usageAlertTriggered) {
        const sessionDurationMinutes = (Date.now() - sessionStartTime) / 60000;
        if (sessionDurationMinutes >= 10) {
          sendNotification("VitalTrack Wellbeing", "Bạn đã sử dụng ứng dụng được 10 phút. Hãy nghỉ ngơi đôi mắt một chút nhé! 👀");
          usageAlertTriggered = true;
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [profile.notifications]);

  const sendNotification = (title: string, body: string) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body
      });
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const addLog = (log: Omit<HealthLog, 'id' | 'timestamp'>) => {
    const newLog: HealthLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };
    setLogs(prev => [...prev, newLog]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100 transition-transform active:scale-95 cursor-pointer">
            <Heart size={20} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">VitalTrack</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hôm nay</p>
            <p className="text-xs font-semibold text-slate-800">
              {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-600 font-bold text-xs">
            {profile.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-6 max-w-lg mx-auto w-full"
          >
            {activeTab === 'home' && <Dashboard profile={profile} logs={logs} />}
            {activeTab === 'stats' && <Statistics logs={logs} profile={profile} />}
            {activeTab === 'log' && <Logging addLog={addLog} profile={profile} />}
            {activeTab === 'profile' && <Profile profile={profile} setProfile={setProfile} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-30 bg-white/80 backdrop-blur-lg border border-slate-200 p-2 flex items-center justify-around max-w-md mx-auto rounded-[2rem] shadow-xl shadow-slate-200/50">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon={<Home size={20} />} 
          label="Tổng quan" 
        />
        <NavButton 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')} 
          icon={<BarChart3 size={20} />} 
          label="Xu hướng" 
        />
        <NavButton 
          active={activeTab === 'log'} 
          onClick={() => setActiveTab('log')} 
          icon={<Plus size={24} />} 
          label="Ghi chép" 
          primary
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<UserIcon size={20} />} 
          label="Tôi" 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, primary }: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  primary?: boolean
}) {
  if (primary) {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "w-12 h-12 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-90 flex items-center justify-center",
          active ? "bg-slate-900 text-white" : "bg-emerald-500 text-white"
        )}
      >
        {icon}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all",
        active ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-emerald-500"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
    </button>
  );
}

