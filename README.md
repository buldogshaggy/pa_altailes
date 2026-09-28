# Fullstack Starter: React + ASP.NET Core + PostgreSQL

Этот репозиторий содержит:
- Frontend: React + TypeScript + React Router + TanStack Query + Tailwind CSS + Axios
- Backend: ASP.NET Core Web API
- Database: PostgreSQL (`site-data`) — пользователи и контракты

## Структура
- `client` - фронтенд
- `server/Api` - бэкенд

## База данных
В Postgres хранятся:
- пользователи (`users`) — `demo` / `demo123`, `holding` / `holding123`
- контракты (`contracts`)

Заявки пока живут в памяти API (позже — 1С), в БД не сохраняются.

Строка подключения: `appsettings.Development.json`  
Пользователь БД: `pa_app` / `pa_app_pass`

## Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

API URL по умолчанию: `http://localhost:5000`.

## Backend
1. .NET SDK 8.0+
2. `cd server/Api`
3. `dotnet run`

Swagger: `http://localhost:5000/swagger`.
