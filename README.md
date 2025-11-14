# Chirpy API (Node/Express + TypeScript + Postgres)

A small X-like backend with users, JWT auth + refresh tokens, chirps, and simple admin tools. Built with Typescript, Express, Drizzle ORM, and Postgres.

### Features
- User signup, login, profile update
- JWT access tokens + refresh/revoke flow (refresh tokens stored in DB)
- Posts(Chirps): create, list, get by ID, delete
- Profanity filtering on chirp body
- Webhook to upgrade users ("Chirpy Red" )
- Admin: simple metric page, dev-only list users and reset
- Auto-migrations on startup
- Serves static client at `/app`
- RESTful API design

### Tech
- Node.js, TypeScript, Express
- Postgres, Drizzle-orm, postgres-js
- Argon2 password hashing, jsonwebtoken
- Vitest

## Getting Started

### Prereqs
- Node v20+
- Postgres running and reachable

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chirpy
```

2. Install dependencies:
```bash
npm install
```
3. Configure environment variables:

Create a `.env` with:

- `PORT=<port_num>`
- `PLATFORM=dev`
- `POLKA_KEY=<your_api_key>`
- `DB_URL=<connection_string>` i.e. postgres://user:pass@host:5432/db
- `SECRET=<super_secret_jwt_key>`

Notes:
- `SECRET` signs access JWTs.
- Access token duration is 1h via config, refresh token 60 days
- `PLATFORM=dev` enables `POST /admin/reset` adn `GET /admin/users`

4. Run database migrations:
```bash
npm run generate
npm run migrate
```
Migrations run automatically on server startup.

5. Build the project:

```bash
npm run build
```

## Other scripts

-  Build and run in development mode:

```bash
npm run dev
```

-  Run test suite:

```bash
npm test
```



### Src directory structure

```
src/
├── index.ts                  # App wiring: routes, static files, migrations
├── config.ts                 # Env-backed configuration
├── middleware.ts             # Logging, hit counter, error handler
├── api/
│   ├── apiHandlers.ts        # Users, chirps, tokens, webhook handlers
│   └── adminHandlers.ts      # Admin routes
├── auth.ts                   # Authentication
├── auth.test.ts              # Unit tests (vitest)
├── errors.ts                 # Error classes
├── db/
│   ├── schema.ts             # Drizzle schema
│   ├── queries/*             # Query functions
│   └── indexDB.ts            # DB connection
└── app/*                     # Static files

```

## API Reference

- All JSON unless specified. 
- Bearer tokens via `Authorization: Bearer <token>` unless stated otherwise.

#### Readiness endpoint

    GET /api/healthz
        200 → text/plain "OK"

#### Users

    POST /api/users
    Register a new user.
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
        400: invalid input

    PUT /api/users (auth: access JWT)
    Updates a user's email and/or password.
        Body: 
        { 
            email: string, 
            password: string 
        }
        200 → updated user (same shape as with new user)
        400: invalid input,
        401: token validation error

#### Webhooks ("Polka")

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
        401: API key error,
        404: user error

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
        400: invalid input,
        401: auth error

    POST /api/refresh
    Refresh user JWT.
        Header: Authorization: Bearer <refreshToken>
        200 → 
        { 
            token: <newAccessJWTstring> 
        }
        401: missing/expired/revoked token

    POST /api/revoke
    Revoke user refresh token.
        Header: Authorization: Bearer <refreshToken>
        204 on success
        401: missing/already revoked token

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
        400: invalid body, 
        401: token validation error

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
        404: if user not found

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
        404: if chirp not found

    DELETE /api/chirps/:chirpID (auth, owner only)
    Deletes chirp with the id of <chirpID>.
        204 on success
        401: token validation error,
        403: user is not owner,
        404: chirp not found


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

- BadRequestError — 400: Invalid or malformed request.

- UnauthorizedError — 401: Missing or invalid authentication.

- ForbiddenError — 403: Authenticated but not allowed.

- NotFoundError — 404: Resource does not exist.

- InternalServerError — 500: Unexpected server error (default).


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

### Possible Future Enhancements
- Pagination for chirp listings
- Rate limiting
- Chirp likes/favorites
- User following system

### Credits

This projects was developed with the guidance of Boot.dev's [HTTP Servers in TypeScript](https://www.boot.dev/courses/learn-http-servers-typescript) course, with additional independent research and implementation work.

####  License

ISC