import type { QrCodeRecord } from '../entities/qr-code.entity';

export const QR_CODE_REPOSITORY = Symbol('QR_CODE_REPOSITORY');
export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');
export const NOW_PROVIDER = Symbol('NOW_PROVIDER');

export type TokenGenerator = () => string;
export type NowProvider = () => Date;

export interface QrCodeRepository {
  findByToken(qrToken: string): Promise<QrCodeRecord | null>;
  findDailyToken(dailyKey: string): Promise<string | null>;
  save(record: QrCodeRecord, ttlSeconds: number): Promise<void>;
  saveDailyToken(dailyKey: string, qrToken: string, ttlSeconds: number): Promise<void>;
}
