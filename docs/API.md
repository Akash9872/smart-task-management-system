# Smart Task API

Base URL: `http://localhost:8080/api`

The API returns JSON. Except for registration, login, OpenAPI docs, Swagger UI, and health checks, requests require `Authorization: Bearer <JWT>`.

## Authentication

### `POST /auth/register`

```json
{ "name": "Alex Morgan", "email": "alex@example.com", "password": "at-least-8-characters" }
```

Creates a `USER` account and returns `{ "token": "...", "user": { "id": 1, "name": "Alex Morgan", "email": "alex@example.com", "role": "USER" } }`.

### `POST /auth/login`

```json
{ "email": "alex@example.com", "password": "your-password" }
```

Returns the same authentication response. Invalid credentials return `401`.

## Tasks

All task endpoints below require a valid JWT. Task reads and writes are scoped to the authenticated owner.

### `GET /tasks`

`GET /tasks?status=IN_PROGRESS&priority=HIGH&q=portfolio&page=0&size=20&sort=deadline&direction=asc`

- `status`: `TODO`, `IN_PROGRESS`, `COMPLETED`
- `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `q`: case-insensitive title/description search
- `page`: zero-based (default `0`); `size`: 1–100 (default `20`)
- `sort`: `title`, `status`, `priority`, `deadline`, `createdAt`, or `updatedAt`
- `direction`: `asc` or `desc` (default `desc`)

Returns `{ "content": [], "page": 0, "size": 20, "totalElements": 0, "totalPages": 0, "last": true }`.

### `POST /tasks`

Create a task. `title` is required (max 160 characters); `description` is optional (max 4000 characters); `status` and `priority` are optional and default to `TODO` and `MEDIUM`; `deadline` is an optional ISO date (`YYYY-MM-DD`) that must be today or later.

```json
{ "title": "Finish portfolio", "description": "Polish the project README", "status": "IN_PROGRESS", "priority": "HIGH", "deadline": "2030-05-31" }
```

### `GET /tasks/{id}`

Read one task owned by the current user.

### `PUT /tasks/{id}`

Replace editable task fields. Send `title`; omitted `status` and `priority` retain their current values. A `null` deadline clears it.

### `DELETE /tasks/{id}`

Delete one task owned by the current user. Returns `204 No Content`.

## Admin

### `GET /admin/tasks`

Requires `ADMIN`. Lists all users' tasks and supports the same filters and pagination as `GET /tasks`.

## Errors

Validation errors return `400` with a `fields` map. Missing records return `404`, duplicate email returns `409`, unauthenticated requests return `401`, and role violations return `403`.
