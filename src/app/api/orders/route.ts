import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendTelegramOrderAlert } from '@/lib/telegram';
import { Order } from '@/types';

export async function POST(req: Request) {
  try {
    const orderData: Order = await req.json();

    if (!orderData || !orderData.orderId) {
      return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 });
    }

    // 1. If Supabase is configured, insert into PostgreSQL
    if (isSupabaseConfigured && supabase) {
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
        // Insert order items
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
    }

    // 2. Dispatch Telegram Bot alert
    await sendTelegramOrderAlert(orderData);

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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
