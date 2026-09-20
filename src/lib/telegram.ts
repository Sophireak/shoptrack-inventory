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

  const text = `
🔔 *ការកុម្ម៉ង់ថ្មី (New Order)* #\`${order.orderId}\`
---------------------------------------
👤 *អតិថិជន:* ${order.customerName}
📞 *លេខទូរស័ព្ទ:* ${order.phone}
🎒 *សិស្ស:* ${order.studentName || 'មិនបញ្ជាក់'} (${order.studentGrade})
🚚 *ការទទួល:* ${order.pickupMethod}
💳 *វិធីទូទាត់:* ${order.paymentMethod.includes('KHQR') ? '📱 KHQR Bakong (ABA: SOVATKANHCHANA SENG)' : order.paymentMethod}

📦 *មុខទំនិញ:*
${itemsList}

💰 *សរុប:* *${order.totalKhr.toLocaleString()} ៛* (~$${order.totalUsd.toFixed(2)})
⏰ *កាលបរិច្ឆេទ:* ${new Date(order.createdAt).toLocaleString('km-KH')}
---------------------------------------
🏫 *ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម*
  `.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('Telegram notification error:', err);
    return false;
  }
}
