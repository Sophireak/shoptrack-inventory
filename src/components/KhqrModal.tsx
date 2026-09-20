'use client';

import React from 'react';
import { X, CheckCircle2, QrCode, Download, ShieldCheck } from 'lucide-react';
import { Order } from '@/types';
import { generateKhqrQrUrl } from '@/lib/khqr';

interface KhqrModalProps {
  isOpen: boolean;
  order: Order | null;
  bakongId: string;
  onClose: () => void;
  onComplete: () => void;
}

export const KhqrModal: React.FC<KhqrModalProps> = ({
  isOpen,
  order,
  bakongId,
  onClose,
  onComplete,
}) => {
  if (!isOpen || !order) return null;

  const qrUrl = generateKhqrQrUrl(bakongId, order.totalKhr, order.orderId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-left">
            <QrCode className="w-5 h-5 text-rose-200" />
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                KHQR Bakong Payment
              </h3>
              <p className="text-[10px] text-rose-100">ស្កេនទូទាត់តាមកម្មវិធីធនាគារ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Body */}
        <div className="p-6 space-y-4">
          <div className="inline-block p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Bakong KHQR"
              className="w-52 h-52 object-contain mx-auto"
            />
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900">
              {order.totalKhr.toLocaleString()} ៛
            </div>
            <div className="text-xs text-slate-500 font-sans">
              ~${order.totalUsd.toFixed(2)} USD
            </div>
            <div className="text-xs text-slate-600 font-medium">
              គណនីទទួល៖ <span className="font-bold text-slate-900">{bakongId || 'cheasim_primary@acleda'}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              លេខវិក្កយបត្រ៖ <span className="font-mono font-bold text-school-700">#{order.orderId}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>គាំទ្រកម្មវិធីធនាគារក្នុងស្រុកទាំងអស់ (ABA, Acleda, etc.)</span>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={onComplete}
              className="w-full bg-school-600 hover:bg-school-700 active:scale-98 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-school-600/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ខ្ញុំបានទូទាត់រួចរាល់</span>
            </button>

            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition block"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ទាញយក QR Code / ថតអេក្រង់</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
