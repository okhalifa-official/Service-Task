# Course Platform — NestJS Microservices with an API Gateway

**Course:** CS425 Service-Oriented Programming
**Student:** Omar Khalifa — *ID: 247923*

A small course-platform backend built as two independent NestJS microservices behind an API Gateway, each with its own MongoDB database, plus a Next.js frontend that talks only to the gateway.

---

## 1. Architecture

```
            ┌────────────────────────────┐
            │  Next.js frontend  :3002   │
            └─────────────┬──────────────┘
                          │ HTTP (JSON)
            ┌─────────────▼──────────────┐
            │    API Gateway     :4000   │   routes by path prefix
            └──────┬──────────────┬──────┘
         /user/... │              │ /course/...
     ┌─────────────▼───┐      ┌───▼─────────────┐
     │ user-service    │      │ course-service  │
     │ :3000           │      │ :3001           │
     └────────┬────────┘      └────────┬────────┘
              │                        │
        ┌─────▼─────┐            ┌─────▼──────┐
        │ users_db  │            │ courses_db │   MongoDB Atlas
        └───────────┘            └────────────┘
```

| Component      | Port | Responsibility                                      | Database     |
| -------------- | ---- | --------------------------------------------------- | ------------ |
| frontend       | 3002 | User interface (Next.js)                            | —            |
| api-gateway    | 4000 | Single entry point; forwards requests to services   | —            |
| user-service   | 3000 | User registration, login, user CRUD                 | `users_db`   |
| course-service | 3001 | Course CRUD                                         | `courses_db` |

**Design principles**

- **Single entry point.** The browser only calls the gateway; service URLs are never exposed to the client.
- **Database per service.** Each service owns its own database and connection settings; services never read each other's data.
- **Thin gateway.** The gateway contains no business logic. It forwards the method, path and body to a fixed, configured destination and passes the service's response (including error status codes) back unchanged.
- **Independent deployment.** Every component is its own Node.js project with its own `package.json` and configuration and can be started, stopped or replaced on its own.

---

## 2. Technology Stack

| Layer      | Technology                                               |
| ---------- | -------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), React 19, TypeScript            |
| Gateway    | NestJS 12, `@nestjs/config`, native `fetch`              |
| Services   | NestJS 12, `class-validator`, official `mongodb` driver  |
| Database   | MongoDB Atlas (one database per service)                 |
| Runtime    | Node.js 22+                                              |

---

## 3. Project Structure

```
task/
├── api-gateway/
│   └── src/
│       ├── main.ts                 # bootstrap, CORS, port
│       ├── app.module.ts
│       ├── gateway.service.ts      # forward(): proxies a request to a service
│       ├── user.controller.ts      # /user/*   → user-service
│       ├── course.controller.ts    # /course/* → course-service
│       ├── health.controller.ts    # GET /health
│       └── logger.middleware.ts    # logs every incoming request
├── user-service/
│   └── src/
│       ├── main.ts
│       ├── database.ts             # MongoDB connection, indexes, seed data, id counter
│       ├── utils/transform.interceptor.ts
│       └── user/
│           ├── user.controller.ts
│           ├── user.service.ts
│           ├── user.logger.ts
│           └── dto/ (user.dto.ts, update-user.dto.ts)
├── course-service/
│   └── src/
│       ├── main.ts
│       ├── database.ts
│       ├── utils/transform.interceptor.ts
│       └── course/
│           ├── course.controller.ts
│           ├── course.service.ts
│           ├── course.logger.ts
│           └── dto/ (course.dto.ts, update-course.dto.ts)
└── frontend/
    ├── app/
    │   ├── page.tsx                # home
    │   ├── login/page.tsx          # login & register
    │   ├── courses/page.tsx        # list, search, edit, delete courses
    │   └── users/page.tsx          # list, search, edit, delete users
    └── lib/
        ├── api.ts                  # fetch wrapper for the gateway
        └── types.ts
```

---

## 4. Setup and Running

### Prerequisites

- Node.js 22 or newer
- A MongoDB Atlas cluster with a database user, and your IP allowed under **Network Access**

### 4.1 Configure environment variables

Each backend component reads its own `.env` file. A `.env.example` template is provided in each folder. Copy it to `.env` and fill in the values.

**user-service/.env**
```dotenv
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-host>/
MONGODB_DB_NAME=users_db
```

**course-service/.env**
```dotenv
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-host>/
MONGODB_DB_NAME=courses_db
```

**api-gateway/.env**
```dotenv
PORT=4000
USER_SERVICE_URL=http://localhost:3000
COURSE_SERVICE_URL=http://localhost:3001
```

The frontend needs no configuration. It uses `http://localhost:4000` by default and can be pointed elsewhere with `NEXT_PUBLIC_API_URL`.

> `.env` files contain credentials and are excluded from version control. Special characters in the database password must be URL-encoded (for example `@` → `%40`).

### 4.2 Install and start

Run each component in its own terminal:

```bash
cd user-service   && npm install && npm run start:dev    # :3000
cd course-service && npm install && npm run start:dev    # :3001
cd api-gateway    && npm install && npm run start:dev    # :4000
cd frontend       && npm install && npm run dev          # :3002
```

Open **http://localhost:3002**.

On first start, each service creates its indexes and seeds sample data if its collection is empty:

- **Users:** `john@example.com` / `password123`, `jane@example.com` / `password456`
- **Courses:** Course 1, Course 2, Course 3

---

## 5. API Reference

All requests go to the gateway at `http://localhost:4000`. Request and response bodies are JSON (`Content-Type: application/json`).

### 5.1 Gateway

| Method | Path      | Description          |
| ------ | --------- | -------------------- |
| GET    | `/health` | Gateway health check |

### 5.2 Users — forwarded to user-service

| Method | Path          | Body                                   | Description                      |
| ------ | ------------- | -------------------------------------- | -------------------------------- |
| GET    | `/user`       | —                                      | List all users (no passwords)    |
| GET    | `/user/:id`   | —                                      | Get one user                     |
| POST   | `/user`       | `{ name, email, password }`            | Register a new user              |
| PUT    | `/user/login` | `{ email, password }`                  | Log in                           |
| PUT    | `/user/:id`   | any of `{ name, email, password }`     | Update only the fields sent      |
| DELETE | `/user/:id`   | —                                      | Delete a user                    |

**Validation rules:** `name` must be at least 3 characters, `email` must be a valid email address, and `password` must be at least 6 characters. Emails are trimmed and lowercased, and each email must be unique.

### 5.3 Courses — forwarded to course-service

| Method | Path          | Body                      | Description                 |
| ------ | ------------- | ------------------------- | --------------------------- |
| GET    | `/course/all` | —                         | List all courses            |
| GET    | `/course/:id` | —                         | Get one course              |
| POST   | `/course`     | `{ name, price }`         | Create a course             |
| PUT    | `/course/:id` | any of `{ name, price }`  | Update only the fields sent |
| DELETE | `/course/:id` | —                         | Delete a course             |

**Validation rules:** `name` must be a non-empty string, and `price` must be a number greater than or equal to 0.

### 5.4 Response format

Every successful response from a service is wrapped by a global interceptor:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { "id": 1, "name": "Course 1", "price": 100 }
}
```

Errors use NestJS's standard error body with the matching HTTP status. The gateway passes them through unchanged:

```json
{ "statusCode": 404, "message": "Course not found" }
{ "statusCode": 400, "message": ["Price must be a non-negative number"], "error": "Bad Request" }
```

If a service cannot be reached, the gateway responds with **503 Service Unavailable** after a 5-second timeout.

### 5.5 Examples

```bash
# Register
curl -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -d '{"name":"Sara Ahmed","email":"sara@example.com","password":"secret123"}'

# Log in
curl -X PUT http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sara@example.com","password":"secret123"}'

# Update only a course's price
curl -X PUT http://localhost:4000/course/1 \
  -H "Content-Type: application/json" \
  -d '{"price":250}'
```

---

## 6. Data Model

**users** (in `users_db`)

| Field      | Type   | Notes                     |
| ---------- | ------ | ------------------------- |
| `id`       | number | Unique, auto-incremented  |
| `name`     | string |                           |
| `email`    | string | Unique, stored lowercase  |
| `password` | string |                           |

**courses** (in `courses_db`)

| Field   | Type   | Notes                    |
| ------- | ------ | ------------------------ |
| `id`    | number | Unique, auto-incremented |
| `name`  | string |                          |
| `price` | number | ≥ 0                      |

The API uses small numeric ids (`1`, `2`, `3`, …) rather than MongoDB `ObjectId`s. Each database has a `counters` collection that hands out the next id atomically (`findOneAndUpdate` with `$inc`), so ids stay unique even when requests arrive at the same time. MongoDB's internal `_id` is never returned by the API.

---

## 7. Frontend

| Page       | Features                                                        |
| ---------- | --------------------------------------------------------------- |
| `/`        | Overview and navigation                                         |
| `/login`   | Log in, or switch to the register form                          |
| `/courses` | List all courses, search by id, edit, delete (with confirmation) |
| `/users`   | List all users, search by id, edit, delete (with confirmation)   |

When editing a user, leaving the password field empty keeps the current password.

---

## 8. Known Limitations and Future Work

- **Passwords are stored in plain text**, and the login and get-by-id responses include them. A production system should hash them (e.g. bcrypt) and never return them.
- **No sessions or tokens.** Login checks the credentials but does not issue a JWT, so no route is protected. A natural next step is to issue a JWT at login and verify it in the gateway.
- **Some user-service errors return a success status.** Login failures, "User not found" and "Email already exists" come back as 200 (201 on register) with only a `message`, while course-service uses proper 4xx codes. The frontend handles both styles.
- **Service ports are hard-coded** (3000 and 3001) in each service's `main.ts`. Only the gateway's port is configurable.
