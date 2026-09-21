import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { botToken, chatId } = await req.json();

    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: 'សូមបញ្ចូលទាំង Bot Token និង Chat ID (Both Bot Token and Chat ID are required)' },
        { status: 400 }
      );
    }

    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();

    const testMessage = `
🎉 *តេស្តការតភ្ជាប់ Telegram Bot ជោគជ័យ!*
---------------------------------------
🏫 *ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម*
🤖 Bot ត្រូវបានតភ្ជាប់ជាមួយប្រព័ន្ធលក់ និងស្តុកទំនិញរួចរាល់។
📱 រាល់ពេលមានការកុម្ម៉ង់ទិញថ្មីតាម KHQR ប្រព័ន្ធនឹងផ្ញើដំណឹងមកកាន់ទីនេះភ្លាមៗ!
⏰ ពេលវេលា៖ ${new Date().toLocaleString('km-KH')}
    `.trim();

    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: testMessage,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.description || 'Failed to send message to Telegram',
          details: data,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'សារតេស្តត្រូវបានផ្ញើទៅកាន់ Telegram ជោគជ័យ!',
      result: data.result,
    });
  } catch (err: any) {
    console.error('Telegram test error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
