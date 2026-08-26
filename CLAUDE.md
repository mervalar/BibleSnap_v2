# BiblePause v2 — Claude Guide

## Project Overview

BiblePause (formerly BibleSnap; the app name changed because "BibleSnap" was already taken — the repo/folder name and API domain remain unchanged) is a Bible study and spiritual development app with a Laravel REST API backend and a React Native (Expo) mobile frontend. Users can read the Bible across multiple books and translations, write journal notes, track daily study progress, save and highlight favourite verses, and view weekly consistency charts.

Production API base URL: `https://biblesnap.bellatis.com/api`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Laravel 12 (PHP 8.2+) |
| Database | SQLite (dev) / MySQL-compatible |
| Auth | Laravel Sanctum (token-based) |
| Queue / Cache / Session | Database driver |
| Frontend | React Native 0.81 via Expo 54 |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| HTTP client | Axios |
| Local storage | AsyncStorage |
| Charts | react-native-chart-kit |
| Linting (backend) | Laravel Pint |
| Build (backend assets) | Vite |

---

## Folder Structure

```
BibleSnap_v2/
├── backend/                        # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/               # Domain API controllers
│   │   │   ├── AuthController.php
│   │   │   ├── ProgressController.php
│   │   │   └── SavedVersersController.php
│   │   └── Models/
│   ├── routes/
│   │   ├── api.php                # All REST endpoints
│   │   └── web.php
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── JsonBible/                 # bookpicker.json (Bible metadata)
│   └── tests/Feature/ tests/Unit/
│
└── frontend/                       # Expo React Native app
    ├── screens/                   # Page-level components
    ├── components/                # Reusable UI (grouped by domain)
    │   ├── home/  bible/  book/  journal/  profile/  savedVerses/
    ├── hooks/                     # Custom hooks (one per feature)
    ├── api/                       # Axios service modules
    ├── styles/                    # StyleSheet files (*.styles.js)
    ├── constants/
    ├── utils/
    └── assets/
```

---

## Naming Conventions

### Backend
- **Models**: PascalCase singular (`User`, `UserNote`, `SavedVerse`)
- **Controllers**: PascalCase + `Controller` suffix (`UserNoteController`)
- **Methods**: camelCase (`store`, `getNotesByCategory`)
- **Tables**: snake_case plural (`user_notes`, `saved_verses`)
- **Migrations**: `YYYY_MM_DD_HHMMSS_verb_noun_table`
- **Variables**: camelCase

### Frontend
- **Screen/page files**: `PascalCase.jsx` (e.g. `HomePage.jsx`)
- **Component files**: `PascalCase.jsx` (e.g. `AuthModal.jsx`)
- **Hook files**: `use` prefix + camelCase (e.g. `useJournal.js`)
- **API service files**: camelCase + `Api` or `Service` suffix (e.g. `journalApi.js`, `bookService.js`)
- **Style files**: `ComponentName.styles.js`
- **Constants**: `UPPER_SNAKE_CASE`
- **Variables / state**: camelCase

---

## Coding Patterns

### Backend Controllers

- Place domain-specific API controllers under `app/Http/Controllers/Api/`
- Use standard CRUD method names: `index`, `store`, `show`, `update`, `destroy`
- Add named methods for filtered queries: `getNotesByCategory`, `getByTestament`, etc.
- Always validate with `$request->validate()` or `Validator::make()`
- Wrap logic in try/catch and return consistent JSON:

```php
// Success
return response()->json(['success' => true, 'data' => $data], 200);

// Error
return response()->json(['success' => false, 'message' => '...', 'error' => $e->getMessage()], 500);
```

- HTTP status codes to use: 200, 201, 400, 401, 404, 422, 500

### Backend Models

- Define `$fillable` for every model (no `$guarded = []`)
- Use `$casts` for array, integer, boolean, and datetime columns
- Define Eloquent relationships (`belongsTo`, `hasMany`) — no raw queries for joins
- Add custom static methods for recurring queries (e.g. `Progress::getTodayProgress()`)

### Backend Routes

- All endpoints live in `routes/api.php` under the `/api` prefix
- Group protected routes with `middleware('auth:sanctum')`
- Public routes (books, categories) require no middleware
- Example structure:

```php
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('user-notes', UserNoteController::class);
    Route::get('/notes/by-category/{id}', [UserNoteController::class, 'getNotesByCategory']);
});
```

### Frontend Hooks

- Each feature has a dedicated custom hook in `frontend/hooks/`
- Hooks own all state, data fetching, and derived logic for their feature
- Always include loading and error states:

```js
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

- Wrap API calls in try/catch, show errors via `Alert.alert()`
- Use AsyncStorage for persistent auth tokens and user preferences

### Frontend Components

- Screens (pages) live in `frontend/screens/`, reusable UI in `frontend/components/`
- Functional components only — no class components
- Styles live in a co-located `ComponentName.styles.js` file using `StyleSheet.create()`
- Import theme constants from `styles/theme.js` — do not hardcode colours
- Use `RefreshControl` for pull-to-refresh on lists

### Frontend API Services

- All HTTP calls go through service files in `frontend/api/`
- Use Axios, attach the Sanctum token from AsyncStorage
- Return raw data (let hooks handle state updates)

---

## Error Handling

### Backend
- Every controller method uses try/catch
- Validation errors (422) are handled automatically by `$request->validate()`
- Never expose raw stack traces to the client in production
- Use consistent JSON envelope for all responses (see pattern above)

### Frontend
- Catch errors from every API call
- Surface user-visible errors with `Alert.alert('Error', message)`
- Show a loading indicator during async operations
- Validate user input in the component before calling an API

---

## Database Guidelines

- Always write a new migration — never edit an existing one
- Use `$table->foreignId('user_id')->constrained()->cascadeOnDelete()` for user-owned rows
- Use `$table->json('column')` for array data (e.g. `related_verses`)
- Add indexes on columns used in `WHERE` clauses (especially `user_id`, `score_date`)
- Unique constraints on natural keys (e.g. `user_id + book + chapter + verse + translation` for saved verses)
- Bible book metadata lives in `JsonBible/bookpicker.json`, not in a database table — do not move it without a clear reason
- `user_notes.status` (the old `not_started|in_progress|completed` enum) is retired for the Application feature — progress is now tracked via `user_notes.progress_percent` (0-100). The `status` column is left in place (unused) rather than dropped, to avoid a destructive migration on production data

---

## Testing

**Backend (PHPUnit 11)**
- Feature tests go in `tests/Feature/`, unit tests in `tests/Unit/`
- Extend `Tests\TestCase` (which refreshes the database via `RefreshDatabase` trait)
- Use model factories for test data
- Run tests: `php artisan test`

**Frontend**
- No automated tests currently exist — manual testing is the current approach
- When adding new hooks or API services, test the golden path manually on both iOS and Android simulators

---

## Rules for Modifying Code

1. **Make minimal, targeted changes.** Do not rewrite a file to fix one line.
2. **Match existing style exactly** — indentation, spacing, naming, brace placement.
3. **Do not add abstractions not already present** (no repositories, no service classes, no event buses unless already used).
4. **Do not add comments** unless the logic is genuinely non-obvious. Existing code has few comments — keep it that way.
5. **Do not introduce new packages** without explicit user confirmation.
6. **Do not add error handling for impossible scenarios.** Only validate at system boundaries (user input, external API responses).
7. **Do not rename existing models, files, or methods** to fix naming inconsistencies (e.g. `starks`, `note_categorie`) — the inconsistencies exist in live data and routes.
8. **Never skip Laravel Pint or `php artisan test`** when touching backend code.
9. **Keep API responses in the established JSON envelope** (`success`, `data` / `message`, `error`).
10. **Frontend style changes must use `StyleSheet.create()`** and reference `theme.js` colours.

---

## Keeping CLAUDE.md Up to Date

Whenever a change introduces a new structural, architectural, or pattern-level decision (new folder, new abstraction, new naming convention, new API response shape, new coding pattern, etc.), update the relevant section of `CLAUDE.md` immediately after making the change.

- Edit only the affected section — do not rewrite the whole file.
- Keep additions minimal and consistent with the existing style.
- Do not update `CLAUDE.md` for routine bug fixes, small UI tweaks, or changes that follow an already-documented pattern.

---

## How Claude Should Behave in This Project

- Read the relevant controller, model, and route before proposing any backend change.
- Read the relevant hook, screen, and styles file before proposing any frontend change.
- Propose the smallest diff that satisfies the request; confirm with the user before doing more.
- When asked to add a new feature, follow the existing pattern for the closest similar feature.
- When something is ambiguous, ask one clarifying question rather than making assumptions.
- Always check `routes/api.php` before creating a new route (avoid duplicates).
- Always check `database/migrations/` before creating a new migration (check if the column already exists).
- Prefer `php artisan make:controller`, `make:model`, `make:migration` over writing boilerplate by hand.
- Do not push, deploy, or run destructive commands without explicit confirmation.
