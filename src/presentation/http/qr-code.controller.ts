import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { toDataURL } from 'qrcode';
import type { QrCodeResponse } from '../../application/dto/qr-code.response';
import { DailyQrCodeUseCase } from '../../application/use-cases/daily-qr-code.use-case';
import { createQrPayload } from '../../domain/entities/qr-code.entity';

@Controller('qr-codes')
export class QrCodeController {
	constructor(private readonly dailyQrCodeUseCase: DailyQrCodeUseCase) {}

	@Get('daily')
	async getDailyQrCode(
		@Query('clientId') clientId: string,
		@Query('businessId') businessId: string,
		@Query('programId') programId?: string,
	): Promise<QrCodeResponse> {
		try {
			const record = await this.dailyQrCodeUseCase.execute({ clientId, businessId, programId });
			const qrPayload = createQrPayload(record.qrToken);
			const qrImageDataUrl = await toDataURL(qrPayload, {
				errorCorrectionLevel: 'M',
				margin: 1,
				width: 256,
			});

			return {
				qrToken: record.qrToken,
				qrPayload,
				qrImageDataUrl,
				expiresAt: record.expiresAt,
			};
		} catch (error) {
			throw new BadRequestException(error instanceof Error ? error.message : 'Invalid QR request');
		}
	}
}
