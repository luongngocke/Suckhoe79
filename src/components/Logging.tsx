/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HealthLog, UserProfile } from '../types';
import { Droplet, Flame, Activity, Moon, Scale, Check, ChevronRight, Sparkles, Phone, X } from 'lucide-react';
import { estimateFoodCalories } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface LoggingProps {
  addLog: (log: Omit<HealthLog, 'id' | 'timestamp'>) => void;
  profile: UserProfile;
}

export default function Logging({ addLog, profile }: LoggingProps) {
  const [selectedType, setSelectedType] = useState<HealthLog['type'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [mealInput, setMealInput] = useState('');
  const [value, setValue] = useState('');
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{ name: string; tel: string } | null>(null);

  const types = [
    { id: 'water', icon: <Droplet size={20} />, label: 'Uống nước', unit: 'ml', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'food', icon: <Flame size={20} />, label: 'Bữa ăn', unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'activity', icon: <Activity size={20} />, label: 'Vận động', unit: 'phút', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'sleep', icon: <Moon size={20} />, label: 'Giấc ngủ', unit: 'giờ', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'weight', icon: <Scale size={20} />, label: 'Cân nặng', unit: 'kg', color: 'text-slate-500', bg: 'bg-slate-100' },
  ];

  const handleManualAdd = () => {
    if (!selectedType || !value || isNaN(parseFloat(value))) {
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      return;
    }
    
    addLog({
      type: selectedType,
      value: parseFloat(value),
      unit: types.find(t => t.id === selectedType)?.unit || ''
    });

    if ("vibrate" in navigator) navigator.vibrate(50);

    // Call suggestion for water
    if (selectedType === 'water' && profile.contacts && profile.contacts.length > 0) {
      const idx = Math.floor(Math.random() * profile.contacts.length);
      setSelectedContact(profile.contacts[idx]);
      setShowCallPrompt(true);
    }

    setSelectedType(null);
    setValue('');
  };

  const handleAIFood = async () => {
    if (!mealInput) {
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      return;
    }
    setLoading(true);
    const result = await estimateFoodCalories(mealInput);
    addLog({
      type: 'food',
      value: result.calories,
      unit: 'kcal',
      note: mealInput,
      metadata: { breakdown: result.breakdown }
    });
    if ("vibrate" in navigator) navigator.vibrate(50);
    setLoading(false);
    setMealInput('');
    setSelectedType(null);
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Ghi nhận mới</h2>
        <p className="text-slate-500 mt-1">Chọn loại hoạt động hoặc chỉ số bạn muốn lưu.</p>
      </section>

      {!selectedType ? (
        <div className="grid grid-cols-1 gap-4">
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id as any)}
              className="flex items-center gap-5 p-5 bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
            >
              <div className={`${t.bg} ${t.color} w-14 h-14 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform`}>
                {t.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800">{t.label}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cập nhật ngay</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-colors">
                <ChevronRight size={18} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8"
        >
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedType(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Trở lại
            </button>
            <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${types.find(t => t.id === selectedType)?.bg.replace('bg-', 'bg-').split('-')[0] + '-500'}`}></span>
               <h3 className="font-bold text-slate-800">
                {types.find(t => t.id === selectedType)?.label}
              </h3>
            </div>
          </div>

          {selectedType === 'food' ? (
             <div className="space-y-6">
               <div className="space-y-3">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Bạn đã ăn gì?</label>
                 <textarea
                   className="w-full h-32 p-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm transition-all resize-none font-medium text-slate-800"
                   placeholder="Ví dụ: Một bát phở bò, 2 cái quẩy và 1 cốc nước cam..."
                   value={mealInput}
                   onChange={(e) => setMealInput(e.target.value)}
                 />
                 <div className="flex items-center gap-2 px-2">
                    <Sparkles size={12} className="text-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">AI sẽ tự động tính lượng calo</p>
                 </div>
               </div>
               
               <button
                 onClick={handleAIFood}
                 disabled={loading || !mealInput}
                 className="w-full py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-200 disabled:opacity-50 hover:bg-emerald-600 transition-all active:scale-95"
               >
                 {loading ? 'Đang tính toán...' : 'Lưu với AI'}
               </button>

               <div className="relative py-2">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                 <div className="relative flex justify-center"><span className="px-4 bg-white text-[10px] text-slate-300 uppercase font-black tracking-widest">hoặc nhập số</span></div>
               </div>

               <div className="flex items-center bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
                  <input
                    type="number"
                    className="flex-1 bg-transparent outline-none font-black text-lg text-slate-800"
                    placeholder="Lượng Calo..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">kcal</span>
               </div>
             </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    autoFocus
                    className="w-40 text-7xl font-black text-center bg-transparent outline-none border-b-4 border-slate-50 focus:border-emerald-500 py-2 transition-all text-slate-800"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{types.find(t => t.id === selectedType)?.unit}</span>
              </div>
            </div>
          )}

          {selectedType !== 'food' && (
            <button
              onClick={handleManualAdd}
              disabled={!value}
              className="w-full py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <Check size={20} strokeWidth={3} />
              Lưu dữ liệu
            </button>
          )}
        </motion.div>
      )}

      {/* Call Prompt Modal */}
      <AnimatePresence>
        {showCallPrompt && selectedContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
                  <Droplet size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800">Uống nước xong rồi!</h3>
                  <p className="text-sm text-slate-500">Gợi ý: Hãy gọi điện cho người thân để chia sẻ niềm vui sống khỏe mỗi ngày.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bạn đồng hành</p>
                    <p className="text-lg font-black text-slate-800">{selectedContact.name}</p>
                  </div>
                  <a 
                    href={`tel:${selectedContact.tel}`}
                    className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-all"
                  >
                    <Phone size={20} fill="currentColor" />
                  </a>
                </div>

                <button 
                  onClick={() => setShowCallPrompt(false)}
                  className="w-full py-4 text-xs font-black text-slate-300 uppercase tracking-[0.2em] hover:text-slate-500 transition-colors"
                >
                  Bỏ qua lúc này
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
