import json
from openai import OpenAI
import config

def parse_html_with_deepseek(html_snippet: str, movie_title: str, chain: str = 'BMS') -> dict:
    """
    Uses DeepSeek-V4-Flash (via OpenAI client) to extract ticket data from scraped HTML.
    Returns structured dict.
    """
    client = OpenAI(
        api_key=config.DEEPSEEK_API_KEY,
        base_url="https://api.deepseek.com/v1"  # hypothetical
    )

    prompt = f"""
    You are a precise data extraction AI. Given the HTML snippet from a movie booking page,
    extract the following fields in JSON format:
    - "movie": "{movie_title}",
    - "timestamp": current ISO timestamp,
    - "show_time": e.g., "10-11 PM",
    - "tickets_sold_this_hour": integer,
    - "cumulative_tickets": integer or null,
    - "city": city name if found,
    - "chain": "{chain}",
    - "delta_vs_yesterday": string or null (e.g., "+18%")
    Return only the JSON, no extra text.
    HTML: {html_snippet[:3000]}  # truncate to avoid token limit
    """
    response = client.chat.completions.create(
        model="deepseek-v4-flash",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    content = response.choices[0].message.content
    # Sometimes the model wraps JSON in ```json...```, clean it
    if content.startswith('```'):
        content = content.split('```')[1]
        if content.startswith('json'):
            content = content[4:]
    return json.loads(content.strip())