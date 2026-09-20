'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, ShoppingCart, Package, ListOrdered, Settings, ArrowLeft } from 'lucide-react';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { PosRegister } from '@/components/admin/PosRegister';
import { InventoryManager } from '@/components/admin/InventoryManager';
import { OrderTracker } from '@/components/admin/OrderTracker';
import { StoreSettings as StoreSettingsComponent } from '@/components/admin/StoreSettings';
import { BASE_PRODUCTS, DEFAULT_SETTINGS } from '@/lib/catalog';
import { Product, Order, StoreSettings, CartItem } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'orders' | 'settings'>('pos');
  const [products, setProducts] = useState<Product[]>(BASE_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Load state on mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('cs_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedSettings = localStorage.getItem('cs_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedProducts = localStorage.getItem('cs_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
    } catch {
      // ignore
    }
  }, []);

  // Save updated products stock
  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem('cs_products', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Stock update handler
  const handleUpdateStock = (
    productId: string,
    variantKey: string | null,
    size: string,
    newStock: number
  ) => {
    const updated = products.map((p) => {
      if (p.id !== productId) return p;

      // If Sport Uniform variant
      if (p.isVariantGroup && p.variants && variantKey) {
        const vKey = variantKey as 'blue' | 'orange' | 'green';
        const targetVariant = p.variants[vKey];
        if (!targetVariant) return p;

        const updatedSizes = targetVariant.sizes.map((s) =>
          s.size === size ? { ...s, stock: newStock } : s
        );

        return {
          ...p,
          variants: {
            ...p.variants,
            [vKey]: {
              ...targetVariant,
              sizes: updatedSizes,
            },
          },
        };
      }

      // Standard product sizes
      if (p.sizes) {
        const updatedSizes = p.sizes.map((s) =>
          s.size === size ? { ...s, stock: newStock } : s
        );
        return { ...p, sizes: updatedSizes };
      }

      return p;
    });

    saveProducts(updated);
  };

  // Record sale from POS
  const handleRecordSale = async (saleData: {
    items: CartItem[];
    totalKhr: number;
    paymentMethod: string;
  }) => {
    const orderId = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      orderId,
      customerName: 'អតិថិជនទិញផ្ទាល់ (Walk-in)',
      phone: 'ទូទាត់នៅកន្លែង',
      studentGrade: 'ទូទៅ',
      pickupMethod: 'Free School Pickup',
      paymentMethod: saleData.paymentMethod,
      items: saleData.items.map((it) => ({
        id: it.id,
        name: it.name,
        nameKh: it.nameKh,
        size: it.size,
        price: it.priceKhr,
        qty: it.qty,
      })),
      totalKhr: saleData.totalKhr,
      totalUsd: saleData.totalKhr / 4100,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    try {
      localStorage.setItem('cs_orders', JSON.stringify(updatedOrders));
    } catch {
      // ignore
    }

    // Decrement stock for each item sold
    let currentProducts = [...products];
    saleData.items.forEach((item) => {
      // Find matching item in products
      currentProducts = currentProducts.map((p) => {
        if (p.sizes && p.sizes.some((s) => s.size === item.size)) {
          return {
            ...p,
            sizes: p.sizes.map((s) =>
              s.size === item.size ? { ...s, stock: Math.max(0, s.stock - item.qty) } : s
            ),
          };
        }
        if (p.variants) {
          const updatedVariants = { ...p.variants };
          (['blue', 'orange', 'green'] as const).forEach((ck) => {
            const v = updatedVariants[ck];
            if (v && v.sizes.some((s) => s.size === item.size)) {
              updatedVariants[ck] = {
                ...v,
                sizes: v.sizes.map((s) =>
                  s.size === item.size ? { ...s, stock: Math.max(0, s.stock - item.qty) } : s
                ),
              };
            }
          });
          return { ...p, variants: updatedVariants };
        }
        return p;
      });
    });

    saveProducts(currentProducts);
  };

  // Update order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) =>
      o.orderId === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    try {
      localStorage.setItem('cs_orders', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Save Store Settings
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('cs_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-khmer">
      {/* Top Admin Navbar */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ត្រឡប់ទៅហាង</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-school-600 flex items-center justify-center text-white font-black">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight text-white">
                  ប្រព័ន្ធគ្រប់គ្រង & គិតលុយ POS
                </h1>
                <p className="text-[10px] text-slate-400 font-sans">
                  {settings.shopName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>POS ដំណើរការផ្ទាល់</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'pos'
                ? 'border-school-500 text-school-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>🛒 ផ្ទាំងគិតលុយ (POS Register)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-school-500 text-school-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>📦 គ្រប់គ្រងស្តុក (Inventory)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'orders'
                ? 'border-school-500 text-school-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>📋 ការកុម្ម៉ង់ទិញ ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'settings'
                ? 'border-school-500 text-school-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>⚙️ ការកំណត់ហាង (Settings)</span>
          </button>
        </div>
      </nav>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Overview Cards */}
        <DashboardOverview orders={orders} products={products} />

        {/* Tab Switcher */}
        {activeTab === 'pos' && (
          <PosRegister
            products={products}
            settings={settings}
            onRecordSale={handleRecordSale}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            products={products}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'orders' && (
          <OrderTracker
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'settings' && (
          <StoreSettingsComponent
            settings={settings}
            onSave={handleSaveSettings}
          />
        )}
      </main>
    </div>
  );
}
