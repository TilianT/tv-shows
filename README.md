# TV Show Explorer

Vue 3 + Vite app that lets users discover TV shows — browse by genre, search, view details, and manage favourites.

The app uses an **API facade + provider** approach around the TVMaze API so the UI/domain logic works with app models (not TVMaze DTOs), keeping the app largely API-agnostic.

Live demo: https://sprightly-cassata-7e2792.netlify.app/

---

## Setup

**Requirements:** Node.js `^20.19.0 || >=22.12.0`, npm

```bash
npm install
npm run dev        # dev server
npm run build      # production build
npm run preview    # preview build
npm run type-check # TypeScript check
npm run test:unit  # unit tests
npm run lint       # eslint + oxlint
npm run format     # prettier
```

---

## Tech Stack

|                         |                       |
| ----------------------- | --------------------- |
| Vue 3                   | `^3.5.40`             |
| Pinia                   | `^4.0.2`              |
| Vue Router              | `^5.2.0`              |
| Vite                    | `^8.1.5`              |
| TypeScript              | `~6.0.0`              |
| Vitest + Vue Test Utils | `^4.1.10` / `^2.4.11` |

---

## Project Structure

```
src/
  api/            # API facade + TVMaze provider + DTO mappers
  components/     # reusable UI components
  models/         # app domain models (Show, Cast, Episode)
  router/         # routes
  store/          # Pinia stores + helpers + config
  styles/         # global styles, skeleton shimmer
  utils/          # cache, debounce, text helpers
  views/          # page components
  __tests__/      # unit tests
```

---

## Pages / Routes

Routes are defined in `src/router/index.ts`.

- `/` (Home): loads the main show list and renders sections/rows of shows. Also drives navigation to genre collections.
- `/show/:id` (Details): show details page (header + cast + episodes).
- `/genre/:genre` (Genre): shows for a specific genre.
- `/favorites` (Favorites): user’s saved favourites list.
- `/search` (Search): search results.

---

## Architectural Decisions

### API facade + Provider layer

All TVMaze calls go through a provider interface in `src/api/`. Raw TVMaze DTOs are mapped to internal domain models at the boundary. The rest of the app only knows about `Show`, `CastMember`, and `Episode` — not TVMaze's response shapes. Swapping the data source requires only a new provider.

### Genre map from accumulated pages

TVMaze has no endpoint for fetching shows by genre. The `/shows?page=N` endpoint returns up to 250 shows per page. On load, the app fetches pages sequentially, maps each show into genre buckets, and builds a `genreMap: Map<string, Show[]>`. Each bucket is sorted by rating on the first build. Subsequent pages are appended to the end of each bucket without re-sorting so it prevents jumping as the user is scrolling through them.

### Unified localStorage cache

Instead of caching individual API pages under separate keys, the app writes a single `{ page, shows }` entry after every fetch. On the next visit that one entry is read, the `genreMap` is rebuilt in one pass, and the page cursor is restored — all synchronously before the first component renders.

### In-memory caches for show details, cast, and episodes

Once a show's detail, cast, or episode list is fetched it's held in a `Map<id, data>` for the lifetime of the session. Navigating back to the same show page is instant and generates zero API calls.

### Hover prefetch on show cards

Hovering a show card for 200 ms triggers a prefetch of that show's details into the in-memory cache. By the time the user clicks, the detail page data is already there.

### Lazy-loaded home page rows

Each genre row on the home page is a `ShowSection` component that registers a vertical `IntersectionObserver` on itself. The row does not render its show cards until it enters the viewport. Off-screen rows are lightweight placeholder containers.

### Genre page: chunked infinite scroll

The genre detail page renders shows in chunks of 12 (desktop)/ 4 (mobile). An `IntersectionObserver` on a sentinel element at the bottom of the grid triggers either a local chunk reveal or an API page fetch when the local list is exhausted.

### `<link rel="dns-prefetch">` in `index.html`

A DNS prefetch hint for `api.tvmaze.com` and `https://static.tvmaze.com` is added in the document `<head>`. The browser resolves the hostname before the first API call is made, shaving a round-trip off the initial load.

---

## State Management

#### `useShowsStore` (`src/store/shows.ts`)

Responsibilities:

- Restore the show list and page cursor from `localStorage` synchronously at store creation (`restoreCache`).
- Fetch and accumulate API pages into a `genreMap` (`loadMoreShows`).
- Persist the accumulated list as a single `{ page, shows }` cache entry after every fetch.
- Hold in-memory caches for show details, cast, and episodes to avoid redundant API calls.
- Maintain favourites and recently viewed (both persisted to `localStorage`).

Related:

- `src/store/shows.helpers.ts` — building and sorting genre buckets.
- `src/store/shows.config.ts` — cache keys, TTLs, limits.

#### `useShowsSearchStore` (`src/store/shows.search.ts`)

Responsibilities:

- Fetch and sort search results by rating.
- Trim query; return empty results on empty input.

---

## Dependencies

The app uses as few dependencies as possible — everything else is platform APIs and Vue.

| Dependency                     | Why                  |
| ------------------------------ | -------------------- |
| `vue`, `pinia`, `vue-router`   | Core framework stack |
| `vite`, `@vitejs/plugin-vue`   | Build tooling        |
| `typescript`, `vue-tsc`        | Type safety          |
| `vitest`, `@vue/test-utils`    | Unit testing         |
| `eslint`, `oxlint`, `prettier` | Code quality         |

No UI component library. No utility library (lodash etc.). CSS, DOM APIs, and Vue's built-ins cover everything the app needs.

---

## AI Usage

GitHub Copilot was used throughout development to accelerate the work, specifically:

- **Boilerplate and base components** - initial component scaffolding, SCSS structure, and repetitive template patterns were drafted by Copilot, freeing time for architecture, stores, and application logic.
- **Regex and data parsing** - one-off patterns for stripping HTML from TVMaze summaries, parsing cache TTLs, and formatting ratings were generated by Copilot rather than looked up.
- **Test writing** - As the main architecture, store, utils are completed AI tools help to write test much faster than usual.

All generated code was reviewed, tested, and frequently rewritten as AI tools leaves bugs, many duplicated code, bad namings, etc.

---

## Known Limitations & Future Improvements

**API constraints**

- The `/shows?page=N` endpoint does not support filtering, sorting, or custom page sizes. The 250-shows-per-page limit is fixed.
- TVMaze has no genre endpoint. The app must fetch all shows page-by-page and build the genre map client-side.
- Rating data is missing for many shows. Unrated shows are sorted to the end of each genre bucket.

**Rating sort across pages**

Page 0 shows are sorted by rating. Shows from subsequent pages are appended to the end of each genre bucket without re-sorting. This is intentional - re-sorting on every page load causes visible position jumps as the user scrolls. If user loaded many pages on the next reload all the stored shows would be sorted in the right way.

**`KeepAlive` on Home only**

`<KeepAlive>` is applied only to the Home route (`meta.keepAlive = true`). Home is the only view worth keeping alive: it holds chunked genre row state and active `IntersectionObserver` instances. Without it, navigating back to Home re-mounts the component, replays all the chunk reveals, and drops the user back to the top of the page. All other routes mount fresh on every visit.

**Potential future improvements**

- Service Worker for offline support and background cache refresh
- Virtual scrolling on the genre page for very large genre buckets (500+ shows)
- Keyboard navigation improvements for the show card grid (arrow key focus management)
- Search by cast crew members
- Episode season grouping on the detail page
