# Movie & Box Office Tracking Platform

A modern, UI-first platform that shows Now Showing, Trending, and Upcoming movies (via TMDB) and optionally tracks live ticket sales from BMS using Playwright + Exa + DeepSeek.

## Quick Start

1. Clone / copy this folder.
2. Install Node.js 18+ and Python 3.9+.
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in your TMDB API key (get free key at https://www.themoviedb.org/settings/api)
   # For scraper: fill DEEPSEEK_API_KEY, EXA_API_KEY if you want live data.
   ```
