'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  totalKhr: number;
  totalUsd: number;
  onClose: () => void;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  totalKhr,
  totalUsd,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-school-600" />
              <h3 className="font-bold text-slate-900 text-base">កន្ត្រកទំនិញរបស់អ្នក</h3>
              <span className="bg-school-100 text-school-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, it) => sum + it.qty, 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  កន្ត្រកទំនិញរបស់អ្នកនៅទំនេរ
                </p>
                <p className="text-xs text-slate-400">
                  សូមជ្រើសរើសឯកសណ្ឋានដែលត្រូវការខាងលើ
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.nameKh}
                    className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {item.nameKh}
                    </h5>
                    <div className="text-[11px] text-school-700 font-semibold mt-0.5">
                      ទំហំ / ពណ៌: <span className="px-1.5 py-0.2 bg-white rounded border border-slate-200 font-bold">{item.size}</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 mt-1">
                      {(item.priceKhr * item.qty).toLocaleString()} ៛
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-slate-300 bg-white rounded-lg overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.cartItemId, -1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.cartItemId, 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-rose-500 hover:text-rose-700 p-0.5 text-[11px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>តម្លៃសរុប (USD)៖</span>
                <span className="font-semibold text-slate-700 font-sans">
                  ${totalUsd.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900">
                <span>សរុបទាំងអស់ (Total)៖</span>
                <span className="text-school-700 font-black text-lg">
                  {totalKhr.toLocaleString()} ៛
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={onProceedCheckout}
              className="w-full bg-school-600 hover:bg-school-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-school-600/25 transition cursor-pointer"
            >
              <span>បន្តទៅកាន់ការទូទាត់ (Checkout)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
