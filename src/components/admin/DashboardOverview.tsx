'use client';

import React from 'react';
import { DollarSign, ShoppingBag, AlertTriangle, PackageCheck } from 'lucide-react';
import { Order, Product } from '@/types';

interface DashboardOverviewProps {
  orders: Order[];
  products: Product[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  orders,
  products,
}) => {
  const totalSalesKhr = orders.reduce((sum, o) => sum + o.totalKhr, 0);
  const totalSalesUsd = totalSalesKhr / 4100;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // Calculate low stock items across products
  let lowStockCount = 0;
  products.forEach(p => {
    if (p.sizes) {
      p.sizes.forEach(s => {
        if (s.stock <= 10) lowStockCount++;
      });
    }
    if (p.variants) {
      Object.values(p.variants).forEach(v => {
        v.sizes.forEach(s => {
          if (s.stock <= 5) lowStockCount++;
        });
      });
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-school-50 text-school-600 flex items-center justify-center shrink-0">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500">ការលក់សរុប (Total Revenue)</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            {totalSalesKhr.toLocaleString()} ៛
          </div>
          <span className="text-[11px] text-slate-400 font-sans">~${totalSalesUsd.toFixed(2)} USD</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500">ការកុម្ម៉ង់សរុប (Orders)</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            {orders.length} កុម្ម៉ង់
          </div>
          <span className="text-[11px] text-blue-600 font-medium">រង់ចាំរៀបចំ៖ {pendingOrders}</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <PackageCheck className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500">បានបញ្ចប់ (Completed)</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            {completedOrders} កុម្ម៉ង់
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">ជោគជ័យ ១០០%</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500">ទំនិញជិតអស់ស្តុក (Low Stock)</span>
          <div className="text-lg sm:text-xl font-black text-rose-600 mt-0.5">
            {lowStockCount} ទំហំ/ពណ៌
          </div>
          <span className="text-[11px] text-slate-400">ត្រូវការបន្ថែមស្តុក</span>
        </div>
      </div>
    </div>
  );
};
