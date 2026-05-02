# Session Changes

## Backend — `coreLog_backend`

### 1. `src/utils/quick_list.utils.ts` *(new file)*
A generic reusable pagination/filter utility for any Mongoose model. Used so that movies, series, journal resolvers won't repeat the same boilerplate.

**Interface — `QuickListFilter`**
| Field | Type | Purpose |
|---|---|---|
| `page` / `limit` | number | Pagination controls |
| `search` / `search_fields` | string / string[] | Regex search across given fields |
| `match` | Record | `$in` / exact field matches |
| `min` | Record | `$gte` comparisons (e.g. rating >= 3) |
| `base_query` | Record | Fixed conditions merged into every query (e.g. `user_id`) |
| `sort_by` / `sort_dir` | string / 1\|-1 | Sort control, defaults to `created_at desc` |

**Interface — `QuickListResult<T>`**
| Field | Meaning |
|---|---|
| `data` | Array of documents for the current page |
| `total_count` | Total matching documents across all pages |
| `current_page` | The page that was fetched |
| `per_page` | Items per page |
| `page_count` | `Math.ceil(total / limit)` |
| `has_next_page` | `current_page < page_count` |

---

### 2. `src/api/models/@books/book/index.type.ts`
- Added `started_from?: string`
- Added `finished_on?: string`

### 3. `src/api/models/@books/book/index.model.ts`
- Added `started_from` and `finished_on` fields to Mongoose schema
- Added compound indexes for performance:
  - `{ user_id, status, genres }`
  - `{ user_id, title: "text", author: "text" }`

---

### 4. `src/api/type-defs/@books/book.type-def.ts`
- Added `started_from` and `finished_on` to `Book`, `CreateBookInput`, `UpdateBookInput`
- Added `BookPage` type with renamed fields:
  ```graphql
  type BookPage {
    books: [Book]!
    total_count: Int!
    current_page: Int!
    per_page: Int!
    page_count: Int!
    has_next_page: Boolean!
  }
  ```
- Added `BookFilterInput` input type (search, genres, status, rating, author, page, limit)
- Added `BookFilters` type:
  ```graphql
  type BookFilters {
    genres: [String!]!
    statuses: [String!]!
    authors: [String!]!
  }
  ```
- Updated `get_my_books` query signature to accept `BookFilterInput` and return `BookPage!`
- Added `get_book_filters: BookFilters!` query

---

### 5. `src/api/resolvers/@books/@query/@resolvers/get-my-books.ts`
- Fully rewritten to use `quick_list` utility (~15 lines vs ~60 lines before)
- Supports: text search on `title`/`author`, `$in` filter on `genres`/`status`, `$gte` filter on `rating`, pagination
- Return fields renamed to match new `BookPage` schema

### 6. `src/api/resolvers/@books/@query/@resolvers/get-book-filters.ts` *(new file)*
- Runs 3 parallel `distinct()` queries on the user's books:
  - `genres` — sorted alphabetically
  - `status` — as stored
  - `authors` — sorted alphabetically
- Returns only values the user actually has in their collection

### 7. `src/api/resolvers/@books/@query/index.ts`
- Registered `get_book_filters` resolver

---

## Frontend — `CoreLog`

### 1. `src/@apis/books/structure.ts`
- All 4 GraphQL queries updated to include `started_from`, `finished_on`
- `GET_MY_BOOKS_QUERY` updated to use renamed pagination fields: `total_count`, `current_page`, `per_page`, `page_count`, `has_next_page`
- Added `GET_BOOK_FILTERS_QUERY` — fetches `genres`, `statuses`, `authors`

### 2. `src/@apis/books/index.ts`
- Added `started_from?` and `finished_on?` to `BookInput`
- Added `BookFilter` interface (search, genres, status, rating, author, page, limit)
- Added `BookPage` interface with renamed fields (`total_count`, `current_page`, `per_page`, `page_count`, `has_next_page`)
- Added `BookFilters` interface (`genres`, `statuses`, `authors`)
- Added `get_book_filters_query()` API function

---

### 3. `src/pages/(app)/(dashboard)/books/AddBook.tsx`
- Added `startedFrom` and `finishedOn` to `AddBookForm` interface (default: today's date)
- Conditional date pickers in form:
  - **Started From** — shown when status is `reading` or `read`, blocks future dates
  - **Finished On** — shown only when status is `read`, blocks future dates
- On submit: passes dates to mutation only when status warrants it

### 4. `src/pages/(app)/(dashboard)/books/BooksList.tsx`
Full rewrite from client-side filtering to server-side filtering:

- **Removed** `useMemo` client-side filter logic and hardcoded `GENRE_OPTIONS` / `STATUS_OPTIONS`
- **Added** server-side fetch via `get_my_books_query` with all filters passed as API params
- **Added** 400ms debounce on search input before firing API call
- **Added** loading skeleton components (`GridSkeleton`, `ListSkeleton`)
- **Added** color-coded status badges on both grid and list view cards
- **Added** dynamic filter options fetched from `get_book_filters_query` on mount:
  - Genre dropdown — user's actual genres only
  - Status dropdown — user's actual statuses only
  - Author dropdown — user's actual authors only
  - Empty state message: *"Add books to filter by X"*
- **Added** `authorFilter` state wired to server query `author` param
- Stats (`total`, `completed`, `reading now`) fetched in parallel with filter options on mount, independent of active filters
- Pagination driven by `page_count` and `has_next_page` from server

### 5. `src/pages/(app)/(dashboard)/books/BookDetail.tsx`
- Added `started_from?` and `finished_on?` to `Book` interface
- Added **Started** meta entry with `PlayCircle` icon (blue), shown only when data exists
- Added **Finished** meta entry with `CheckCircle2` icon (green), shown only when data exists

---

## Key rename — pagination fields

| Old name | New name | Where |
|---|---|---|
| `total` | `total_count` | `QuickListResult`, `BookPage`, GraphQL schema, frontend |
| `page` | `current_page` | same |
| `limit` | `per_page` | same |
| `total_pages` | `page_count` | same |
| `has_next_page` | `has_next_page` | unchanged |
| `data` | `data` | unchanged |


# TODO
## Feat

- add series name also
- group by series
- calender view like the timeframe read

## Fix 

- add google book fallback
- fix edit book
- add fraction review also
- more clean ui
