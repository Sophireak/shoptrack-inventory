// Vercel Serverless Function: /api/orders
// Handles School Uniform Orders & Dispatches Telegram Notifications

const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      orderId,
      customerName,
      studentName,
      studentGrade,
      phone,
      telegram = '',
      pickupMethod = 'On-Campus Booth Pickup (ទទួលនៅបញ្ជរក្នុងសាលា)',
      paymentMethod = 'KHQR Bakong',
      items = [],
      totalKhr = 0,
      totalUsd = 0,
      notes = ''
    } = req.body || {};

    if (!customerName || !phone || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required order fields (customerName, phone, or items).'
      });
    }

    const assignedId = orderId || `CS-${Math.floor(1000 + Math.random() * 9000)}`;
    const phnomPenhTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' });

    // Format item list for Telegram
    let itemsText = '';
    items.forEach((item, index) => {
      const sizeTag = item.size ? ` [ទំហំ/Size: ${item.size}]` : '';
      itemsText += `  ${index + 1}. <b>${escapeHtml(item.nameKh || item.name)}</b>${escapeHtml(sizeTag)} x ${item.qty} = <b>${(item.price * item.qty).toLocaleString()} ៛</b>\n`;
    });

    const isPickup = pickupMethod.toLowerCase().includes('campus') || pickupMethod.toLowerCase().includes('បញ្ជរ') || pickupMethod.toLowerCase().includes('pickup');
    const pickupBadge = isPickup ? '🏫 <b>ទទួលនៅបញ្ជរក្នុងសាលា (On-Campus Booth)</b>' : '🛵 <b>ដឹកជញ្ជូនដល់ផ្ទះ (Delivery)</b>';

    const tgMessage = 
      `🎒 <b>ការបញ្ជាទិញឯកសណ្ឋានថ្មី / NEW UNIFORM ORDER</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🆔 <b>លេខកូដវិក្កយបត្រ (Order ID):</b> <code>${escapeHtml(assignedId)}</code>\n` +
      `🏫 <b>សាលារៀន:</b> បឋមសិក្សា សម្តេចជាស៊ីម\n` +
      `📍 <b>ទីតាំងបញ្ជរ:</b> ខាងក្នុងបរិវេណសាលា (Inside Campus)\n\n` +
      `👨‍👩‍👧 <b>អាណាព្យាបាល:</b> ${escapeHtml(customerName)}\n` +
      `📞 <b>លេខទូរស័ព្ទ:</b> <code>${escapeHtml(phone)}</code>\n` +
      (studentName ? `👦👧 <b>ឈ្មោះសិស្ស:</b> ${escapeHtml(studentName)} (${escapeHtml(studentGrade || 'ទូទៅ')})\n` : '') +
      (telegram ? `✈️ <b>Telegram:</b> @${escapeHtml(telegram.replace('@', ''))}\n` : '') +
      `📦 <b>វិធីសាស្រ្តទទួល:</b> ${pickupBadge}\n` +
      `💳 <b>ការទូទាត់:</b> <b>${escapeHtml(paymentMethod)}</b>\n\n` +
      `📋 <b>មុខទំនិញដែលបានកុម្ម៉ង់ (Ordered Items):</b>\n` +
      `${itemsText}\n` +
      `💰 <b>សរុប (Total):</b> <b>${Number(totalKhr).toLocaleString()} ៛</b> (~$${Number(totalUsd).toFixed(2)})\n` +
      (notes ? `📝 <b>សម្គាល់:</b> <i>${escapeHtml(notes)}</i>\n` : '') +
      `⏱ <b>កាលបរិច្ឆេទ:</b> ${phnomPenhTime}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👉 <i>សូមរៀបចំទំនិញទុកជូននៅបញ្ជរក្នុងសាលា!</i>`;

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8407260653:AAF4Ys0ZLGro9oCAr_wZgXkMpwnG8JkrcE0';
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1004328071470';

    try {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, tgMessage);
    } catch (tgError) {
      console.error('Telegram dispatch error:', tgError.message);
    }

    const orderRecord = {
      orderId: assignedId,
      customerName,
      studentName,
      studentGrade,
      phone,
      telegram,
      pickupMethod,
      paymentMethod,
      items,
      totalKhr,
      totalUsd,
      notes,
      status: 'pending_pickup',
      createdAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      orderId: assignedId,
      message: 'Order processed successfully and shop staff notified.',
      data: orderRecord
    });

  } catch (error) {
    console.error('Order API error:', error);
    return res.status(500).json({ error: 'Internal server error processing order.' });
  }
};

function sendTelegramMessage(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 6000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Telegram API responded with HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Telegram request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
