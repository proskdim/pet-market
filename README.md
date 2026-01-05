# 🐾 PetMarket

Пример проекта на **NestJS**, **Angular**, **GraphQL**, **Prisma** и **PostgreSQL**, демонстрирующий связку современных технологий в едином рабочем пространстве **Nx**.

### Предварительные требования

- Node.js 20+
- PostgreSQL
- npm

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd pet-market

# Установка зависимостей
npm install
```

### Настройка базы данных

1. Создайте файл `.env` в `apps/pet-market-be/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pet_market?schema=public"
```

2. Примените миграции Prisma:

```bash
cd apps/pet-market-be
npx prisma migrate dev
npx prisma generate
```

---

### Development

```bash
# Запуск frontend (Angular SSR)
nx serve pet-market-web

# Запуск backend (NestJS GraphQL API)
nx serve pet-market-be

# Запуск двух проектов сразу
nx run-many --parallel -t serve -p apps/pet-market-be apps/pet-market-web
```

### Build

```bash
# Сборка frontend
nx build pet-market-web

# Сборка backend
nx build pet-market-be
```

### Тестирование

```bash
# Юнит-тесты
nx test pet-market-be

# E2E тесты
nx e2e pet-market-be-e2e

# Lint
nx lint pet-market-web
nx lint pet-market-be
```

### Полезные Nx команды

```bash
# Граф зависимостей проектов
nx graph

# Запуск задачи для всех проектов
nx run-many -t build

# Проверка типов
nx typecheck pet-market-be
```