import MovieCard from './MovieCard';

interface Movie {
  id: number;
  slug?: string;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
}

interface Props {
  title: string;
  movies: Movie[];
}

export default function CategoryRow({ title, movies }: Props) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 text-blue-300">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}