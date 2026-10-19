# Smart Task Management System

A full-stack task management system built as a B.Tech placement portfolio project.

## Stack

- **Frontend:** React 19, Vite, Axios, dnd-kit
- **Backend:** Java 17+, Spring Boot 3.5, Spring Security, JWT bearer authentication
- **Database:** MySQL 8+
- **API docs:** OpenAPI and Swagger UI

## Features implemented

- User registration and login with BCrypt password hashing and signed JWTs.
- `USER` and `ADMIN` roles. Public registration always creates a `USER`; `/api/admin/**` requires `ADMIN`.
- Persistent task CRUD with owner isolation, status, priority, and deadlines.
- Search, status and priority filters, pagination, sorting, and admin-wide task listing.
- Responsive dashboard with board/list views and drag-and-drop status changes.
- Request validation and consistent API error responses.

## Repository layout

- `frontend/` — React application
- `backend/` — Spring Boot API and backend tests
- `docs/` — API documentation and design notes

## Build progress

1. **Structure and prerequisites** — complete.
2. **Backend** — implemented; 4 backend integration tests pass against H2.
3. **Frontend** — implemented; Vite production build succeeds.
4. **Integration** — frontend API wiring is implemented. MySQL-backed runtime integration still needs a MySQL server; none was detected during the environment check.

## Prerequisites

- Node.js and npm
- Java 17 or newer
- Apache Maven
- MySQL Server

The original environment check found Java 24 under Maven, Node.js 22, npm 10, and Maven 3.9. Neither a MySQL client/service nor Docker was found, so MySQL-backed startup has not been verified on that machine. You can use an existing MySQL Server or launch one with the optional Compose file if Docker is installed.

## Configuration and credentials

## Configure and run

Create a MySQL database (for example, `smart_task_db`) and a MySQL account with access to it, or set the values below and run `docker compose up -d db` from the project root to start the optional MySQL 8.4 container. Compose stores database files in a named volume. The application does not contain database passwords or JWT signing secrets.

You can configure the app with environment variables or an ignored local properties file. To use the local file, copy `backend/application-local.properties.example` to `backend/application-local.properties` and replace the placeholders on your machine. That file is excluded from Git. Generate a JWT secret of at least 32 bytes and do not share or commit it.

For environment variables, set values for the current PowerShell session:

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/smart_task_db?serverTimezone=UTC'
$env:MYSQL_DATABASE = 'smart_task_db'
$env:DB_USERNAME = 'your_mysql_user'
$env:DB_PASSWORD = 'your_mysql_password'
$env:MYSQL_ROOT_PASSWORD = '<your-local-mysql-root-password>'
$env:APP_JWT_SECRET = 'generate-a-random-secret-locally'
$env:CORS_ALLOWED_ORIGIN = 'http://localhost:5173'
```

For the optional Compose database, set `DB_USERNAME`, `DB_PASSWORD`, `MYSQL_DATABASE`, and `MYSQL_ROOT_PASSWORD` before running `docker compose up -d db`. Use the same database username/password and database name in the backend environment.

Start the backend:

```powershell
cd backend
mvn spring-boot:run
```

Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. API requests go to `http://localhost:8080/api` by default. To use another API URL, copy `frontend/.env.example` to `frontend/.env.local` and change `VITE_API_URL`.

The backend uses Hibernate `ddl-auto: update` for local development. For production, replace this with versioned database migrations and a least-privilege MySQL account. Never commit `.env*`, local application configuration, passwords, or generated JWT secrets.

## API documentation

When the backend is running, open [Swagger UI](http://localhost:8080/swagger-ui.html) or the [OpenAPI JSON](http://localhost:8080/v3/api-docs). Authenticate in Swagger UI with the JWT returned by registration or login.

See [docs/API.md](docs/API.md) for routes, request fields, and query parameters.

## Tests and build verification

Backend integration tests run against an isolated in-memory H2 database and do not replace MySQL in normal application runs:

```powershell
cd backend
mvn test
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Create an administrator

Public sign-up never accepts a role field and cannot create an administrator. To promote a trusted account for a local portfolio demo, update its role using an authorized MySQL session:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'trusted-account@example.com';
```

That user must sign in again to receive a JWT containing the updated role.
