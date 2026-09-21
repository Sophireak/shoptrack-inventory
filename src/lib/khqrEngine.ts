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

/**
 * Computes standard 32-character MD5 hash of KHQR string (compliant with NBC Bakong check_transaction_by_md5)
 */
export function computeKhqrMd5(str: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  const utf8Str = unescape(encodeURIComponent(str));
  const n = utf8Str.length;
  const words: number[] = [];
  for (let i = 0; i < n; i++) {
    words[i >> 2] = (words[i >> 2] || 0) | ((utf8Str.charCodeAt(i) & 0xff) << ((i % 4) * 8));
  }
  words[n >> 2] = (words[n >> 2] || 0) | (0x80 << ((n % 4) * 8));
  words[(((n + 8) >> 6) << 4) + 14] = n * 8;
  words[(((n + 8) >> 6) << 4) + 15] = 0;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < words.length; i += 16) {
    const aa = a, bb = b, cc = c, dd = d;
    a = FF(a, b, c, d, words[i + 0] || 0, 7, -680876936);
    d = FF(d, a, b, c, words[i + 1] || 0, 12, -389564586);
    c = FF(c, d, a, b, words[i + 2] || 0, 17, 606105819);
    b = FF(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
    a = FF(a, b, c, d, words[i + 4] || 0, 7, -176418897);
    d = FF(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
    c = FF(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
    b = FF(b, c, d, a, words[i + 7] || 0, 22, -45705983);
    a = FF(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
    d = FF(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
    c = FF(c, d, a, b, words[i + 10] || 0, 17, -42063);
    b = FF(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
    a = FF(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
    d = FF(d, a, b, c, words[i + 13] || 0, 12, -40341101);
    c = FF(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
    b = FF(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

    a = GG(a, b, c, d, words[i + 1] || 0, 5, -165796510);
    d = GG(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
    c = GG(c, d, a, b, words[i + 11] || 0, 14, 643717713);
    b = GG(b, c, d, a, words[i + 0] || 0, 20, -373897302);
    a = GG(a, b, c, d, words[i + 5] || 0, 5, -701558691);
    d = GG(d, a, b, c, words[i + 10] || 0, 9, 38016083);
    c = GG(c, d, a, b, words[i + 15] || 0, 14, -660478335);
    b = GG(b, c, d, a, words[i + 4] || 0, 20, -405537848);
    a = GG(a, b, c, d, words[i + 9] || 0, 5, 568446438);
    d = GG(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
    c = GG(c, d, a, b, words[i + 3] || 0, 14, -187363961);
    b = GG(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
    a = GG(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
    d = GG(d, a, b, c, words[i + 2] || 0, 9, -51403784);
    c = GG(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
    b = GG(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

    a = HH(a, b, c, d, words[i + 5] || 0, 4, -378558);
    d = HH(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
    c = HH(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
    b = HH(b, c, d, a, words[i + 14] || 0, 23, -35309556);
    a = HH(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
    d = HH(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
    c = HH(c, d, a, b, words[i + 7] || 0, 16, -155497632);
    b = HH(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
    a = HH(a, b, c, d, words[i + 13] || 0, 4, 681279174);
    d = HH(d, a, b, c, words[i + 0] || 0, 11, -358537222);
    c = HH(c, d, a, b, words[i + 3] || 0, 16, -722521979);
    b = HH(b, c, d, a, words[i + 6] || 0, 23, 76029189);
    a = HH(a, b, c, d, words[i + 9] || 0, 4, -640364487);
    d = HH(d, a, b, c, words[i + 12] || 0, 11, -421815835);
    c = HH(c, d, a, b, words[i + 15] || 0, 16, 530742520);
    b = HH(b, c, d, a, words[i + 2] || 0, 23, -995338651);

    a = II(a, b, c, d, words[i + 0] || 0, 6, -198630844);
    d = II(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
    c = II(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
    b = II(b, c, d, a, words[i + 5] || 0, 21, -57434055);
    a = II(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
    d = II(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
    c = II(c, d, a, b, words[i + 10] || 0, 15, -1051523);
    b = II(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
    a = II(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
    d = II(d, a, b, c, words[i + 15] || 0, 10, -30611744);
    c = II(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
    b = II(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
    a = II(a, b, c, d, words[i + 4] || 0, 6, -145523070);
    d = II(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
    c = II(c, d, a, b, words[i + 2] || 0, 15, 718787259);
    b = II(b, c, d, a, words[i + 9] || 0, 21, -343485551);

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  function toHex(val: number) {
    let hex = '';
    for (let j = 0; j < 4; j++) {
      hex += ((val >> (j * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return hex;
  }
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}
