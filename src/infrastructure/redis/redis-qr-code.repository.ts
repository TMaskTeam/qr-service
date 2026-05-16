import { Injectable } from '@nestjs/common';
import type { QrCodeRecord } from '../../domain/entities/qr-code.entity';
import type { QrCodeRepository } from '../../domain/ports/qr-code.repository';
import { RedisClientService } from './redis-client.service';

@Injectable()
export class RedisQrCodeRepository implements QrCodeRepository {
  constructor(private readonly redisClientService: RedisClientService) {}

  async findByToken(qrToken: string): Promise<QrCodeRecord | null> {
    const value = await this.redisClientService.getClient().get(tokenKey(qrToken));

    if (!value) return null;

    return JSON.parse(value) as QrCodeRecord;
  }

  async findDailyToken(dailyKey: string): Promise<string | null> {
    return this.redisClientService.getClient().get(dailyKey);
  }

  async save(record: QrCodeRecord, ttlSeconds: number): Promise<void> {
    await this.redisClientService
      .getClient()
      .set(tokenKey(record.qrToken), JSON.stringify(record), { EX: ttlSeconds });
  }

  async saveDailyToken(dailyKey: string, qrToken: string, ttlSeconds: number): Promise<void> {
    await this.redisClientService.getClient().set(dailyKey, qrToken, { EX: ttlSeconds });
  }
}

function tokenKey(qrToken: string) {
  return `qr:token:${qrToken}`;
}
