# Verde Escape

A small hospitality frontend built around two imagined cabin stays, quiet editorial presentation and a booking-style planner with explicit date, capacity and pet rules.

![Verde Escape](docs/screenshots/desktop.png)

The project is intentionally frontend-only. It does not pretend to be connected to hotel inventory or payments: the planner calculates an indicative stay and lets the visitor download the result, but it never confirms a reservation.

## The experience

Verde Escape combines a compact retreat website with a functional planning flow:

- two cabin profiles with different capacity, nightly rate and pet policy;
- local project imagery and an interactive gallery/lightbox;
- a stay planner with calendar validation and itemised pricing;
- downloadable stay-plan summary;
- FAQ disclosures and responsive navigation;
- keyboard interaction and reduced-motion behavior.

![Stay planner](docs/screenshots/stay-planner.png)

## The two stays

| Cabin | Nightly rate | Capacity | Dogs |
| --- | ---: | ---: | --- |
| The Lake House | 195 | 2 guests | No |
| The Woodland Suite | 245 | 4 guests | Yes |

The cabin values live with the booking rules in `src/booking.js`, rather than being inferred from presentation markup.

## Stay planner logic

The planner is the main piece of application logic. `calculateStay()` is isolated from DOM rendering so its rules can be tested directly.

A valid plan must satisfy all of the following:

1. the selected cabin exists;
2. arrival and departure are real `YYYY-MM-DD` calendar dates;
3. arrival is today or later;
4. the stay is at least two nights and no more than 21;
5. guest count is a positive integer within the selected cabin capacity;
6. a dog is only accepted for the Woodland Suite.

A valid result returns the number of nights, nightly rate, optional dog fee and total price.

```text
total = nights × nightly rate + dog fee
```

The current dog supplement is a flat 25 for the stay.

## Calendar arithmetic

Date-only booking logic is easy to make dependent on the browser's local timezone or daylight-saving transitions. Verde Escape parses arrival and departure at UTC noon and calculates nights from those normalized timestamps.

It also round-trips each parsed value back to an ISO date before accepting it. That rejects impossible values such as a non-existent calendar day instead of relying only on JavaScript's permissive date parsing.

This is still a demonstration planner rather than an availability engine: there are no blocked dates, inventory records, seasonal prices or server-side reservation conflicts.

## Gallery and interaction

![Gallery](docs/screenshots/gallery.png)

The visual layer uses vanilla JavaScript rather than a UI framework. `src/main.js` coordinates navigation, gallery/lightbox behavior, planner rendering and the rest of the page interactions, while `src/booking.js` remains independent domain logic.

The gallery is keyboard operable, FAQ sections use native disclosure behavior, and nonessential movement is reduced when the operating system requests reduced motion. Desktop presentation includes restrained reveal/parallax effects rather than autoplaying media.

![Mobile](docs/screenshots/mobile.png)

## Stack

HTML5, CSS, vanilla JavaScript and Vite, with ESLint/Prettier for source checks and Playwright for browser coverage.

There is no backend, account system, runtime API or secret configuration.

## Run locally

Requires Node.js 24 and npm.

```bash
npm ci
npm run dev
```

For a production build:

```bash
npm run lint
npm run build
npm run preview
```

`BASE_PATH` can override Vite's base path. Local builds use relative assets; the repository workflow supplies the repository path for GitHub Pages publishing.

## Tests

```bash
npx playwright install chromium
npm test
```

The browser/domain suite covers valid and impossible dates, the two-night minimum, 21-night maximum, cabin capacity, dog restrictions, daylight-saving-safe night calculations, itemised prices, stay-plan download, gallery keyboard interaction, FAQ behavior, mobile navigation, responsive layouts and automated accessibility checks.

The responsive review includes 360, 768, 1440 and 2560 pixel widths. Automated axe scans are regression coverage rather than a claim of full accessibility certification.

## Project structure

```text
src/
  booking.js          Stay rules and price calculation
  main.js             Page and interaction orchestration
  style.css           Responsive visual system
public/
  media/              Project-specific cabin imagery
  icons/              Local interface assets
tests/                Planner and browser coverage
docs/
  ASSETS.md            Image provenance
  screenshots/        Captures from the running application
.github/workflows/    Validation and Pages publishing
```

## Media

The cabin photography represents imagined places rather than a real property. The two project images were generated specifically for Verde Escape and stored locally as WebP files; no stock photographs are fetched by the application. Their provenance is recorded in [docs/ASSETS.md](docs/ASSETS.md).

## Scope

Verde Escape demonstrates the visitor-side planning experience. It does **not** implement:

- live cabin availability;
- reservation persistence;
- payments;
- booking confirmation;
- email delivery;
- customer accounts;
- variable/seasonal pricing.

Those boundaries are intentional: the implemented planner can be evaluated on its own without implying infrastructure that is not present.

MIT licensed; dependencies retain their upstream licenses.