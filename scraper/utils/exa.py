from exa_py import Exa
import config

def find_movie_urls(movie_name: str, chain: str = 'BMS') -> list:
    """
    Use Exa.ai to discover live BMS booking page URLs for a given movie.
    Returns list of URLs.
    """
    exa = Exa(api_key=config.EXA_API_KEY)
    query = f"{movie_name} bookmyshow tickets"
    region = 'India'
    search = exa.search_and_contents(
        query,
        type="keyword",
        num_results=3,
        include_domains=["in.bookmyshow.com"],
        text=False,
    )
    urls = [result.url for result in search.results if '/buytickets/' in result.url or '/movies/' in result.url]
    return urls