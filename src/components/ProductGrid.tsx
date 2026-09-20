'use client';

import React from 'react';
import { Product, ProductCategory, SportVariant } from '@/types';
import { StandardCard } from './cards/StandardCard';
import { SportUniformCard } from './cards/SportUniformCard';
import { IdHolderCard } from './cards/IdHolderCard';

interface ProductGridProps {
  products: Product[];
  currentCategory: ProductCategory;
  activeSportColor: 'blue' | 'orange' | 'green';
  activeSportSize: string;
  activeIdHolderType: 'set' | 'holder' | 'lanyard';
  activeIdHolderColor: 'blue' | 'orange' | 'green';
  onChangeCategory: (cat: ProductCategory) => void;
  onChangeSportColor: (color: 'blue' | 'orange' | 'green') => void;
  onChangeSportSize: (size: string) => void;
  onChangeIdHolderType: (type: 'set' | 'holder' | 'lanyard') => void;
  onChangeIdHolderColor: (color: 'blue' | 'orange' | 'green') => void;
  onAddStandardToCart: (product: Product, selectedSize: string) => void;
  onAddSportToCart: (variant: SportVariant, size: string, priceKhr: number, priceUsd: number) => void;
  onAddIdHolderToCart: () => void;
  onOpenSizeGuide: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currentCategory,
  activeSportColor,
  activeSportSize,
  activeIdHolderType,
  activeIdHolderColor,
  onChangeCategory,
  onChangeSportColor,
  onChangeSportSize,
  onChangeIdHolderType,
  onChangeIdHolderColor,
  onAddStandardToCart,
  onAddSportToCart,
  onAddIdHolderToCart,
  onOpenSizeGuide,
}) => {
  const categories: { id: ProductCategory; label: string; count: number }[] = [
    { id: 'all', label: 'ទាំងអស់', count: 7 },
    { id: 'boy', label: 'ឯកសណ្ឋានប្រុស', count: 3 },
    { id: 'girl', label: 'ឯកសណ្ឋានស្រី', count: 2 },
    { id: 'sport', label: 'ឈុតកីឡាសាលា', count: 1 },
    { id: 'supplies', label: 'សម្ភារៈសិស្ស', count: 1 },
  ];

  const filteredProducts =
    currentCategory === 'all'
      ? products
      : products.filter(p => p.category === currentCategory);

  return (
    <section id="productsSection" className="my-8 scroll-mt-24">
      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            បញ្ជីឯកសណ្ឋាន និងសម្ភារៈផ្លូវការ (៧ មុខគត់)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ជ្រើសរើសទំហំ ឬពណ៌តាមកម្រិតថ្នាក់ដើម្បីពិនិត្យស្តុក ឬកុម្ម៉ង់ទិញ
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChangeCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                currentCategory === cat.id
                  ? 'bg-school-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Live Stock & Fitting Notification Bar */}
      <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold">
              ទិន្នន័យស្តុកផ្សាយផ្ទាល់ពីបញ្ជរក្នុងសាលា៖
            </span>
            <span className="text-emerald-800">
              មានបង្ហាញចំនួនស្តុក និងទម្ងន់កូន (គីឡូ) លើទំហំនីមួយៗច្បាស់ៗ។
            </span>
          </div>
          <p className="text-[11px] text-emerald-800/90 pl-4.5">
            👕 <strong>សាកល្បងទំហំដោយឥតគិតថ្លៃ៖</strong> ប្រសិនបើមិនច្បាស់ពីទំហំ អាចនាំកូនមកសាកផ្ទាល់នៅបញ្ជរមុខអគាររដ្ឋបាល ឬចុច &quot;សួរ Telegram&quot;។
          </p>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl self-start md:self-auto shrink-0 border border-emerald-300/40">
          🟢 មានស្តុកគ្រប់ទំហំ
        </span>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => {
          if (product.id === 'cs-sport-uniform') {
            return (
              <SportUniformCard
                key={product.id}
                product={product}
                activeColor={activeSportColor}
                activeSize={activeSportSize}
                onChangeColor={onChangeSportColor}
                onChangeSize={onChangeSportSize}
                onAddToCart={onAddSportToCart}
                onOpenSizeGuide={onOpenSizeGuide}
              />
            );
          }

          if (product.id === 'cs-id-holder') {
            return (
              <IdHolderCard
                key={product.id}
                product={product}
                activeType={activeIdHolderType}
                activeColor={activeIdHolderColor}
                onChangeType={onChangeIdHolderType}
                onChangeColor={onChangeIdHolderColor}
                onAddToCart={onAddIdHolderToCart}
              />
            );
          }

          return (
            <StandardCard
              key={product.id}
              product={product}
              onAddToCart={onAddStandardToCart}
              onOpenSizeGuide={onOpenSizeGuide}
            />
          );
        })}
      </div>
    </section>
  );
};
