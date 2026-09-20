'use client';

import React, { useState } from 'react';
import { Save, Store, Phone, Send, QrCode } from 'lucide-react';
import { StoreSettings as SettingsType } from '@/types';

interface StoreSettingsProps {
  settings: SettingsType;
  onSave: (newSettings: SettingsType) => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<SettingsType>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 max-w-2xl">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Store className="w-5 h-5 text-school-600" />
          <span>ការកំណត់ព័ត៌មានហាងសាលា (Store Configuration)</span>
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          ព័ត៌មានទាំងនេះនឹងបង្ហាញនៅលើគេហទំព័រ និងវិក្កយបត្ររបស់អតិថិជន
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            ឈ្មោះហាងសាលា (Shop Name)
          </label>
          <input
            type="text"
            required
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:ring-2 focus:ring-school-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            ទីតាំងជាក់ស្តែង (Store Location Description)
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:ring-2 focus:ring-school-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-school-600" />
              <span>លេខទូរស័ព្ទទី១ (ចម្បង)</span>
            </label>
            <input
              type="text"
              required
              value={formData.phone1}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:ring-2 focus:ring-school-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>លេខទូរស័ព្ទទី២ (បន្ទាប់បន្សំ)</span>
            </label>
            <input
              type="text"
              value={formData.phone2}
              onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:ring-2 focus:ring-school-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span>គណនី Telegram Admin</span>
            </label>
            <input
              type="text"
              placeholder="@username"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:ring-2 focus:ring-school-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-rose-600" />
              <span>Bakong ID សម្រាប់ KHQR</span>
            </label>
            <input
              type="text"
              placeholder="name@bank"
              value={formData.bakongId}
              onChange={(e) => setFormData({ ...formData, bakongId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:ring-2 focus:ring-school-500"
            />
          </div>
        </div>

        {/* ABA Specific Settings */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#002f49]"></span>
            <span>ព័ត៌មានគណនី ABA KHQR ផ្លូវការ</span>
          </h5>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ឈ្មោះម្ចាស់គណនី ABA (Account Name)
            </label>
            <input
              type="text"
              placeholder="SOVATKANHCHANA SENG"
              value={formData.accountName || ''}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:ring-2 focus:ring-school-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ៛ លេខគណនី KHR
              </label>
              <input
                type="text"
                placeholder="008 906 861"
                value={formData.accountKhr || ''}
                onChange={(e) => setFormData({ ...formData, accountKhr: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-school-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                $ លេខគណនី USD
              </label>
              <input
                type="text"
                placeholder="001 155 614"
                value={formData.accountUsd || ''}
                onChange={(e) => setFormData({ ...formData, accountUsd: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-school-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ផ្លូវរូបភាព ABA KHQR (Standee Image URL)
            </label>
            <input
              type="text"
              placeholder="/images/aba-khqr.jpg"
              value={formData.customQrUrl || ''}
              onChange={(e) => setFormData({ ...formData, customQrUrl: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:ring-2 focus:ring-school-500"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          {saved && (
            <span className="text-emerald-600 font-bold text-xs animate-in fade-in">
              ✓ បានរក្សាទុកការកំណត់ជោគជ័យ!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto bg-school-600 hover:bg-school-700 active:scale-95 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-school-600/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>រក្សាទុកព័ត៌មាន</span>
          </button>
        </div>
      </form>
    </div>
  );
};
