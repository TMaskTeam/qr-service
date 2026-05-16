# QR Service

## Назначение

QR Service - отдельный NestJS microservice в `qr-service`.

Он отвечает за создание ежедневного QR token клиента и хранение данных в Redis.

## Правила QR

- Для клиента QR обновляется раз в сутки.
- Если на текущий день QR уже существует, сервис возвращает существующий token.
- Если QR еще нет, сервис генерирует новый token.
- Перед сохранением token проверяется на уникальность в Redis.
- В QR payload попадает только `qrToken`.
- Данные клиента, бизнеса и программы хранятся в Redis.

## Clean Architecture

Слои сервиса:

- `domain` - сущность QR-кода и порт репозитория;
- `application` - use case daily QR;
- `infrastructure` - Redis client и repository implementation;
- `presentation` - HTTP controller.

## Endpoint

```http
GET /qr-codes/daily?clientId=client-001&businessId=business-001&programId=program-001
```

Через nginx во frontend:

```http
GET /qr-api/qr-codes/daily?clientId=client-001&businessId=business-001&programId=program-001
```

## Проверки

Для сервиса добавлены unit-тесты:

- создание daily QR;
- возврат существующего daily QR;
- проверка уникальности token перед сохранением;
- расчет TTL до конца дня;
- controller response с QR image data URL.
