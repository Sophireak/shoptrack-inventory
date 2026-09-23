import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Order } from '@/types';

export const dynamic = 'force-dynamic';

const dataDir = path.join(process.cwd(), 'data');
const ordersFilePath = path.join(dataDir, 'orders.json');

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

function saveStoredOrders(orders: Order[]) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing stored orders:', err);
  }
}

async function markOrderCompleted(orderId: string): Promise<Order | null> {
  const orders = getStoredOrders();
  const target = orders.find((o) => o.orderId === orderId);
  if (!target) return null;

  const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: 'completed' as const } : o));
  saveStoredOrders(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').update({ status: 'completed' }).eq('order_number', orderId);
    } catch (e) {
      console.warn('Supabase status update fallback:', e);
    }
  }

  return { ...target, status: 'completed' };
}

// 1. GET /api/orders/confirm?orderId=CS-1234 (Used by Telegram inline link / button)
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');

  if (!orderId) {
    return new NextResponse('Missing orderId parameter', { status: 400 });
  }

  const updatedOrder = await markOrderCompleted(orderId);

  const html = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>បញ្ជាក់ការទូទាត់ជោគជ័យ - #${orderId}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hanuman', sans-serif;
      background-color: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 16px;
    }
    .card {
      background: white;
      max-width: 440px;
      width: 100%;
      padding: 32px 24px;
      border-radius: 24px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .badge-icon {
      width: 64px;
      height: 64px;
      background: #dcfce7;
      color: #16a34a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 32px;
    }
    h1 {
      font-size: 20px;
      color: #0f172a;
      margin: 0 0 8px;
    }
    p {
      color: #64748b;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 20px;
    }
    .order-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      padding: 14px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .order-id {
      font-weight: bold;
      color: #002f49;
      font-family: monospace;
      font-size: 16px;
    }
    .status-tag {
      display: inline-block;
      background: #16a34a;
      color: white;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 6px;
    }
    .note {
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge-icon">✓</div>
    <h1>ការទូទាត់ត្រូវបានបញ្ជាក់ជោគជ័យ!</h1>
    <p>ការកុម្ម៉ង់លេខ #${orderId} ត្រូវបានសម្គាល់ថាបានបង់ប្រាក់រួចរាល់។ អេក្រង់អតិថិជនបានលោតវិក្កយបត្រស្វ័យប្រវត្តិហើយ។</p>
    
    <div class="order-box">
      <div class="order-id">#${orderId}</div>
      ${updatedOrder ? `<div>អតិថិជន៖ <strong>${updatedOrder.customerName}</strong> (${updatedOrder.phone})</div>` : ''}
      ${updatedOrder ? `<div>សរុប៖ <strong>${updatedOrder.totalKhr.toLocaleString()} ៛</strong></div>` : ''}
      <div class="status-tag">PAID / COMPLETED</div>
    </div>

    <div class="note">ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម · Telegram Payment Verification</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// 2. POST /api/orders/confirm (Used by Webhooks or programmatic calls)
export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const updatedOrder = await markOrderCompleted(orderId);
    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Order #${orderId} marked as completed`,
      order: updatedOrder,
    });
  } catch (err) {
    console.error('Error confirming order:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
