# Introduction

Personal website for **AnRat / Seph / Aqua**: a portfolio-style home page, an interactive browser/search page, a GitHub Discussions blog, and a file-explorer collection of small tools, games, and experiments.

The site is static HTML, CSS, and vanilla JavaScript. It can be hosted by any static host; there is no build step for the main site.

## Site map

| Path | What it is |
| --- | --- |
| [`/`](index.html) | Main portfolio home page. |
| [`/browser/`](browser/index.html) | Desktop-inspired personal search/browser page. |
| [`/blog.html`](blog.html) | GitHub Discussions-powered blog feed and reader. |
| [`/general.html`](general.html) | General community discussion board. |
| [`/FileExplorer/Tools/`](FileExplorer/Tools/index.html) | Standalone tools directory. |
| [`/addy/Valentines/`](addy/Valentines/index.html) | Valentine-themed interactive page. |
| [`/J/Artistic%20Integrity/`](J/Artistic%20Integrity/index.html) | Artistic Integrity page. |
| [`/tests/text.html`](tests/text.html) | Small development/test page. |

## Main page

[`index.html`](index.html) is the portfolio landing page. It contains:

- An animated loading state, time-aware background, and Mizuki background artwork.
- A header with the file explorer, Blog, tool-directory, and contact links.
- An About Me card with expandable biography text.
- Game-development and full-stack/graphics-design cards, including animated experience counters and portfolio/store links.
- Social links, splash text, and a small terminal-style command area.
- A shared desktop-like File Explorer that can preview local site files, `.href` shortcuts, and supported embedded pages in an iframe. Preview windows can be refreshed, minimized, restored from the dock, or shown fullscreen.

Shared behavior for the main page and browser page lives in [`script.js`](script.js); shared styles live in [`style.css`](style.css). [`background-time.js`](background-time.js) controls the time-sensitive visual treatment.

## Browser page

[`browser/index.html`](browser/index.html) keeps the desktop theme but focuses on web search. It includes:

- A time-aware greeting that begins with a morning/afternoon/evening/rest-style greeting and rotates into question prompts. Greeting text scales to remain on one line.
- A search box that accepts normal search terms and direct `http(s)` URLs. Search state is represented in the URL as `?search=...`.
- Custom web results from the LangSearch-backed API, truncated snippets, and a **Load more** button.
- An optional two-sentence local Ollama summary above results. The page checks for a loaded model at `http://127.0.0.1:11434/api/ps`, then calls `http://127.0.0.1:11434/api/chat`. If local Ollama is unavailable, blocked by CORS, or has no loaded model, no summary is shown.
- A search-mode layout that hides the explorer, splash, terminal, greeting, and most of the header, leaving the search bar and results.
- A double-Enter Google escape hatch when using custom search, plus a settings option to send every search directly to Google.
- Custom desktop-app-style shortcuts under the search box. Their title, URL, and icon are editable; favicon icons are used by default when available.
- Customizable bookmarks to the left of the Google-app menu. The menu closes when the user clicks outside it.
- A Google menu containing Gmail, GitHub, ChatGPT, Classroom, Drive, Calendar, Docs, and Browser settings. These links open in the current tab.
- A profile image that returns to the home page.
- The same File Explorer/preview system as the home page.

### Browser settings

Settings are stored only in the visitor's `localStorage` under `anrat-browser-settings`; no personal settings are sent to the server. They provide:

- Display-name replacement via `{name}` in greeting text.
- Custom opening greetings.
- Extra minute prompts. These are added to the built-in time-based prompt pool rather than replacing it.
- Greeting interval, result batch size, and greeting animation toggle.
- Splash-text and command-bar visibility toggles.
- Mizuki visibility: daytime only, always, or never. Daytime-only hides it from midnight through 6 AM.
- Search behavior: custom results with double-Enter Google, or Google directly.

Saved links and bookmarks are likewise stored in browser-local storage, so each visitor can configure their own desktop without changing the repository.

## Blog and community

[`blog.html`](blog.html), [`blog.js`](blog.js), and [`blog.css`](blog.css) render project updates from GitHub Discussions. The page has a feed, a modal-style post reader, links back to GitHub, and a Giscus comments area.

[`general.html`](general.html) is a Giscus-powered general board. Posting and replying require GitHub sign-in because the content is stored in GitHub Discussions.

## File Explorer content

The explorer reads [`FileExplorer/file-index.json`](FileExplorer/file-index.json), which represents the files under [`FileExplorer/`](FileExplorer/).

| Area | Contents |
| --- | --- |
| `Links` | Discord and YouTube shortcuts. |
| `Misc/Fun` | Magic 8 Ball, music player, and sliders experiments. |
| `Misc/Games` | Doom embed shortcut and Star Catcher game. |
| `Misc/Random` | Secret page. |
| `Tools/Diagrams` | Blueprint Maker for layouts, measurements, furniture, and notes. |
| `Tools/Study` | Paranaque Science Notes shortcut. |
| Root | Portfolio shortcut. |

The [`FileExplorer/Tools/index.html`](FileExplorer/Tools/index.html) page is a separate browsable directory for the tools subset. It reads the same index and resolves `.href` shortcut files before navigating.

## Other standalone pages

- [`FileExplorer/Misc/Fun/Magic8Ball.html`](FileExplorer/Misc/Fun/Magic8Ball.html): themed Magic 8 Ball experience.
- [`FileExplorer/Misc/Fun/MusicPlayer.html`](FileExplorer/Misc/Fun/MusicPlayer.html): music-player experiment.
- [`FileExplorer/Misc/Fun/sliders.html`](FileExplorer/Misc/Fun/sliders.html): slider interaction experiment.
- [`FileExplorer/Misc/Fun/WordWheel.html`](FileExplorer/Misc/Fun/WordWheel.html): randomized letter-wheel crossword game.
- [`FileExplorer/Misc/Fun/WordleUnlimited.html`](FileExplorer/Misc/Fun/WordleUnlimited.html): unlimited Wordle-style game using the shared word list.
- [`FileExplorer/Misc/Games/Star-Catcher.html`](FileExplorer/Misc/Games/Star-Catcher.html): browser game.
- [`FileExplorer/Tools/Diagrams/Blueprint-Maker.html`](FileExplorer/Tools/Diagrams/Blueprint-Maker.html): diagram/layout utility.

## External services and assets

- **Font Awesome** supplies interface icons.
- **GitHub Discussions + Giscus** power the blog and general board.
- **LangSearch** supplies the custom result list through the companion API service at `api.anrat.link`; the same service provides the alphabetized, length-grouped word list used by Word Wheel.
- **Local Ollama** is optional and used only by the browser page for summaries. It is accessed directly on the visitor's own machine, not through the static website.

## Updating the explorer index

GitHub Actions rebuilds and commits [`FileExplorer/file-index.json`](FileExplorer/file-index.json) whenever `FileExplorer/` changes. To update it locally before pushing:

```powershell
node scripts/build-file-explorer-index.mjs
```

## Local preview

Because this is a static site, serve the repository with any local HTTP server rather than opening pages directly from the filesystem. For example:

```powershell
npx serve .
```

Then open the URL printed by the server. The optional local Ollama summary requires Ollama to be running and a model to be loaded.

When visiting the deployed site, Ollama must also allow the site origin. On Windows, set this once and restart Ollama:

```powershell
[Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', 'https://anrat.link,https://www.anrat.link', 'User')
```
