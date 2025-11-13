# Chirpy API (Node/Express + TypeScript + Postgres)

A small X-like backend with users, JWT auth + refresh tokens, chirps, and simple admin tools. Built with Express, Drizzle ORM, and Postgres.

### Features
- User signup, login, profile update
- JWT access tokens + refresh/revoke flow (refresh tokens stored in DB)
- Posts(Chirps): create, list, get by ID, delete
- Profanity filtering on chirp body
- Webhook ("Polka") to upgrade users ("Chirpy Red")
- Admin: metrics page, list users, dev-only reset
- Auto-migrations on startup
- Serves static client at `/app`

### Tech
- Node.js 18+, TypeScript, Express
- Postgres, drizzle-orm, postgres-js
- Argon2 password hashing, jsonwebtoken

## Getting Started

### Prereqs
- Node 18+
- Postgres running and reachable

### Environment
Create a `.env` with:

- `PORT=<port_num>`
- `PLATFORM=dev`
- `POLKA_KEY=<your_api_key>`
- `DB_URL=<connection_string>` i.e. postgres://user:pass@host:5432/db
- `SECRET=<super_secret_jwt_key>`


Notes:
- `SECRET` signs access JWTs.
- Access token duration is 1h via config, refresh token 60 days
- `PLATFORM=dev` enables `POST /admin/reset`.

### Install and Run
```bash
npm install
npm run build           # if you output to dist
node dist/index.js      # or: ts-node src/index.ts
```

On boot, migrations run automatically. Server listens on PORT (default 8080).
### Project Structure

    src/index.ts – app wiring, routes, static, migrations
    src/api/apiHandlers.ts – users, chirps, tokens, webhook
    src/api/adminHandlers.ts – admin routes
    src/middleware.ts – logging, hit counter, error handler
    src/db/schema.ts – drizzle schema (users, chirps, refresh_tokens)
    src/db/queries/* – query functions
    src/db/indexDB.ts – db connection
    src/auth.ts – hashing, JWT, header parsing
    src/config.ts – env-backed runtime config
    src/auth.test.ts – unit tests (vitest)

## API Reference

- All JSON unless specified. 
- Bearer tokens via `Authorization: Bearer <token>` unless stated otherwise.

#### Readiness endpoint

    GET /api/healthz
        200 → text/plain "OK"

#### Users

    POST /api/users
    Creates a new user.
        Body: 
        { 
            email: string, 
            password: string 
        }
        201 →   
        {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            isChirpyRed: boolean;
        }

    PUT /api/users (auth: access JWT)
    Updates a user's email and/or password.
        Body: 
        { 
            email: string, 
            password: string 
        }
        200 → updated user (same shape as with new user)

#### Webhooks (Polka)

    POST /api/polka/webhooks
    Upgrades user to "Chirpy Red".
        Header: Authorization: ApiKey <POLKA_KEY>
        Body: 
        {
            event: string,
            data: {
                userId: string
            }
        }
        204 on success or non-upgrade events

####  Auth/Tokens

    POST /api/login
    User login and token creation.
        Body: 
        { 
            email: string, 
            password: string 
        }
        200 →
        {
            token: string;
            refreshToken: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            isChirpyRed: boolean;
        }

    POST /api/refresh
    Refresh user JWT.
        Header: Authorization: Bearer <refreshToken>
        200 → 
        { 
            token: <newAccessJWTstring> 
        }
        401 if missing/expired/revoked

    POST /api/revoke
    Revoke user refresh token.
        Header: Authorization: Bearer <refreshToken>
        204 on success
        401 if missing/already revoked

#### Chirps

    POST /api/chirps (auth: access JWT)
    Post a "chirp" (post). 
        Body: (<= 140 chars; trims; profane words replaced with ****)
        { 
            body: string 
        } 
        201 → 
        {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            body: string;
            userId: string;
        }
        400 invalid body, 401 unauthenticated

    GET /api/chirps
    Get all chirps or all chirps from single user; optional sorting.
        Query:
            authorId=<userId> optional filter
            sort=desc optional; default is ascending by createdAt
        200 → 
        [ {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            body: string;
            userId: string;
        } ]

    GET /api/chirps/:chirpID
    Returns a single chirp with the id of <chirpID>.
        200 → 
        {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            body: string;
            userId: string;
        }
        404 if not found

    DELETE /api/chirps/:chirpID (auth, owner only)
    Deletes chirp with the id of <chirpID>.
        204 on success
        404 not found, 403 not owner, 401 unauthenticated


#### Admin

    GET /admin/metrics
        200 → HTML page with file server hit count (fileserverHits)

    GET /admin/users
    Get all users. Only when PLATFORM=dev.
        200 → 
        [ {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            hashedPassword: string;
            isChirpyRed: boolean;
        } ]
        403 if not dev
        
    POST /admin/reset
    Resets hit counter and deletes all users. Only when PLATFORM=dev.
        200 → text/plain “Count reset and users deleted”
        403 if not dev

### Errors

JSON shape:

```json
{ 
    "error": "message" 
}
```

**Error Types**:
```
    NotFoundError, 404 (Not Found), Resource requested does not exist.
    ForbiddenError, 403 (Forbidden), Client lacks necessary permissions to access the resource.
    UnauthorizedError, 401 (Unauthorized), Authentication is missing or invalid.
    BadRequestError, 400 (Bad Request), Client-side error (e.g., malformed request, missing parameters).
    Default, 500 (Internal Server Error), Plain Text: Internal Server Error, An unexpected server-side error occurred.
```

### Example cURL

#### Login:
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"secret"}'
```
#### Create chirp:
```bash
curl -X POST http://localhost:8080/api/chirps \
  -H "Authorization: Bearer <ACCESS_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"body":"Hello world"}'
```
#### List chirps by user, desc:
```bash
curl "http://localhost:8080/api/chirps?authorId=<USER_ID>&sort=desc"
```
#### Refresh token:
```bash
curl -X POST http://localhost:8080/api/refresh \
  -H "Authorization: Bearer <REFRESH_TOKEN>"
```
#### Revoke refresh token:
```bash
curl -X POST http://localhost:8080/api/revoke \
  -H "Authorization: Bearer <REFRESH_TOKEN>"
```
#### Webhook (upgrade):
```bash
curl -X POST http://localhost:8080/api/polka/webhooks \
  -H "Authorization: ApiKey <POLKA_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"event":"user.upgraded","data":{"userId":"<USER_ID>"}}'
```

### Testing

Uses Vitest.

```bash
npm test
```

####  License

MIT