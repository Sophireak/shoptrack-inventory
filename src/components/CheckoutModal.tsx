'use client';

import React, { useState } from 'react';
import { X, User, Phone, GraduationCap, Truck, QrCode, Banknote, ShieldCheck } from 'lucide-react';
import { CartItem } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  defaultGrade: number;
  onClose: () => void;
  onSubmitOrder: (formData: {
    customerName: string;
    phone: string;
    studentName: string;
    studentGrade: string;
    pickupMethod: string;
    paymentMethod: string;
    shippingFeeKhr: number;
  }) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  defaultGrade,
  onClose,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState(`ថ្នាក់ទី ${defaultGrade}`);
  const [pickupMethod, setPickupMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'khqr' | 'cash'>('khqr');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const itemsSubtotalKhr = cart.reduce((sum, it) => sum + it.priceKhr * it.qty, 0);
  const shippingFeeKhr = pickupMethod === 'delivery' ? 4000 : 0;
  const grandTotalKhr = itemsSubtotalKhr + shippingFeeKhr;
  const grandTotalUsd = grandTotalKhr / 4100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert('សូមបំពេញឈ្មោះ និងលេខទូរស័ព្ទ!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        studentName: studentName.trim(),
        studentGrade,
        pickupMethod: pickupMethod === 'delivery' ? 'Phnom Penh Delivery (+4,000 ៛)' : 'Free School Pickup',
        paymentMethod: paymentMethod === 'khqr' ? 'KHQR Bakong' : 'Cash on Pickup / Delivery',
        shippingFeeKhr,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              ព័ត៌មានកុម្ម៉ង់ និងទូទាត់ប្រាក់
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Chea Sim Primary School Order Confirmation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Parent/Buyer Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <User className="w-4 h-4 text-school-600" />
              <span>ព័ត៌មានអាណាព្យាបាល / អ្នកទិញ</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  ឈ្មោះអ្នកកុម្ម៉ង់ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុខ វិសាល"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-school-500 text-slate-900 font-medium text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  លេខទូរស័ព្ទ (Telegram) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="ឧ. 012 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-school-500 text-slate-900 font-medium text-xs"
                />
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <GraduationCap className="w-4 h-4 text-school-600" />
              <span>ព័ត៌មានសិស្ស</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  ឈ្មោះសិស្ស
                </label>
                <input
                  type="text"
                  placeholder="ឧ. វិសាល សុជាតា"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-school-500 text-slate-900 font-medium text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  កម្រិតថ្នាក់ *
                </label>
                <select
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-school-500 text-slate-900 font-medium text-xs bg-white"
                >
                  <option value="ថ្នាក់ទី ១">ថ្នាក់ទី ១ (កីឡា/កាត: ខៀវ)</option>
                  <option value="ថ្នាក់ទី ២">ថ្នាក់ទី ២ (កីឡា/កាត: ខៀវ)</option>
                  <option value="ថ្នាក់ទី ៣">ថ្នាក់ទី ៣ (កីឡា/កាត: ទឹកក្រូច)</option>
                  <option value="ថ្នាក់ទី ៤">ថ្នាក់ទី ៤ (កីឡា/កាត: ទឹកក្រូច)</option>
                  <option value="ថ្នាក់ទី ៥">ថ្នាក់ទី ៥ (កីឡា/កាត: បៃតង)</option>
                  <option value="ថ្នាក់ទី ៦">ថ្នាក់ទី ៦ (កីឡា/កាត: បៃតង)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fulfillment Method */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-800 block text-xs">
              ជម្រើសទទួលទំនិញ (Fulfillment Method)៖
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer text-center transition ${
                  pickupMethod === 'pickup'
                    ? 'border-school-600 bg-school-50 text-school-900 font-bold ring-2 ring-school-400/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="pickupMethod"
                  value="pickup"
                  checked={pickupMethod === 'pickup'}
                  onChange={() => setPickupMethod('pickup')}
                  className="sr-only"
                />
                <ShieldCheck className="w-4 h-4 text-school-600 mb-1" />
                <span className="text-xs">ទទួលនៅសាលា</span>
                <span className="text-[10px] text-emerald-600 font-bold">ឥតគិតថ្លៃ (Free)</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer text-center transition ${
                  pickupMethod === 'delivery'
                    ? 'border-school-600 bg-school-50 text-school-900 font-bold ring-2 ring-school-400/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="pickupMethod"
                  value="delivery"
                  checked={pickupMethod === 'delivery'}
                  onChange={() => setPickupMethod('delivery')}
                  className="sr-only"
                />
                <Truck className="w-4 h-4 text-school-600 mb-1" />
                <span className="text-xs">ដឹកជញ្ជូនដល់ផ្ទះ</span>
                <span className="text-[10px] text-amber-700 font-bold">+4,000 ៛</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-800 block text-xs">
              វិធីទូទាត់ប្រាក់ (Payment Choice)៖
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer text-center transition ${
                  paymentMethod === 'khqr'
                    ? 'border-school-600 bg-school-50 text-school-900 font-bold ring-2 ring-school-400/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="khqr"
                  checked={paymentMethod === 'khqr'}
                  onChange={() => setPaymentMethod('khqr')}
                  className="sr-only"
                />
                <QrCode className="w-4 h-4 text-school-600 mb-1" />
                <span className="text-xs">ស្កេន KHQR Bakong</span>
                <span className="text-[10px] text-school-700">ធនាគារទាំងអស់</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer text-center transition ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="sr-only"
                />
                <Banknote className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-xs">សាច់ប្រាក់សុទ្ធ</span>
                <span className="text-[10px] text-emerald-700">ទូទាត់ពេលទទួល</span>
              </label>
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>ចំនួនមុខទំនិញ៖</span>
              <span className="font-bold">{cart.reduce((s, i) => s + i.qty, 0)} កំប្លេ/មុខ</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ថ្លៃដឹកជញ្ជូន៖</span>
              <span className={shippingFeeKhr > 0 ? 'text-amber-700 font-bold' : 'text-emerald-600 font-bold'}>
                {shippingFeeKhr > 0 ? '+4,000 ៛' : 'ឥតគិតថ្លៃ'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>សរុបត្រូវទូទាត់៖</span>
              <div className="text-right">
                <span className="text-school-700 text-base">{grandTotalKhr.toLocaleString()} ៛</span>
                <div className="text-[10px] text-slate-400 font-normal">~${grandTotalUsd.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-school-600 hover:bg-school-700 active:scale-98 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-school-600/25 transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>កំពុងបញ្ជូនទិន្នន័យ...</span>
              </>
            ) : paymentMethod === 'khqr' ? (
              <span>បញ្ជាក់ការកុម្ម៉ង់ & បង្ហាញ KHQR</span>
            ) : (
              <span>បញ្ជាក់ការកុម្ម៉ង់ (ទូទាត់សាច់ប្រាក់ពេលទទួល)</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
