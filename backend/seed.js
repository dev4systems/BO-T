require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  console.error('❌ TMDB_API_KEY is not set in .env');
  process.exit(1);
}

async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed: ${endpoint} - ${res.status}`);
    return null;
  }
  return res.json();
}

function generateSlug(title, releaseDate) {
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  let base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  if (!base) base = 'movie';
  return year ? `${base}-${year}` : base;
}

async function seedMovies() {
  console.log('🌱 Starting movie seed...\n');

  const movieIds = new Set();
  let totalCached = 0;

  // 1. Fetch from standard endpoints
  const sources = [
    { name: 'Popular', fn: '/movie/popular', pages: 10 },
    { name: 'Top Rated', fn: '/movie/top_rated', pages: 10 },
    { name: 'Now Playing', fn: '/movie/now_playing', pages: 5 },
    { name: 'Upcoming', fn: '/movie/upcoming', pages: 5 },
  ];

  for (const source of sources) {
    console.log(`📥 Fetching ${source.name}...`);
    for (let page = 1; page <= source.pages; page++) {
      const data = await tmdbFetch(source.fn, { page });
      if (!data || !data.results) break;
      data.results.forEach(m => movieIds.add(m.id));
      if (page >= data.total_pages) break;
      await new Promise(r => setTimeout(r, 100));
    }
  }

  // 2. Fetch by year ranges (1960-2025)
  // To keep it reasonable for a seed script, we'll pick top movies from each year
  console.log('📅 Fetching top movies by year (1960-2025)...');
  for (let year = 2025; year >= 1960; year--) {
    const data = await tmdbFetch('/discover/movie', {
      primary_release_year: year,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100,
      page: 1
    });
    if (data && data.results) {
      data.results.forEach(m => movieIds.add(m.id));
    }
    // Small delay
    if (year % 10 === 0) process.stdout.write('.');
    await new Promise(r => setTimeout(r, 100));
  }
  console.log('\n');

  console.log(`🎯 Total unique movie IDs: ${movieIds.size}`);
  console.log(`📦 Fetching full details and caching...\n`);

  const ids = Array.from(movieIds);
  let processed = 0;

  for (const id of ids) {
    try {
      const existing = await prisma.movie.findUnique({ where: { id } });
      if (existing) {
        processed++;
        continue;
      }

      const data = await tmdbFetch(`/movie/${id}`, { append_to_response: 'credits,videos' });
      if (!data || !data.title) {
        processed++;
        continue;
      }

      const director = (data.credits?.crew || []).find(c => c.job === 'Director')?.name || null;
      const cast = (data.credits?.cast || []).slice(0, 15).map(c => ({
        name: c.name,
        character: c.character,
        profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w500${c.profile_path}` : null,
      }));

      const trailer = (data.videos?.results || []).find(v => v.site === 'YouTube' && v.type === 'Trailer');
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

      const slug = generateSlug(data.title, data.release_date);

      // Check for slug collision (rare with year, but possible)
      let finalSlug = slug;
      let counter = 1;
      while (await prisma.movie.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      await prisma.movie.create({
        data: {
          id: data.id,
          slug: finalSlug,
          title: data.title,
          overview: data.overview || '',
          posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
          backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
          releaseDate: data.release_date || '',
          originalLanguage: data.original_language || '',
          popularity: data.popularity || 0,
          voteAverage: data.vote_average || 0,
          voteCount: data.vote_count || 0,
          runtime: data.runtime || null,
          tagline: data.tagline || null,
          genres: JSON.stringify(data.genres || []),
          castData: JSON.stringify(cast),
          director: director,
          budget: data.budget ? BigInt(data.budget) : null,
          revenue: data.revenue ? BigInt(data.revenue) : null,
          status: data.status || null,
          adult: data.adult || false,
          video: data.video || false,
          imdbId: data.imdb_id || null,
          homepage: data.homepage || null,
          trailerUrl: trailerUrl,
          productionCompanies: JSON.stringify(data.production_companies || []),
        }
      });

      totalCached++;
      processed++;

      if (processed % 20 === 0) {
        console.log(`   📊 Progress: ${processed}/${movieIds.size} (${totalCached} new cached)`);
      }

      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`   ❌ Error on movie ${id}: ${err.message}`);
      processed++;
      continue;
    }
  }

  const finalCount = await prisma.movie.count();
  console.log(`\n✨ Seed complete! Total movies in database: ${finalCount}`);
}

seedMovies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
