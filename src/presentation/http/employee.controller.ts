import {
	Controller,
	Post,
	Delete,
	Get,
	Body,
	Param,
	UseGuards,
	Req,
	HttpCode,
	HttpStatus,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
	AssignEmployeeUseCase,
	AlreadyEmployeeException,
	BusinessNotFoundException,
	ClientNotFoundException,
} from '../../application/use-cases/assign-employee.use-case';
import { RemoveEmployeeUseCase } from '../../application/use-cases/remove-employee.use-case';
import { ListEmployeesUseCase } from '../../application/use-cases/list-employees.use-cases';

interface JwtRequest extends Request {
	jwtPayload?: { owner_id: number; role: string };
}

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
	constructor(
		private readonly assignUseCase: AssignEmployeeUseCase,
		private readonly removeUseCase: RemoveEmployeeUseCase,
		private readonly listUseCase: ListEmployeesUseCase,
	) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async assign(@Req() req: JwtRequest, @Body() body: { emailOrPhone: string }) {
		if (!body.emailOrPhone?.trim()) {
			throw new BadRequestException('emailOrPhone is required');
		}
		try {
			return await this.assignUseCase.execute({
				ownerIdFromToken: req.jwtPayload!.owner_id,
				emailOrPhone: body.emailOrPhone,
			});
		} catch (e) {
			if (e instanceof ClientNotFoundException) throw new NotFoundException(e.message);
			if (e instanceof AlreadyEmployeeException) throw new ConflictException(e.message);
			if (e instanceof BusinessNotFoundException) throw new NotFoundException(e.message);
			throw e;
		}
	}

	@Delete(':clientId')
	@HttpCode(HttpStatus.NO_CONTENT)
	async remove(@Req() req: JwtRequest, @Param('clientId') clientId: string) {
		try {
			await this.removeUseCase.execute({
				ownerIdFromToken: req.jwtPayload!.owner_id,
				clientId: Number(clientId),
			});
		} catch (e) {
			if (e instanceof BusinessNotFoundException) throw new NotFoundException(e.message);
			throw e;
		}
	}

	@Get()
	async list(@Req() req: JwtRequest) {
		try {
			return await this.listUseCase.execute({
				ownerIdFromToken: req.jwtPayload!.owner_id,
			});
		} catch (e) {
			if (e instanceof BusinessNotFoundException) throw new NotFoundException(e.message);
			throw e;
		}
	}
}
