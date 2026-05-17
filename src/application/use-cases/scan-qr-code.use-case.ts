import { Inject, Injectable } from '@nestjs/common';
import type { QrCodeRecord } from '../../domain/entities/qr-code.entity';
import { QR_CODE_REPOSITORY, type QrCodeRepository } from '../../domain/ports/qr-code.repository';

export interface ScanQrCodeCommand {
	qrToken: string;
}

export interface ScanQrCodeResult {
	clientId: string;
	businessId: string;
	programId?: string;
	expiresAt: string;
}

@Injectable()
export class ScanQrCodeUseCase {
	constructor(
		@Inject(QR_CODE_REPOSITORY)
		private readonly repository: QrCodeRepository,
	) {}

	async execute(command: ScanQrCodeCommand): Promise<ScanQrCodeResult> {
		this.assertCommand(command);

		const record = await this.repository.findByToken(command.qrToken);

		if (!record) {
			throw new QrCodeNotFoundException(command.qrToken);
		}

		if (new Date(record.expiresAt) < new Date()) {
			throw new QrCodeExpiredException(command.qrToken);
		}

		return {
			clientId: record.clientId,
			businessId: record.businessId,
			programId: record.programId,
			expiresAt: record.expiresAt,
		};
	}

	private assertCommand(command: ScanQrCodeCommand) {
		if (!command.qrToken?.trim()) {
			throw new Error('qrToken is required');
		}
	}
}

export class QrCodeNotFoundException extends Error {
	constructor(token: string) {
		super(`QR code not found or expired: ${token}`);
		this.name = 'QrCodeNotFoundException';
	}
}

export class QrCodeExpiredException extends Error {
	constructor(token: string) {
		super(`QR code has expired: ${token}`);
		this.name = 'QrCodeExpiredException';
	}
}
