-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "releaseDate" TEXT,
    "originalLanguage" TEXT,
    "popularity" REAL,
    "voteAverage" REAL,
    "voteCount" INTEGER,
    "runtime" INTEGER,
    "tagline" TEXT,
    "genres" TEXT,
    "castData" TEXT,
    "director" TEXT,
    "budget" INTEGER,
    "revenue" INTEGER,
    "status" TEXT,
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "video" BOOLEAN NOT NULL DEFAULT false,
    "imdbId" TEXT,
    "homepage" TEXT,
    "trailerUrl" TEXT,
    "productionCompanies" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BoxOfficeSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movieTitle" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "showTime" TEXT,
    "ticketsSold" INTEGER NOT NULL,
    "cumulative" INTEGER,
    "city" TEXT,
    "chain" TEXT,
    "deltaPercent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_slug_key" ON "Movie"("slug");

-- CreateIndex
CREATE INDEX "Movie_slug_idx" ON "Movie"("slug");

-- CreateIndex
CREATE INDEX "Movie_releaseDate_idx" ON "Movie"("releaseDate");

-- CreateIndex
CREATE INDEX "Movie_popularity_idx" ON "Movie"("popularity");

-- CreateIndex
CREATE INDEX "Movie_voteAverage_idx" ON "Movie"("voteAverage");
