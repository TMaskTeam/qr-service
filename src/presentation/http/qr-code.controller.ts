import {
	Controller,
	Get,
	Query,
	HttpCode,
	HttpStatus,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { DailyQrCodeUseCase } from '../../application/use-cases/daily-qr-code.use-case';
import {
	ScanQrCodeUseCase,
	QrCodeNotFoundException,
	QrCodeExpiredException,
} from '../../application/use-cases/scan-qr-code.use-case';
import { QrCodeResponse } from '../../application/dto/qr-code.response';
import { toDataURL } from 'qrcode';
import { createQrPayload } from '../../domain/entities/qr-code.entity';

@Controller('qr-codes')
export class QrCodeController {
	constructor(
		private readonly dailyQrCodeUseCase: DailyQrCodeUseCase,
		private readonly scanQrCodeUseCase: ScanQrCodeUseCase,
	) {}

	@Get('daily')
	async getDailyQrCode(@Query('clientId') clientId: string): Promise<QrCodeResponse> {
		try {
			const record = await this.dailyQrCodeUseCase.execute({ clientId });
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

	@Get('scan')
	@HttpCode(HttpStatus.OK)
	async scan(@Query('token') token: string) {
		try {
			const result = await this.scanQrCodeUseCase.execute({ qrToken: token });
			return result;
		} catch (e) {
			if (e instanceof QrCodeNotFoundException || e instanceof QrCodeExpiredException) {
				throw new NotFoundException(e.message);
			}
			throw new BadRequestException((e as Error).message);
		}
	}
}
