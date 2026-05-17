import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
	ForbiddenException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';
import type { Request } from 'express';

const JWT_SECRET = 't@#mask&&bmstu13!!sgn%&the@3333third?<>';

interface JwtPayload {
	owner_id: number;
	role: string;
	exp: number;
}

function parseJwt(token: string): JwtPayload {
	const parts = token.split('.');
	if (parts.length !== 3) throw new Error('invalid jwt');

	const [header, payload, signature] = parts;

	// Verify signature
	const expected = createHmac('sha256', JWT_SECRET)
		.update(`${header}.${payload}`)
		.digest('base64url');

	if (expected !== signature) throw new Error('invalid signature');

	const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as JwtPayload;

	if (decoded.exp < Math.floor(Date.now() / 1000)) {
		throw new Error('token expired');
	}

	return decoded;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest<Request & { jwtPayload?: JwtPayload }>();
		const token = req.cookies?.['token'] as string | undefined;

		if (!token) throw new UnauthorizedException('missing token');

		try {
			const payload = parseJwt(token);
			if (payload.role !== 'business_owner') {
				throw new ForbiddenException('only business_owner can manage employees');
			}
			req.jwtPayload = payload;
			return true;
		} catch (e) {
			if (e instanceof ForbiddenException) throw e;
			throw new UnauthorizedException('invalid token');
		}
	}
}
