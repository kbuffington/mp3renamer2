# MP3 Renamer2

Electron + Angular desktop app for MP3 file renaming, ID3 tagging, MusicBrainz metadata retrieval, and album artwork downloading. Rewrite of an older LabWindows/CVI tool, tailored to foobar2000 conventions.

## Tech Stack

- **Frontend:** Angular 17 with TypeScript 5.3
- **Desktop:** Electron 29 (main process in `main.js`)
- **UI:** Clarity Design System (clr/cds) v17
- **State:** RxJS BehaviorSubjects in services (no NgRx)
- **ID3:** node-id3tag for MP3 metadata I/O
- **Build:** Angular CLI, electron-packager

## Commands

- `npm start` - Angular dev server (localhost:4200)
- `npm run start-id3` - Compile node-id3 module + launch Electron
- `npm run build` - Build Angular app to dist/
- `npm run build:win` - Build + package for Windows (win32-x64)
- `npm run build:osx` - Build + package for macOS (darwin-x64)
- `npm test` - Run unit tests (Karma + Jasmine)
- `ng lint` - ESLint

## Project Structure

```
src/app/
  classes/        # Data models (Track, MetadataObj, MusicBrainz types)
  components/     # Angular components (main, left-panel, right-panel, renamer-grid, etc.)
  services/       # Business logic & state (TrackService, MusicbrainzService, ConfigService, etc.)
  directives/     # Custom directives (auto-focus)
  editable-cell/  # Inline editing component
  input-field/    # Reusable input component
  css/            # Shared SCSS variables
main.js           # Electron main process (file I/O, IPC, ID3 read/write, downloads)
config.json       # User-specific app configuration (paths, API keys)
```

## Path Aliases (tsconfig)

- `@classes/*` -> `app/classes/*`
- `@components/*` -> `app/components/*`
- `@directives/*` -> `app/directives/*`
- `@services/*` -> `app/services/*`

## Code Style

- **Formatting:** Prettier - single quotes, 4-space indent, 100 char width, trailing commas, no arrow parens
- **Linting:** ESLint with Google style guide + TypeScript plugin
- **Max line length:** 130 (ESLint), 100 (Prettier)
- **Quotes:** Single quotes (template literals allowed)
- **Naming:** PascalCase classes, camelCase properties/methods, kebab-case files and CSS classes
- **Components:** Standard Angular pattern (`name.component.ts/html/scss/spec.ts`)
- **Selectors:** Kebab-case (e.g., `<renamer-grid>`)

## Architecture Notes

- Single `AppModule` (no feature modules) - all components declared in one module
- State management via `TrackService` using RxJS BehaviorSubjects (subscribe in ngOnInit, unsubscribe in ngOnDestroy)
- Forms use `[(ngModel)]` two-way binding (FormsModule)
- Electron main process handles file system operations and ID3 tag I/O via IPC
- `@electron/remote` used for main-process calls from renderer
- HTTP caching: custom `CacheInterceptor` with 12-hour localStorage cache for MusicBrainz API
- `TitleFormatService` implements `%variable%` templating for filename patterns
- Metadata pipeline: NodeID3 raw frames -> Track -> MetadataObj (with MetadataProperty wrappers) -> edit -> write back
