import { Module } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DailyQrCodeUseCase } from './application/use-cases/daily-qr-code.use-case';
import { HealthController } from './presentation/http/health.controller';
import { QrCodeController } from './presentation/http/qr-code.controller';
import { RedisQrCodeRepository } from './infrastructure/redis/redis-qr-code.repository';
import { RedisClientService } from './infrastructure/redis/redis-client.service';
import {
	NOW_PROVIDER,
	QR_CODE_REPOSITORY,
	TOKEN_GENERATOR,
} from './domain/ports/qr-code.repository';
import { ScanQrCodeUseCase } from './application/use-cases/scan-qr-code.use-case';

@Module({
	controllers: [HealthController, QrCodeController],
	providers: [
		ScanQrCodeUseCase,
		RedisClientService,
		DailyQrCodeUseCase,
		{
			provide: QR_CODE_REPOSITORY,
			useClass: RedisQrCodeRepository,
		},
		{
			provide: TOKEN_GENERATOR,
			useValue: () => randomUUID().replaceAll('-', ''),
		},
		{
			provide: NOW_PROVIDER,
			useValue: () => new Date(),
		},
	],
})
export class AppModule {}
