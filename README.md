# Fullstack Starter: React + ASP.NET Core

Этот репозиторий содержит:
- Frontend: React + TypeScript + React Router + TanStack Query + Tailwind CSS + Axios
- Backend: ASP.NET Core Web API (отдельное приложение)

## Структура
- `client` - фронтенд
- `server/Api` - бэкенд

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

Swagger будет доступен по адресу `http://localhost:5000/swagger`.

Демо-данные хранятся в памяти API (и в локальном fallback на фронте, если API недоступен).

## Проверка связки
- Запустить backend
- Запустить frontend
- Открыть frontend и убедиться, что на главной странице отображается ответ `/api/health`
