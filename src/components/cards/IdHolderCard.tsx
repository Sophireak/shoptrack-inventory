'use client';

import React from 'react';
import { Plus, CheckCircle2, ShieldCheck, MessageCircle } from 'lucide-react';
import { Product } from '@/types';
import { ID_HOLDER_TYPES, ID_HOLDER_VARIANTS } from '@/lib/catalog';

interface IdHolderCardProps {
  product: Product;
  activeType: 'set' | 'holder' | 'lanyard';
  activeColor: 'blue' | 'orange' | 'green';
  onChangeType: (typeKey: 'set' | 'holder' | 'lanyard') => void;
  onChangeColor: (colorKey: 'blue' | 'orange' | 'green') => void;
  onAddToCart: () => void;
}

export const IdHolderCard: React.FC<IdHolderCardProps> = ({
  product,
  activeType,
  activeColor,
  onChangeType,
  onChangeColor,
  onAddToCart,
}) => {
  const currentVariant = ID_HOLDER_VARIANTS[activeColor] || ID_HOLDER_VARIANTS.blue;
  const currentType = ID_HOLDER_TYPES[activeType] || ID_HOLDER_TYPES.set;

  // Image and dynamic badge
  const displayImage = currentVariant.image;
  const displayBadge =
    activeType === 'holder'
      ? `ប្រអប់កាត • ${currentVariant.badge}`
      : activeType === 'lanyard'
      ? `ខ្សែពាក់ក • ${currentVariant.badge}`
      : `១ ឈុត • ${currentVariant.badge}`;

  // Color label based on selected package
  const colorSectionLabel =
    activeType === 'holder'
      ? 'ជ្រើសពណ៌ប្រអប់កាតតាមថ្នាក់ (Holder Color by Grade):'
      : activeType === 'lanyard'
      ? 'ជ្រើសពណ៌ខ្សែតាមថ្នាក់ (Lanyard Color by Grade):'
      : 'ជ្រើសពណ៌ឈុតតាមថ្នាក់ (Set Color by Grade):';

  // Dynamic stock lookup based on type and color
  const stockMap: Record<string, Record<'blue' | 'orange' | 'green', number>> = {
    set: { blue: 120, orange: 95, green: 80 },
    holder: { blue: 150, orange: 120, green: 100 },
    lanyard: { blue: 100, orange: 85, green: 70 },
  };
  const stock = stockMap[activeType]?.[activeColor] ?? 100;

  const telegramMessage = encodeURIComponent(
    `សួស្តីបង! ខ្ញុំចង់សួរពីស្តុក៖ ${displayBadge} (${currentVariant.colorKh}) តើនៅមានក្នុងស្តុកអត់បង?`
  );
  const telegramUrl = `https://t.me/bNha_dev?text=${telegramMessage}`;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-school-500 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image with Badges */}
      <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={displayBadge}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="bg-school-800/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
            {displayBadge}
          </span>
        </div>

        {/* Top right stock badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> មានក្នុងស្តុក ({stock})
          </span>
        </div>

        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-slate-700 p-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-xs">
          <ShieldCheck className="w-3 h-3 text-school-600" />
          <span>ឡូហ្គោសាលា</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug group-hover:text-school-700 transition">
              {product.nameKh}
            </h4>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              Free Size
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">{product.name}</p>

          {/* Package Option Selector (1 Set, Card Holder Only, Lanyard Only) */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              ជ្រើសរើសជម្រើសទិញ (Package Options):
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => onChangeType('set')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  activeType === 'set'
                    ? 'bg-school-700 text-white border-school-700 shadow-xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 font-medium'
                }`}
              >
                <span className="text-[10px] leading-tight">១ ឈុត (Set)</span>
                <span
                  className={`text-[9px] ${
                    activeType === 'set' ? 'text-amber-200' : 'text-school-700'
                  } font-bold`}
                >
                  6,500 ៛
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChangeType('holder')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  activeType === 'holder'
                    ? 'bg-school-700 text-white border-school-700 shadow-xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 font-medium'
                }`}
              >
                <span className="text-[10px] leading-tight">តែប្រអប់កាត</span>
                <span
                  className={`text-[9px] ${
                    activeType === 'holder' ? 'text-amber-200' : 'text-school-700'
                  } font-bold`}
                >
                  1,500 ៛
                </span>
              </button>

              <button
                type="button"
                onClick={() => onChangeType('lanyard')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  activeType === 'lanyard'
                    ? 'bg-school-700 text-white border-school-700 shadow-xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 font-medium'
                }`}
              >
                <span className="text-[10px] leading-tight">តែខ្សែពាក់ក</span>
                <span
                  className={`text-[9px] ${
                    activeType === 'lanyard' ? 'text-amber-200' : 'text-school-700'
                  } font-bold`}
                >
                  5,000 ៛
                </span>
              </button>
            </div>
          </div>

          {/* Color by Grade Selector Pills (Active for all 3 options) */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {colorSectionLabel}
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => onChangeColor('blue')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  activeColor === 'blue'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-400/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                }`}
              >
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  <span>ថ្នាក់ ១-២</span>
                </span>
                <span className="text-[9px] opacity-80">ពណ៌ខៀវ ({stockMap[activeType].blue})</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeColor('orange')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  activeColor === 'orange'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-400/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                }`}
              >
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span>ថ្នាក់ ៣-៤</span>
                </span>
                <span className="text-[9px] opacity-80">ពណ៌ទឹកក្រូច ({stockMap[activeType].orange})</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeColor('green')}
                className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  activeColor === 'green'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400/20 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                }`}
              >
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  <span>ថ្នាក់ ៥-៦</span>
                </span>
                <span className="text-[9px] opacity-80">ពណ៌បៃតង ({stockMap[activeType].green})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stock info line */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-school-600" />
            <span>
              {activeType === 'holder'
                ? 'ប្រអប់ជ័រពណ៌តាមថ្នាក់'
                : activeType === 'lanyard'
                ? 'ខ្សែពាក់កពណ៌តាមថ្នាក់'
                : 'ឈុតពេញលេញពណ៌តាមថ្នាក់'}
            </span>
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            🟢 នៅសល់ {stock}
          </span>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="text-base md:text-lg font-black text-school-800">
              {currentType.priceKhr.toLocaleString()} ៛
            </div>
            <div className="text-xs text-slate-500 font-sans">
              ~${currentType.priceUsd.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onAddToCart}
              className="bg-school-600 hover:bg-school-700 active:scale-95 text-white font-bold py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ដាក់កន្ត្រក</span>
            </button>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-700 border border-sky-200 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1 transition text-center"
            >
              <MessageCircle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>សួរ Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
