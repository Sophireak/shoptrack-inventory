'use client';

import React from 'react';
import { ShoppingBag, Phone, MapPin, Store, ShieldCheck, MessageCircle } from 'lucide-react';
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
  const telegramUrl = `https://t.me/${settings.telegram || 'bNha_dev'}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-school-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ស្តុកផ្សាយផ្ទាល់ពីបញ្ជរ</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{settings.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href={`tel:${settings.phone1.replace(/\s+/g, '')}`}
              className="hover:text-amber-200 transition flex items-center gap-1 text-emerald-300 font-bold"
            >
              <Phone className="w-3 h-3" />
              <span>{settings.phone1}</span>
            </a>
            <span className="text-school-700">|</span>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-300 transition flex items-center gap-1 text-sky-300"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Telegram</span>
            </a>
            <span className="text-school-700">|</span>
            <Link
              href="/admin"
              className="text-[11px] text-slate-400 hover:text-white transition"
            >
              Admin / POS
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-school-700 flex items-center justify-center text-white shadow-md shadow-school-700/20 group-hover:scale-105 transition">
            <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-slate-900 text-sm sm:text-base leading-tight group-hover:text-school-700 transition">
                {settings.shopName}
              </h1>
              <span className="hidden sm:inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> ស្តង់ដាររដ្ឋ
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans">
              បញ្ជរលក់ឯកសណ្ឋានសិស្សផ្លូវការ សាលាបឋមសិក្សា សម្តេចជាស៊ីម
            </p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Call Button (Mobile & Desktop) */}
          <a
            href={`tel:${settings.phone1.replace(/\s+/g, '')}`}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-school-700 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Phone className="w-3.5 h-3.5 text-school-600" />
            <span>ខលសួរ</span>
          </a>

          {/* Quick Telegram Button */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden xs:inline">ឆាតសួរ</span>
          </a>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative bg-school-600 hover:bg-school-700 active:scale-95 text-white font-bold py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-school-600/20 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden md:inline">កន្ត្រក</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="hidden sm:inline border-l border-school-400/40 pl-1.5 text-xs font-medium text-amber-200">
              {cartTotalKhr.toLocaleString()} ៛
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
