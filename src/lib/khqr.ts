export function generateKhqrQrUrl(bakongId: string, amountKhr: number, orderId: string): string {
  const cleanId = bakongId.trim() || 'cheasim_primary@acleda';
  // Standard format for mock/test KHQR display using qrserver
  const qrText = `bakong://pay?id=${encodeURIComponent(cleanId)}&amount=${amountKhr}&currency=KHR&memo=${encodeURIComponent(orderId)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}&color=1e293b`;
}
