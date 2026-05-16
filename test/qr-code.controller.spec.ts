import { describe, expect, it, jest } from '@jest/globals';
import { QrCodeController } from '../src/presentation/http/qr-code.controller';
import type { QrCodeRecord } from '../src/domain/entities/qr-code.entity';
import type { DailyQrCodeUseCase } from '../src/application/use-cases/daily-qr-code.use-case';

describe('QrCodeController', () => {
	it('returns token payload and QR image data URL', async () => {
		const record: QrCodeRecord = {
			qrToken: 'daily-token',
			clientId: 'client-001',
			businessId: 'business-001',
			programId: 'program-001',
			createdAt: '2026-05-15T10:00:00.000Z',
			expiresAt: '2026-05-15T23:59:59.999Z',
		};

		const executeMock = jest.fn<() => Promise<QrCodeRecord>>().mockResolvedValue(record);

		const controller = new QrCodeController({
			execute: executeMock,
		} as unknown as DailyQrCodeUseCase);

		const result = await controller.getDailyQrCode('client-001', 'business-001', 'program-001');

		expect(result.qrToken).toBe('daily-token');
		expect(result.qrPayload).toBe('loyalty:qr:daily-token');
		expect(result.qrImageDataUrl).toMatch(/^data:image\/png;base64,/);
		expect(result.expiresAt).toBe(record.expiresAt);
	});
});
