# Matter Management System - Take-Home Assessment

Welcome! We're excited to see your approach to building a production-ready system.

## What You'll Be Building

You'll be enhancing a **Matter Management System** - a tool for legal teams to track cases and matters. We've provided a working foundation, and you'll implement the missing features.

**Time Estimate**: 4-8 hours  

---

## 📖 Start Here

### Step 1: Read the Instructions
👉 **[ASSESSMENT.md](./ASSESSMENT.md)** - Your main task list and requirements

### Step 2: Understand the Database
👉 **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete schema docs (READ THIS before coding!)

### Step 3: Quick Setup
👉 **[QUICKSTART.md](./QUICKSTART.md)** - Setup guide and troubleshooting

---

## 🚀 Quick Start

```bash
# 1. Verify you have Docker and prerequisites
./verify-setup.sh

# 2. Start everything (takes ~3 minutes to seed 10,000 matters)
docker compose up

# 3. Open the application
open http://localhost:8080

# 4. Check the API
curl http://localhost:3000/health
```

That's it! You now have a running application with 10,000 pre-seeded matters.

---

## 🎯 Your Tasks

We've intentionally left some features incomplete for you to implement:

### 1. ⏱️ Cycle Time & SLA Calculation
Implement logic to track how long matters take to resolve and whether they meet our 8-hour SLA.

**What you'll build**:
- Calculate resolution time from "To Do" → "Done"
- Determine SLA status (Met, Breached, In Progress)
- Display with color-coded badges in the UI

**Files to modify**:
- `backend/src/ticketing/matter/service/cycle_time_service.ts`
- `frontend/src/components/MatterTable.tsx`

### 2. 🔄 Column Sorting
Add sorting functionality to ALL table columns (currently only date sorting works).

**What you'll build**:
- Sort by numbers, text, dates, statuses, users, currency, booleans
- Handle NULL values appropriately
- Work with the EAV database pattern

**Files to modify**:
- `backend/src/ticketing/matter/repo/matter_repo.ts`
- `frontend/src/components/MatterTable.tsx`

### 3. 🔍 Search
Implement search across all fields using PostgreSQL full-text search.

**What you'll build**:
- Search text, numbers, status labels, user names
- Debounced search input (500ms)
- Use pg_trgm for fuzzy matching

**Files to modify**:
- `backend/src/ticketing/matter/repo/matter_repo.ts`
- `frontend/src/App.tsx` (add SearchBar component)

### 4. 🧪 Tests
Write comprehensive tests for your implementations.

**What you'll write**:
- Unit tests for cycle time logic
- Integration tests for API endpoints
- Edge case tests (NULL values, empty data)
- 80%+ coverage on business logic

**Directory**: `backend/src/ticketing/matter/service/__tests__/`

### 5. 📈 Scalability Documentation
Document how your solution would handle 10× the current load (100,000 matters, 1,000+ concurrent users).

**What to include**:
- Database optimization strategies
- Caching approaches
- Query optimization
- Specific, quantified recommendations

**File to update**: This README.md (add your analysis at the bottom)

---

## 🏗️ What We've Built For You

To save you time, we've provided a fully working foundation:

### Database (PostgreSQL)
- ✅ 11 tables with complete schema
- ✅ 10,000 pre-seeded matters with realistic data
- ✅ 8 field types (text, number, select, date, currency, boolean, status, user)
- ✅ Cycle time history tracking (for your implementation)
- ✅ Performance indexes (GIN, B-tree)
- ✅ pg_trgm extension enabled for search

### Backend (Node.js + TypeScript)
- ✅ Express API with proper structure
- ✅ Database connection pooling
- ✅ Basic CRUD endpoints (list, get, update)
- ✅ Error handling framework
- ✅ Winston logging configured
- ✅ Zod validation setup
- ✅ Vitest test configuration

### Frontend (React + TypeScript)
- ✅ React 18 with TypeScript
- ✅ Vite build tooling
- ✅ TailwindCSS styling
- ✅ Matter table with pagination
- ✅ Basic sorting UI (ready for your implementation)
- ✅ Loading and error states

### Infrastructure
- ✅ Docker Compose orchestration
- ✅ Automatic database seeding
- ✅ Health checks
- ✅ Development and production modes

---

## 📊 System Architecture

```
┌─────────────────┐
│   React SPA     │  ← Frontend (Port 8080)
│  (Vite + TS)    │     - Table with pagination
└────────┬────────┘     - YOU IMPLEMENT: Sorting, Search, Cycle Time display
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express API    │  ← Backend (Port 3000)
│  (Node.js + TS) │     - Basic CRUD endpoints
└────────┬────────┘     - YOU IMPLEMENT: Sorting, Search, Cycle Time service
         │
         │ pg (connection pool)
         │
┌────────▼────────┐
│  PostgreSQL 15  │  ← Database (Port 5432)
│  + pg_trgm      │     - 10,000 seeded matters
└─────────────────┘     - Complete schema ready
```

---

## 💾 Database Schema (Quick Overview)

We use an **Entity-Attribute-Value (EAV)** pattern for flexible field definitions. This is important to understand for your sorting and search implementations!

### Key Tables (11 total)

| Table | Purpose | Rows Seeded |
|-------|---------|-------------|
| `ticketing_ticket` | Matter records | 10,000 |
| `ticketing_ticket_field_value` | Field values (EAV table) | ~90,000 |
| `ticketing_fields` | Field definitions | 9 |
| `ticketing_cycle_time_histories` | Status transitions | Variable |
| `ticketing_field_status_groups` | Status groups (To Do, In Progress, Done) | 3 |
| `users` | User assignments | 5 |
| ... + 5 more tables | Options, currencies, etc. | Various |

### 8 Field Types

| Type | Storage Column | Example |
|------|----------------|---------|
| `text` | `text_value` or `string_value` | Subject, Description |
| `number` | `number_value` | Case Number |
| `select` | `select_reference_value_uuid` | Priority |
| `date` | `date_value` | Due Date |
| `currency` | `currency_value` (JSONB) | Contract Value |
| `boolean` | `boolean_value` | Urgent flag |
| `status` | `status_reference_value_uuid` | Matter Status |
| `user` | `user_value` | Assigned To |

**📖 Full Details**: See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for:
- Complete table schemas with column descriptions
- EAV pattern explanation
- Sample SQL queries for sorting and search
- Performance optimization tips
- Index documentation

---

## 🛠️ Development Commands

```bash
# Start everything
docker compose up

# Start in development mode (with hot reload)
docker compose -f docker-compose.dev.yml up

# View logs
docker compose logs -f backend

# Stop services
docker compose down

# Clean up (removes data)
docker compose down -v

# Run tests
cd backend && npm test

# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

---

## 🔌 API Endpoints

### What's Implemented

```http
GET /health
GET /api/v1/fields
GET /api/v1/matters?page=1&limit=25&sortBy=created_at&sortOrder=desc
GET /api/v1/matters/:id
PATCH /api/v1/matters/:id
```

**Note**: `sortBy` currently only supports `created_at` and `updated_at`. You'll add support for field-based sorting (case_number, status, etc.).

### What You'll Add

**Sorting**:
```http
GET /api/v1/matters?sortBy=case_number&sortOrder=asc
GET /api/v1/matters?sortBy=status&sortOrder=desc
```

**Search**:
```http
GET /api/v1/matters?search=contract&page=1&limit=25
```

**Cycle Time/SLA** (added to response):
```json
{
  "data": [{
    "id": "uuid",
    "fields": { ... },
    "cycleTime": {
      "resolutionTimeMs": 14400000,
      "resolutionTimeFormatted": "4h",
      "isInProgress": false
    },
    "sla": "Met"
  }]
}
```

---

## 🧪 Testing

We've configured Vitest for you. You'll write the actual tests.

**Run tests**:
```bash
cd backend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

**What to test**:
- ✅ Cycle time calculations (NULL handling, edge cases)
- ✅ SLA determination logic
- ✅ Sorting with different field types
- ✅ Search across all fields
- ✅ API endpoints (integration tests)
- ✅ Error conditions

**Test location**: `backend/src/ticketing/matter/service/__tests__/`

---

## 🤖 AI Tool Usage

**You may use AI tools** (GitHub Copilot, ChatGPT, Claude, etc.), but:

### ✅ We Expect
- Honest disclosure of which tools you used
- Explanation of what was AI-generated vs. human-written
- Justification for using AI for specific parts
- **Full accountability** for all submitted code

### ❌ Unacceptable
- Blindly copying AI output without review
- Submitting code you don't understand
- Not testing AI-generated code

### Good Example Disclosure
> "I used GitHub Copilot to generate the initial cycle time query structure, but I rewrote the NULL handling logic and added edge case tests manually. The duration formatting function was AI-assisted but I modified it to handle our specific requirements (in-progress matters, very large durations). I am confident in the correctness and can explain every line."

---

## ✅ Submission Checklist

Before you submit, make sure:

### Implementation
- [ ] Cycle time & SLA working correctly
- [ ] Sorting works for ALL columns
- [ ] Search works across all field types
- [ ] Tests written with good coverage
- [ ] Edge cases handled (NULL, empty, missing data)

### Code Quality
- [ ] No TypeScript errors (`npm run build` succeeds in both backend & frontend)
- [ ] No linting errors (`npm run lint` passes)
- [ ] Code follows existing patterns
- [ ] Clear variable and function names
- [ ] Error handling throughout

### Documentation
- [ ] README.md updated with your approach
- [ ] Scalability analysis included (specific, quantified)
- [ ] AI tool usage disclosed (if applicable)
- [ ] Trade-offs explained
- [ ] Setup instructions verified

### Testing
- [ ] Application runs with `docker compose up`
- [ ] Tests pass with `npm test`
- [ ] Edge cases tested
- [ ] Integration tests included

### Performance
- [ ] No N+1 query problems
- [ ] Efficient SQL queries
- [ ] Proper index usage
- [ ] Connection pooling configured

---

## 📂 Project Structure

```
matter-management-mvp/
├── README.md                    ← You're here!
├── ASSESSMENT.md                ← Task instructions
├── DATABASE_SCHEMA.md           ← Schema docs (read this!)
├── QUICKSTART.md                ← Setup guide
├── verify-setup.sh              ← Prerequisites checker
│
├── backend/
│   ├── src/
│   │   ├── ticketing/
│   │   │   ├── matter/
│   │   │   │   ├── service/
│   │   │   │   │   ├── cycle_time_service.ts    ← IMPLEMENT: Cycle time
│   │   │   │   │   ├── matter_service.ts
│   │   │   │   │   └── __tests__/               ← ADD: Your tests
│   │   │   │   ├── repo/
│   │   │   │   │   └── matter_repo.ts           ← IMPLEMENT: Sorting & search
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── getMatters.ts
│   │   │   │   │   ├── getMatterDetails.ts
│   │   │   │   │   ├── updateMatter.ts
│   │   │   │   │   └── getFields.ts
│   │   │   │   └── routes.ts
│   │   │   ├── fields/
│   │   │   │   └── repo/fields_repo.ts
│   │   │   └── types.ts
│   │   ├── db/pool.ts
│   │   ├── utils/
│   │   │   ├── config.ts
│   │   │   └── logger.ts
│   │   └── app.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                      ← ADD: SearchBar component
│   │   ├── components/
│   │   │   ├── MatterTable.tsx          ← IMPLEMENT: Sort handlers, cycle time/SLA display
│   │   │   └── Pagination.tsx
│   │   ├── hooks/
│   │   │   └── useMatters.ts
│   │   ├── types/
│   │   │   └── matter.ts
│   │   └── utils/
│   │       └── formatting.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── database/
│   ├── schema.sql               ← Complete schema
│   ├── seed.js                  ← Seeds 10,000 matters
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml           ← Main compose file
```

---

## 🎓 What We're Looking For

We evaluate across these dimensions:

### 1. Code Quality (25%)
- Clean, maintainable code
- TypeScript best practices
- Follows SOLID principles
- Consistent patterns

### 2. Production Readiness (20%)
- Comprehensive error handling
- Input validation
- Logging with context
- Edge case handling

### 3. Security (15%)
- SQL injection prevention
- Input sanitization
- Safe error messages

### 4. Testing (20%)
- Unit and integration tests
- Edge case coverage
- Test quality and design

### 5. System Design (15%)
- Query optimization
- Scalability thinking
- Caching strategy
- Trade-off awareness

### 6. Documentation (5%)
- Clear explanations
- Decision justifications
- Scalability analysis

---

## 💡 Tips for Success

1. **Read DATABASE_SCHEMA.md first** - Understanding the EAV pattern is critical
2. **Start with cycle times** - It's the foundation for other features
3. **Test as you go** - Don't wait until the end
4. **Think production** - This is meant to be production-ready code
5. **Document your thinking** - Explain WHY, not just WHAT
6. **Be honest about AI** - We value transparency
7. **Manage your time** - 4-8 hours total, prioritize accordingly

---

## ❓ Questions?

- **Setup issues?** See [QUICKSTART.md](./QUICKSTART.md)
- **Schema questions?** See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Task unclear?** Document your assumptions in your submission
- **Found a bug in the boilerplate?** Note it in your README

We're interested in how you think through ambiguity. Make reasonable assumptions and document them.

---

## 🚀 Ready to Start?

1. ✅ Read [ASSESSMENT.md](./ASSESSMENT.md) for detailed requirements
2. ✅ Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) to understand the data model
3. ✅ Run `docker compose up` to start the system
4. ✅ Start coding!

**Good luck! We're excited to see your solution.** 🎉

---

**Happy coding! 🚀**

---

# Development Notes

# Setup Instructions

If you've arleady run up an instance of this project, you'll need to rebuild the database to apply new indexes. Do this with:

`docker compose -f docker-compose.dev.yml up --build`

Setup is otherwise as described in [QUICKSTART.md](./QUICKSTART.md).

# Getting Started

I read QUICKSTART.md and went from there - going over all provided documentation.

At this stage, I use AI to read over the project and "brain dump" all the important information about the project. This saves me hours going through the codebase to understand how everything is working.

It then allows me to query the codebase, asking questions about where things are and how they're connected. This ultimately saves development time as I have an "assistant" 

For example, I now have a complete overview of the backend with a simple question asking for an overview of the backend architecture - this is immensely useful!

Here's the backend architecture breakdown:

  ---
  Backend Architecture

  HTTP Request
       │
       ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  app.ts (Express Server)                                    │
  │  - Middleware (helmet, cors, json parsing)                  │
  │  - Request logging                                          │
  │  - Routes: /api/v1 → matterRouter                           │
  └─────────────────────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  routes.ts (Router)                                         │
  │  - GET  /matters      → getMatters handler                  │
  │  - GET  /matters/:id  → getMatterDetails handler            │
  │  - PATCH /matters/:id → updateMatter handler                │
  │  - GET  /fields       → getFields handler                   │
  └─────────────────────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  handlers/getMatters.ts                                     │
  │  - Validates query params with Zod (page, limit, sort, etc) │
  │  - Instantiates MatterService                               │
  │  - Calls matterService.getMatters(params)                   │
  │  - Returns JSON response                                    │
  └─────────────────────────────────────────────────────────────┘
       │
       ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  service/matter_service.ts                                  │
  │  - Business logic layer                                     │
  │  - Uses MatterRepo to fetch data                            │
  │  - Uses CycleTimeService to enrich each matter              │
  │  - Adds cycleTime + sla to each matter before returning     │
  └─────────────────────────────────────────────────────────────┘
       │
       ├──────────────────────────┐
       ▼                          ▼
  ┌──────────────────┐    ┌──────────────────────────────────────┐
  │  repo/           │    │  service/cycle_time_service.ts       │
  │  matter_repo.ts  │    │  - YOUR TASK: Calculate cycle time   │
  │  - Raw SQL       │    │  - Query ticketing_cycle_time_       │
  │    queries       │    │    histories table                   │
  │  - Returns       │    │  - Determine SLA status              │
  │    Matter[]      │    │  - Format durations                  │
  └──────────────────┘    └──────────────────────────────────────┘
       │
       ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  db/pool.ts                                                 │
  │  - pg.Pool connection pool                                  │
  │  - Max 20 connections                                       │
  │  - Shared across all repos                                  │
  └─────────────────────────────────────────────────────────────┘
       │
       ▼
     PostgreSQL


I then assess how docker is setup and run it. Works as expected. I look over the database through pgAdmin and get a good feel for how the application is using the database schema.

I switched to the dev docker and immediately had a few issues.

1) The seed tried to run again - not too big of a deal because it failed to insert duplicates and exited. But there should be a simple check in the seeding file to check if it has already been done. I did this with an account check. This is an assumption for all data being seeded correctly, but it'll do for now. A more advanced seeding system could be implemented to improve this in the future.

2) matter-management-backend-dev >> sh: tsx: not found
Because I built non-dev docker first and lost devDependencies. Rebuilt with dev and all good.




# Task 1

The requirements say to use joins to identify the status groups. But in the data set given, the groups are already "To Do", "In Progress" and "Done" and this information is already passed in via the _currentStatusGroupName param. We could assume this could be wrong, and perform those extra checks. But then there is probably a larger issue with the incoming data being not what we expect anyway.

Regardless, the query to join the other tables could look something like this, but wasn't used in the end as I felt it wasn't required given the above.

SELECT
(   SELECT tcth.transitioned_at
     FROM public.ticketing_cycle_time_histories AS tcth
     INNER JOIN ticketing_field_status_options AS tfso ON tcth.to_status_id = tfso.id
     INNER JOIN ticketing_field_status_groups AS tfsg ON tfso.group_id = tfsg.id
     WHERE ticket_id = $1
     ORDER BY transitioned_at ASC
     LIMIT 1
) AS first_transitioned,
(   SELECT tcth.transitioned_at
     FROM public.ticketing_cycle_time_histories AS tcth
     INNER JOIN ticketing_field_status_options AS tfso ON tcth.to_status_id = tfso.id
     INNER JOIN ticketing_field_status_groups AS tfsg ON tfso.group_id = tfsg.id
     WHERE ticket_id = $1
     ORDER BY transitioned_at DESC
     LIMIT 1
) AS last_transitioned;


The final query without the joins worked. However, when I got to thinking about optimization towards the end of the task, this was clearly going to be a bad idea as we end up creating an n+1 query scenario when loading matters. So I ended up transitioning this into the matter_repo.ts file as sub queries. These are generally faster than the joins and gives us the required information for the cycle_time_service ahead of time. It reduces queries to the database and reduces the overall response time. Plus a much better separation of logic!


## Thoughts on Caching

I would consider moving the cycle time calculations to the client-side which would. This would solve the issue of stale Resolution Time being displayed on the frontend should a CDN be used. We could set a short TTL of around 60s and use it with Cloudflare which would significantly reduce the load on the database. Combine this with cache invalidation on status changes and it could be a solid solution.



# Task 2

This task is challenging because I need to sort columns with the EAV pattern which is quite complex.
I started by figuring out what I needed to sort by. I didn't want to hardcode UUIDs in the backend, so I figured since the frontend already has this information, along with the data type, that information could be passed to the backend to then query the database based on those fields and data type.

From there it was a matter of matching that up against correct joins and columns in the backend.
The frontend sorting functionality was quite simple to implement.

I had a bit of difficulty with sorting Resolution Time and SLA. See the comments in the matter_repo.ts file.

Lastly tests are partially implemented. I feel you can get the gist of what I was doing and felt I needed to move on from this task onto the final task.

## Some Notes

Spec for sorting text says to use string_value - but subject is text and is found in text_value. I've used COALESCE to handle both cases.

Note that while Contract Value sorting is accurate in terms of number sorting. It's not in terms of value sorting. The difference in currency would change the sort order.


# Task 3

For this I started with the frontend as there was a bit of work involved to create a SearchBar component and then integrate it. I noted in previous tasks that the useMatter hook already has the search param being sent to the server. So for the beginning of this task I was simply hooking into that existing structure.

For the search component. I used AI to generate the SVG icons. Usually I would store these in an Icon component, or use existing Hero Icons.
I also used it to get an understanding of pg_trgm since I had not used it before. The examples it provided allowed me to construct the search query.

For the tests, I used AI to generate a good outline of tests which would cover off a good amount of use cases. I then went through each one and wrote the checks for each test.

There are more tests that could be written like testing combined features. But I chose to focus on the main meat of the tests and edge cases that I could think of. More specific tests could also be written against known data in a test database. 


## Issue

Searching for Cycle Time and SLA for this implementation isn't possible due to "production readiness" requirement. Trying to bolt it into the search query would be very inefficient (you can see issues with this in task 2). It also would not pass the "Handle 10,000+ records efficiently" requirement. I think this data should be pre-calculated whenever the status of a record changes. Then they could be stored in their own columns which would be easily searchable and sortable.

# Things I would improve.

1) The frontend "Fields" don't have great type safety. Long term, I would think about pulling fields from the backend and using them in a safer way than relying on fixed text or constants.

2) Use URI params for search. Better state, easier to navigate, can share full search queries.



# Scalability

This solution scales to a point. But it certainly needs some of the improvements that I've mentioned above, and in the code. Things like pre-calculating cycle times and cloudflare caching with short TTL would do wonders. We could also integrate query result caching into Redis with a 60-second TTL for even more caching!

Production could have scalability through horizontal scaling using a load balancer and also better handling of database connection pool.

Overall, I am not a fan of this database pattern. The very first major project I worked on over 20 years ago was based on this EAV pattern (a classified engine) and it was always a challenge to work with and optimize. It adds a level of complexity that compounds at scale!

I haven't worked on software with this pattern since because it's been done either with MongoDB or using JSONB fields which if architected correctly can provide similar flexibility and simplify querying - usually with better performance.

# My General Notes


## Docker
Docker is setup to split frontend and backend into two build processes. Both rely on a dedicated Dockerfile.

Frontend Dockerfile builds an nginx service.
Backend Dockerfile builds a nodejs (express) service.

Dependencies are in place to ensure services report back as healthy (see HEALTHCHECK in Dockerfile or healthcheck block in docker-compose).

Lastly there is a postgres (database) service with an additional seed service.