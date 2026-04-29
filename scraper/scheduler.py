import schedule
import time
import asyncio
from main import run_once
import config

def job():
    asyncio.run(run_once())

if __name__ == "__main__":
    if config.SCHEDULE_MINUTES == 0:
        job()
    else:
        schedule.every(config.SCHEDULE_MINUTES).minutes.do(job)
        print(f"Scraper scheduler started, runs every {config.SCHEDULE_MINUTES} min.")
        while True:
            schedule.run_pending()
            time.sleep(1)