'use client';

import React from 'react';
import { Plus, Ruler, Sparkles } from 'lucide-react';
import { Product, SportVariant } from '@/types';

interface SportUniformCardProps {
  product: Product;
  activeColor: 'blue' | 'orange' | 'green';
  activeSize: string;
  onChangeColor: (color: 'blue' | 'orange' | 'green') => void;
  onChangeSize: (size: string) => void;
  onAddToCart: (variant: SportVariant, size: string, priceKhr: number, priceUsd: number) => void;
  onOpenSizeGuide: () => void;
}

export const SportUniformCard: React.FC<SportUniformCardProps> = ({
  product,
  activeColor,
  activeSize,
  onChangeColor,
  onChangeSize,
  onAddToCart,
  onOpenSizeGuide,
}) => {
  if (!product.variants) return null;

  const currentVariant: SportVariant = product.variants[activeColor] || product.variants.blue;
  const currentSizeObj = currentVariant.sizes.find(s => s.size === activeSize) || currentVariant.sizes[0];
  const stock = currentSizeObj ? currentSizeObj.stock : 10;
  const isLowStock = stock <= 5;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200/80 hover:border-school-400 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image with Badges */}
      <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentVariant.image}
          alt={currentVariant.badge}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="bg-school-700/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{currentVariant.badge}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-slate-700 hover:text-school-700 p-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition"
        >
          <Ruler className="w-3 h-3 text-school-600" />
          <span>Size Guide</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug group-hover:text-school-700 transition">
              {product.nameKh}
            </h4>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Unisex
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">{product.name}</p>

          {/* Color by Grade Selector Pills */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              ជ្រើសពណ៌តាមកម្រិតថ្នាក់ (Color by Grade):
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
                <span className="text-[9px] opacity-75">ពណ៌ខៀវ</span>
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
                <span className="text-[9px] opacity-75">ពណ៌ទឹកក្រូច</span>
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
                <span className="text-[9px] opacity-75">ពណ៌បៃតង</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sizing Selector */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label className="font-semibold text-slate-700">ជ្រើសទំហំ (Size):</label>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                isLowStock
                  ? 'text-rose-600 bg-rose-50 animate-pulse'
                  : 'text-emerald-600 bg-emerald-50'
              }`}
            >
              {isLowStock ? `⚠️ នៅសល់ត្រឹម ${stock}` : `នៅសល់ ${stock} កំប្លេ`}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
            {currentVariant.sizes.map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => onChangeSize(s.size)}
                className={`py-1.5 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                  activeSize === s.size
                    ? 'bg-school-600 text-white border-school-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Add Button */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-base md:text-lg font-extrabold text-school-800">
              {product.priceKhr.toLocaleString()} ៛
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              ~${product.priceUsd.toFixed(2)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(currentVariant, activeSize, product.priceKhr, product.priceUsd)}
            className="bg-school-600 hover:bg-school-700 active:scale-95 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-school-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ដាក់កន្ត្រក</span>
          </button>
        </div>
      </div>
    </div>
  );
};
