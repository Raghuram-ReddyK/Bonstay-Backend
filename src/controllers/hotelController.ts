import { Request, Response } from 'express';
import Hotel from '../models/Hotel';

// Generate unique hotel ID
const generateHotelId = (): string => {
  const prefix = 'IND-BONSTAY-';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum.toString().padStart(4, '0')}`;
};

// Generate unique review ID
const generateReviewId = (): string => {
  return Date.now().toString();
};

// Get all hotels with pagination and filtering
export const getHotels = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      state,
      country,
      category,
      minRating,
      maxPrice,
      search,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};

    // Add filters
    if (city) query.city = new RegExp(city as string, 'i');
    if (state) query.state = new RegExp(state as string, 'i');
    if (country) query.country = new RegExp(country as string, 'i');
    if (category) query.category = new RegExp(category as string, 'i');
    if (minRating) query.rating = { $gte: parseFloat(minRating as string) };
    if (maxPrice) query['roomTypes.pricePerNight'] = { $lte: parseInt(maxPrice as string) };
    if (search) {
      query.$or = [
        { hotelName: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { city: new RegExp(search as string, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const hotels = await Hotel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: hotels,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get hotel by ID
export const getHotelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findOne({ id });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    res.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Create new hotel (Admin only)
export const createHotel = async (req: Request, res: Response) => {
  try {
    const hotelData = req.body;

    // Generate unique ID if not provided
    if (!hotelData.id) {
      hotelData.id = generateHotelId();
    }

    // Check if hotel with this ID already exists
    const existingHotel = await Hotel.findOne({ id: hotelData.id });
    if (existingHotel) {
      return res.status(409).json({
        success: false,
        message: 'Hotel with this ID already exists',
      });
    }

    // Validate required fields
    const requiredFields = [
      'hotelName', 'city', 'state', 'country', 'category',
      'description', 'phoneNo', 'email', 'website', 'address',
      'coordinates', 'checkInTime', 'checkOutTime', 'imageUrl',
      'policies', 'amenities'
    ];

    for (const field of requiredFields) {
      if (!hotelData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    // Set default values
    hotelData.rating = hotelData.rating || 0;
    hotelData.totalReviews = hotelData.totalReviews || 0;
    hotelData.gallery = hotelData.gallery || [];
    hotelData.roomTypes = hotelData.roomTypes || [];
    hotelData.nearbyAttractions = hotelData.nearbyAttractions || [];
    hotelData.reviews = hotelData.reviews || [];

    const newHotel = new Hotel(hotelData);
    await newHotel.save();

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: newHotel,
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update hotel (Admin only)
export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const hotel = await Hotel.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel,
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete hotel (Admin only)
export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findOneAndDelete({ id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    res.json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Add review to hotel
export const addHotelReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, userName, userEmail, rating, comment, roomType } = req.body;

    if (!userId || !userName || !rating || !comment || !roomType) {
      return res.status(400).json({
        success: false,
        message: 'userId, userName, rating, comment, and roomType are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const hotel = await Hotel.findOne({ id });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    const newReview = {
      id: generateReviewId(),
      userId,
      userName,
      userEmail,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      helpful: 0,
      roomType,
      verified: true,
      createdAt: new Date(),
    };

    hotel.reviews.push(newReview);

    // Update rating and total reviews
    const totalRating = hotel.reviews.reduce((sum, review) => sum + review.rating, 0);
    hotel.rating = Math.round((totalRating / hotel.reviews.length) * 10) / 10;
    hotel.totalReviews = hotel.reviews.length;

    await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: newReview,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Search hotels
export const searchHotels = async (req: Request, res: Response) => {
  try {
    const { q, city, state, checkIn, checkOut, guests, rooms } = req.query;

    const query: any = {};

    // Text search
    if (q) {
      query.$or = [
        { hotelName: new RegExp(q as string, 'i') },
        { description: new RegExp(q as string, 'i') },
        { city: new RegExp(q as string, 'i') },
        { amenities: new RegExp(q as string, 'i') }
      ];
    }

    // Location filters
    if (city) query.city = new RegExp(city as string, 'i');
    if (state) query.state = new RegExp(state as string, 'i');

    // Filter by room availability and capacity
    if (guests || rooms) {
      const guestCount = parseInt(guests as string) || 1;
      const roomCount = parseInt(rooms as string) || 1;

      query.roomTypes = {
        $elemMatch: {
          available: true,
          availableRooms: { $gte: roomCount },
          capacity: { $gte: guestCount }
        }
      };
    }

    const hotels = await Hotel.find(query)
      .sort({ rating: -1 })
      .limit(50)
      .select('id hotelName city state rating totalReviews imageUrl roomTypes.pricePerNight roomTypes.capacity roomTypes.availableRooms');

    res.json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    console.error('Error searching hotels:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};