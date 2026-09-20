import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { BASE_PRODUCTS } from '@/lib/catalog';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Product } from '@/types';

const dataDir = path.join(process.cwd(), 'data');
const productsFilePath = path.join(dataDir, 'products.json');

function getStoredProducts(): Product[] {
  try {
    if (fs.existsSync(productsFilePath)) {
      const content = fs.readFileSync(productsFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const savedMap = new Map(parsed.map((p: Product) => [p.id, p]));
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
      }
    }
  } catch (err) {
    console.error('Error reading stored products:', err);
  }
  return BASE_PRODUCTS;
}

function saveStoredProducts(products: Product[]) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stored products:', err);
  }
}

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)');

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, data });
      }
    }

    const data = getStoredProducts();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      saveStoredProducts(body);
      return NextResponse.json({ success: true, message: 'Inventory updated successfully', data: body });
    }
    return NextResponse.json({ success: false, error: 'Expected array of products' }, { status: 400 });
  } catch (error) {
    console.error('Error saving inventory:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { productId, variantKey, size, stock, priceKhr, costKhr } = await req.json();
    const current = getStoredProducts();

    const updated = current.map((p) => {
      if (p.id !== productId) return p;

      // If specific size is targeted
      if (size) {
        if (p.isVariantGroup && p.variants && variantKey) {
          const vKey = variantKey as 'blue' | 'orange' | 'green';
          const targetVariant = p.variants[vKey];
          if (targetVariant) {
            const updatedSizes = targetVariant.sizes.map((s) => {
              if (s.size !== size) return s;
              return {
                ...s,
                ...(typeof stock === 'number' ? { stock } : {}),
                ...(typeof priceKhr === 'number' ? { priceKhr, priceUsd: Math.round((priceKhr / 4100) * 100) / 100 } : {}),
                ...(typeof costKhr === 'number' ? { costKhr, costUsd: Math.round((costKhr / 4100) * 100) / 100 } : {}),
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
        }

        if (p.sizes) {
          const updatedSizes = p.sizes.map((s) => {
            if (s.size !== size) return s;
            return {
              ...s,
              ...(typeof stock === 'number' ? { stock } : {}),
              ...(typeof priceKhr === 'number' ? { priceKhr, priceUsd: Math.round((priceKhr / 4100) * 100) / 100 } : {}),
              ...(typeof costKhr === 'number' ? { costKhr, costUsd: Math.round((costKhr / 4100) * 100) / 100 } : {}),
            };
          });
          return { ...p, sizes: updatedSizes };
        }
      }

      // If whole product base is targeted (size is null/undefined)
      let updatedProduct = { ...p };
      if (typeof priceKhr === 'number') {
        updatedProduct.priceKhr = priceKhr;
        updatedProduct.priceUsd = Math.round((priceKhr / 4100) * 100) / 100;
      }
      if (typeof costKhr === 'number') {
        updatedProduct.costKhr = costKhr;
        updatedProduct.costUsd = Math.round((costKhr / 4100) * 100) / 100;
      }
      return updatedProduct;
    });

    saveStoredProducts(updated);
    return NextResponse.json({ success: true, message: 'Item updated', data: updated });
  } catch (error) {
    console.error('Error updating stock/price:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
