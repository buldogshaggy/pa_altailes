# Fullstack Starter: React + ASP.NET Core + PostgreSQL

Этот репозиторий содержит:
- Frontend: React + TypeScript + React Router + TanStack Query + Tailwind CSS + Axios
- Backend: ASP.NET Core Web API
- Database: PostgreSQL (`site-data`) — пользователи и контракты

## Структура
- `client` - фронтенд
- `server/Api` - бэкенд

## GitHub Pages (демо для коллег)
Публикация идёт в **демо-режиме** (`VITE_DEMO_MODE=true`):
- логин локальный: `demo` / `demo123`, `holding` / `holding123`
- контракты и заявки из моков во фронте
- API и Postgres не нужны

## Локально с базой
1. Postgres + API (`cd server/Api && dotnet run`)
2. В `client/.env`:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_DEMO_MODE=false
   ```
3. `cd client && npm run dev`

В Postgres хранятся пользователи и контракты. Заявки пока в памяти API / на фронте.

## Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

## Backend
1. .NET SDK 8.0+
2. `cd server/Api`
3. `dotnet run`

Swagger: `http://localhost:5000/swagger`.
