'use client';

import React, { useState } from 'react';
import { Plus, Ruler } from 'lucide-react';
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
  const isLowStock = stock <= 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-school-400 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image with Badges */}
      <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.nameKh}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="bg-school-700/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
            {product.badge}
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
          <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug group-hover:text-school-700 transition">
            {product.nameKh}
          </h4>
          <p className="text-[11px] text-slate-500 font-sans">{product.name}</p>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
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

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {sizes.map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => setSelectedSize(s.size)}
                className={`py-1.5 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                  selectedSize === s.size
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
            onClick={() => onAddToCart(product, selectedSize)}
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
