import { Injectable } from '@nestjs/common';
import type { EmployeeRecord } from '../../domain/entities/employee.entity';
import type { EmployeeRepository } from '../../domain/ports/employee.repository';
import { PostgresClientService } from './postgres-client.service';

@Injectable()
export class PostgresEmployeeRepository implements EmployeeRepository {
	constructor(private readonly db: PostgresClientService) {}

	async findClientByEmail(email: string) {
		const res = await this.db.pool.query<{ client_id: number }>(
			`SELECT client_id FROM mask.client WHERE email = $1 LIMIT 1`,
			[email],
		);
		return res.rows[0] ?? null;
	}

	async findClientByPhone(phone: string) {
		const res = await this.db.pool.query<{ client_id: number }>(
			`SELECT client_id FROM mask.client WHERE phone_number = $1 LIMIT 1`,
			[phone],
		);
		return res.rows[0] ?? null;
	}

	async findEmployee(clientId: number, businessId: number) {
		const res = await this.db.pool.query<EmployeeRecord>(
			`SELECT * FROM mask.employee
			 WHERE client_id = $1 AND business_id = $2 LIMIT 1`,
			[clientId, businessId],
		);
		return res.rows[0] ?? null;
	}

	async save(record: Omit<EmployeeRecord, 'employee_id' | 'created_at'>) {
		const res = await this.db.pool.query<EmployeeRecord>(
			`INSERT INTO mask.employee (client_id, business_id, assigned_by_owner_id)
			 VALUES ($1, $2, $3)
			 RETURNING *`,
			[record.client_id, record.business_id, record.assigned_by_owner_id],
		);
		return res.rows[0];
	}

	async delete(clientId: number, businessId: number) {
		await this.db.pool.query(
			`DELETE FROM mask.employee WHERE client_id = $1 AND business_id = $2`,
			[clientId, businessId],
		);
	}

	async listByBusiness(businessId: number) {
		const res = await this.db.pool.query<EmployeeRecord>(
			`SELECT * FROM mask.employee WHERE business_id = $1 ORDER BY created_at DESC`,
			[businessId],
		);
		return res.rows;
	}

	async findBusinessByOwnerId(ownerId: number) {
		const res = await this.db.pool.query<{ business_id: number }>(
			`SELECT business_id FROM mask.business WHERE owner_id = $1 LIMIT 1`,
			[ownerId],
		);
		return res.rows[0] ?? null;
	}
}
