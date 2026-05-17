import type { EmployeeRecord } from '../entities/employee.entity';

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface EmployeeRepository {
	findClientByEmail(email: string): Promise<{ client_id: number } | null>;
	findClientByPhone(phone: string): Promise<{ client_id: number } | null>;
	findEmployee(clientId: number, businessId: number): Promise<EmployeeRecord | null>;
	save(record: Omit<EmployeeRecord, 'employee_id' | 'created_at'>): Promise<EmployeeRecord>;
	delete(clientId: number, businessId: number): Promise<void>;
	listByBusiness(businessId: number): Promise<EmployeeRecord[]>;
	findBusinessByOwnerId(ownerId: number): Promise<{ business_id: number } | null>;
}
