import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.enableCors({ origin: true, credentials: true });

	const port = Number(process.env.QR_SERVICE_PORT ?? 3001);
	await app.listen(port, '0.0.0.0');
}

void bootstrap();
