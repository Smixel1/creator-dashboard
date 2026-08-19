# CreatorPulse — Creator Analytics Dashboard

Внутренняя платформа аналитики для авторов Instagram Reels.

## Быстрый старт

```bash
cd creator-dashboard
npm install
cp .env.example .env
```

### 1. PostgreSQL (Neon)

1. Создайте бесплатную базу на [neon.tech](https://neon.tech)
2. Скопируйте connection string (формат):

```
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

3. Вставьте в `.env`

### 2. Переменные окружения

| Переменная | Обязательна | Описание |
|------------|-------------|----------|
| `DATABASE_URL` | Да | PostgreSQL (Neon) connection string |
| `AUTH_SECRET` | Да | Секрет для JWT-сессий (min 32 символа) |
| `APIFY_API_TOKEN` | Нет | Токен Apify для реальных данных Instagram |
| `USE_APIFY` | Нет | `true` — включить Apify вместо mock |

### 3. База данных

```bash
npm run db:push    # применить schema
npm run db:seed    # demo user + reels
```

### 4. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

**Demo login:**
- Email: `anna@creator.io`
- Password: `password123`

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:push` | Применить Prisma schema |
| `npm run db:seed` | Заполнить demo данными |

## Архитектура

- **Next.js 16** App Router + TypeScript
- **Prisma 7** + PostgreSQL (Neon) + `@prisma/adapter-pg`
- **JWT auth** через httpOnly cookies
- **Mock/Apify** Instagram service (server-side only)

## Деплой (Vercel)

1. Push на GitHub
2. Подключить Vercel
3. Добавить env vars: `DATABASE_URL`, `AUTH_SECRET`
4. Deploy → `npx prisma db push && npm run db:seed`
