'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPopular, fetchTrending, fetchUpcoming } from '@/lib/api';
import Hero from './Hero';
import CategoryRow from './CategoryRow';
import SearchBar from './SearchBar';
import MovieSkeleton from './MovieSkeleton';

export default function HomePage() {
  const [popular, setPopular] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: any) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Initial load
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      const [tr, up, pop] = await Promise.all([
        fetchTrending(1),
        fetchUpcoming(1),
        fetchPopular(1),
      ]);
      setTrending(tr?.results?.slice(0, 10) || []);
      setUpcoming(up?.results?.slice(0, 10) || []);
      setPopular(pop?.results || []);
      setLoading(false);
    }
    loadInitial();
  }, []);

  // Load more popular movies
  useEffect(() => {
    if (page === 1) return;
    async function loadMore() {
      setLoadingMore(true);
      const pop = await fetchPopular(page);
      if (pop?.results?.length === 0) {
        setHasMore(false);
      } else {
        setPopular(prev => [...prev, ...(pop?.results || [])]);
      }
      setLoadingMore(false);
    }
    loadMore();
  }, [page]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      <Hero />
      <SearchBar />

      {loading ? (
        <div className="space-y-12">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="h-8 bg-gray-800 rounded w-48 mb-6 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map(j => <MovieSkeleton key={j} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <CategoryRow title="Trending This Week" movies={trending} />
          <CategoryRow title="Coming Soon" movies={upcoming} />
          
          <section>
            <h2 className="text-2xl font-bold mb-6 text-blue-300 border-l-4 border-blue-600 pl-4">All Popular Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {popular.map((movie, index) => (
                <div key={movie.id} ref={index === popular.length - 1 ? lastElementRef : null}>
                  <img 
                    src={movie.poster_path?.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                    style={{display: 'none'}} 
                    alt="" 
                  />
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
            
            {loadingMore && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6">
                {[1, 2, 3, 4, 5].map(j => <MovieSkeleton key={j} />)}
              </div>
            )}
            
            {!hasMore && (
              <div className="text-center py-12 text-gray-500 italic">
                You've reached the end of the collection.
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
