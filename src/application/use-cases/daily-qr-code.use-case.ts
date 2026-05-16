import { Inject, Injectable } from '@nestjs/common';
import type { QrCodeRecord } from '../../domain/entities/qr-code.entity';
import {
  NOW_PROVIDER,
  QR_CODE_REPOSITORY,
  TOKEN_GENERATOR,
  type NowProvider,
  type QrCodeRepository,
  type TokenGenerator
} from '../../domain/ports/qr-code.repository';

export interface GetDailyQrCodeCommand {
  clientId: string;
  businessId: string;
  programId?: string;
}

@Injectable()
export class DailyQrCodeUseCase {
  private readonly maxAttempts = Number(process.env.QR_TOKEN_MAX_ATTEMPTS ?? 10);

  constructor(
    @Inject(QR_CODE_REPOSITORY)
    private readonly repository: QrCodeRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(NOW_PROVIDER)
    private readonly nowProvider: NowProvider
  ) {}

  async execute(command: GetDailyQrCodeCommand): Promise<QrCodeRecord> {
    this.assertCommand(command);

    const now = this.nowProvider();
    const dailyKey = createDailyKey(command, now);
    const ttlSeconds = secondsUntilEndOfDay(now);
    const existingToken = await this.repository.findDailyToken(dailyKey);

    if (existingToken) {
      const existingRecord = await this.repository.findByToken(existingToken);

      if (existingRecord) {
        return existingRecord;
      }
    }

    const qrToken = await this.createUniqueToken();
    const record: QrCodeRecord = {
      qrToken,
      clientId: command.clientId,
      businessId: command.businessId,
      programId: command.programId,
      createdAt: now.toISOString(),
      expiresAt: endOfDay(now).toISOString()
    };

    await this.repository.save(record, ttlSeconds);
    await this.repository.saveDailyToken(dailyKey, qrToken, ttlSeconds);

    return record;
  }

  private async createUniqueToken() {
    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      const qrToken = this.tokenGenerator();
      const existing = await this.repository.findByToken(qrToken);

      if (!existing) {
        return qrToken;
      }
    }

    throw new Error('Unable to generate unique QR token');
  }

  private assertCommand(command: GetDailyQrCodeCommand) {
    if (!command.clientId?.trim()) {
      throw new Error('clientId is required');
    }

    if (!command.businessId?.trim()) {
      throw new Error('businessId is required');
    }
  }
}

export function createDailyKey(command: GetDailyQrCodeCommand, date: Date) {
  const day = date.toISOString().slice(0, 10);
  const program = command.programId ?? 'default';

  return `qr:daily:${command.clientId}:${command.businessId}:${program}:${day}`;
}

export function secondsUntilEndOfDay(date: Date) {
  const diff = endOfDay(date).getTime() - date.getTime();

  return Math.max(1, Math.ceil(diff / 1000));
}

function endOfDay(date: Date) {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return end;
}
