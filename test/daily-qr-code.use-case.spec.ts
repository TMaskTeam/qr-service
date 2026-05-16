import { describe, expect, it } from '@jest/globals';
import {
	createDailyKey,
	DailyQrCodeUseCase,
	secondsUntilEndOfDay,
} from '../src/application/use-cases/daily-qr-code.use-case';
import type { QrCodeRecord } from '../src/domain/entities/qr-code.entity';
import type { QrCodeRepository } from '../src/domain/ports/qr-code.repository';

class InMemoryQrCodeRepository implements QrCodeRepository {
	records = new Map<string, QrCodeRecord>();
	daily = new Map<string, string>();

	async findByToken(qrToken: string) {
		return this.records.get(qrToken) ?? null;
	}

	async findDailyToken(dailyKey: string) {
		return this.daily.get(dailyKey) ?? null;
	}

	async save(record: QrCodeRecord, _ttlSeconds: number) {
		void _ttlSeconds;
		this.records.set(record.qrToken, record);
	}

	async saveDailyToken(dailyKey: string, qrToken: string, _ttlSeconds: number) {
		void _ttlSeconds;
		this.daily.set(dailyKey, qrToken);
	}
}

describe('DailyQrCodeUseCase', () => {
	const now = new Date('2026-05-15T10:00:00.000Z');

	it('creates daily QR token and stores daily mapping', async () => {
		const repository = new InMemoryQrCodeRepository();
		const useCase = new DailyQrCodeUseCase(
			repository,
			() => 'token-1',
			() => now,
		);

		const result = await useCase.execute({
			clientId: 'client-001',
			businessId: 'business-001',
			programId: 'program-001',
		});

		expect(result.qrToken).toBe('token-1');
		expect(result.clientId).toBe('client-001');
		expect(repository.records.get('token-1')).toEqual(result);
		expect(
			repository.daily.get(
				createDailyKey(
					{ clientId: 'client-001', businessId: 'business-001', programId: 'program-001' },
					now,
				),
			),
		).toBe('token-1');
	});

	it('returns existing QR token for the same client and day', async () => {
		const repository = new InMemoryQrCodeRepository();
		const existing: QrCodeRecord = {
			qrToken: 'existing-token',
			clientId: 'client-001',
			businessId: 'business-001',
			programId: 'program-001',
			createdAt: now.toISOString(),
			expiresAt: '2026-05-15T23:59:59.999Z',
		};

		repository.records.set(existing.qrToken, existing);
		repository.daily.set(
			createDailyKey(
				{ clientId: 'client-001', businessId: 'business-001', programId: 'program-001' },
				now,
			),
			existing.qrToken,
		);

		const useCase = new DailyQrCodeUseCase(
			repository,
			() => 'new-token',
			() => now,
		);
		const result = await useCase.execute({
			clientId: 'client-001',
			businessId: 'business-001',
			programId: 'program-001',
		});

		expect(result).toEqual(existing);
	});

	it('checks Redis uniqueness before saving a generated token', async () => {
		const repository = new InMemoryQrCodeRepository();
		repository.records.set('collision', {
			qrToken: 'collision',
			clientId: 'other-client',
			businessId: 'business-001',
			createdAt: now.toISOString(),
			expiresAt: '2026-05-15T23:59:59.999Z',
		});

		const tokens = ['collision', 'unique-token'];
		const useCase = new DailyQrCodeUseCase(
			repository,
			() => tokens.shift() ?? 'fallback',
			() => now,
		);

		const result = await useCase.execute({
			clientId: 'client-001',
			businessId: 'business-001',
		});

		expect(result.qrToken).toBe('unique-token');
	});

	it('calculates TTL until end of UTC day', () => {
		expect(secondsUntilEndOfDay(new Date('2026-05-15T23:59:58.500Z'))).toBe(2);
	});

	it('rejects empty clientId', async () => {
		const repository = new InMemoryQrCodeRepository();
		const useCase = new DailyQrCodeUseCase(
			repository,
			() => 'token',
			() => now,
		);

		await expect(useCase.execute({ clientId: '', businessId: 'business-001' })).rejects.toThrow(
			'clientId is required',
		);
	});
});
