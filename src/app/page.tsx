'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '@/components/Header';
import { GradeAdvisor } from '@/components/GradeAdvisor';
import { ProductGrid } from '@/components/ProductGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { KhqrModal } from '@/components/KhqrModal';
import { SizeGuideModal } from '@/components/SizeGuideModal';
import { BASE_PRODUCTS, DEFAULT_SETTINGS, ID_HOLDER_VARIANTS, ID_HOLDER_TYPES } from '@/lib/catalog';
import { Product, ProductCategory, CartItem, Order, StoreSettings, SportVariant } from '@/types';
import { ShoppingBag, Sparkles, MapPin, Phone, MessageCircle } from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>(BASE_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<ProductCategory>('all');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);

  // Card Variant States
  const [activeSportColor, setActiveSportColor] = useState<'blue' | 'orange' | 'green'>('blue');
  const [activeSportSize, setActiveSportSize] = useState<string>('20');
  const [activeIdHolderType, setActiveIdHolderType] = useState<'set' | 'holder' | 'lanyard'>('set');
  const [activeIdHolderColor, setActiveIdHolderColor] = useState<'blue' | 'orange' | 'green'>('blue');

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isKhqrOpen, setIsKhqrOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Helper to merge saved products with BASE_PRODUCTS
  const mergeWithBaseProducts = (saved: Product[]): Product[] => {
    const savedMap = new Map(saved.map((p) => [p.id, p]));
    return BASE_PRODUCTS.map((base) => {
      const s = savedMap.get(base.id);
      if (!s) return base;
      return {
        ...base,
        priceKhr: typeof s.priceKhr === 'number' ? s.priceKhr : base.priceKhr,
        priceUsd: typeof s.priceUsd === 'number' ? s.priceUsd : base.priceUsd,
        costKhr: typeof s.costKhr === 'number' ? s.costKhr : (base.costKhr ?? 0),
        costUsd: typeof s.costUsd === 'number' ? s.costUsd : (base.costUsd ?? 0),
        sizes: s.sizes || base.sizes,
        variants: s.variants || base.variants,
      };
    });
  };

  // Load cart, settings, and products from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('cs_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedCart = localStorage.getItem('cs_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedProducts = localStorage.getItem('cs_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) {
          setProducts(mergeWithBaseProducts(parsed));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('cs_cart', JSON.stringify(newCart));
    } catch {
      // ignore
    }
  };

  // Grade Advisor synchronization
  const handleSelectGrade = (grade: number) => {
    setSelectedGrade(grade);
    if (grade === 1 || grade === 2) {
      setActiveSportColor('blue');
      setActiveSportSize(grade === 1 ? '20' : '22');
      setActiveIdHolderColor('blue');
    } else if (grade === 3 || grade === 4) {
      setActiveSportColor('orange');
      setActiveSportSize(grade === 3 ? '24' : '26');
      setActiveIdHolderColor('orange');
    } else if (grade === 5 || grade === 6) {
      setActiveSportColor('green');
      setActiveSportSize(grade === 5 ? '28' : '30');
      setActiveIdHolderColor('green');
    }
  };

  const handleScrollToCatalog = () => {
    document.getElementById('productsSection')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cart Management
  const handleAddStandardToCart = (prod: Product, selectedSize: string) => {
    const cartItemId = `${prod.id}__${selectedSize}`;
    const existing = cart.find((it) => it.cartItemId === cartItemId);

    let updated: CartItem[];
    if (existing) {
      updated = cart.map((it) =>
        it.cartItemId === cartItemId ? { ...it, qty: it.qty + 1 } : it
      );
    } else {
      updated = [
        ...cart,
        {
          cartItemId,
          id: prod.id,
          name: prod.name,
          nameKh: prod.nameKh,
          size: selectedSize,
          priceKhr: prod.priceKhr,
          priceUsd: prod.priceUsd,
          image: prod.image,
          qty: 1,
        },
      ];
    }
    saveCart(updated);
    setIsCartOpen(true);
  };

  const handleAddSportToCart = (
    variant: SportVariant,
    size: string,
    priceKhr: number,
    priceUsd: number
  ) => {
    const cartItemId = `${variant.id}__${size}`;
    const existing = cart.find((it) => it.cartItemId === cartItemId);

    let updated: CartItem[];
    if (existing) {
      updated = cart.map((it) =>
        it.cartItemId === cartItemId ? { ...it, qty: it.qty + 1 } : it
      );
    } else {
      updated = [
        ...cart,
        {
          cartItemId,
          id: variant.id,
          name: `Sport Uniform - ${variant.colorKh} (${variant.gradeGroup})`,
          nameKh: `ឈុតកីឡាសាលា ${variant.colorKh} (${variant.gradeGroup})`,
          size,
          priceKhr,
          priceUsd,
          image: variant.image,
          qty: 1,
        },
      ];
    }
    saveCart(updated);
    setIsCartOpen(true);
  };

  const handleAddIdHolderToCart = () => {
    const variant = ID_HOLDER_VARIANTS[activeIdHolderColor];
    const typeConfig = ID_HOLDER_TYPES[activeIdHolderType];

    let cartItemId = '';
    let prodId = '';
    let itemNameKh = '';
    let itemNameEn = '';
    const itemSize = variant.colorKh;
    const itemImage = variant.image;

    if (activeIdHolderType === 'set') {
      cartItemId = `cs-id-set__${variant.colorCode}`;
      prodId = 'cs-id-holder';
      itemNameKh = `ឈុតប្រអប់កាត + ខ្សែពាក់ក (1 Set) - ${variant.colorKh} (${variant.gradeGroup})`;
      itemNameEn = `ID Card Set (Holder + Lanyard) - ${variant.colorKh} (${variant.gradeGroup})`;
    } else if (activeIdHolderType === 'holder') {
      cartItemId = `cs-id-holder-only__${variant.colorCode}`;
      prodId = 'cs-id-holder-only';
      itemNameKh = `ប្រអប់កាតសិស្ស (Card Holder Only) - ${variant.colorKh} (${variant.gradeGroup})`;
      itemNameEn = `School ID Card Holder (Only) - ${variant.colorKh} (${variant.gradeGroup})`;
    } else {
      cartItemId = `cs-id-lanyard-only__${variant.colorCode}`;
      prodId = 'cs-id-lanyard-only';
      itemNameKh = `ខ្សែពាក់កសិស្ស (Lanyard Only) - ${variant.colorKh} (${variant.gradeGroup})`;
      itemNameEn = `School ID Lanyard (Only) - ${variant.colorKh} (${variant.gradeGroup})`;
    }

    const existing = cart.find((it) => it.cartItemId === cartItemId);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map((it) =>
        it.cartItemId === cartItemId ? { ...it, qty: it.qty + 1 } : it
      );
    } else {
      updated = [
        ...cart,
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
    }
    saveCart(updated);
    setIsCartOpen(true);
  };

  const handleUpdateQty = (cartItemId: string, delta: number) => {
    const updated = cart
      .map((it) => (it.cartItemId === cartItemId ? { ...it, qty: it.qty + delta } : it))
      .filter((it) => it.qty > 0);
    saveCart(updated);
  };

  const handleRemoveItem = (cartItemId: string) => {
    const updated = cart.filter((it) => it.cartItemId !== cartItemId);
    saveCart(updated);
  };

  const cartTotalKhr = cart.reduce((sum, it) => sum + it.priceKhr * it.qty, 0);
  const cartTotalUsd = cartTotalKhr / 4100;
  const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);

  // Submit Order flow
  const handleSubmitOrder = async (formData: {
    customerName: string;
    phone: string;
    studentName: string;
    studentGrade: string;
    pickupMethod: string;
    paymentMethod: string;
    shippingFeeKhr: number;
  }) => {
    const orderId = `CS-${Math.floor(1000 + Math.random() * 9000)}`;
    const grandTotalKhr = cartTotalKhr + formData.shippingFeeKhr;
    const grandTotalUsd = grandTotalKhr / 4100;

    const newOrder: Order = {
      id: orderId,
      orderId,
      customerName: formData.customerName,
      phone: formData.phone,
      studentName: formData.studentName,
      studentGrade: formData.studentGrade,
      pickupMethod: formData.pickupMethod,
      paymentMethod: formData.paymentMethod,
      items: cart.map((it) => ({
        id: it.id,
        name: it.name,
        nameKh: it.nameKh,
        size: it.size,
        price: it.priceKhr,
        qty: it.qty,
      })),
      totalKhr: grandTotalKhr,
      totalUsd: grandTotalUsd,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save in local storage orders history
    try {
      const stored = JSON.parse(localStorage.getItem('cs_orders') || '[]');
      stored.unshift(newOrder);
      localStorage.setItem('cs_orders', JSON.stringify(stored));
    } catch {
      // ignore
    }

    // Call /api/orders
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (err) {
      console.warn('Non-fatal API dispatch:', err);
    }

    // Clear Cart
    saveCart([]);
    setIsCheckoutOpen(false);
    setCurrentOrder(newOrder);

    // If KHQR, open KHQR modal; otherwise show success confetti
    if (formData.paymentMethod.includes('KHQR')) {
      setIsKhqrOpen(true);
    } else {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      alert(`🎉 ការកុម្ម៉ង់ #${newOrder.orderId} ទទួលបានជោគជ័យ! សូមអរគុណ។`);
    }
  };

  const handleCompleteKhqr = () => {
    setIsKhqrOpen(false);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    alert('🎉 យើងបានទទួលការបញ្ជាក់ការទូទាត់របស់អ្នករួចរាល់ហើយ! សូមអរគុណ។');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-khmer">
      {/* Navigation Header */}
      <Header
        settings={settings}
        cartCount={cartCount}
        cartTotalKhr={cartTotalKhr}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6">
        {/* Hero Welcome Banner */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="max-w-2xl space-y-3 z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ទិន្នន័យស្តុកផ្សាយផ្ទាល់ពីបញ្ជរក្នុងសាលា</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              ឯកសណ្ឋានសិស្សបឋមសិក្សា <br className="hidden sm:inline" />
              <span className="text-school-700 font-black">សម្តេចជាស៊ីម</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              ពិនិត្យមើលស្តុកទំហំ និងពណ៌ផ្លូវការតាមកម្រិតថ្នាក់ (ថ្នាក់ទី ១ ដល់ ទី ៦) ភ្លាមៗ។ អាចកក់ទុកតាម Telegram ឬមកទិញផ្ទាល់នៅបញ្ជរមុខអគាររដ្ឋបាល។
            </p>
            
            {/* Direct Contact / Actions for Parents */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <a
                href={`tel:${settings.phone1.replace(/\s+/g, '')}`}
                className="bg-school-700 hover:bg-school-800 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-school-800/20 transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>ខលសួរផ្ទាល់៖ {settings.phone1}</span>
              </a>

              <a
                href={`https://t.me/${settings.telegram || 'bNha_dev'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-sky-200 flex items-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>ឆាត Telegram ទៅកាន់អ្នកគ្រប់គ្រង</span>
              </a>

              <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 pl-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>មុខអគាររដ្ឋបាលសាលា</span>
              </div>
            </div>
          </div>

          <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl bg-school-50 flex items-center justify-center text-school-700 shadow-inner shrink-0 relative overflow-hidden border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=700&auto=format&fit=crop&q=80"
              alt="Uniform Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Grade Advisor */}
        <GradeAdvisor
          selectedGrade={selectedGrade}
          onSelectGrade={handleSelectGrade}
          onScrollToCatalog={handleScrollToCatalog}
        />

        {/* Product Catalog Grid (7 Unified Cards) */}
        <ProductGrid
          products={products}
          currentCategory={currentCategory}
          activeSportColor={activeSportColor}
          activeSportSize={activeSportSize}
          activeIdHolderType={activeIdHolderType}
          activeIdHolderColor={activeIdHolderColor}
          onChangeCategory={setCurrentCategory}
          onChangeSportColor={setActiveSportColor}
          onChangeSportSize={setActiveSportSize}
          onChangeIdHolderType={setActiveIdHolderType}
          onChangeIdHolderColor={setActiveIdHolderColor}
          onAddStandardToCart={handleAddStandardToCart}
          onAddSportToCart={handleAddSportToCart}
          onAddIdHolderToCart={handleAddIdHolderToCart}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        />
      </main>

      {/* Floating Mobile Cart Bar */}
      {cartCount > 0 && (
        <div className="md:hidden fixed bottom-4 inset-x-4 z-30">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-school-600 hover:bg-school-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>មើលកន្ត្រក ({cartCount})</span>
            </div>
            <span className="font-extrabold text-amber-200">
              {cartTotalKhr.toLocaleString()} ៛
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-800">
            © {new Date().getFullYear()} {settings.shopName} · សាលាបឋមសិក្សា សម្តេចជាស៊ីម
          </p>
          <p>ទីតាំង៖ {settings.location} · ទំនាក់ទំនង៖ {settings.phone1} / {settings.phone2}</p>
          <p className="text-[11px] text-slate-400 font-sans">
            Built with Next.js & Supabase by Sophireak (@bNha_dev)
          </p>
        </div>
      </footer>

      {/* Slide-over & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        totalKhr={cartTotalKhr}
        totalUsd={cartTotalUsd}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        defaultGrade={selectedGrade}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmitOrder={handleSubmitOrder}
      />

      <KhqrModal
        isOpen={isKhqrOpen}
        order={currentOrder}
        bakongId={settings.bakongId}
        onClose={() => setIsKhqrOpen(false)}
        onComplete={handleCompleteKhqr}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
}
