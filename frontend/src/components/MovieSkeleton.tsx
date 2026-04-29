export default function MovieSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse">
      <div className="w-full h-[360px] bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-700 rounded w-1/4" />
          <div className="h-3 bg-gray-700 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
