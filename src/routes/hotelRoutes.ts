import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  addHotelReview,
  searchHotels,
} from '../controllers/hotelController';

const router = express.Router();

// Public routes
// GET /api/hotels - Get all hotels
router.get('/', getHotels);

// GET /api/hotels/search - Search hotels
router.get('/search', searchHotels);

// GET /api/hotels/:id - Get hotel by ID
router.get('/:id', getHotelById);

// POST /api/hotels/:id/reviews - Add review to hotel
router.post('/:id/reviews', addHotelReview);

// Admin only routes (would need authentication middleware in production)
// POST /api/hotels - Create hotel
router.post('/', createHotel);

// PUT /api/hotels/:id - Update hotel
router.put('/:id', updateHotel);

// DELETE /api/hotels/:id - Delete hotel
router.delete('/:id', deleteHotel);

export default router;