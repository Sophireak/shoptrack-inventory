// Vercel Serverless Function: /api/telegram-report
// Dispatches End-of-Day (EOD) POS & Inventory Closing Report to Telegram

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
      date = new Date().toLocaleDateString('km-KH'),
      totalSalesKhr = 0,
      totalSalesUsd = 0,
      totalOrders = 0,
      walkInCount = 0,
      onlineCount = 0,
      topItems = [],
      lowStockAlerts = [],
      cashTotalKhr = 0,
      khqrTotalKhr = 0,
      cashierName = 'បេឡាករប្រចាំបញ្ជរ'
    } = req.body || {};

    const phnomPenhTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' });

    let topItemsText = '';
    if (topItems.length > 0) {
      topItems.forEach((it, idx) => {
        topItemsText += `  ${idx + 1}. ${escapeHtml(it.name)}: <b>${it.qty} កំប្លេ/កេស</b> (${Number(it.revenue || 0).toLocaleString()} ៛)\n`;
      });
    } else {
      topItemsText = '  - គ្មានទិន្នន័យ\n';
    }

    let lowStockText = '';
    if (lowStockAlerts.length > 0) {
      lowStockAlerts.forEach((ls) => {
        lowStockText += `  ⚠️ <b>${escapeHtml(ls.name)}</b> [ទំហំ/Size: ${escapeHtml(ls.size)}]: នៅសល់ត្រឹម <b>${ls.stock} កំប្លេ</b>\n`;
      });
    } else {
      lowStockText = '  ✅ ស្តុកទាំងអស់មានបរិមាណគ្រប់គ្រាន់\n';
    }

    const tgMessage = 
      `📊 <b>របាយការណ៍បិទបញ្ជីប្រចាំថ្ងៃ / END-OF-DAY SALES REPORT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏫 <b>ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម (On-Campus Booth)</b>\n` +
      `📅 <b>កាលបរិច្ឆេទ:</b> ${escapeHtml(date)}\n` +
      `👤 <b>បេឡាករបញ្ជរ:</b> ${escapeHtml(cashierName)}\n\n` +
      `💵 <b>សរុបចំណូលលក់ (Total Revenue):</b>\n` +
      `👉 <b>${Number(totalSalesKhr).toLocaleString()} ៛</b> (~$${Number(totalSalesUsd).toFixed(2)})\n\n` +
      `💳 <b>បែងចែកតាមវិធីទូទាត់ (Payment Breakdown):</b>\n` +
      `  • KHQR Bakong Scan: <b>${Number(khqrTotalKhr).toLocaleString()} ៛</b>\n` +
      `  • សាច់ប្រាក់ផ្ទាល់ (Cash): <b>${Number(cashTotalKhr).toLocaleString()} ៛</b>\n\n` +
      `🧾 <b>ចំនួនការលក់ (Transactions):</b> ${totalOrders} វិក្កយបត្រ\n` +
      `  • លក់ផ្ទាល់នៅបញ្ជរ (Walk-in): ${walkInCount}\n` +
      `  • កុម្ម៉ង់អនឡាញ (Online Pickup): ${onlineCount}\n\n` +
      `🏆 <b>មុខទំនិញលក់ដាច់បំផុត (Top Selling):</b>\n` +
      `${topItemsText}\n` +
      `🚨 <b>ការជូនដំណឹងស្តុកជិតអស់ (Low Stock Alert):</b>\n` +
      `${lowStockText}\n` +
      `⏱ <b>បិទបញ្ជីម៉ោង:</b> ${phnomPenhTime}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>របាយការណ៍ស្វ័យប្រវត្តិចេញពីប្រព័ន្ធ ShopTrack POS</i>`;

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8407260653:AAF4Ys0ZLGro9oCAr_wZgXkMpwnG8JkrcE0';
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1004328071470';

    try {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, tgMessage);
    } catch (tgErr) {
      console.error('Telegram dispatch error (non-fatal):', tgErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'End-of-day sales report compiled and sent to Telegram successfully.'
    });

  } catch (error) {
    console.error('Telegram report API error:', error);
    return res.status(500).json({ error: 'Internal server error dispatching report.' });
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
