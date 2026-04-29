import asyncio
from datetime import datetime
from scrapers.bms import scrape_bms_tickets
from utils.deepseek_parser import parse_html_with_deepseek
from utils.exa import find_movie_urls
from utils.db import get_db, save_snapshot
from utils.proxy import ProxyManager
import config

async def run_once():
    # Example: track a few known movies. In production, get list from TMDB or config.
    movies_to_track = [
        "Kalki 2898 AD",
        "Pushpa 2",
        "Jawan",
    ]
    proxy_manager = ProxyManager(config.PROXY_LIST)
    db = await get_db()
    try:
        for movie in movies_to_track:
            print(f"Tracking {movie}...")
            urls = find_movie_urls(movie, chain='BMS')
            if not urls:
                print(f"  No BMS URLs found for {movie}. Skipping.")
                continue
            for url in urls[:1]:  # scrape first valid URL
                html = await scrape_bms_tickets(url, proxy_manager)
                if html:
                    structured = parse_html_with_deepseek(html, movie, chain='BMS')
                    structured['timestamp'] = datetime.now().isoformat()
                    await save_snapshot(db, structured)
                    print(f"  Saved snapshot: {structured['tickets_sold_this_hour']} tickets")
    finally:
        await db.disconnect()

if __name__ == '__main__':
    asyncio.run(run_once())