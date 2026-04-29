const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchFromBackend(endpoint: string) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error('API fetch error:', res.statusText);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('Network error:', err);
    return null;
  }
}

export async function fetchNowShowing(page = 1) {
  return fetchFromBackend(`/movies/now-showing?page=${page}`);
}

export async function fetchTrending(page = 1) {
  return fetchFromBackend(`/movies/trending?page=${page}`);
}

export async function fetchUpcoming(page = 1) {
  return fetchFromBackend(`/movies/upcoming?page=${page}`);
}

export async function fetchPopular(page = 1) {
  return fetchFromBackend(`/movies/popular?page=${page}`);
}

export async function fetchTopRated(page = 1) {
  return fetchFromBackend(`/movies/top-rated?page=${page}`);
}

export async function fetchMovieDetail(idOrSlug: string) {
  return fetchFromBackend(`/movies/${idOrSlug}`);
}

export async function fetchSimilarMovies(idOrSlug: string) {
  return fetchFromBackend(`/movies/${idOrSlug}/similar`);
}

export async function fetchRecommendations(idOrSlug: string) {
  return fetchFromBackend(`/movies/${idOrSlug}/recommendations`);
}

export async function searchMovies(query: string, page = 1) {
  const res = await fetch(
    `${API_BASE}/movies/search?query=${encodeURIComponent(query)}&page=${page}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMoviesByGenre(genreId: number, page = 1) {
  return fetchFromBackend(`/movies/genre/${genreId}?page=${page}`);
}

export async function fetchStats() {
  return fetchFromBackend(`/movies/stats`);
}
