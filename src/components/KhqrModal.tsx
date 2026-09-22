'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Download,
  ShieldCheck,
  Printer,
  RefreshCw,
  Clock,
  Check,
  Smartphone,
  Loader2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, StoreSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/catalog';
import { generateKhqrDataUrl } from '@/lib/khqr';

interface KhqrModalProps {
  isOpen: boolean;
  order: Order | null;
  settings?: StoreSettings;
  bakongId?: string;
  onClose: () => void;
  onComplete?: () => void;
}

export const KhqrModal: React.FC<KhqrModalProps> = ({
  isOpen,
  order,
  settings = DEFAULT_SETTINGS,
  onClose,
  onComplete,
}) => {
  // Timer state: 60 seconds countdown
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [md5Hash, setMd5Hash] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'paid'>('waiting');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const md5Ref = useRef<string>('');
  const generatedForOrderIdRef = useRef<string | null>(null);

  const accountName = settings.accountName || 'SOVATKANHCHANA SENG';
  const accountKhr = settings.accountKhr || '008 906 861';

  // 1. Generate Dynamic QR Code with exact item price, Tag 99 expiration, and MD5
  const generateQr = async () => {
    if (!order) return;
    try {
      const result = await generateKhqrDataUrl({
        accountNumber: accountKhr,
        bankSwift: 'abaakhppxxx@abaa',
        bankName: 'ABA Bank',
        merchantName: accountName,
        currency: 'KHR',
        amount: order.totalKhr,
        billNumber: order.orderId,
        storeLabel: 'Chea Sim Uniform Store',
        expirationMinutes: 1,
      });
      setDynamicQrUrl(result.dataUrl);
      setMd5Hash(result.md5);
      md5Ref.current = result.md5;
    } catch (err) {
      console.warn('Dynamic QR generation fallback:', err);
    }
  };

  // 2. Complete payment & show receipt
  const handlePaymentSuccess = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setPaymentStatus('paid');
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });

    // Update order status on server to 'completed'
    if (order) {
      fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, status: 'completed' }),
      }).catch(() => {});
    }

    if (onComplete) onComplete();
  };

  // Reset & Start countdown
  const resetTimer = () => {
    setTimeLeft(60);
    setIsExpired(false);
    generateQr();
  };

  useEffect(() => {
    if (isOpen && order) {
      // Generate QR only once per order session (prevents endless re-generation loop)
      if (generatedForOrderIdRef.current !== order.orderId) {
        generatedForOrderIdRef.current = order.orderId;
        setPaymentStatus('waiting');
        setTimeLeft(60);
        setIsExpired(false);
        generateQr();
      }

      // 60s countdown timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Background Polling /api/orders & /api/bakong/check-md5 every 2 seconds
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        try {
          // 1. Check local order status (updated by Telegram confirm button or Admin)
          const res = await fetch('/api/orders');
          if (res.ok) {
            const data = await res.json();
            const allOrders: Order[] = Array.isArray(data) ? data : data?.data || [];
            const current = allOrders.find((o) => o.orderId === order.orderId);
            if (current && (current.status === 'confirmed' || current.status === 'completed')) {
              handlePaymentSuccess();
              return;
            }
          }

          // 2. Also check Bakong Open API via /api/bakong/check-md5 if MD5 exists
          const md5Val = md5Ref.current || order.md5;
          if (md5Val) {
            const bakongRes = await fetch('/api/bakong/check-md5', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ md5: md5Val, orderId: order.orderId }),
            });
            if (bakongRes.ok) {
              const bakongData = await bakongRes.json();
              if (bakongData.paid) {
                handlePaymentSuccess();
                return;
              }
            }
          }
        } catch {
          // ignore
        }
      }, 2000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    } else if (!isOpen) {
      generatedForOrderIdRef.current = null;
    }
  }, [isOpen, order?.orderId]);

  const copyToClipboard = (text: string, fieldName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 my-auto text-center flex flex-col max-h-[92vh]">
        
        {/* ======================================================== */}
        {/* VIEW 1: ACTIVE PAYMENT VIEW (DYNAMIC KHQR WITH TIMER)    */}
        {/* ======================================================== */}
        {paymentStatus === 'waiting' && (
          <>
            {/* Modal Header */}
            <div className="bg-[#002f49] text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-xs text-white shadow-inner">
                  KHQR
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-wide text-white">ABA&apos; QR Payment</span>
                    <span className="text-[10px] bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded font-bold border border-rose-400/30">
                      ជាមួយតម្លៃពិត
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-300">ស្កេនទូទាត់តាម ABA Mobile ឬគ្រប់ធនាគារក្នុងស្រុក</p>
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

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-left text-xs">
              
              {/* Dynamic Amount Due Banner */}
              <div className="bg-gradient-to-br from-school-50 to-blue-50/60 p-3.5 rounded-2xl border border-school-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    ចំនួនទឹកប្រាក់ត្រូវទូទាត់ (Amount Due)
                  </span>
                  <div className="text-2xl font-black text-school-800 tracking-tight">
                    {order.totalKhr.toLocaleString()} ៛
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans">
                    ~${order.totalUsd.toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">លេខវិក្កយបត្រ</span>
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

              {/* 1-Minute Countdown Timer & Live Check Status */}
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-4 h-4 ${isExpired ? 'text-rose-500' : 'text-amber-600 animate-pulse'}`} />
                    <span className="font-bold text-slate-700">
                      {isExpired ? 'QR បានផុតកំណត់' : 'ផុតកំណត់ក្នុងរយៈពេល៖'}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-black text-sm px-2 py-0.5 rounded-md ${
                      isExpired
                        ? 'bg-rose-100 text-rose-700'
                        : timeLeft <= 15
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    00:{String(timeLeft).padStart(2, '0')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      isExpired ? 'bg-rose-500' : timeLeft <= 15 ? 'bg-rose-500' : 'bg-school-600'
                    }`}
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  />
                </div>

                {/* Live App Checking Beacon */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-school-600 animate-spin" />
                    <span className="font-medium text-slate-700">កំពុងរង់ចាំការស្កេនទូទាត់...</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    Live Check
                  </span>
                </div>
              </div>

              {/* Dynamic KHQR Code Display Container (NO STANDEE TAB) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center justify-center min-h-[260px] relative">
                {isExpired ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">QR Code នេះបានផុតកំណត់ 1 នាទីហើយ</div>
                    <p className="text-xs text-slate-500 max-w-xs">
                      សូមចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើត QR ថ្មីជាមួយតម្លៃទំនិញឡើងវិញ
                    </p>
                    <button
                      type="button"
                      onClick={resetTimer}
                      className="bg-school-600 hover:bg-school-700 text-white font-bold py-2 px-4 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md shadow-school-600/20 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>បង្កើត QR ម្តងទៀត</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2 w-full">
                    {/* Official KHQR Card Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 w-full px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded">KHQR</span>
                        <span className="font-extrabold text-[#002f49] text-xs uppercase">{accountName}</span>
                      </div>
                      <span className="font-black text-rose-600 text-xs">
                        {order.totalKhr.toLocaleString()} KHR
                      </span>
                    </div>

                    {/* High-Resolution QR Canvas/Image */}
                    {dynamicQrUrl ? (
                      <div className="p-2 bg-white rounded-xl inline-block border border-slate-200 shadow-inner mx-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={dynamicQrUrl}
                          alt="Dynamic ABA KHQR"
                          className="w-52 h-52 object-contain mx-auto block"
                        />
                      </div>
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center bg-slate-50 rounded-xl mx-auto">
                        <Loader2 className="w-6 h-6 text-school-600 animate-spin" />
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 text-center font-sans">
                      ស្កេនជាមួយ ABA Mobile វានឹងបញ្ចូលចំនួន <strong>{order.totalKhr.toLocaleString()} ៛</strong> ដោយស្វ័យប្រវត្តិ!
                    </div>

                    {md5Hash && (
                      <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span>MD5:</span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {md5Hash.slice(0, 16)}...
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(md5Hash, 'md5')}
                          className="text-school-600 hover:text-school-800 p-0.5 cursor-pointer"
                          title="Copy MD5"
                        >
                          {copiedField === 'md5' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Account Info */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">៛ លេខគណនី ABA (KHR)</span>
                  <span className="font-mono font-black text-slate-800 text-xs">{accountKhr}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountKhr.replace(/\s+/g, ''), 'khr')}
                  className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'khr' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>ចម្លង</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handlePaymentSuccess}
                  className="w-full bg-[#002f49] hover:bg-[#001f33] active:scale-98 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#002f49]/20 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ខ្ញុំបានផ្ទេររួចរាល់ (បង្ហាញវិក្កយបត្រភ្លាមៗ)</span>
                </button>
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2 text-[10.5px] text-amber-900 text-center leading-relaxed">
                  💡 បន្ទាប់ពីស្កេន និងផ្ទេរប្រាក់ក្នុង ABA រួចរាល់ សូមចុចប៊ូតុងខាងលើដើម្បីទទួលបានវិក្កយបត្រភ្លាមៗ!
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={dynamicQrUrl}
                    download={`aba-khqr-${order.orderId}.png`}
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
          </>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: SUCCESS RECEIPT / INVOICE VIEW (ALERT & RECEIPT) */}
        {/* ======================================================== */}
        {paymentStatus === 'paid' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-left">
            {/* Success Celebration Alert */}
            <div className="text-center py-2 space-y-1">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 pt-1 flex items-center justify-center gap-1.5">
                <span>ការទូទាត់ទទួលបានជោគជ័យ!</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500">
                វិក្កយបត្រកុម្ម៉ង់ត្រូវបានកត់ត្រា និងជូនដំណឹងទៅកាន់អ្នកគ្រប់គ្រងរួចរាល់
              </p>
            </div>

            {/* Official Printable Receipt Card */}
            <div
              id="printable-receipt"
              className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-sm space-y-3 font-khmer text-xs"
            >
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900">
                  {settings.shopName || 'ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម'}
                </h4>
                <p className="text-[10px] text-slate-500 font-sans">
                  សាលាបឋមសិក្សា សម្តេចជាស៊ីម · វិក្កយបត្រលក់ (Sales Receipt)
                </p>
                <div className="pt-1 font-mono font-bold text-school-800 text-xs">
                  #{order.orderId}
                </div>
              </div>

              {/* Order Meta */}
              <div className="space-y-1 text-[11px] text-slate-600 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>កាលបរិច្ឆេទ៖</span>
                  <span className="font-medium text-slate-900 font-sans">
                    {new Date(order.createdAt).toLocaleString('km-KH')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>អតិថិជន៖</span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>លេខទូរស័ព្ទ៖</span>
                  <span className="font-mono text-slate-900">{order.phone}</span>
                </div>
                {order.studentName && (
                  <div className="flex justify-between">
                    <span>ឈ្មោះសិស្ស៖</span>
                    <span className="font-medium text-slate-900">
                      {order.studentName} ({order.studentGrade})
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>វិធីទទួល៖</span>
                  <span className="text-slate-800 font-medium">{order.pickupMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>វិធីទូទាត់៖</span>
                  <span className="font-bold text-emerald-700">ABA KHQR (SOVATKANHCHANA SENG)</span>
                </div>
                {(order.md5 || md5Hash) && (
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-0.5">
                    <span>KHQR MD5:</span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded">
                      {(order.md5 || md5Hash).slice(0, 16)}...
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
                <div className="font-bold text-slate-800 text-[11px]">មុខទំនិញដែលបានទិញ៖</div>
                <div className="space-y-1.5">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-baseline text-[11px]">
                      <div className="pr-2">
                        <span className="font-semibold text-slate-800">{it.nameKh || it.name}</span>
                        <span className="text-slate-500 text-[10px] block">
                          ទំហំ៖ {it.size} x {it.qty}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0 font-sans">
                        {(it.price * it.qty).toLocaleString()} ៛
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-sm font-black text-slate-900">
                  <span>សរុបបានទូទាត់ (PAID)៖</span>
                  <span className="text-school-800 text-base">{order.totalKhr.toLocaleString()} ៛</span>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-sans">
                  ~${order.totalUsd.toFixed(2)} USD
                </div>
              </div>

              {/* Receipt Footer Note */}
              <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-dashed border-slate-200">
                ទីតាំង៖ {settings.location}
                <br />
                សូមអរគុណចំពោះការគាំទ្រ! សូមបង្ហាញវិក្កយបត្រនេះពេលមកទទួលទំនិញ
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ព្រីនវិក្កយបត្រ</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="bg-school-600 hover:bg-school-700 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>រួចរាល់ (Done)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
