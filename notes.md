

# Getting Started

Read QUICKSTART.md and go from there - going over all provided documentation.

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