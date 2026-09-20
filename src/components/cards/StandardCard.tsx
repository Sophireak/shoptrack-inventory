'use client';

import React, { useState } from 'react';
import { Plus, Ruler, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product } from '@/types';

interface StandardCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: string) => void;
  onOpenSizeGuide: () => void;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  product,
  onAddToCart,
  onOpenSizeGuide,
}) => {
  const sizes = product.sizes || [{ size: 'ស្តង់ដារ', stock: 100 }];
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0].size);

  const currentSizeObj = sizes.find(s => s.size === selectedSize) || sizes[0];
  const stock = currentSizeObj.stock;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 10;

  const telegramMessage = encodeURIComponent(
    `សួស្តីបង! ខ្ញុំចង់សួរពីស្តុក៖ ${product.nameKh} (ទំហំ ${selectedSize}) តើនៅមានក្នុងស្តុកអត់បង?`
  );
  const telegramUrl = `https://t.me/bNha_dev?text=${telegramMessage}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-school-400 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image with Badges */}
      <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.nameKh}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Top left badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-school-800/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
            {product.badge}
          </span>
        </div>

        {/* Top right stock indicator */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> អស់ស្តុកបណ្តោះអាសន្ន
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
              <span>⚠️ សល់តិច ({stock} ឈុត)</span>
            </span>
          ) : (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> មានក្នុងស្តុក ({stock} ឈុត)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-slate-700 hover:text-school-700 p-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition"
        >
          <Ruler className="w-3 h-3 text-school-600" />
          <span>តារាងទំហំ (Size Guide)</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug group-hover:text-school-700 transition">
            {product.nameKh}
          </h4>
          <p className="text-[11px] text-slate-500 font-sans">{product.name}</p>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Sizing Selector with live availability */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label className="font-bold text-slate-700">ជ្រើសទំហំ (Size):</label>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isOutOfStock
                  ? 'text-rose-700 bg-rose-50 border border-rose-200'
                  : isLowStock
                  ? 'text-amber-800 bg-amber-50 border border-amber-200 animate-pulse'
                  : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
              }`}
            >
              {isOutOfStock
                ? '🔴 ទំហំនេះអស់ស្តុក'
                : isLowStock
                ? `⚠️ សល់ត្រឹម ${stock} ឈុត`
                : `🟢 នៅសល់ ${stock} ឈុត`}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {sizes.map((s) => {
              const outOfStock = s.stock === 0;
              const isSelected = selectedSize === s.size;
              return (
                <button
                  key={s.size}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => setSelectedSize(s.size)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-school-700 text-white border-school-700 shadow-xs font-bold'
                      : outOfStock
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50 line-through'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">{s.size}</span>
                  <span
                    className={`text-[9px] ${
                      isSelected
                        ? 'text-amber-200'
                        : outOfStock
                        ? 'text-slate-400'
                        : s.stock <= 5
                        ? 'text-rose-600 font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {outOfStock ? 'អស់' : `សល់ ${s.stock}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="text-base md:text-lg font-black text-school-800">
              {product.priceKhr.toLocaleString()} ៛
            </div>
            <div className="text-xs text-slate-500 font-sans">
              ~${product.priceUsd.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product, selectedSize)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition shadow-xs ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-school-600 hover:bg-school-700 active:scale-95 text-white shadow-school-600/20 cursor-pointer'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'អស់ស្តុក' : 'ដាក់កន្ត្រក'}</span>
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
