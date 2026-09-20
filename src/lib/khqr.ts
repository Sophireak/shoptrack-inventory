import QRCode from 'qrcode';
import { generateEmvcoKhqr, KhqrPayloadOptions } from './khqrEngine';

export interface GeneratedKhqrResult {
  qrString: string;
  dataUrl: string;
}

/**
 * Generates an official, scannable EMVCo KHQR code data URL locally with custom amount
 */
export async function generateKhqrDataUrl(options: KhqrPayloadOptions): Promise<GeneratedKhqrResult> {
  const qrString = generateEmvcoKhqr(options);
  const dataUrl = await QRCode.toDataURL(qrString, {
    width: 360,
    margin: 1,
    color: {
      dark: '#002f49', // ABA navy color
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
  return { qrString, dataUrl };
}

export { generateEmvcoKhqr };
export type { KhqrPayloadOptions };
