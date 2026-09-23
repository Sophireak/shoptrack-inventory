import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pollTelegramUpdates } from '@/lib/telegram';
import { Order } from '@/types';

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

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');

    // Check for any pending Telegram button taps
    try {
      await pollTelegramUpdates();
    } catch (pollErr) {
      console.warn('Telegram poll fallback:', pollErr);
    }

    if (!orderId) {
      return NextResponse.json({ success: true, message: 'Telegram polled' });
    }

    const orders = getStoredOrders();
    const order = orders.find((o) => o.orderId === orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const isPaid = order.status === 'completed' || order.status === 'confirmed';

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      paid: isPaid,
    });
  } catch (err) {
    console.error('Check updates error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
