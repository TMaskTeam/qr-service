import { Inject, Injectable } from '@nestjs/common';
import type { RemoveEmployeeCommand } from '../dto/employee.dto';
import {
	EMPLOYEE_REPOSITORY,
	type EmployeeRepository,
} from '../../domain/ports/employee.repository';
import { BusinessNotFoundException } from './assign-employee.use-case';

@Injectable()
export class RemoveEmployeeUseCase {
	constructor(
		@Inject(EMPLOYEE_REPOSITORY)
		private readonly repository: EmployeeRepository,
	) {}

	async execute(command: RemoveEmployeeCommand): Promise<void> {
		const business = await this.repository.findBusinessByOwnerId(command.ownerIdFromToken);
		if (!business) {
			throw new BusinessNotFoundException(command.ownerIdFromToken);
		}

		await this.repository.delete(command.clientId, business.business_id);
	}
}
