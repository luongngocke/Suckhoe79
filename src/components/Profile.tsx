/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';
import { User, Settings, Shield, Bell, LogOut, ChevronRight, Save, Trash2, Users, Phone } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export default function Profile({ profile, setProfile }: ProfileProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (parseFloat(value) || value);

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...(profile as any)[parent],
          [child]: val
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: name === 'age' || name === 'weight' || name === 'height' ? parseFloat(value) : val
      });
    }
  };

  const handlePickContact = async () => {
    try {
      if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const contacts = await (navigator as any).contacts.select(props, opts);
        
        if (contacts.length > 0) {
          const newContacts = contacts.map((c: any) => ({
            name: c.name?.[0] || 'Unknown',
            tel: c.tel?.[0] || ''
          })).filter((c: any) => c.tel);
          
          setProfile({
            ...profile,
            contacts: [...profile.contacts, ...newContacts]
          });
        }
      } else {
        // Fallback or alert
        const name = prompt("Nhập tên người thân:");
        const tel = prompt("Nhập số điện thoại:");
        if (name && tel) {
          setProfile({
            ...profile,
            contacts: [...profile.contacts, { name, tel }]
          });
        }
      }
    } catch (err) {
      console.error("Error picking contact:", err);
    }
  };

  const removeContact = (index: number) => {
    const newContacts = [...profile.contacts];
    newContacts.splice(index, 1);
    setProfile({ ...profile, contacts: newContacts });
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-center gap-6 py-6 pb-2">
        <div className="w-28 h-28 rounded-[2rem] bg-emerald-50 flex items-center justify-center border-4 border-white shadow-xl shadow-slate-200/50 relative">
          <User size={52} className="text-emerald-500" strokeWidth={1.5} />
          <div className="absolute -bottom-2 -right-2 bg-slate-900 border-4 border-white w-10 h-10 rounded-2xl flex items-center justify-center text-white">
            <Settings size={18} />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{profile.name}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {profile.age} tuổi • {profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : 'Khác'}
          </p>
        </div>
      </section>

      {/* Editable Profile */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h3 className="font-bold text-slate-800">Thông tin cơ bản</h3>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Tên hiển thị</label>
            <input 
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Giới tính</label>
            <select 
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Cân nặng (kg)</label>
            <input 
              type="number"
              name="weight"
              value={profile.weight}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Chiều cao (cm)</label>
            <input 
              type="number"
              name="height"
              value={profile.height}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
          <h3 className="font-bold text-slate-800">Mục tiêu cá nhân</h3>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between p-2">
             <div className="flex flex-col">
               <span className="text-sm font-bold text-slate-800">Cân nặng đích</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Duy trì hoặc hướng tới</span>
             </div>
             <div className="flex items-center gap-2">
               <input 
                 name="goals.weight"
                 type="number"
                 value={profile.goals.weight}
                 onChange={handleChange}
                 className="w-20 bg-slate-50 border border-slate-50 rounded-xl p-2.5 text-sm text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none font-black text-blue-600 transition-all"
               />
               <span className="text-[10px] font-bold text-slate-400">KG</span>
             </div>
           </div>
           <div className="flex items-center justify-between p-2">
             <div className="flex flex-col">
               <span className="text-sm font-bold text-slate-800">Lượng nước mỗi ngày</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Mục tiêu tối thiểu</span>
             </div>
             <div className="flex items-center gap-2">
               <input 
                  name="goals.water"
                  type="number"
                  value={profile.goals.water}
                  onChange={handleChange}
                  className="w-20 bg-slate-50 border border-slate-50 rounded-xl p-2.5 text-sm text-right focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none font-black text-emerald-600 transition-all"
                />
               <span className="text-[10px] font-bold text-slate-400">ML</span>
             </div>
           </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
          <h3 className="font-bold text-slate-800">Cài đặt thông báo</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">Nhắc uống nước</p>
              <p className="text-[10px] text-slate-400 font-medium">Thông báo mỗi 5 phút (8:00 - 20:00)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="notifications.waterReminder"
                checked={profile.notifications.waterReminder}
                onChange={handleChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">Cảnh báo sử dụng</p>
              <p className="text-[10px] text-slate-400 font-medium">Nhắc nhở khi sử dụng app quá 10 phút</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="notifications.usageAlert"
                checked={profile.notifications.usageAlert}
                onChange={handleChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Water Buddies / Contacts Section */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="font-bold text-slate-800">Bạn đồng hành (Uống nước)</h3>
          </div>
          <button 
            onClick={handlePickContact}
            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Users size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {profile.contacts.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chưa có danh bạ</p>
              <p className="text-[10px] text-slate-400 mt-1">Thêm người thân để gọi điện khi uống nước</p>
            </div>
          ) : (
            profile.contacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                    {contact.name.substring(0, 1)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{contact.name}</span>
                    <span className="text-[10px] font-bold text-slate-400">{contact.tel}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeContact(index)}
                  className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        <p className="text-[10px] text-slate-400 text-center font-medium px-4">
          Khi bạn ghi nhận uống nước, ứng dụng sẽ gợi ý gọi điện cho một người trong danh sách này.
        </p>
      </section>

      {/* Other options */}
      <div className="space-y-3">
        <button 
          onClick={async () => {
            if (!("Notification" in window)) {
              alert("Trình duyệt này không hỗ trợ thông báo.");
              return;
            }
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              new Notification("VitalTrack", { 
                body: "Thông báo nhắc nhở đã được kích hoạt!",
                icon: "/favicon.ico"
              });
            } else {
              alert("Bạn cần cấp quyền để nhận thông báo nhắc nhở.");
            }
          }}
          className="w-full flex items-center justify-between p-5 px-8 bg-white rounded-[1.5rem] border border-slate-100 text-sm font-bold text-slate-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Bell size={18} />
            </div>
            Bật thông báo nhắc nhở
          </div>
          <ChevronRight size={18} className="text-slate-200" />
        </button>
        <button 
           onClick={() => {
             if(confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu?")) {
               localStorage.clear();
               window.location.reload();
             }
           }}
           className="w-full flex items-center justify-between p-5 px-8 bg-rose-50 rounded-[1.5rem] border border-rose-100 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-200/50 flex items-center justify-center">
              <LogOut size={18} />
            </div>
            Xóa dữ liệu & Đăng xuất
          </div>
        </button>
      </div>

      <div className="pb-12 pt-4 text-center">
        <p className="text-[10px] text-slate-200 uppercase tracking-[0.3em] font-black underline underline-offset-8 decoration-slate-100">VitalTrack Ecosystem</p>
      </div>
    </div>
  );
}
