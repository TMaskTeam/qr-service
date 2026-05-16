export interface QrCodeRecord {
  qrToken: string;
  clientId: string;
  businessId: string;
  programId?: string;
  createdAt: string;
  expiresAt: string;
}

export function createQrPayload(qrToken: string) {
  return `loyalty:qr:${qrToken}`;
}
