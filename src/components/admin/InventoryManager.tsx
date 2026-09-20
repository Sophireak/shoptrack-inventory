'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Package,
  TrendingUp,
  Tag,
  Layers,
} from 'lucide-react';
import { Product } from '@/types';

interface InventoryManagerProps {
  products: Product[];
  onUpdateStock: (productId: string, variantKey: string | null, size: string, newStock: number) => void;
  onUpdatePrice?: (
    productId: string,
    variantKey: string | null,
    size: string | null,
    newSellingPrice: number,
    newBoughtPrice?: number
  ) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  onUpdateStock,
  onUpdatePrice,
}) => {
  const [search, setSearch] = useState('');

  // Calculate total units, cost, retail value, and potential profit across all inventory
  let totalUnits = 0;
  let totalCostKhr = 0;
  let totalRetailKhr = 0;

  products.forEach((p) => {
    if (p.sizes) {
      p.sizes.forEach((sz) => {
        const cost = typeof sz.costKhr === 'number' ? sz.costKhr : (p.costKhr ?? 0);
        const price = typeof sz.priceKhr === 'number' ? sz.priceKhr : p.priceKhr;
        totalUnits += sz.stock;
        totalCostKhr += sz.stock * cost;
        totalRetailKhr += sz.stock * price;
      });
    }

    if (p.isVariantGroup && p.variants) {
      Object.values(p.variants).forEach((v) => {
        v.sizes.forEach((sz) => {
          const cost = typeof sz.costKhr === 'number' ? sz.costKhr : (p.costKhr ?? 0);
          const price = typeof sz.priceKhr === 'number' ? sz.priceKhr : p.priceKhr;
          totalUnits += sz.stock;
          totalCostKhr += sz.stock * cost;
          totalRetailKhr += sz.stock * price;
        });
      });
    }
  });

  const totalProfitKhr = totalRetailKhr - totalCostKhr;
  const profitMarginPct = totalRetailKhr > 0 ? ((totalProfitKhr / totalRetailKhr) * 100).toFixed(1) : '0';

  // Search filter helper
  const matchesSearch = (p: Product, sizeStr?: string, colorStr?: string) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.nameKh.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (sizeStr && sizeStr.toLowerCase().includes(q)) ||
      (colorStr && colorStr.toLowerCase().includes(q))
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">ទំនិញក្នុងស្តុកសរុប</span>
            <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {totalUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">កំប្លេ/គូ</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">ថ្លៃដើមទុនទិញចូលសរុប</span>
            <div className="text-base sm:text-lg font-black text-amber-700 leading-tight">
              {totalCostKhr.toLocaleString()} ៛
            </div>
            <span className="text-[10px] text-slate-400 font-sans">~${(totalCostKhr / 4100).toFixed(2)} USD</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">តម្លៃលក់ចេញសរុប</span>
            <div className="text-base sm:text-lg font-black text-purple-700 leading-tight">
              {totalRetailKhr.toLocaleString()} ៛
            </div>
            <span className="text-[10px] text-slate-400 font-sans">~${(totalRetailKhr / 4100).toFixed(2)} USD</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">ប្រាក់ចំណេញរំពឹងទុក</span>
            <div className="text-base sm:text-lg font-black text-emerald-700 leading-tight">
              +{totalProfitKhr.toLocaleString()} ៛
            </div>
            <span className="text-[10px] text-emerald-600 font-bold font-sans">ចំណេញ {profitMarginPct}%</span>
          </div>
        </div>
      </div>

      {/* 2. Master Product Overview & Batch Pricing Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>🏷️ បញ្ជីមុខទំនិញគោល (Master Product List)</span>
              <span className="bg-school-100 text-school-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {products.length} មុខទំនិញ
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              📌 តម្លៃលក់ និងថ្លៃដើមអាចខុសគ្នាតាមទំហំនីមួយៗ។ ដើម្បីកែប្រែទំហំណាមួយជាក់លាក់ សូមកែប្រែក្នុងតារាងទំហំខាងក្រោម។
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">មុខទំនិញ (Product)</th>
                <th className="p-3">ប្រភេទ</th>
                <th className="p-3">ចន្លោះតម្លៃលក់ (Price Range)</th>
                <th className="p-3">ថ្លៃដើមលំនាំដើម (Base Cost)</th>
                <th className="p-3">តម្លៃលក់លំនាំដើម (Base Price)</th>
                <th className="p-3 text-center">ស្តុកសរុប</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                // Collect prices of all sizes for this product
                const sizePrices: number[] = [];
                let prodUnits = 0;

                if (p.sizes) {
                  p.sizes.forEach((s) => {
                    prodUnits += s.stock;
                    sizePrices.push(typeof s.priceKhr === 'number' ? s.priceKhr : p.priceKhr);
                  });
                } else if (p.variants) {
                  Object.values(p.variants).forEach((v) => {
                    v.sizes.forEach((s) => {
                      prodUnits += s.stock;
                      sizePrices.push(typeof s.priceKhr === 'number' ? s.priceKhr : p.priceKhr);
                    });
                  });
                }

                const minPrice = sizePrices.length > 0 ? Math.min(...sizePrices) : p.priceKhr;
                const maxPrice = sizePrices.length > 0 ? Math.max(...sizePrices) : p.priceKhr;
                const priceDisplay =
                  minPrice === maxPrice
                    ? `${minPrice.toLocaleString()} ៛`
                    : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} ៛`;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt={p.nameKh}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.nameKh}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[10px] font-bold">
                        {p.badge}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-school-700 bg-school-50 px-2 py-1 rounded-lg border border-school-200">
                        {priceDisplay}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={p.costKhr ?? 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            onUpdatePrice?.(p.id, null, null, p.priceKhr, isNaN(val) ? 0 : val);
                          }}
                          step={500}
                          min={0}
                          title="កែប្រែថ្លៃដើមលំនាំដើម"
                          className="w-24 px-2 py-1 text-right font-medium text-xs text-amber-900 bg-amber-50/60 hover:bg-white focus:bg-white border border-amber-200 focus:border-school-500 rounded-lg focus:outline-hidden transition"
                        />
                        <span className="text-xs font-bold text-slate-400">៛</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={p.priceKhr}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            onUpdatePrice?.(p.id, null, null, isNaN(val) ? 0 : val, p.costKhr ?? 0);
                          }}
                          step={500}
                          min={0}
                          title="កែប្រែតម្លៃលក់លំនាំដើម"
                          className="w-24 px-2 py-1 text-right font-bold text-xs text-school-700 bg-school-50/60 hover:bg-white focus:bg-white border border-school-200 focus:border-school-500 rounded-lg focus:outline-hidden transition"
                        />
                        <span className="text-xs font-bold text-slate-400">៛</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800">
                      {prodUnits}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Detailed Stock & Price Calibration Table (Per Size / Per Item Editing) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-school-600" />
              <span>តារាងគ្រប់គ្រងតម្លៃ និងស្តុកតាមទំហំនីមួយៗ (Per-Item Pricing & Stock)</span>
            </h4>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              ✨ អ្នកអាចកំណត់តម្លៃ និងថ្លៃដើមខុសៗគ្នាតាមទំហំនីមួយៗបានដោយឡែកពីគ្នា (Edit each size individually)
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ទំហំ (31, 32...) ឬពណ៌..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-school-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">មុខទំនិញ</th>
                <th className="p-3">ប្រភេទ / ពណ៌</th>
                <th className="p-3">ទំហំ (Size)</th>
                <th className="p-3">ថ្លៃដើមទិញចូល (Cost ៛)</th>
                <th className="p-3">តម្លៃលក់ចេញ (Price ៛)</th>
                <th className="p-3">ចំណេញ (Profit)</th>
                <th className="p-3">ស្តុកនៅសល់</th>
                <th className="p-3 text-center">កែប្រែស្តុក</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Standard Products (including Sneakers 31-42) */}
              {products
                .filter((p) => !p.isVariantGroup && p.id !== 'cs-id-holder')
                .flatMap((p) =>
                  (p.sizes || []).map((sz) => {
                    if (!matchesSearch(p, sz.size, p.badge)) return null;

                    const cost = typeof sz.costKhr === 'number' ? sz.costKhr : (p.costKhr ?? 0);
                    const price = typeof sz.priceKhr === 'number' ? sz.priceKhr : p.priceKhr;
                    const profit = price - cost;
                    const isLow = sz.stock <= 10;

                    return (
                      <tr key={`${p.id}-${sz.size}`} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            {p.category === 'shoes' && <span className="text-sm">👟</span>}
                            <span>{p.nameKh}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-500">{p.badge}</td>
                        <td className="p-3 font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-sans">
                            {sz.size}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={cost}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onUpdatePrice?.(p.id, null, sz.size, price, isNaN(val) ? 0 : val);
                              }}
                              step={500}
                              min={0}
                              className="w-20 px-2 py-1 text-right font-medium text-xs bg-amber-50/50 hover:bg-white focus:bg-white border border-amber-200 focus:border-school-500 rounded focus:outline-hidden"
                            />
                            <span className="text-[11px] text-slate-400 font-bold">៛</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onUpdatePrice?.(p.id, null, sz.size, isNaN(val) ? 0 : val, cost);
                              }}
                              step={500}
                              min={0}
                              className="w-20 px-2 py-1 text-right font-bold text-xs text-school-700 bg-school-50/40 hover:bg-white focus:bg-white border border-school-200 focus:border-school-500 rounded focus:outline-hidden"
                            />
                            <span className="text-[11px] text-slate-400 font-bold">៛</span>
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              profit >= 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {profit >= 0 ? `+${profit.toLocaleString()} ៛` : `${profit.toLocaleString()} ៛`}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sz.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onUpdateStock(p.id, null, sz.size, Math.max(0, sz.stock - 1))}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={sz.stock}
                              onChange={(e) => onUpdateStock(p.id, null, sz.size, parseInt(e.target.value) || 0)}
                              className="w-14 text-center py-1 border border-slate-200 rounded font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => onUpdateStock(p.id, null, sz.size, sz.stock + 1)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}

              {/* Sport Uniform Color Variants */}
              {products
                .filter((p) => p.isVariantGroup && p.variants)
                .flatMap((p) =>
                  Object.entries(p.variants!).flatMap(([colKey, v]) =>
                    v.sizes.map((sz) => {
                      if (!matchesSearch(p, sz.size, `${v.colorKh} ${v.gradeGroup}`)) return null;

                      const cost = typeof sz.costKhr === 'number' ? sz.costKhr : (p.costKhr ?? 0);
                      const price = typeof sz.priceKhr === 'number' ? sz.priceKhr : p.priceKhr;
                      const profit = price - cost;
                      const isLow = sz.stock <= 5;

                      return (
                        <tr key={`${v.id}-${sz.size}`} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>🏃</span>
                              <span>ឈុតកីឡាសាលា (Unisex)</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800">{v.colorKh} ({v.gradeGroup})</span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-sans">
                              {sz.size}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={cost}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  onUpdatePrice?.(p.id, colKey, sz.size, price, isNaN(val) ? 0 : val);
                                }}
                                step={500}
                                min={0}
                                className="w-20 px-2 py-1 text-right font-medium text-xs bg-amber-50/50 hover:bg-white focus:bg-white border border-amber-200 focus:border-school-500 rounded focus:outline-hidden"
                              />
                              <span className="text-[11px] text-slate-400 font-bold">៛</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={price}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  onUpdatePrice?.(p.id, colKey, sz.size, isNaN(val) ? 0 : val, cost);
                                }}
                                step={500}
                                min={0}
                                className="w-20 px-2 py-1 text-right font-bold text-xs text-school-700 bg-school-50/40 hover:bg-white focus:bg-white border border-school-200 focus:border-school-500 rounded focus:outline-hidden"
                              />
                              <span className="text-[11px] text-slate-400 font-bold">៛</span>
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                profit >= 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {profit >= 0 ? `+${profit.toLocaleString()} ៛` : `${profit.toLocaleString()} ៛`}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {sz.stock}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => onUpdateStock(p.id, colKey, sz.size, Math.max(0, sz.stock - 1))}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                value={sz.stock}
                                onChange={(e) => onUpdateStock(p.id, colKey, sz.size, parseInt(e.target.value) || 0)}
                                className="w-14 text-center py-1 border border-slate-200 rounded font-bold text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => onUpdateStock(p.id, colKey, sz.size, sz.stock + 1)}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

              {/* ID Card Holder 1 Set */}
              {products
                .filter((p) => p.id === 'cs-id-holder')
                .flatMap((p) =>
                  (p.sizes || []).map((sz) => {
                    if (!matchesSearch(p, sz.size, 'ID Card')) return null;

                    const cost = typeof sz.costKhr === 'number' ? sz.costKhr : (p.costKhr ?? 0);
                    const price = typeof sz.priceKhr === 'number' ? sz.priceKhr : p.priceKhr;
                    const profit = price - cost;

                    return (
                      <tr key={`id-set-${sz.size}`} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>🪪</span>
                            <span>ឈុតប្រអប់កាត + ខ្សែពាក់ក (1 Set)</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-school-800">{sz.size}</td>
                        <td className="p-3 text-slate-500 font-semibold">Free Size</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={cost}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onUpdatePrice?.(p.id, null, sz.size, price, isNaN(val) ? 0 : val);
                              }}
                              step={500}
                              min={0}
                              className="w-20 px-2 py-1 text-right font-medium text-xs bg-amber-50/50 hover:bg-white focus:bg-white border border-amber-200 focus:border-school-500 rounded focus:outline-hidden"
                            />
                            <span className="text-[11px] text-slate-400 font-bold">៛</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onUpdatePrice?.(p.id, null, sz.size, isNaN(val) ? 0 : val, cost);
                              }}
                              step={500}
                              min={0}
                              className="w-20 px-2 py-1 text-right font-bold text-xs text-school-700 bg-school-50/40 hover:bg-white focus:bg-white border border-school-200 focus:border-school-500 rounded focus:outline-hidden"
                            />
                            <span className="text-[11px] text-slate-400 font-bold">៛</span>
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              profit >= 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {profit >= 0 ? `+${profit.toLocaleString()} ៛` : `${profit.toLocaleString()} ៛`}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-100 text-emerald-800">
                            {sz.stock}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onUpdateStock(p.id, null, sz.size, Math.max(0, sz.stock - 1))}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={sz.stock}
                              onChange={(e) => onUpdateStock(p.id, null, sz.size, parseInt(e.target.value) || 0)}
                              className="w-14 text-center py-1 border border-slate-200 rounded font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => onUpdateStock(p.id, null, sz.size, sz.stock + 1)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
