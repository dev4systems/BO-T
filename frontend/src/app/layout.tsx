export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Movie Tracker',
  description: 'Now Showing, Trending, and Upcoming movies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <header className="bg-gray-900 shadow p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-400">🎬 MovieBoxOffice</h1>
            <nav>
              <a href="/" className="hover:text-blue-300">Home</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}