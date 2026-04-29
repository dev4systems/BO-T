'use client';
import { useState } from 'react';
import { searchMovies } from '@/lib/api';
import MovieCard from './MovieCard';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const data = await searchMovies(val);
    setResults(data.results || []);
    setLoading(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={handleSearch}
        className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-xl z-50 p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-gray-400">Searching...</p>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {results.slice(0, 8).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}