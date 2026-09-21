import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { StoreSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/catalog';

const dataDir = path.join(process.cwd(), 'data');
const settingsFilePath = path.join(dataDir, 'settings.json');

function getStoredSettings(): StoreSettings {
  try {
    let settings = { ...DEFAULT_SETTINGS };
    if (fs.existsSync(settingsFilePath)) {
      const content = fs.readFileSync(settingsFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      settings = { ...settings, ...parsed };
    }
    // Environment variable overrides
    if (process.env.TELEGRAM_BOT_TOKEN) {
      settings.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    }
    if (process.env.TELEGRAM_CHAT_ID) {
      settings.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    }
    if (process.env.BAKONG_AUTH_TOKEN) {
      settings.bakongAuthToken = process.env.BAKONG_AUTH_TOKEN;
    }
    return settings;
  } catch (err) {
    console.error('Error reading stored settings:', err);
    return DEFAULT_SETTINGS;
  }
}

function saveStoredSettings(settings: StoreSettings) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving stored settings:', err);
  }
}

export async function GET() {
  try {
    const settings = getStoredSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    console.error('Failed to get settings:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: StoreSettings = await req.json();
    if (!body) {
      return NextResponse.json({ success: false, error: 'Settings body required' }, { status: 400 });
    }

    const current = getStoredSettings();
    const updated: StoreSettings = { ...current, ...body };
    saveStoredSettings(updated);

    return NextResponse.json({ success: true, message: 'Settings saved successfully', data: updated });
  } catch (err) {
    console.error('Failed to save settings:', err);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
