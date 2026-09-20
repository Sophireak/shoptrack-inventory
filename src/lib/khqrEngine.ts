/**
 * Authentic EMVCo Merchant-Presented Mode (MPM) KHQR Engine for Cambodia
 * Fully compliant with National Bank of Cambodia (NBC) KHQR Specification
 * and ABA Bank (ABAAKHPPXXX) Account Structures.
 */

export interface KhqrPayloadOptions {
  accountNumber: string; // e.g. "008906861"
  bankSwift?: string;     // e.g. "abaakhppxxx@abaa"
  bankName?: string;      // e.g. "ABA Bank"
  merchantName: string;   // e.g. "SOVATKANHCHANA SENG"
  merchantCity?: string;  // e.g. "Phnom Penh"
  currency?: 'KHR' | 'USD';
  amount?: number;        // e.g. 28000
  billNumber?: string;    // e.g. "CS-1234"
  storeLabel?: string;    // e.g. "Chea Sim Primary Store"
  expirationMinutes?: number; // e.g. 1
}

/**
 * Standard CRC-16/CCITT-FALSE calculation
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
export function crc16Ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formats a single EMVCo TLV (Tag-Length-Value) element
 */
function emvTag(id: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Generates an official EMVCo KHQR String with dynamic or static pricing
 * and mandatory Tag 99 timestamp (Creation & Expiration) for dynamic QR.
 */
export function generateEmvcoKhqr(options: KhqrPayloadOptions): string {
  const account = (options.accountNumber || '008906861').replace(/\s+/g, '');
  const bankSwift = options.bankSwift || 'abaakhppxxx@abaa';
  const bankName = options.bankName || 'ABA Bank';
  const merchantName = (options.merchantName || 'SOVATKANHCHANA SENG').toUpperCase();
  const merchantCity = options.merchantCity || 'Phnom Penh';
  const isKhr = (options.currency || 'KHR') === 'KHR';
  const currencyCode = isKhr ? '116' : '840';

  // Tag 29: Merchant Account Information (Bakong / ABA)
  const sub29 = emvTag('00', bankSwift) + emvTag('01', account) + emvTag('02', bankName);
  const tag29 = emvTag('29', sub29);

  // Tag 62: Additional Data Template (Bill Number & Store Label)
  let sub62 = '';
  if (options.billNumber) {
    sub62 += emvTag('01', options.billNumber);
  }
  if (options.storeLabel) {
    sub62 += emvTag('03', options.storeLabel);
  }
  const tag62 = sub62 ? emvTag('62', sub62) : '';

  // Tag 54: Amount & Tag 99: Timestamps (Mandatory for Dynamic KHQR)
  let tag54 = '';
  let tag99 = '';
  const isDynamic = typeof options.amount === 'number' && options.amount > 0;

  if (isDynamic) {
    // Amount formatting: Integer for KHR, 2 decimals for USD
    const formattedAmount = isKhr ? String(Math.round(options.amount!)) : options.amount!.toFixed(2);
    tag54 = emvTag('54', formattedAmount);

    // Tag 99: Creation and Expiration Timestamps (in milliseconds)
    const now = Date.now();
    const expireDurationMs = Math.max(1, options.expirationMinutes || 1) * 60 * 1000;
    const expireTimestamp = now + expireDurationMs;

    const sub99 = emvTag('00', String(now)) + emvTag('01', String(expireTimestamp));
    tag99 = emvTag('99', sub99);
  }

  // Initiation Method: 12 for Dynamic (with amount), 11 for Static
  const initiationMethod = isDynamic ? '12' : '11';

  // Build Payload up to Tag 63 (CRC)
  const rawPayload =
    emvTag('00', '01') +
    emvTag('01', initiationMethod) +
    tag29 +
    emvTag('52', '5999') +
    emvTag('53', currencyCode) +
    tag54 +
    emvTag('58', 'KH') +
    emvTag('59', merchantName) +
    emvTag('60', merchantCity) +
    tag62 +
    tag99 +
    '6304';

  const checksum = crc16Ccitt(rawPayload);
  return rawPayload + checksum;
}
