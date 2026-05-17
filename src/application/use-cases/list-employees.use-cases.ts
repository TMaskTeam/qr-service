import { Inject, Injectable } from '@nestjs/common';
import type { EmployeeResult, ListEmployeesCommand } from '../dto/employee.dto';
import {
	EMPLOYEE_REPOSITORY,
	type EmployeeRepository,
} from '../../domain/ports/employee.repository';
import { BusinessNotFoundException } from './assign-employee.use-case';

@Injectable()
export class ListEmployeesUseCase {
	constructor(
		@Inject(EMPLOYEE_REPOSITORY)
		private readonly repository: EmployeeRepository,
	) {}

	async execute(command: ListEmployeesCommand): Promise<EmployeeResult[]> {
		const business = await this.repository.findBusinessByOwnerId(command.ownerIdFromToken);
		if (!business) {
			throw new BusinessNotFoundException(command.ownerIdFromToken);
		}

		const records = await this.repository.listByBusiness(business.business_id);
		return records.map((r) => ({
			employeeId: r.employee_id,
			clientId: r.client_id,
			businessId: r.business_id,
			createdAt: r.created_at,
		}));
	}
}
