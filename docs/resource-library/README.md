# Resource library

`/resources` combines a small starter collection, public resources shared by club officers, and the researched student hackathon shortlist. It uses the existing site fonts, colors, square borders, offset shadows, header, and footer.

## Publishing resources

1. Sign in through `/officer` and open **Add Resource** in your club dashboard.
2. Add a title, short description, format, and URL. Videos, courses, websites, documents, guides, templates, and tools all retain their URL.
3. Choose **Learn & tools** or **Club materials**, an experience level, and optional comma-separated topics/category.
4. Publish. The resource appears in the shared library and the club's resource page on the next page load.

The officer form publishes public links. Existing officer authentication and server-selected club ownership are retained. Publishing requires the same server credentials as the existing dashboard; no live CMS records were created while developing this feature.

For file uploads, use the existing Sanity Studio **Club Resources** editor. Set the library collection to include a public item in the shared library. Leave it blank to keep a legacy item on its club page. Uploaded files remain supported; an external URL takes precedence when both are present. Members-only records are excluded from public resource pages before their URLs reach the browser.

## Content maintenance

- Starter links: `src/app/resources/curated.mjs`. The initial eight links were checked against the official publishers on September 8, 2026. Public CMS entries can replace the same starter URL without duplicate cards.
- Hackathons: `src/app/resources/hackathons.json`. There are 25 researched events: nine verified open, five portals requiring another check, and eleven watchlist/closed entries as of September 8, 2026. Every event links to its source.
- Excel snapshot: `public/resources/GUPC-Hackathon-Applications-2026.xlsx`. This is a dated download, not a live export. Update its filename/label when replacing it with a newly researched snapshot.

For hackathons, record unknown dates as `null`, preserve uncertainty, and only set `deadlineAt` or `priorityAt` when the closing time and timezone have been verified. The UI advances known deadlines and event dates, and downgrades stale open claims after 14 days. It does not recheck application portals automatically. Recheck the complete shortlist before updating its shared `checked` date.

Search matches names, descriptions, providers, and topics. Hackathon search also includes application notes, so searching for an overlapping event can match more than one entry. The four-person filter only includes events with a verified capacity of at least four.

## Development and verification

The existing lockfile installs with:

```sh
npm ci --legacy-peer-deps --no-audit --no-fund
npm run test:resources
npm run build
```

Use the site's existing `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` configuration for public reads. A resource-fetch failure leaves the curated links and hackathons usable and displays an explicit message for shared club resources.

Fourteen focused tests cover URL safety, URL preservation across formats, optional metadata, public visibility, duplicate handling, search, team size, Eastern/Pacific deadlines, stale openings, and the actual officer handler with in-memory authentication/storage. The handler tests never write to Sanity.

Browser verification covered the real public CMS connection, filters and combined filters, empty states, all 25 hackathon entries, nine confirmed openings, team-size filtering, expandable details, direct section links, the Excel download, an unauthenticated API request, keyboard Escape, and layouts at 1440, 1280, 1024, 768, 390, and 320 pixels. No page errors or horizontal overflow were detected.

The production build completes. The repository's existing ESLint configuration reports a circular-configuration error both before and after this feature; it is not a clean lint baseline. An isolated React/hooks/accessibility lint configuration passed the new library modules, API handler, Header, and Footer. The older officer dashboard also has pre-existing accessibility/comment-text lint findings outside this change.

The resource tests also run on pull requests and pushes to `main`. Vercel's existing Git integration handles preview and production builds.
