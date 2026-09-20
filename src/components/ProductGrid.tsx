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
      {/* Section Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            បញ្ជីឯកសណ្ឋាន និងសម្ភារៈផ្លូវការ (៧ មុខគត់)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ជ្រើសរើសទំហំ ឬពណ៌តាមកម្រិតថ្នាក់ដើម្បីកុម្ម៉ង់ទិញ
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
                  ? 'bg-school-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
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
