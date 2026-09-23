import fs from 'fs';
import path from 'path';
import { Order } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const dataDir = path.join(process.cwd(), 'data');
const ordersFilePath = path.join(dataDir, 'orders.json');
const offsetFilePath = path.join(dataDir, 'telegram_offset.json');

let isPollingActive = false;
let memoryOffset: number | null = null;

function getStoredTokenAndChatId(): { token?: string; chatId?: string } {
  let token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    try {
      const settingsPath = path.join(dataDir, 'settings.json');
      if (fs.existsSync(settingsPath)) {
        const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        if (!token && parsed.telegramBotToken) token = parsed.telegramBotToken;
        if (!chatId && parsed.telegramChatId) chatId = parsed.telegramChatId;
      }
    } catch {}
  }
  return { token, chatId };
}

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

export async function markOrderCompleted(orderId: string): Promise<Order | null> {
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

function getTelegramOffset(): number {
  if (memoryOffset !== null) return memoryOffset;
  try {
    if (fs.existsSync(offsetFilePath)) {
      const content = fs.readFileSync(offsetFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (typeof parsed?.offset === 'number') {
        memoryOffset = parsed.offset;
        return parsed.offset;
      }
    }
  } catch {}
  return 0;
}

function saveTelegramOffset(offset: number) {
  memoryOffset = offset;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(offsetFilePath, JSON.stringify({ offset, updatedAt: new Date().toISOString() }), 'utf-8');
  } catch {}
}

export async function sendTelegramOrderAlert(order: Order): Promise<boolean> {
  const { token, chatId } = getStoredTokenAndChatId();

  if (!token || !chatId) {
    console.warn(
      '⚠️ Telegram Bot Alert skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env.local or Admin Settings.'
    );
    return false;
  }

  const itemsList = order.items
    .map((it, idx) => `${idx + 1}. *${it.nameKh}* (ទំហំ: ${it.size}) x${it.qty} = ${(it.price * it.qty).toLocaleString()} ៛`)
    .join('\n');

  const md5Line = order.md5 ? `🔑 *KHQR MD5:* \`${order.md5}\`\n` : '';

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const confirmWebUrl = `${siteUrl}/api/orders/confirm?orderId=${order.orderId}`;

  const text = `
🔔 *ការកុម្ម៉ង់ថ្មី (New Order)* #\`${order.orderId}\`
---------------------------------------
👤 *អតិថិជន:* ${order.customerName}
📞 *លេខទូរស័ព្ទ:* ${order.phone}
🎒 *សិស្ស:* ${order.studentName || 'មិនបញ្ជាក់'} (${order.studentGrade})
🚚 *ការទទួល:* ${order.pickupMethod}
💳 *វិធីទូទាត់:* ${order.paymentMethod.includes('KHQR') ? '📱 KHQR Bakong (ABA: SOVATKANHCHANA SENG)' : order.paymentMethod}
${md5Line}
📦 *មុខទំនិញ:*
${itemsList}

💰 *សរុប:* *${order.totalKhr.toLocaleString()} ៛* (~$${order.totalUsd.toFixed(2)})
⏰ *កាលបរិច្ឆេទ:* ${new Date(order.createdAt).toLocaleString('km-KH')}
---------------------------------------
ℹ️ *ប្រព័ន្ធកំពុងផ្ទៀងផ្ទាត់ការទូទាត់ Online ដោយស្វ័យប្រវត្តិ... (Auto Online Verification)*
  `.trim();

  try {
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    };

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return res.ok && data?.ok === true;
  } catch (err) {
    console.error('Telegram notification error:', err);
    return false;
  }
}

/**
 * Polls Telegram getUpdates for callback_query from cashier tapping the Confirm button.
 * Marks the order as completed and informs Telegram.
 */
export async function pollTelegramUpdates(): Promise<{ processedCount: number; confirmedOrders: string[] }> {
  if (isPollingActive) {
    return { processedCount: 0, confirmedOrders: [] };
  }

  const { token } = getStoredTokenAndChatId();
  if (!token) {
    return { processedCount: 0, confirmedOrders: [] };
  }

  isPollingActive = true;
  const confirmedOrders: string[] = [];
  let processedCount = 0;

  try {
    const currentOffset = getTelegramOffset();
    const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${currentOffset}&limit=20&timeout=0`;
    const res = await fetch(url, { method: 'GET' });

    if (!res.ok) {
      isPollingActive = false;
      return { processedCount: 0, confirmedOrders: [] };
    }

    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result)) {
      isPollingActive = false;
      return { processedCount: 0, confirmedOrders: [] };
    }

    let nextOffset = currentOffset;

    for (const update of data.result) {
      if (typeof update.update_id === 'number') {
        nextOffset = Math.max(nextOffset, update.update_id + 1);
      }

      // 1. Handle Inline Button Click (callback_query)
      if (update.callback_query) {
        const cq = update.callback_query;
        const cqData: string = cq.data || '';

        if (cqData.startsWith('confirm:')) {
          const orderId = cqData.replace('confirm:', '').trim();
          if (orderId) {
            const completed = await markOrderCompleted(orderId);
            if (completed) {
              confirmedOrders.push(orderId);
              processedCount++;

              // Answer callback query with toast notification
              try {
                await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    callback_query_id: cq.id,
                    text: `✅ បានបញ្ជាក់ការទទួលប្រាក់លេខ #${orderId} ជោគជ័យ! អតិថិជនបានទទួលវិក្កយបត្រហើយ។`,
                    show_alert: false,
                  }),
                });
              } catch {}

              // Update the message inline keyboard to show confirmed status
              if (cq.message?.chat?.id && cq.message?.message_id) {
                try {
                  await fetch(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: cq.message.chat.id,
                      message_id: cq.message.message_id,
                      reply_markup: {
                        inline_keyboard: [
                          [
                            {
                              text: '✅ បានបញ្ជាក់ការទូទាត់រួចរាល់ (Confirmed)',
                              callback_data: 'done',
                            },
                          ],
                        ],
                      },
                    }),
                  });
                } catch {}
              }
            }
          }
        } else if (cqData === 'done') {
          // Already confirmed, just show toast
          try {
            await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: cq.id,
                text: 'ℹ️ ការកុម្ម៉ង់នេះត្រូវបានបញ្ជាក់រួចរាល់ហើយ។',
                show_alert: false,
              }),
            });
          } catch {}
        }
      }

      // 2. Handle Text command e.g. /confirm ORD-xxxx
      if (update.message?.text) {
        const text = update.message.text.trim();
        if (text.startsWith('/confirm ')) {
          const orderId = text.replace('/confirm ', '').trim();
          if (orderId) {
            const completed = await markOrderCompleted(orderId);
            if (completed) {
              confirmedOrders.push(orderId);
              processedCount++;
              try {
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: update.message.chat.id,
                    text: `✅ ការកុម្ម៉ង់លេខ *#${orderId}* ត្រូវបានបញ្ជាក់ការទូទាត់ជោគជ័យ!`,
                    parse_mode: 'Markdown',
                  }),
                });
              } catch {}
            }
          }
        }
      }
    }

    if (nextOffset > currentOffset) {
      saveTelegramOffset(nextOffset);
    }
  } catch (err) {
    console.error('Error polling Telegram updates:', err);
  } finally {
    isPollingActive = false;
  }

  return { processedCount, confirmedOrders };
}
