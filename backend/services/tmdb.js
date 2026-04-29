require('dotenv').config({ path: '../.env' });
const NodeCache = require('node-cache');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_ORIGINAL = 'https://image.tmdb.org/t/p/original';

async function tmdbFetch(endpoint, params = {}, retries = 3) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDB_API_KEY is missing');
  
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After') || 2;
          await new Promise(r => setTimeout(r, retryAfter * 1000));
          continue;
        }
        throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      cache.set(cacheKey, data, 300);
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

function formatMovieList(results) {
  return results.map(movie => ({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null,
    backdrop_path: movie.backdrop_path ? `${TMDB_ORIGINAL}${movie.backdrop_path}` : null,
    vote_average: movie.vote_average || 0,
    vote_count: movie.vote_count || 0,
    release_date: movie.release_date || '',
    overview: movie.overview || '',
    popularity: movie.popularity || 0,
    original_language: movie.original_language || '',
    genre_ids: movie.genre_ids || [],
    slug: generateSlug(movie.title, movie.release_date), // Fallback for list views
  }));
}

function generateSlug(title, releaseDate) {
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  let base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  if (!base) base = 'movie';
  return year ? `${base}-${year}` : base;
}

async function formatMovieDetail(data) {
  const trailer = (data.videos?.results || []).find(v => v.site === 'YouTube' && v.type === 'Trailer');
  return {
    id: data.id,
    slug: generateSlug(data.title, data.release_date),
    title: data.title,
    overview: data.overview || '',
    poster_path: data.poster_path ? `${TMDB_IMG}${data.poster_path}` : null,
    backdrop_path: data.backdrop_path ? `${TMDB_ORIGINAL}${data.backdrop_path}` : null,
    vote_average: data.vote_average || 0,
    vote_count: data.vote_count || 0,
    release_date: data.release_date || '',
    runtime: data.runtime || 0,
    tagline: data.tagline || '',
    genres: data.genres || [],
    cast: (data.credits?.cast || []).slice(0, 15).map(c => ({
      name: c.name,
      character: c.character,
      profile_path: c.profile_path ? `${TMDB_IMG}${c.profile_path}` : null,
    })),
    director: (data.credits?.crew || []).find(c => c.job === 'Director')?.name || null,
    budget: data.budget ? Number(data.budget) : 0,
    revenue: data.revenue ? Number(data.revenue) : 0,
    status: data.status || '',
    adult: data.adult || false,
    video: data.video || false,
    imdb_id: data.imdb_id || null,
    homepage: data.homepage || null,
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    production_companies: data.production_companies || [],
    popularity: data.popularity || 0,
    original_language: data.original_language || '',
  };
}

// Cache movie in database
async function cacheMovieInDb(movieData) {
  try {
    const existing = await prisma.movie.findUnique({ where: { id: movieData.id } });
    if (!existing) {
      await prisma.movie.create({
        data: {
          id: movieData.id,
          slug: movieData.slug || generateSlug(movieData.title, movieData.release_date),
          title: movieData.title,
          overview: movieData.overview || '',
          posterPath: movieData.poster_path,
          backdropPath: movieData.backdrop_path,
          releaseDate: movieData.release_date,
          originalLanguage: movieData.original_language || '',
          popularity: movieData.popularity || 0,
          voteAverage: movieData.vote_average || 0,
          voteCount: movieData.vote_count || 0,
          runtime: movieData.runtime || null,
          tagline: movieData.tagline || null,
          genres: JSON.stringify(movieData.genres || []),
          castData: JSON.stringify(movieData.cast || []),
          director: movieData.director || null,
          budget: movieData.budget ? BigInt(movieData.budget) : null,
          revenue: movieData.revenue ? BigInt(movieData.revenue) : null,
          status: movieData.status || null,
          adult: movieData.adult || false,
          video: movieData.video || false,
          imdbId: movieData.imdb_id || null,
          homepage: movieData.homepage || null,
          trailerUrl: movieData.trailerUrl || null,
          productionCompanies: JSON.stringify(movieData.production_companies || []),
        }
      });
    }
  } catch (err) {
    console.error(`Failed to cache movie ${movieData.id}:`, err.message);
  }
  return movieData;
}

// Map DB model back to API format
function mapDbMovieToApi(m) {
  return {
    id: m.id,
    slug: m.slug,
    title: m.title,
    overview: m.overview,
    poster_path: m.posterPath,
    backdrop_path: m.backdropPath,
    release_date: m.releaseDate,
    vote_average: m.voteAverage,
    vote_count: m.voteCount,
    runtime: m.runtime,
    tagline: m.tagline,
    genres: JSON.parse(m.genres || '[]'),
    cast: JSON.parse(m.castData || '[]'),
    director: m.director,
    budget: m.budget ? Number(m.budget) : 0,
    revenue: m.revenue ? Number(m.revenue) : 0,
    status: m.status,
    adult: m.adult,
    video: m.video,
    imdb_id: m.imdbId,
    homepage: m.homepage,
    trailerUrl: m.trailerUrl,
    production_companies: JSON.parse(m.productionCompanies || '[]'),
    popularity: m.popularity,
    original_language: m.originalLanguage,
    from_cache: true,
  };
}

// Get movie from DB or TMDB
async function getMovieFromDbOrApi(idOrSlug) {
  let movie;
  const isId = !isNaN(parseInt(idOrSlug)) && /^\d+$/.test(idOrSlug);

  if (isId) {
    movie = await prisma.movie.findUnique({ where: { id: parseInt(idOrSlug) } });
  } else {
    // Try exact slug match
    movie = await prisma.movie.findUnique({ where: { slug: idOrSlug } });
    if (!movie) {
      // Try name-only lookup (e.g. "inception" matches "inception-2010")
      movie = await prisma.movie.findFirst({
        where: { slug: { startsWith: `${idOrSlug}-` } },
        orderBy: { popularity: 'desc' }
      });
    }
  }

  if (movie) return mapDbMovieToApi(movie);

  // If not in DB, fetch from TMDB (only possible if it's an ID)
  if (isId) {
    const data = await tmdbFetch(`/movie/${idOrSlug}`, { append_to_response: 'credits,videos' });
    const formatted = await formatMovieDetail(data);
    await cacheMovieInDb(formatted);
    return { ...formatted, from_cache: false };
  }
  
  return null;
}

async function getNowShowing(page = 1) {
  const data = await tmdbFetch('/movie/now_playing', { page, region: 'IN' });
  return {
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
    results: formatMovieList(data.results),
  };
}

async function getTrending(page = 1) {
  const data = await tmdbFetch('/trending/movie/week', { page });
  return {
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
    results: formatMovieList(data.results),
  };
}

async function getUpcoming(page = 1) {
  const data = await tmdbFetch('/movie/upcoming', { page });
  return {
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
    results: formatMovieList(data.results),
  };
}

async function getPopular(page = 1) {
  const data = await tmdbFetch('/movie/popular', { page });
  return {
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
    results: formatMovieList(data.results),
  };
}

async function getTopRated(page = 1) {
  const data = await tmdbFetch('/movie/top_rated', { page });
  return {
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
    results: formatMovieList(data.results),
  };
}

async function searchMovies(query, page = 1) {
  const data = await tmdbFetch('/search/movie', { query, page });
  return {
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
    results: formatMovieList(data.results),
  };
}

async function getMoviesByGenre(genreId, page = 1) {
  const data = await tmdbFetch('/discover/movie', { with_genres: genreId, page, sort_by: 'popularity.desc' });
  return {
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
    results: formatMovieList(data.results),
  };
}

async function getSimilarMovies(id) {
  const data = await tmdbFetch(`/movie/${id}/similar`);
  return formatMovieList(data.results || []).slice(0, 10);
}

async function getRecommendations(id) {
  const data = await tmdbFetch(`/movie/${id}/recommendations`);
  return formatMovieList(data.results || []).slice(0, 10);
}

async function getCachedMovieCount() {
  return prisma.movie.count();
}

module.exports = {
  getNowShowing,
  getTrending,
  getUpcoming,
  getPopular,
  getTopRated,
  searchMovies,
  getMovieDetail: getMovieFromDbOrApi,
  getMoviesByGenre,
  getSimilarMovies,
  getRecommendations,
  getCachedMovieCount,
  tmdbFetch,
  formatMovieList,
  formatMovieDetail,
  cacheMovieInDb,
  getMovieFromDbOrApi,
  generateSlug,
};
