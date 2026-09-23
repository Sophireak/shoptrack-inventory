import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Order } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { markOrderCompleted } from '@/lib/telegram';

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

    const updated = await markOrderCompleted(target.orderId);

    return NextResponse.json({
      success: true,
      message: `Payment confirmed for order #${target.orderId}`,
      orderId: target.orderId,
      status: 'completed',
      order: updated,
    });
  } catch (err) {
    console.error('Bakong webhook error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
