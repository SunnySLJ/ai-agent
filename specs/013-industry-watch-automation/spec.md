# Feature 013: AI Industry Watch Automation

## Why

The project now requires daily AI industry intelligence, but the current state only has a manual rule and template. The completion audit explicitly says automatic scheduled collection has no script, cron, GitHub Actions, or runtime evidence.

## Scope

- Add a configurable source list for official RSS/Atom feeds.
- Add a standard-library Python collector that fetches RSS/Atom feeds, filters relevant AI Agent/RAG items, deduplicates entries, and writes `logs/industry/YYYY-MM-DD.md`.
- Add a GitHub Actions workflow that runs every day around Beijing morning and commits the daily log when changed.
- Add tests for RSS/Atom parsing, filtering, Markdown output, failure recording, and CLI writing.
- Run the collector once locally for the current day and update completion evidence.

## Out of Scope

- LLM summarization of news.
- Browser scraping of sites without RSS/Atom feeds.
- Logged-in BOSS job screening.
- Paid API integrations.

## Acceptance Criteria

### AC1: Collector parses RSS and Atom

Given RSS and Atom feed payloads,
When the collector reads them,
Then it extracts source, title, link, published date, summary, credibility, impact, and next action.

### AC2: Collector filters and deduplicates relevant items

Given mixed AI and unrelated entries,
When collection runs,
Then only Agent/RAG/model/tooling/job-related items are kept and duplicate links are removed.

### AC3: Collector writes the required daily Markdown

Given collected items and source failures,
When a daily log is rendered,
Then the file contains 今日摘要、资讯记录、对今日计划的影响、backlog、面试表达、待复核 sections.

### AC4: Scheduled automation exists

Given the repository is on GitHub,
When `.github/workflows/industry-watch.yml` runs on schedule or manual dispatch,
Then it invokes the collector and commits `logs/industry/*.md` changes with `GITHUB_TOKEN`.

### AC5: Completion audit is honest

Given the collector can run locally but BOSS and valid model-key smoke are still external blockers,
When docs are updated,
Then the audit marks industry watch automation complete but keeps the remaining external blockers.
