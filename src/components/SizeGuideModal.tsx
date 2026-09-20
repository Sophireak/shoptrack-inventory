'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-school-600" />
            <h3 className="font-bold text-slate-900 text-base">
              តារាងទំហំឯកសណ្ឋាន (Size Guide Chart)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            ទំហំឯកសណ្ឋានត្រូវបានរចនាឡើងតាមស្តង់ដារសិស្សបឋមសិក្សាកម្ពុជា។ ខាងក្រោមជាទំហំដែលត្រូវនឹងកម្រិតថ្នាក់ទូទៅ៖
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">ទំហំ (Size)</th>
                  <th className="p-2.5">កម្រិតថ្នាក់សមស្រប</th>
                  <th className="p-2.5">កម្ពស់ (cm)</th>
                  <th className="p-2.5">ទម្ងន់ (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">20 - 22</td>
                  <td className="p-2.5">ថ្នាក់ទី ១ (ពណ៌ខៀវ)</td>
                  <td className="p-2.5">110 - 120 cm</td>
                  <td className="p-2.5">18 - 23 kg</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">22 - 24</td>
                  <td className="p-2.5">ថ្នាក់ទី ២ (ពណ៌ខៀវ)</td>
                  <td className="p-2.5">118 - 128 cm</td>
                  <td className="p-2.5">22 - 27 kg</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">24 - 26</td>
                  <td className="p-2.5">ថ្នាក់ទី ៣ (ពណ៌ទឹកក្រូច)</td>
                  <td className="p-2.5">125 - 135 cm</td>
                  <td className="p-2.5">26 - 32 kg</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">26 - 28</td>
                  <td className="p-2.5">ថ្នាក់ទី ៤ (ពណ៌ទឹកក្រូច)</td>
                  <td className="p-2.5">132 - 142 cm</td>
                  <td className="p-2.5">30 - 38 kg</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">28 - 30</td>
                  <td className="p-2.5">ថ្នាក់ទី ៥ (ពណ៌បៃតង)</td>
                  <td className="p-2.5">140 - 150 cm</td>
                  <td className="p-2.5">36 - 45 kg</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">30, M, L, XL</td>
                  <td className="p-2.5">ថ្នាក់ទី ៦ (ពណ៌បៃតង)</td>
                  <td className="p-2.5">148 - 160 cm</td>
                  <td className="p-2.5">42 - 55+ kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            💡 <strong>ចំណាំ៖</strong> ប្រសិនបើសិស្សមានមាឌធំជាងមិត្តរួមថ្នាក់ សូមជ្រើសរើសទំហំធំជាង ១ លេខដើម្បីពាក់បានស្រួល និងយូរ។
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
