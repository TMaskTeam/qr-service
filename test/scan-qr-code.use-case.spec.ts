import { describe, expect, it, jest } from '@jest/globals';
import {
	ScanQrCodeUseCase,
	QrCodeNotFoundException,
	QrCodeExpiredException,
} from '../src/application/use-cases/scan-qr-code.use-case';
import type { QrCodeRecord } from '../src/domain/entities/qr-code.entity';
import type { QrCodeRepository } from '../src/domain/ports/qr-code.repository';

describe('ScanQrCodeUseCase', () => {
	const makeRecord = (overrides: Partial<QrCodeRecord>): QrCodeRecord => ({
		qrToken: 'test-token',
		clientId: 'c1',
		businessId: 'b1',
		programId: undefined,
		createdAt: new Date().toISOString(),
		expiresAt: new Date(Date.now() + 60_000).toISOString(),
		...overrides,
	});

	const makeRepo = (record: QrCodeRecord | null): Pick<QrCodeRepository, 'findByToken'> => ({
		findByToken: jest.fn<() => Promise<QrCodeRecord | null>>().mockResolvedValue(record),
	});

	it('возвращает данные по валидному токену', async () => {
		const record = makeRecord({ clientId: 'c1', businessId: 'b1', programId: 'p1' });
		const repo = makeRepo(record);
		const useCase = new ScanQrCodeUseCase(repo as QrCodeRepository);

		const result = await useCase.execute({ qrToken: 'valid-token' });

		expect(result.clientId).toBe('c1');
		expect(result.businessId).toBe('b1');
	});

	it('бросает QrCodeNotFoundException если токен не найден', async () => {
		const repo = makeRepo(null);
		const useCase = new ScanQrCodeUseCase(repo as QrCodeRepository);

		await expect(useCase.execute({ qrToken: 'unknown' })).rejects.toBeInstanceOf(
			QrCodeNotFoundException,
		);
	});

	it('бросает QrCodeExpiredException если токен истёк', async () => {
		const record = makeRecord({ expiresAt: new Date(Date.now() - 1000).toISOString() });
		const repo = makeRepo(record);
		const useCase = new ScanQrCodeUseCase(repo as QrCodeRepository);

		await expect(useCase.execute({ qrToken: 'expired' })).rejects.toBeInstanceOf(
			QrCodeExpiredException,
		);
	});

	it('бросает ошибку если qrToken пустой', async () => {
		const repo = makeRepo(null);
		const useCase = new ScanQrCodeUseCase(repo as QrCodeRepository);

		await expect(useCase.execute({ qrToken: '' })).rejects.toThrow('qrToken is required');
	});
});
