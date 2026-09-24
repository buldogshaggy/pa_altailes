# Fullstack Starter: React + ASP.NET Core + PostgreSQL

Этот репозиторий содержит:
- Frontend: React + TypeScript + React Router + TanStack Query + Tailwind CSS + Axios
- Backend: ASP.NET Core Web API
- Database: PostgreSQL (`site-data`)

## Структура
- `client` - фронтенд
- `server/Api` - бэкенд

## База данных
1. PostgreSQL 18+, база `site-data`
2. Пользователь приложения: `pa_app` / `pa_app_pass` (можно сменить в `appsettings.Development.json`)
3. При старте API применяет миграции и заливает демо-данные:
   - пользователи `demo` / `demo123`, `holding` / `holding123`
   - контракты и заявки

## Frontend
1. Перейти в папку `client`
2. Установить зависимости: `npm install`
3. Скопировать `.env.example` в `.env` (если нужно)
4. Запустить: `npm run dev`

По умолчанию API URL: `http://localhost:5000`.

## Backend
1. Установить .NET SDK 8.0+
2. Перейти в папку `server/Api`
3. Восстановить пакеты: `dotnet restore`
4. Запустить: `dotnet run`

Swagger: `http://localhost:5000/swagger`.

## Проверка связки
- Запустить PostgreSQL
- Запустить backend
- Запустить frontend
- Войти как `demo` / `demo123`
