'use client';

import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, Printer, CheckCircle, ShoppingCart } from 'lucide-react';
import { Product, StoreSettings, CartItem } from '@/types';
import { ID_HOLDER_VARIANTS, ID_HOLDER_TYPES } from '@/lib/catalog';

interface PosRegisterProps {
  products: Product[];
  settings: StoreSettings;
  onRecordSale: (saleData: {
    items: CartItem[];
    totalKhr: number;
    paymentMethod: string;
  }) => Promise<void>;
}

export const PosRegister: React.FC<PosRegisterProps> = ({
  products,
  settings,
  onRecordSale,
}) => {
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'khqr'>('cash');
  const [lastReceipt, setLastReceipt] = useState<{
    orderId: string;
    items: CartItem[];
    totalKhr: number;
    date: string;
    paymentMethod: string;
  } | null>(null);

  // Add standard product size to POS cart
  const handleAddStandard = (prod: Product, size: string, priceKhr: number, priceUsd: number) => {
    const cartItemId = `${prod.id}__${size}`;
    setPosCart((prev) => {
      const existing = prev.find((it) => it.cartItemId === cartItemId);
      if (existing) {
        return prev.map((it) =>
          it.cartItemId === cartItemId ? { ...it, qty: it.qty + 1 } : it
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          id: prod.id,
          name: prod.name,
          nameKh: prod.nameKh,
          size,
          priceKhr,
          priceUsd,
          image: prod.image,
          qty: 1,
        },
      ];
    });
  };

  // Add Sport Uniform to POS cart
  const handleAddSport = (colorKey: 'blue' | 'orange' | 'green', size: string) => {
    const sportProd = products.find((p) => p.id === 'cs-sport-uniform');
    if (!sportProd || !sportProd.variants) return;
    const variant = sportProd.variants[colorKey];
    const cartItemId = `${variant.id}__${size}`;

    setPosCart((prev) => {
      const existing = prev.find((it) => it.cartItemId === cartItemId);
      if (existing) {
        return prev.map((it) =>
          it.cartItemId === cartItemId ? { ...it, qty: it.qty + 1 } : it
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          id: variant.id,
          name: `Sport Uniform - ${variant.colorKh} (${variant.gradeGroup})`,
          nameKh: `ឈុតកីឡា ${variant.colorKh} (${variant.gradeGroup})`,
          size,
          priceKhr: sportProd.priceKhr,
          priceUsd: sportProd.priceUsd,
          image: variant.image,
          qty: 1,
        },
      ];
    });
  };

  // Add ID Holder / Lanyard package to POS cart
  const handleAddIdPackage = (
    typeKey: 'set' | 'holder' | 'lanyard',
    colorKey: 'blue' | 'orange' | 'green'
  ) => {
    const variant = ID_HOLDER_VARIANTS[colorKey];
    const typeConfig = ID_HOLDER_TYPES[typeKey];

    let cartItemId = '';
    let prodId = '';
    let itemNameKh = '';
    let itemNameEn = '';
    const itemSize = variant.colorKh;
    const itemImage = variant.image;

    if (typeKey === 'set') {
      cartItemId = `cs-id-set__${variant.colorCode}`;
      prodId = 'cs-id-holder';
      itemNameKh = `ឈុតប្រអប់កាត + ខ្សែពាក់ក (1 Set) - ${variant.colorKh}`;
      itemNameEn = `ID Card Set - ${variant.colorKh}`;
    } else if (typeKey === 'holder') {
      cartItemId = `cs-id-holder-only__${variant.colorCode}`;
      prodId = 'cs-id-holder-only';
      itemNameKh = `ប្រអប់កាតសិស្ស (Card Holder Only) - ${variant.colorKh}`;
      itemNameEn = `ID Card Holder - ${variant.colorKh}`;
    } else {
      cartItemId = `cs-id-lanyard-only__${variant.colorCode}`;
      prodId = 'cs-id-lanyard-only';
      itemNameKh = `ខ្សែពាក់កសិស្ស (Lanyard Only) - ${variant.colorKh}`;
      itemNameEn = `ID Lanyard - ${variant.colorKh}`;
    }

    setPosCart((prev) => {
      const existing = prev.find((it) => it.cartItemId === cartItemId);
      if (existing) {
        return prev.map((it) =>
          it.cartItemId === cartItemId ? { ...it, qty: it.qty + 1 } : it
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          id: prodId,
          name: itemNameEn,
          nameKh: itemNameKh,
          size: itemSize,
          priceKhr: typeConfig.priceKhr,
          priceUsd: typeConfig.priceUsd,
          image: itemImage,
          qty: 1,
        },
      ];
    });
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((it) =>
          it.cartItemId === cartItemId ? { ...it, qty: it.qty + delta } : it
        )
        .filter((it) => it.qty > 0)
    );
  };

  const removeCartItem = (cartItemId: string) => {
    setPosCart((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const totalKhr = posCart.reduce((sum, it) => sum + it.priceKhr * it.qty, 0);
  const totalUsd = totalKhr / 4100;

  const handleCheckout = async () => {
    if (posCart.length === 0) return;
    const orderId = `CS-POS-${Math.floor(1000 + Math.random() * 9000)}`;

    await onRecordSale({
      items: posCart,
      totalKhr,
      paymentMethod: paymentMethod === 'cash' ? 'Cash at Counter' : 'KHQR Bakong',
    });

    setLastReceipt({
      orderId,
      items: [...posCart],
      totalKhr,
      date: new Date().toLocaleString('km-KH'),
      paymentMethod: paymentMethod === 'cash' ? 'សាច់ប្រាក់សុទ្ធ' : 'KHQR Bakong',
    });

    setPosCart([]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Rapid Sale Buttons */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ស្វែងរកឈ្មោះឯកសណ្ឋាន ឬទំហំ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-school-500 shadow-xs"
          />
        </div>

        {/* 1. Sport Uniform Quick Tap */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              🏃 ឈុតកីឡាសាលា (Unisex) — ២៦,០០០ ៛
            </h4>
            <span className="text-[11px] text-slate-400">ជ្រើសពណ៌តាមថ្នាក់ & ទំហំ</span>
          </div>

          {/* Grade 1-2 Blue */}
          <div>
            <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>ថ្នាក់ ១-២ (ពណ៌ខៀវ)៖</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {['20', '22', '24', '26', '28', '30', 'M', 'L', 'XL'].map((sz) => (
                <button
                  key={`blue-${sz}`}
                  type="button"
                  onClick={() => handleAddSport('blue', sz)}
                  className="px-2 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-xs font-bold text-blue-800 transition cursor-pointer"
                >
                  +{sz}
                </button>
              ))}
            </div>
          </div>

          {/* Grade 3-4 Orange */}
          <div>
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>ថ្នាក់ ៣-៤ (ពណ៌ទឹកក្រូច)៖</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {['20', '22', '24', '26', '28', '30', 'M', 'L', 'XL'].map((sz) => (
                <button
                  key={`orange-${sz}`}
                  type="button"
                  onClick={() => handleAddSport('orange', sz)}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900 transition cursor-pointer"
                >
                  +{sz}
                </button>
              ))}
            </div>
          </div>

          {/* Grade 5-6 Green */}
          <div>
            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>ថ្នាក់ ៥-៦ (ពណ៌បៃតង)៖</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {['20', '22', '24', '26', '28', '30', 'M', 'L', 'XL'].map((sz) => (
                <button
                  key={`green-${sz}`}
                  type="button"
                  onClick={() => handleAddSport('green', sz)}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 transition cursor-pointer"
                >
                  +{sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. School ID Card Holder & Lanyard Quick Tap (3 Package Options) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              🪪 ប្រអប់កាត & ខ្សែពាក់ក (ID Supplies — 3 Options)
            </h4>
            <span className="text-[11px] text-slate-400">ចុចលើប៊ូតុងដើម្បីលក់រហ័ស</span>
          </div>

          {/* 1 Set */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              📦 ១ ឈុតពេញលេញ (Set) — ៦,៥០០ ៛៖
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleAddIdPackage('set', 'blue')}
                className="p-1.5 rounded-lg bg-blue-50 border border-blue-300 text-blue-900 hover:bg-blue-600 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ថ្នាក់ ១-២ (ខៀវ)
              </button>
              <button
                type="button"
                onClick={() => handleAddIdPackage('set', 'orange')}
                className="p-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-500 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ថ្នាក់ ៣-៤ (ទឹកក្រូច)
              </button>
              <button
                type="button"
                onClick={() => handleAddIdPackage('set', 'green')}
                className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-600 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ថ្នាក់ ៥-៦ (បៃតង)
              </button>
            </div>
          </div>

          {/* Holder Only */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              🪪 តែប្រអប់កាត (Card Holder Only) — ១,៥០០ ៛៖
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleAddIdPackage('holder', 'blue')}
                className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-600 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ប្រអប់ខៀវ (១-២)
              </button>
              <button
                type="button"
                onClick={() => handleAddIdPackage('holder', 'orange')}
                className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-500 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ប្រអប់ទឹកក្រូច (៣-៤)
              </button>
              <button
                type="button"
                onClick={() => handleAddIdPackage('holder', 'green')}
                className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ប្រអប់បៃតង (៥-៦)
              </button>
            </div>
          </div>

          {/* Lanyard Only */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1">
              🎗️ តែខ្សែពាក់ក (Lanyard Only) — ៥,០០០ ៛៖
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleAddIdPackage('lanyard', 'blue')}
                className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-600 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ខ្សែខៀវ (១-២)
              </button>
              <button
                type="button"
                onClick={() => handleAddIdPackage('lanyard', 'orange')}
                className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-500 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ខ្សែទឹកក្រូច (៣-៤)
              </button>
              <button
                type="button"
                onClick={() => handleAddIdPackage('lanyard', 'green')}
                className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white text-xs font-bold transition text-center cursor-pointer"
              >
                + ខ្សែបៃតង (៥-៦)
              </button>
            </div>
          </div>
        </div>

        {/* 3. Sneakers Quick Tap */}
        {products
          .filter((p) => p.category === 'shoes')
          .map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  👟 {p.nameKh} — {p.priceKhr.toLocaleString()} ៛
                </h4>
                <span className="text-[11px] text-slate-400">ទំហំ ៣១ ដល់ ៤២</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(p.sizes || []).map((sz) => (
                  <button
                    key={sz.size}
                    type="button"
                    onClick={() => handleAddStandard(p, sz.size, p.priceKhr, p.priceUsd)}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-school-600 hover:text-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    +{sz.size}
                  </button>
                ))}
              </div>
            </div>
          ))}

        {/* 4. Regular Uniforms (Boy Shirt, Pant, Tie, Girl Shirt, Skirt) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm border-b border-slate-100 pb-2">
            👔 ឯកសណ្ឋានផ្លូវការប្រុស-ស្រី
          </h4>

          {products
            .filter((p) => !p.isVariantGroup && p.id !== 'cs-id-holder' && p.category !== 'shoes')
            .map((p) => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{p.nameKh}</span>
                  <span className="text-school-700 font-extrabold">{p.priceKhr.toLocaleString()} ៛</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(p.sizes || [{ size: 'ស្តង់ដារ', stock: 100 }]).map((sz) => (
                    <button
                      key={sz.size}
                      type="button"
                      onClick={() => handleAddStandard(p, sz.size, p.priceKhr, p.priceUsd)}
                      className="px-2 py-1 bg-slate-50 hover:bg-school-600 hover:text-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer"
                    >
                      +{sz.size}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Col: Active POS Cart & Thermal Receipt Trigger */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-school-600" />
              <h4 className="font-bold text-slate-900 text-sm">វិក្កយបត្រគិតលុយ (POS)</h4>
            </div>
            {posCart.length > 0 && (
              <button
                type="button"
                onClick={() => setPosCart([])}
                className="text-rose-600 text-xs hover:underline cursor-pointer"
              >
                លុបទាំងអស់
              </button>
            )}
          </div>

          {/* Cart Items in POS */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 flex-1">
            {posCart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                មិនទាន់មានទំនិញត្រូវបានជ្រើសរើសនៅឡើយ<br />
                សូមចុចប៊ូតុង + ខាងឆ្វេងដើម្បីបញ្ចូលទំនិញ
              </div>
            ) : (
              posCart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-bold text-slate-900 truncate">{item.nameKh}</div>
                    <div className="text-[10px] text-slate-500">
                      ទំហំ/ពណ៌: <span className="font-semibold text-school-700">{item.size}</span>
                    </div>
                    <div className="text-[11px] font-extrabold text-slate-800 mt-0.5">
                      {(item.priceKhr * item.qty).toLocaleString()} ៛
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center border border-slate-300 bg-white rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.cartItemId, -1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.cartItemId, 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCartItem(item.cartItemId)}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment & Checkout */}
          <div className="border-t border-slate-200 pt-3 mt-3 space-y-3">
            {/* Payment Choice */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                💵 សាច់ប្រាក់ (Cash)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('khqr')}
                className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                  paymentMethod === 'khqr'
                    ? 'bg-school-600 text-white border-school-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                📱 KHQR Bakong
              </button>
            </div>

            {/* Total */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700 text-xs">សរុបត្រូវគិតលុយ៖</span>
              <div className="text-right">
                <div className="text-lg font-black text-school-800">
                  {totalKhr.toLocaleString()} ៛
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  ~${totalUsd.toFixed(2)} USD
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={posCart.length === 0}
              onClick={handleCheckout}
              className="w-full bg-school-600 hover:bg-school-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-school-600/25 transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ទទួលប្រាក់ & ចេញវិក្កយបត្រ</span>
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Card */}
        {lastReceipt && (
          <div
            id="printableReceipt"
            className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-300 shadow-sm text-xs space-y-3"
          >
            <div className="text-center border-b border-slate-200 pb-2">
              <h5 className="font-black text-sm text-slate-900">{settings.shopName}</h5>
              <p className="text-[10px] text-slate-500">{settings.location}</p>
              <p className="text-[10px] text-slate-500">ទូរស័ព្ទ៖ {settings.phone1}</p>
              <div className="text-[11px] font-bold text-school-700 mt-1">
                វិក្កយបត្រ #{lastReceipt.orderId}
              </div>
              <div className="text-[10px] text-slate-400">{lastReceipt.date}</div>
            </div>

            <div className="divide-y divide-slate-100">
              {lastReceipt.items.map((it, idx) => (
                <div key={idx} className="py-1 flex justify-between">
                  <div className="pr-2">
                    <div className="font-semibold text-slate-800 truncate">{it.nameKh}</div>
                    <div className="text-[10px] text-slate-400">
                      {it.size} x {it.qty}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 whitespace-nowrap">
                    {(it.priceKhr * it.qty).toLocaleString()} ៛
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-300 pt-2 flex justify-between items-center font-black text-sm">
              <span>សរុប (Total)៖</span>
              <span className="text-school-700">{lastReceipt.totalKhr.toLocaleString()} ៛</span>
            </div>

            <div className="text-[10px] text-center text-slate-400 pt-1">
              វិធីទូទាត់៖ {lastReceipt.paymentMethod}
              <br />
              សូមអរគុណ! សូមពិនិត្យទំនិញមុនចាកចេញ
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer print:hidden"
            >
              <Printer className="w-4 h-4" />
              <span>ព្រីនវិក្កយបត្រ (Print Receipt)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
