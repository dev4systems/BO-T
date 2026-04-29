const express = require('express');
const router = express.Router();
const tmdb = require('../services/tmdb');
const { query, param, validationResult } = require('express-validator');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/movies/now-showing?page=1
router.get('/now-showing', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await tmdb.getNowShowing(page);
  res.json(data);
}));

// GET /api/movies/trending?page=1
router.get('/trending', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await tmdb.getTrending(page);
  res.json(data);
}));

// GET /api/movies/upcoming?page=1
router.get('/upcoming', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await tmdb.getUpcoming(page);
  res.json(data);
}));

// GET /api/movies/popular?page=1
router.get('/popular', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await tmdb.getPopular(page);
  res.json(data);
}));

// GET /api/movies/top-rated?page=1
router.get('/top-rated', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const data = await tmdb.getTopRated(page);
  res.json(data);
}));

// GET /api/movies/search?query=xxx&page=1
router.get('/search', [
  query('query').isString().trim().notEmpty().withMessage('Search query required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const page = parseInt(req.query.page) || 1;
  const data = await tmdb.searchMovies(req.query.query, page);
  res.json(data);
}));

// GET /api/movies/genre/:genreId?page=1
router.get('/genre/:genreId', asyncHandler(async (req, res) => {
  const genreId = parseInt(req.params.genreId);
  const page = parseInt(req.query.page) || 1;
  const data = await tmdb.getMoviesByGenre(genreId, page);
  res.json(data);
}));

// GET /api/movies/stats - cached movie count
router.get('/stats', asyncHandler(async (req, res) => {
  const count = await tmdb.getCachedMovieCount();
  res.json({ cachedMovies: count });
}));

// GET /api/movies/:idOrSlug/similar
router.get('/:idOrSlug/similar', asyncHandler(async (req, res) => {
  const movie = await tmdb.getMovieDetail(req.params.idOrSlug);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  const similar = await tmdb.getSimilarMovies(movie.id);
  res.json(similar);
}));

// GET /api/movies/:idOrSlug/recommendations
router.get('/:idOrSlug/recommendations', asyncHandler(async (req, res) => {
  const movie = await tmdb.getMovieDetail(req.params.idOrSlug);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  const recs = await tmdb.getRecommendations(movie.id);
  res.json(recs);
}));

// GET /api/movies/:idOrSlug - single movie detail (with DB cache)
router.get('/:idOrSlug', asyncHandler(async (req, res) => {
  const movie = await tmdb.getMovieDetail(req.params.idOrSlug);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
}));

module.exports = router;
