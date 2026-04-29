# Movie & Box Office Tracking Platform

A modern, UI-first platform that shows Now Showing, Trending, and Upcoming movies (via TMDB) and optionally tracks live ticket sales from BMS using Claude + Codex + Playwright + Exa + DeepSeek.

## Quick Start

1. Clone / copy this folder.
2. Install Node.js 18+ and Python 3.9+.
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in your TMDB API key (get free key at https://www.themoviedb.org/settings/api)
   # For scraper: fill DEEPSEEK_API_KEY, EXA_API_KEY if you want live data.
   ```
# Movie Platform System (WIP)

A production-oriented movie discovery and box office tracking platform focused on data accuracy, clean architecture, and scalable design.

---

##  Core Idea

Build a reliable system for:

* Movie discovery (global catalog via TMDB)
* Structured movie + cast/crew data
* Box office tracking (best-effort, improving over time)
* Clean and intuitive UI

---

##  Architecture (Planned)

* Frontend: React (Lovable for UI prototyping)
* Backend: Node.js + Express (in progress)
* Database: PostgreSQL (planned)
* Data Sources:

  * TMDB API
  * Future scraping pipeline for box office data

---

##  Development Approach

* Backend-first (built in vertical slices)
* Contract-based data layer (MovieDataClient pattern)
* AI-assisted workflow (Claude, Codex)
* Strong focus on:

  * data consistency
  * avoiding duplicates
  * clean API design

---

##  Current Status

* [ ] Project planning and system design
* [ ] Frontend architecture defined
* [ ] Backend API development (starting)
* [ ] Database integration
* [ ] Box office data pipeline

---

##  Goal

To build a production-grade movie data platform that balances:

* usability
* accuracy
* scalability

---

##  Notes

* Box office data is currently "best-effort" and will improve over time.
* No showtime tracking in v1 due to lack of reliable global APIs.
