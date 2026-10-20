# Deploy on Vercel

Deploy this monorepo as two Vercel projects: a Vite frontend and a Spring Boot API container. MySQL remains a separate managed database. The backend uses Vercel's Dockerfile deployment support and listens on Vercel's assigned `PORT`.

## 1. Push this repository to GitHub

Push the deployment files and application changes to the repository, then import it into Vercel. Do not commit `backend/application-local.properties`, database passwords, or JWT secrets.

## 2. Create a MySQL-compatible database

Vercel containers are stateless, so application data must live in a separate database service. The Vercel Marketplace offers TiDB Cloud, which provides MySQL-compatible databases; another hosted MySQL provider can also be used. Select a region close to the API deployment and get the host, port, database, username, and password from the provider.

Keep all database credentials and the JWT secret out of frontend `VITE_` variables and committed files.

## 3. Deploy the API

Create a Vercel project from the repository and set **Root Directory** to `backend`. Vercel builds `Dockerfile.vercel` as the API container. Add these environment variables to the API project, using the values provided by your database service:

| Variable | Value |
| --- | --- |
| `DB_URL` | `jdbc:mysql://<host>:<port>/<database>?sslMode=VERIFY_IDENTITY&serverTimezone=UTC` |
| `DB_USERNAME` | Database username from your provider |
| `DB_PASSWORD` | Database password from your provider |
| `APP_JWT_SECRET` | A newly generated random secret of at least 32 bytes |
| `CORS_ALLOWED_ORIGIN` | Temporary `http://localhost:5173`; update after creating the frontend project |

Deploy the API and note its generated URL, for example `https://<your-api-project>.vercel.app`.

## 4. Deploy the frontend

Create a second Vercel project from the same repository and set **Root Directory** to `frontend`. Vercel detects and builds the Vite app. Set this environment variable before deploying:

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-api-project>.vercel.app/api` |

After deploying the frontend, set `CORS_ALLOWED_ORIGIN` in the API project to the exact frontend URL and redeploy the API. Vite embeds `VITE_API_URL` in the frontend at build time, so changing it requires a new frontend build/deploy.

## 5. Verify the live site

Open the frontend's generated URL, register an account, sign in, and create a task. Check `https://<your-api-project>.vercel.app/actuator/health` for a healthy API response.

## Database notes

The application currently uses Hibernate `ddl-auto: update`, which creates or updates tables on startup. Back up the database before future application changes. The task stopwatch is stored in each user's browser and is not synchronized through the database.
