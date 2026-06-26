# Feature 008: Application Conversion Kit

## Why

The project now has enough technical proof: Python Agent Platform, Java Business Tool Service, OpenAPI/MCP contract, Docker Compose runtime, and Eval Dashboard. The next missing part is converting those artifacts into job-search materials that help a 5-year Java engineer interview for AI Agent/RAG application roles around Hangzhou 20K.

## Scope

Create a job-search conversion kit:

- Map current repo artifacts to common AI Agent/RAG job requirements.
- Provide BOSS search links and role-filtering rules.
- Provide resume bullets, project description, self-introduction, and recruiter messages.
- Provide interview proof points and demo order.
- Update existing job/interview docs so they point to the conversion kit.

## Out of Scope

- Applying to jobs automatically.
- Scraping private BOSS pages behind login.
- Claiming production work experience that the user does not have.
- Creating fake metrics beyond local verified portfolio metrics.

## Acceptance Criteria

### AC1: Role fit matrix exists

Given the current portfolio,
When reading the conversion kit,
Then it maps AI Agent/RAG JD requirements to concrete repo evidence.

### AC2: Resume and BOSS copy exists

Given the user wants to apply,
When reading the conversion kit,
Then it contains copy-paste-ready resume bullets and BOSS opening messages.

### AC3: Interview story is concrete

Given an interviewer asks about the project,
When reading the conversion kit,
Then it gives a demo order and proof points tied to Python, Java, MCP, Docker, and evaluation.

### AC4: Existing docs link the kit

Given someone enters from README or interview docs,
When following the document map,
Then they can find the application conversion kit.

### AC5: Source snapshot is explicit

Given job-market pages change quickly,
When reading the kit,
Then BOSS search links are recorded as entry points and the snapshot date is clear.
