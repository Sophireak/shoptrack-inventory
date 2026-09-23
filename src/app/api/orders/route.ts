import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendTelegramOrderAlert, pollTelegramUpdates } from '@/lib/telegram';
import { generateEmvcoKhqr, computeKhqrMd5 } from '@/lib/khqrEngine';
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

export async function POST(req: Request) {
  try {
    const orderData: Order = await req.json();

    if (!orderData || !orderData.orderId) {
      return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 });
    }

    // Ensure KHQR md5 is populated for KHQR payments
    if (!orderData.md5 && orderData.paymentMethod?.includes('KHQR')) {
      try {
        const qrString = generateEmvcoKhqr({
          accountNumber: '008906861',
          bankSwift: 'abaakhppxxx@abaa',
          bankName: 'ABA Bank',
          merchantName: 'SOVATKANHCHANA SENG',
          currency: 'KHR',
          amount: orderData.totalKhr,
          billNumber: orderData.orderId,
          storeLabel: 'Chea Sim Uniform Store',
          expirationMinutes: 1,
        });
        orderData.qrString = qrString;
        orderData.md5 = computeKhqrMd5(qrString);
      } catch (err) {
        console.warn('Server-side KHQR calculation fallback:', err);
      }
    }

    // 1. If Supabase is configured, insert into PostgreSQL
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: insertedOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderData.orderId,
            customer_name: orderData.customerName,
            phone: orderData.phone,
            student_name: orderData.studentName || null,
            student_grade: orderData.studentGrade,
            pickup_method: orderData.pickupMethod,
            payment_method: orderData.paymentMethod,
            total_khr: orderData.totalKhr,
            total_usd: orderData.totalUsd,
            status: 'pending',
          })
          .select()
          .single();

        if (!orderError && insertedOrder) {
          const itemsToInsert = orderData.items.map((it) => ({
            order_id: insertedOrder.id,
            product_id: it.id || null,
            item_name_kh: it.nameKh,
            size_or_color: it.size,
            unit_price_khr: it.price,
            quantity: it.qty,
            subtotal_khr: it.price * it.qty,
          }));

          await supabase.from('order_items').insert(itemsToInsert);
        }
      } catch (sbErr) {
        console.warn('Supabase insertion error:', sbErr);
      }
    }

    // 2. Persist locally to server data/orders.json
    const existingOrders = getStoredOrders();
    // Prepend new order if not already present
    const isDuplicate = existingOrders.some((o) => o.orderId === orderData.orderId);
    if (!isDuplicate) {
      const updated = [orderData, ...existingOrders];
      saveStoredOrders(updated);
    }

    // 3. Dispatch Telegram Bot alert
    try {
      await sendTelegramOrderAlert(orderData);
    } catch (tgErr) {
      console.warn('Telegram alert error:', tgErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: orderData,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 1. Automatically check if cashier tapped Confirm in Telegram
    try {
      await pollTelegramUpdates();
    } catch (pollErr) {
      console.warn('Telegram poll fallback:', pollErr);
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return NextResponse.json({ success: true, data });
        }
      } catch (sbErr) {
        console.warn('Supabase fetch error:', sbErr);
      }
    }

    const data = getStoredOrders();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'orderId and status required' }, { status: 400 });
    }

    const orders = getStoredOrders();
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status } : o));
    saveStoredOrders(updated);

    return NextResponse.json({ success: true, message: 'Order status updated', data: updated });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
