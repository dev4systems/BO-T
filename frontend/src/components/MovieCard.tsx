'use client';
import Image from 'next/image';
import Link from 'next/link';

interface Movie {
  id: number;
  slug?: string;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
}

export default function MovieCard({ movie }: { movie: Movie }) {
  // If poster_path already has http, use it directly
  const posterUrl = movie.poster_path 
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w300${movie.poster_path}`)
    : 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <Link href={`/movie/${movie.slug || movie.id}`} className="group">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
        <Image
          src={posterUrl}
          alt={movie.title}
          width={300}
          height={450}
          className="w-full h-[360px] object-cover"
          loading="lazy"
        />
        <div className="p-3">
          <h3 className="text-white font-semibold truncate">{movie.title}</h3>
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>⭐ {movie.vote_average.toFixed(1)}</span>
            <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}