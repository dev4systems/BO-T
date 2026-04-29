import { fetchMovieDetail, fetchSimilarMovies, fetchRecommendations } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';

export default async function MovieDetailPage({ params }: { params: { idOrSlug: string } }) {
  const movie = await fetchMovieDetail(params.idOrSlug);

  if (!movie || movie.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400">Movie not found.</p>
          <Link href="/" className="mt-6 inline-block text-blue-400 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const similar = await fetchSimilarMovies(params.idOrSlug);

  const backdropUrl = movie.backdrop_path 
    ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
    : null;

  const posterUrl = movie.poster_path 
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover opacity-30"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-12 flex flex-col md:flex-row gap-8 items-end">
          <div className="hidden md:block w-64 flex-shrink-0 shadow-2xl rounded-lg overflow-hidden border border-gray-800">
            <Image
              src={posterUrl}
              alt={movie.title}
              width={256}
              height={384}
              className="w-full h-auto"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>
            <div className="flex flex-wrap gap-4 text-lg text-gray-300 mb-6">
              <span>📅 {movie.release_date?.split('-')[0]}</span>
              <span>⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>⏱️ {movie.runtime} min</span>
              <span className="px-2 py-0.5 bg-gray-800 rounded text-sm self-center">{movie.status}</span>
            </div>
            <p className="text-xl italic text-blue-300 mb-4">{movie.tagline}</p>
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((g: any) => (
                <span key={g.id} className="px-3 py-1 bg-blue-900/40 border border-blue-700 rounded-full text-sm">
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-l-4 border-blue-600 pl-4">Overview</h2>
            <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
          </section>

          {/* Trailer */}
          {movie.trailerUrl && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 border-l-4 border-blue-600 pl-4">Trailer</h2>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${movie.trailerUrl.split('v=')[1]}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* Cast */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 border-l-4 border-blue-600 pl-4">Full Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {movie.cast?.map((person: any, idx: number) => (
                <div key={idx} className="bg-gray-900 rounded-lg overflow-hidden group">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={person.profile_path || 'https://via.placeholder.com/200x300?text=No+Photo'}
                      alt={person.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="p-2 text-center">
                    <p className="font-medium text-sm truncate">{person.name}</p>
                    <p className="text-xs text-gray-500 truncate">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Similar Movies */}
          {similar && similar.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 border-l-4 border-blue-600 pl-4">Similar Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {similar.slice(0, 5).map((m: any) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-6 text-blue-400">Movie Insights</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Director</p>
                <p className="font-semibold">{movie.director || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Budget</p>
                <p className="font-semibold">${(movie.budget / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Revenue</p>
                <p className="font-semibold">${(movie.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Original Language</p>
                <p className="uppercase font-semibold">{movie.original_language}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">IMDb</p>
                {movie.imdb_id ? (
                  <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" className="text-blue-400 hover:underline">View on IMDb</a>
                ) : 'N/A'}
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-800/30">
            <h3 className="text-xl font-bold mb-4">Where to Watch</h3>
            <p className="text-gray-400 text-sm">Placeholder: Stream this on Netflix, Amazon Prime, or Disney+.</p>
            <div className="mt-4 flex gap-2">
               <div className="w-10 h-10 bg-gray-800 rounded shadow animate-pulse" />
               <div className="w-10 h-10 bg-gray-800 rounded shadow animate-pulse" />
               <div className="w-10 h-10 bg-gray-800 rounded shadow animate-pulse" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
