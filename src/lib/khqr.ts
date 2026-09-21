import QRCode from 'qrcode';
import { generateEmvcoKhqr, computeKhqrMd5, KhqrPayloadOptions } from './khqrEngine';

export interface GeneratedKhqrResult {
  qrString: string;
  dataUrl: string;
  md5: string;
}

/**
 * Generates an official, scannable EMVCo KHQR code data URL locally with custom amount and MD5 checksum
 */
export async function generateKhqrDataUrl(options: KhqrPayloadOptions): Promise<GeneratedKhqrResult> {
  const qrString = generateEmvcoKhqr(options);
  const md5 = computeKhqrMd5(qrString);
  const dataUrl = await QRCode.toDataURL(qrString, {
    width: 360,
    margin: 1,
    color: {
      dark: '#002f49', // ABA navy color
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
  return { qrString, dataUrl, md5 };
}

export { generateEmvcoKhqr, computeKhqrMd5 };
export type { KhqrPayloadOptions };

