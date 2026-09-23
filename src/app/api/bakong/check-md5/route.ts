import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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

/**
 * Checks KHQR payment status by MD5 hash
 * If BAKONG_AUTH_TOKEN is provided in .env, connects to NBC Bakong Open API:
 * POST https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5
 */
export async function POST(req: Request) {
  try {
    const { md5, orderId } = await req.json();

    if (!md5 && !orderId) {
      return NextResponse.json({ success: false, error: 'md5 or orderId is required' }, { status: 400 });
    }

    const orders = getStoredOrders();
    const order = orders.find((o) => (md5 && o.md5 === md5) || (orderId && o.orderId === orderId));

    // 1. If Bakong Developer Bearer Token is configured, query NBC Bakong Open API
    let bakongToken = process.env.BAKONG_AUTH_TOKEN;
    if (!bakongToken) {
      try {
        const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
        if (fs.existsSync(settingsPath)) {
          const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
          if (parsed.bakongAuthToken) bakongToken = parsed.bakongAuthToken;
        }
      } catch {}
    }

    if (bakongToken && md5) {
      try {
        const bakongRes = await fetch('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bakongToken}`,
          },
          body: JSON.stringify({ md5 }),
        });

        if (bakongRes.ok) {
          const bakongData = await bakongRes.json();
          // NBC Bakong responseCode: 0 means transaction received and settled
          if (bakongData.responseCode === 0) {
            if (order) {
              const updated = orders.map((o) => (o.orderId === order.orderId ? { ...o, status: 'completed' as const } : o));
              try {
                fs.writeFileSync(ordersFilePath, JSON.stringify(updated, null, 2), 'utf-8');
              } catch {}
            }
            return NextResponse.json({
              success: true,
              paid: true,
              source: 'bakong_api',
              data: bakongData.data,
            });
          }
        }
      } catch (err) {
        console.warn('Bakong API request failed:', err);
      }
    }

    // 2. Check local order status
    if (order) {
      const isPaid = order.status === 'completed' || order.status === 'confirmed';
      return NextResponse.json({
        success: true,
        paid: isPaid,
        orderId: order.orderId,
        status: order.status,
        md5: order.md5,
        source: 'local_store',
      });
    }

    return NextResponse.json({
      success: true,
      paid: false,
      message: 'Pending payment or transaction not yet registered',
    });
  } catch (err) {
    console.error('Check MD5 error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
