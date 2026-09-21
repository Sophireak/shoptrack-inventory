import { Order } from '@/types';

export async function sendTelegramOrderAlert(order: Order): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return false;
  }

  const itemsList = order.items
    .map((it, idx) => `${idx + 1}. *${it.nameKh}* (ទំហំ: ${it.size}) x${it.qty} = ${(it.price * it.qty).toLocaleString()} ៛`)
    .join('\n');

  const md5Line = order.md5 ? `🔑 *KHQR MD5:* \`${order.md5}\`\n` : '';

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const confirmUrl = `${siteUrl}/api/orders/confirm?orderId=${order.orderId}`;

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
🏫 *ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម*
  `.trim();

  try {
    const payload: {
      chat_id: string;
      text: string;
      parse_mode: string;
      reply_markup?: {
        inline_keyboard: Array<Array<{ text: string; url: string }>>;
      };
    } = {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    };

    if (confirmUrl.startsWith('https://')) {
      payload.reply_markup = {
        inline_keyboard: [
          [
            {
              text: '✅ បញ្ជាក់ថាបានទទួលប្រាក់ (Confirm Payment)',
              url: confirmUrl,
            },
          ],
        ],
      };
    } else {
      payload.text += `\n\n👉 [ចុចទីនេះដើម្បីបញ្ជាក់ការទូទាត់](${confirmUrl})`;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error('Telegram notification error:', err);
    return false;
  }
}
