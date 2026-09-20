'use client';

import React from 'react';
import { ShoppingBag, Phone, MapPin, Store, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { StoreSettings } from '@/types';

interface HeaderProps {
  settings: StoreSettings;
  cartCount: number;
  cartTotalKhr: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  cartTotalKhr,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-school-800 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium">
              ទីតាំងហាង៖ <span className="text-amber-200">{settings.location}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${settings.phone1.replace(/\s+/g, '')}`}
              className="hover:text-amber-200 transition flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{settings.phone1}</span>
            </a>
            <span className="text-school-400">|</span>
            <Link
              href="/admin"
              className="text-[11px] bg-school-700 hover:bg-school-600 px-2 py-0.5 rounded text-amber-300 font-semibold transition"
            >
              ចូលប្រព័ន្ធ Admin & POS
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-school-600 flex items-center justify-center text-white shadow-md shadow-school-600/30 group-hover:scale-105 transition">
            <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-sm sm:text-lg leading-tight group-hover:text-school-700 transition">
                {settings.shopName}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> ស្តង់ដាររដ្ឋ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Samdech Chea Sim Primary Uniform & Supplies
            </p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenCart}
            className="relative bg-school-600 hover:bg-school-700 active:scale-95 text-white font-bold py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-school-600/25 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden md:inline">កន្ត្រកទំនិញ</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="hidden sm:inline border-l border-school-400/40 pl-2 text-xs font-medium text-amber-200">
              {cartTotalKhr.toLocaleString()} ៛
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
