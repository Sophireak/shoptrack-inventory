import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Order } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

function getStoredOrders(): Order[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const content = fs.readFileSync(ordersFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading stored orders:', err);
  }
  return [];
}

/**
 * Webhook endpoint for ABA PayWay, NBC Bakong, or payment notification relays.
 * Marks the order as completed when a payment notification is received.
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const orderId = payload.orderId || payload.billNumber || payload.order_number;
    const md5 = payload.md5 || payload.hash;

    if (!orderId && !md5) {
      return NextResponse.json({ success: false, error: 'orderId or md5 required' }, { status: 400 });
    }

    const orders = getStoredOrders();
    const target = orders.find((o) => (orderId && o.orderId === orderId) || (md5 && o.md5 === md5));

    if (!target) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updated = orders.map((o) =>
      o.orderId === target.orderId ? { ...o, status: 'completed' as const } : o
    );
    fs.writeFileSync(ordersFilePath, JSON.stringify(updated, null, 2), 'utf-8');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ status: 'completed' }).eq('order_number', target.orderId);
      } catch (e) {
        console.warn('Supabase webhook sync fallback:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment confirmed for order #${target.orderId}`,
      orderId: target.orderId,
      status: 'completed',
    });
  } catch (err) {
    console.error('Bakong webhook error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
