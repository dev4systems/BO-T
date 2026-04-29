import asyncio
from playwright.async_api import async_playwright
from utils.proxy import ProxyManager
import random
import config
from datetime import datetime

async def scrape_bms_tickets(movie_url: str, proxy_manager: ProxyManager = None) -> str:
    """
    Launch headless browser, go to BMS movie page, wait for ticket counter element,
    return the page HTML of the relevant section or full body.
    """
    proxy = proxy_manager.get_proxy() if config.USE_PROXY and proxy_manager else None
    launch_args = {}
    if proxy:
        launch_args['proxy'] = proxy

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            **launch_args
        )
        page = await context.new_page()
        # Add stealth scripts
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            window.chrome = { runtime: {} };
        """)
        try:
            await page.goto(movie_url, timeout=30000, wait_until='networkidle')
            # Wait for a known element like "tickets sold" or seat layout
            await page.wait_for_selector('text=tickets', timeout=10000)
            await asyncio.sleep(random.uniform(2, 4))  # human-like delay
            content = await page.content()
            return content
        except Exception as e:
            print(f"Scraping error for {movie_url}: {e}")
            return ""
        finally:
            await browser.close()