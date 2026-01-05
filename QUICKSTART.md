# Быстрый старт

## 1. Установка зависимостей

```bash
npm run install:all
```

## 2. Настройка базы данных

### Вариант A: Использование Docker (рекомендуется)

```bash
docker-compose up -d
```

### Вариант B: Локальный PostgreSQL

Убедитесь, что PostgreSQL запущен и доступен. Создайте базу данных вручную.

## 3. Настройка переменных окружения

### Backend
Создайте файл `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=your_database_name
JWT_SECRET=your-secret-key-change-in-production-use-long-random-string
PORT=3001
NODE_ENV=development
```

### Frontend
Создайте файл `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 4. Запуск проекта

```bash
npm run dev
```

Это запустит:
- Backend на http://localhost:3001
- Frontend на http://localhost:3000

## 5. Использование

1. Откройте http://localhost:3000
2. Зарегистрируйте нового пользователя
3. Войдите в систему
4. Просмотрите свой профиль

## Полезные команды

- `npm run dev` - Запуск backend и frontend одновременно
- `npm run dev:backend` - Только backend
- `npm run dev:frontend` - Только frontend
- `docker-compose up -d` - Запуск PostgreSQL в Docker
- `docker-compose down` - Остановка PostgreSQL

