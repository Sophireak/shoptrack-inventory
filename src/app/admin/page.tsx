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

  // Helper to merge saved products with BASE_PRODUCTS
  const mergeWithBaseProducts = (saved: Product[]): Product[] => {
    const savedMap = new Map(saved.map((p) => [p.id, p]));
    return BASE_PRODUCTS.map((base) => {
      const s = savedMap.get(base.id);
      if (!s) return base;

      const mergedSizes = base.sizes?.map((bs) => {
        const ss = s.sizes?.find((x) => x.size === bs.size);
        if (!ss) return bs;
        return {
          ...bs,
          stock: typeof ss.stock === 'number' ? ss.stock : bs.stock,
          priceKhr: typeof ss.priceKhr === 'number' ? ss.priceKhr : bs.priceKhr,
          priceUsd: typeof ss.priceUsd === 'number' ? ss.priceUsd : bs.priceUsd,
          costKhr: typeof ss.costKhr === 'number' ? ss.costKhr : bs.costKhr,
          costUsd: typeof ss.costUsd === 'number' ? ss.costUsd : bs.costUsd,
        };
      });

      let mergedVariants = base.variants;
      if (base.variants && s.variants) {
        mergedVariants = {
          blue: {
            ...base.variants.blue,
            sizes: base.variants.blue.sizes.map((bs) => {
              const ss = s.variants?.blue?.sizes.find((x) => x.size === bs.size);
              return ss ? { ...bs, ...ss } : bs;
            }),
          },
          orange: {
            ...base.variants.orange,
            sizes: base.variants.orange.sizes.map((bs) => {
              const ss = s.variants?.orange?.sizes.find((x) => x.size === bs.size);
              return ss ? { ...bs, ...ss } : bs;
            }),
          },
          green: {
            ...base.variants.green,
            sizes: base.variants.green.sizes.map((bs) => {
              const ss = s.variants?.green?.sizes.find((x) => x.size === bs.size);
              return ss ? { ...bs, ...ss } : bs;
            }),
          },
        };
      }

      return {
        ...base,
        priceKhr: typeof s.priceKhr === 'number' ? s.priceKhr : base.priceKhr,
        priceUsd: typeof s.priceUsd === 'number' ? s.priceUsd : base.priceUsd,
        costKhr: typeof s.costKhr === 'number' ? s.costKhr : (base.costKhr ?? 0),
        costUsd: typeof s.costUsd === 'number' ? s.costUsd : (base.costUsd ?? 0),
        sizes: mergedSizes || s.sizes || base.sizes,
        variants: mergedVariants || s.variants || base.variants,
      };
    });
  };

  // BroadcastChannel helper for instant cross-tab sync
  const broadcastSync = (type: 'PRODUCTS_UPDATED' | 'ORDERS_UPDATED', payload: any) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('cs_store_sync');
        bc.postMessage({ type, payload });
        bc.close();
      } catch {}
    }
  };

  // Load state on mount and sync with server
  useEffect(() => {
    // 1. Instant local state
    try {
      const savedOrders = localStorage.getItem('cs_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedSettings = localStorage.getItem('cs_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (!parsed.location || parsed.location.includes('មុខអគាររដ្ឋបាល')) {
          parsed.location = DEFAULT_SETTINGS.location;
        }
        if (!parsed.customQrUrl || !parsed.accountName) {
          parsed.customQrUrl = DEFAULT_SETTINGS.customQrUrl;
          parsed.accountName = DEFAULT_SETTINGS.accountName;
          parsed.accountKhr = DEFAULT_SETTINGS.accountKhr;
          parsed.accountUsd = DEFAULT_SETTINGS.accountUsd;
          parsed.bakongId = DEFAULT_SETTINGS.bakongId;
        }
        setSettings(parsed);
      }

      const savedProducts = localStorage.getItem('cs_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) {
          setProducts(mergeWithBaseProducts(parsed));
        }
      }
    } catch {}

    // 2. Sync from server API
    const fetchServerData = async () => {
      try {
        const [invRes, ordersRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/orders'),
        ]);

        if (invRes.ok) {
          const invJson = await invRes.json();
          if (invJson.success && Array.isArray(invJson.data) && invJson.data.length > 0) {
            const merged = mergeWithBaseProducts(invJson.data);
            setProducts(merged);
            try {
              localStorage.setItem('cs_products', JSON.stringify(merged));
            } catch {}
          }
        }

        if (ordersRes.ok) {
          const ordJson = await ordersRes.json();
          if (ordJson.success && Array.isArray(ordJson.data)) {
            setOrders((prev) => {
              const combined = [...ordJson.data];
              prev.forEach((po) => {
                if (!combined.some((co) => co.orderId === po.orderId)) {
                  combined.push(po);
                }
              });
              try {
                localStorage.setItem('cs_orders', JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }
      } catch (err) {
        // Fallback to local
      }
    };

    fetchServerData();

    // 3. Setup BroadcastChannel & storage listeners
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('cs_store_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'PRODUCTS_UPDATED' && Array.isArray(event.data.payload)) {
          setProducts(mergeWithBaseProducts(event.data.payload));
        } else if (event.data?.type === 'ORDERS_UPDATED' && Array.isArray(event.data.payload)) {
          setOrders(event.data.payload);
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cs_products' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setProducts(mergeWithBaseProducts(parsed));
        } catch {}
      }
      if (e.key === 'cs_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setOrders(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Poll orders & inventory every 4 seconds
    const interval = setInterval(fetchServerData, 4000);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Save updated products
  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem('cs_products', JSON.stringify(updated));
    } catch {}
    broadcastSync('PRODUCTS_UPDATED', updated);

    // Persist to server
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn('Sync to /api/inventory failed:', err));
  };

  // Save updated orders
  const saveOrders = (updated: Order[]) => {
    setOrders(updated);
    try {
      localStorage.setItem('cs_orders', JSON.stringify(updated));
    } catch {}
    broadcastSync('ORDERS_UPDATED', updated);
  };

  // Price & Cost update handler: supports individual item/size update or whole product
  const handleUpdatePrice = (
    productId: string,
    variantKey: string | null,
    size: string | null,
    newSellingPriceKhr: number,
    newBoughtPriceKhr?: number
  ) => {
    const priceKhr = Math.max(0, newSellingPriceKhr);
    const priceUsd = Math.round((priceKhr / 4100) * 100) / 100;
    const costKhr = typeof newBoughtPriceKhr === 'number' ? Math.max(0, newBoughtPriceKhr) : undefined;
    const costUsd = typeof costKhr === 'number' ? Math.round((costKhr / 4100) * 100) / 100 : undefined;

    const updated = products.map((p) => {
      if (p.id !== productId) return p;

      // 1. If targeting specific size of Sport Uniform variant
      if (size && p.isVariantGroup && p.variants && variantKey) {
        const vKey = variantKey as 'blue' | 'orange' | 'green';
        const targetVariant = p.variants[vKey];
        if (!targetVariant) return p;

        const updatedSizes = targetVariant.sizes.map((s) => {
          if (s.size !== size) return s;
          return {
            ...s,
            priceKhr,
            priceUsd,
            ...(typeof costKhr === 'number' ? { costKhr, costUsd } : {}),
          };
        });

        return {
          ...p,
          variants: {
            ...p.variants,
            [vKey]: { ...targetVariant, sizes: updatedSizes },
          },
        };
      }

      // 2. If targeting specific size of a standard product (or sneakers / ID set)
      if (size && p.sizes) {
        const updatedSizes = p.sizes.map((s) => {
          if (s.size !== size) return s;
          return {
            ...s,
            priceKhr,
            priceUsd,
            ...(typeof costKhr === 'number' ? { costKhr, costUsd } : {}),
          };
        });
        return { ...p, sizes: updatedSizes };
      }

      // 3. If updating base product (when size is null)
      return {
        ...p,
        priceKhr,
        priceUsd,
        costKhr: typeof costKhr === 'number' ? costKhr : p.costKhr,
        costUsd: typeof costUsd === 'number' ? costUsd : p.costUsd,
      };
    });

    saveProducts(updated);
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
    saveOrders(updatedOrders);

    // Sync POS order with server
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch((err) => console.warn('Sync POS order to /api/orders failed:', err));

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
    saveOrders(updated);

    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: newStatus }),
    }).catch((err) => console.warn('Failed to update order status on server:', err));
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
            onUpdatePrice={handleUpdatePrice}
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
