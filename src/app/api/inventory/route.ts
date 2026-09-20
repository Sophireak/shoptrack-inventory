import { NextResponse } from 'next/server';
import { BASE_PRODUCTS } from '@/lib/catalog';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

    // Fallback to bundled catalog
    return NextResponse.json({ success: true, data: BASE_PRODUCTS });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { productId, size, stock } = await req.json();

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('product_variants')
        .update({ stock_qty: stock })
        .match({ product_id: productId, size_label: size });
    }

    return NextResponse.json({ success: true, message: 'Stock updated' });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
