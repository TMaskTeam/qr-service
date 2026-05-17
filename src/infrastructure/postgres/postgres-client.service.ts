import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PostgresClientService implements OnModuleInit, OnModuleDestroy {
	readonly pool: Pool;

	constructor() {
		this.pool = new Pool({
			host: process.env.DATABASE_HOST,
			port: Number(process.env.DATABASE_PORT ?? 5432),
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_DBNAME,
		});
	}

	async onModuleInit() {
		await this.pool.query('SELECT 1');
	}

	async onModuleDestroy() {
		await this.pool.end();
	}
}
