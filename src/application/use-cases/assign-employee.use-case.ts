import { Inject, Injectable } from '@nestjs/common';
import type { AssignEmployeeCommand, EmployeeResult } from '../dto/employee.dto';
import {
	EMPLOYEE_REPOSITORY,
	type EmployeeRepository,
} from '../../domain/ports/employee.repository';

@Injectable()
export class AssignEmployeeUseCase {
	constructor(
		@Inject(EMPLOYEE_REPOSITORY)
		private readonly repository: EmployeeRepository,
	) {}

	async execute(command: AssignEmployeeCommand): Promise<EmployeeResult> {
		const { ownerIdFromToken, emailOrPhone } = command;

		const business = await this.repository.findBusinessByOwnerId(ownerIdFromToken);
		if (!business) {
			throw new BusinessNotFoundException(ownerIdFromToken);
		}

		const isPhone = emailOrPhone.startsWith('+') || /^\d/.test(emailOrPhone);
		const client = isPhone
			? await this.repository.findClientByPhone(emailOrPhone)
			: await this.repository.findClientByEmail(emailOrPhone);

		if (!client) {
			throw new ClientNotFoundException(emailOrPhone);
		}

		const existing = await this.repository.findEmployee(client.client_id, business.business_id);
		if (existing) {
			throw new AlreadyEmployeeException(client.client_id);
		}

		const record = await this.repository.save({
			client_id: client.client_id,
			business_id: business.business_id,
			assigned_by_owner_id: ownerIdFromToken,
		});

		return {
			employeeId: record.employee_id,
			clientId: record.client_id,
			businessId: record.business_id,
			createdAt: record.created_at,
		};
	}
}

export class BusinessNotFoundException extends Error {
	constructor(ownerId: number) {
		super(`No business found for owner_id: ${ownerId}`);
		this.name = 'BusinessNotFoundException';
	}
}

export class ClientNotFoundException extends Error {
	constructor(identifier: string) {
		super(`Client not found: ${identifier}`);
		this.name = 'ClientNotFoundException';
	}
}

export class AlreadyEmployeeException extends Error {
	constructor(clientId: number) {
		super(`Client ${clientId} is already an employee of this business`);
		this.name = 'AlreadyEmployeeException';
	}
}
