import { Module } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DailyQrCodeUseCase } from './application/use-cases/daily-qr-code.use-case';
import { AssignEmployeeUseCase } from './application/use-cases/assign-employee.use-case';
import { RemoveEmployeeUseCase } from './application/use-cases/remove-employee.use-case';
import { HealthController } from './presentation/http/health.controller';
import { QrCodeController } from './presentation/http/qr-code.controller';
import { EmployeeController } from './presentation/http/employee.controller';
import { RedisQrCodeRepository } from './infrastructure/redis/redis-qr-code.repository';
import { RedisClientService } from './infrastructure/redis/redis-client.service';
import { PostgresClientService } from './infrastructure/postgres/postgres-client.service';
import { PostgresEmployeeRepository } from './infrastructure/postgres/postgres-employee.repository';
import {
	NOW_PROVIDER,
	QR_CODE_REPOSITORY,
	TOKEN_GENERATOR,
} from './domain/ports/qr-code.repository';
import { EMPLOYEE_REPOSITORY } from './domain/ports/employee.repository';
import { ScanQrCodeUseCase } from './application/use-cases/scan-qr-code.use-case';
import { ListEmployeesUseCase } from './application/use-cases/list-employees.use-cases'

@Module({
	controllers: [HealthController, QrCodeController, EmployeeController],
	providers: [
		ScanQrCodeUseCase,
		DailyQrCodeUseCase,
		AssignEmployeeUseCase,
		RemoveEmployeeUseCase,
		ListEmployeesUseCase,
		RedisClientService,
		PostgresClientService,
		{
			provide: QR_CODE_REPOSITORY,
			useClass: RedisQrCodeRepository,
		},
		{
			provide: EMPLOYEE_REPOSITORY,
			useClass: PostgresEmployeeRepository,
		},
		{
			provide: TOKEN_GENERATOR,
			useValue: () => randomUUID().replaceAll('-', ''),
		},
		{
			provide: NOW_PROVIDER,
			useValue: () => new Date(),
		},
	],
})
export class AppModule {}
