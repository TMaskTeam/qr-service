# QR Service

NestJS microservice для ежедневных QR-кодов клиента.

## Назначение

Сервис создает daily QR token для клиента и хранит привязанные данные в Redis. Во frontend возвращается только `qrToken`, payload для QR и готовый `qrImageDataUrl`.

QR обновляется один раз в сутки. Перед сохранением новый token проверяется на уникальность в Redis.

## Архитектура

Сервис построен в стиле Clean Architecture:

- `domain` - сущность QR-кода и порт репозитория;
- `application` - use case создания/получения daily QR;
- `infrastructure` - Redis client и реализация репозитория;
- `presentation` - HTTP controller NestJS.

## API

```http
GET /qr-codes/daily?clientId=client-001&businessId=business-001&programId=program-001
```

Ответ:

```json
{
  "qrToken": "token",
  "qrPayload": "loyalty:qr:token",
  "qrImageDataUrl": "data:image/png;base64,...",
  "expiresAt": "2026-05-15T20:59:59.999Z"
}
```

## Переменные окружения

- `QR_SERVICE_PORT` - порт сервиса внутри контейнера, по умолчанию `3001`.
- `REDIS_URL` - URL Redis, например `redis://redis:6379`.
- `QR_TOKEN_MAX_ATTEMPTS` - максимум попыток генерации уникального token.

## Локальный запуск

```bash
npm install
npm run start:dev
```

## Тесты

```bash
npm test
```
