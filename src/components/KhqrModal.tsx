'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Download, ShieldCheck, ExternalLink, Check, Smartphone } from 'lucide-react';
import { Order, StoreSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/catalog';

interface KhqrModalProps {
  isOpen: boolean;
  order: Order | null;
  settings?: StoreSettings;
  bakongId?: string;
  onClose: () => void;
  onComplete: () => void;
}

export const KhqrModal: React.FC<KhqrModalProps> = ({
  isOpen,
  order,
  settings = DEFAULT_SETTINGS,
  onClose,
  onComplete,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const qrImageUrl = settings.customQrUrl || '/images/aba-khqr.jpg';
  const accountName = settings.accountName || 'SOVATKANHCHANA SENG';
  const accountKhr = settings.accountKhr || '008 906 861';
  const accountUsd = settings.accountUsd || '001 155 614';

  const copyToClipboard = (text: string, fieldName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 my-auto text-center flex flex-col max-h-[92vh]">
        {/* ABA Official Header */}
        <div className="bg-[#002f49] text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-xs text-white shadow-inner">
              KHQR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide text-white">ABA&apos; QR Payment</span>
                <span className="text-[10px] bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded font-bold border border-rose-400/30">
                  ផ្លូវការ
                </span>
              </div>
              <p className="text-[10.5px] text-slate-300">ស្កេនតាម ABA Mobile ឬគ្រប់ធនាគារក្នុងស្រុក</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-left text-xs">
          {/* Amount to Pay Banner */}
          <div className="bg-gradient-to-br from-school-50 to-blue-50/60 p-3.5 rounded-2xl border border-school-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">ចំនួនទឹកប្រាក់ត្រូវទូទាត់ (Amount Due)</span>
              <div className="text-xl sm:text-2xl font-black text-school-800 tracking-tight">
                {order.totalKhr.toLocaleString()} ៛
              </div>
              <span className="text-[11px] text-slate-500 font-sans">
                ~${order.totalUsd.toFixed(2)} USD
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">វិក្កយបត្រ (Bill Ref)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(order.orderId, 'orderId')}
                className="font-mono font-bold text-school-700 bg-white px-2 py-1 rounded-lg border border-school-200 hover:bg-school-50 transition inline-flex items-center gap-1 cursor-pointer"
              >
                <span>#{order.orderId}</span>
                {copiedField === 'orderId' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Authentic ABA QR Standee Image Card */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
            <div className="relative max-w-[280px] sm:max-w-[300px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt={`ABA QR - ${accountName}`}
                className="w-full h-auto object-contain block select-none"
              />
            </div>
            <p className="text-[10.5px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ស្កេនពី ABA, ACLEDA, Wing, Sathapana, Bakong បានទាំងអស់</span>
            </p>
          </div>

          {/* Direct Account Number Transfer Option */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700">ឈ្មោះគណនី៖</span>
              <span className="font-extrabold text-[#002f49] uppercase tracking-wide">{accountName}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
              {/* KHR Account */}
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[9.5px] text-slate-400 block font-medium">៛ គណនី KHR</span>
                  <span className="font-mono font-black text-slate-800 text-[12px]">{accountKhr}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountKhr.replace(/\s+/g, ''), 'khr')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="ចម្លងលេខគណនី KHR"
                >
                  {copiedField === 'khr' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* USD Account */}
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[9.5px] text-slate-400 block font-medium">$ គណនី USD</span>
                  <span className="font-mono font-black text-slate-800 text-[12px]">{accountUsd}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountUsd.replace(/\s+/g, ''), 'usd')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="ចម្លងលេខគណនី USD"
                >
                  {copiedField === 'usd' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions for Mobile Users */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[10.5px] text-amber-900 leading-relaxed">
            💡 <strong>សម្រាប់អ្នកប្រើទូរស័ព្ទដៃ៖</strong> ចុចប៊ូតុង <strong>«ទាញយក QR / ថតអេក្រង់»</strong> រួចបើកកម្មវិធី <strong>ABA Mobile</strong> ចូលទៅកាន់ <strong>Scan QR</strong> ហើយជ្រើសរើសរូបភាពពី <strong>Photo Gallery</strong>។
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onComplete}
              className="w-full bg-[#002f49] hover:bg-[#001f33] active:scale-98 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#002f49]/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ខ្ញុំបានទូទាត់រួចរាល់ (Payment Completed)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={qrImageUrl}
                download="aba-khqr-cheasim.jpg"
                className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>ទាញយក QR</span>
              </a>

              <a
                href="aba://"
                className="bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-sky-200 transition text-center"
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span>បើក ABA Mobile</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
