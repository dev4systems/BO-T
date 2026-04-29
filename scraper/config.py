import os
from dotenv import load_dotenv

load_dotenv('../.env')  # relative to scraper dir

TMDB_API_KEY = os.getenv('TMDB_API_KEY')
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
EXA_API_KEY = os.getenv('EXA_API_KEY')
DATABASE_URL = os.getenv('SCRAPER_DB_URL', 'file:../backend/prisma/dev.db')
SCHEDULE_MINUTES = int(os.getenv('SCRAPER_SCHEDULE', '30'))
USE_PROXY = os.getenv('USE_PROXY', 'false').lower() == 'true'
PROXY_LIST = os.getenv('PROXY_LIST', '').split(',') if os.getenv('PROXY_LIST') else []