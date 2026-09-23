'use client';

import React, { useState } from 'react';
import { Search, Phone, CheckCircle, Clock, Truck, XCircle, Package } from 'lucide-react';
import { Order } from '@/types';

interface OrderTrackerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  onUpdateStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [search, setSearch] = useState('');

  const filteredOrders = orders
    .filter((o) => statusFilter === 'all' || o.status === statusFilter)
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.studentName && o.studentName.toLowerCase().includes(q))
      );
    });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" /> រង់ចាំពិនិត្យ
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <Package className="w-3 h-3" /> បានបញ្ជាក់
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <Truck className="w-3 h-3" /> ត្រៀមរួចរាល់
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <CheckCircle className="w-3 h-3" /> បានបញ្ចប់
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3" /> បានលុបចោល
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/80">
        <div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
            បញ្ជីកុម្ម៉ង់ទិញរបស់អាណាព្យាបាល (Parent Orders Live Tracker)
          </h4>
          <p className="text-xs text-slate-500">
            ត្រួតពិនិត្យការកុម្ម៉ង់ ស្ថានភាពទូទាត់ និងការទទួលឯកសណ្ឋាន
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'pending', 'confirmed', 'ready', 'completed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-school-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st === 'all' ? 'ទាំងអស់' : st}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ស្វែងរក ID, ឈ្មោះ, លេខ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs w-full sm:w-44 focus:outline-hidden focus:ring-2 focus:ring-school-500"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">លេខកុម្ម៉ង់</th>
              <th className="p-3">អតិថិជន & សិស្ស</th>
              <th className="p-3">មុខទំនិញ</th>
              <th className="p-3">ការទទួល & ទូទាត់</th>
              <th className="p-3">តម្លៃសរុប</th>
              <th className="p-3">ស្ថានភាព</th>
              <th className="p-3 text-center">កែប្រែស្ថានភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  មិនមានទិន្នន័យកុម្ម៉ង់ទិញឡើយ
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono font-bold text-school-700">
                    #{order.orderId}
                    <div className="text-[10px] text-slate-400 font-sans">
                      {new Date(order.createdAt).toLocaleDateString('km-KH')}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                    <a
                      href={`tel:${order.phone.replace(/\s+/g, '')}`}
                      className="text-[11px] text-slate-500 hover:text-school-700 flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{order.phone}</span>
                    </a>
                    {order.studentName && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        សិស្ស៖ <span className="font-semibold text-slate-700">{order.studentName}</span> ({order.studentGrade})
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="space-y-0.5 max-w-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="truncate text-slate-700">
                          • {it.nameKh} ({it.size}) x{it.qty}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{order.pickupMethod}</div>
                    <div className="text-[10px] text-slate-500">{order.paymentMethod}</div>
                  </td>

                  <td className="p-3">
                    <div className="font-extrabold text-school-800">
                      {order.totalKhr.toLocaleString()} ៛
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      ~${order.totalUsd.toFixed(2)}
                    </div>
                  </td>

                  <td className="p-3">{getStatusBadge(order.status)}</td>

                  <td className="p-3 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.orderId, 'completed')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded-lg text-[11px] inline-flex items-center gap-1 shadow-xs transition cursor-pointer shrink-0"
                          title="បញ្ជាក់ថាបានទទួលប្រាក់ និងចេញវិក្កយបត្រស្វ័យប្រវត្តលើអេក្រង់អតិថិជន"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>បញ្ជាក់ប្រាក់</span>
                        </button>
                      )}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateStatus(order.orderId, e.target.value as Order['status'])
                        }
                        className="text-xs py-1 px-2 rounded-lg border border-slate-200 bg-white font-semibold cursor-pointer"
                      >
                        <option value="pending">រង់ចាំ (Pending)</option>
                        <option value="confirmed">បានបញ្ជាក់ (Confirmed)</option>
                        <option value="ready">ត្រៀមរួចរាល់ (Ready)</option>
                        <option value="completed">បានបញ្ចប់ (Completed)</option>
                        <option value="cancelled">បោះបង់ (Cancelled)</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
