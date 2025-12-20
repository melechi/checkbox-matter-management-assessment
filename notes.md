

# Getting Started

Read QUICKSTAR.md and go from there - going over all provided documentation.

At this stage, I use AI to read over the project and "brain dump" all the important information about the project. This saves me hours going through the codebase to understand how everything is working.

It then allows me to query the codebase, asking questions about where things are and how they're connected. This ultimately saves delopment time as I have an "assistant" 

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

The requirements say to use joins to identify the status groups. But in the data set given, the groups are already "To Do", "In Progress" and "Done" and this information is already passed in via the _currentStatusGroupName param. We could assume this could be wrong, and preform those extra checks. But then there is probably a larger issue with the incoming data being not what we expect anyway.

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


The final query without the joins worked. However, when I got to thinking about optimizaiton towards the end of the task, this was clearly going to be a bad idea as we end up creating an n+1 query scenario when loading matters. So I ended up transitioning this into the matter_repo.ts file as sub queries. These are generally faster than the joins and gives us the required information for the cycle_time_service ahead of time. It reduces queries to the database and reduces the overall responce time. Plus a much better separation of logic!


## Thoughts on Caching

I would consider moving the cycle time calculations to the client-side which would. This would solve the issue of stale Resolution Time being displayed on the frontend should a CDN be used. We could set a short TTL of around 60s and use it with Cloudflare which would significantly reduce the load on the database. Combine this with cache invalidation on status changes and it could be a solid solution.


# My General Notes


## Docker
Docker is setup to split frontend and backend into two build processes. Both rely on a dedicated Dockerfile.

Frontend Dockerfile builds an nginx service.
Backend Dockerfile builds a nodejs (express) service.

Dependencies are in place to ensure services report back as healthy (see HEALTHCHECK in Dockerfile or healthcheck block in docker-compose).

Lastly there is a postgres (database) service with an additional seed service


# Things I would improve.

1) The frontend "Fields" don't have great type safety. Long term, I would think about pulling fields from the backend and using them in a safer way than relying on fixed text or constants.

2) 

