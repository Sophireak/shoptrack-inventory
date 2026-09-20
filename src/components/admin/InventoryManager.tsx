'use client';

import React, { useState } from 'react';
import { Search, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product } from '@/types';

interface InventoryManagerProps {
  products: Product[];
  onUpdateStock: (productId: string, variantKey: string | null, size: string, newStock: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  onUpdateStock,
}) => {
  const [search, setSearch] = useState('');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
        <div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
            តារាងគ្រប់គ្រងស្តុកទំនិញ (Inventory Stock Calibration)
          </h4>
          <p className="text-xs text-slate-500">
            កែប្រែចំនួនស្តុកជាក់ស្តែងផ្ទាល់ (Updates will sync with storefront in real-time)
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ..."
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
              <th className="p-3">តម្លៃលក់</th>
              <th className="p-3">ស្តុកនៅសល់</th>
              <th className="p-3 text-center">កែប្រែស្តុក</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Standard Products */}
            {products
              .filter(p => !p.isVariantGroup && p.id !== 'cs-id-holder')
              .filter(p => !search || p.nameKh.includes(search) || p.name.toLowerCase().includes(search.toLowerCase()))
              .flatMap(p => (p.sizes || []).map(sz => {
                const isLow = sz.stock <= 10;
                return (
                  <tr key={`${p.id}-${sz.size}`} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">{p.nameKh}</td>
                    <td className="p-3 text-slate-500">{p.badge}</td>
                    <td className="p-3 font-semibold text-slate-700">{sz.size}</td>
                    <td className="p-3 font-bold text-school-700">{p.priceKhr.toLocaleString()} ៛</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
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
              }))}

            {/* Sport Uniform Color Variants */}
            {products
              .filter(p => p.isVariantGroup && p.variants)
              .flatMap(p => Object.entries(p.variants!).flatMap(([colKey, v]) => v.sizes.map(sz => {
                const isLow = sz.stock <= 5;
                return (
                  <tr key={`${v.id}-${sz.size}`} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-900">ឈុតកីឡាសាលា (Unisex)</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800">{v.colorKh} ({v.gradeGroup})</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{sz.size}</td>
                    <td className="p-3 font-bold text-school-700">26,000 ៛</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
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
              })))}

            {/* ID Card Holder 1 Set */}
            {products
              .filter(p => p.id === 'cs-id-holder')
              .flatMap(p => (p.sizes || []).map(sz => (
                <tr key={`id-set-${sz.size}`} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-bold text-slate-900">ឈុតប្រអប់កាត + ខ្សែពាក់ក (1 Set)</td>
                  <td className="p-3 font-bold text-school-800">{sz.size}</td>
                  <td className="p-3 text-slate-500">Free Size</td>
                  <td className="p-3 font-bold text-school-700">6,500 ៛</td>
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
              )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
