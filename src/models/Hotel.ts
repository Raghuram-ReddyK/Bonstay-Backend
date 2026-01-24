import mongoose, { Document } from 'mongoose';

export interface IHotel extends Document {
  id: string;
  hotelName: string;
  city: string;
  state: string;
  country: string;
  category: string;
  rating: number;
  totalReviews: number;
  description: string;
  amenities: string[];
  phoneNo: string;
  email: string;
  website: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  checkInTime: string;
  checkOutTime: string;
  imageUrl: string;
  gallery: string[];
  roomTypes: IRoomType[];
  policies: {
    cancellation: string;
    childPolicy: string;
    petPolicy: string;
    smokingPolicy: string;
  };
  nearbyAttractions: {
    name: string;
    distance: string;
  }[];
  reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  size: string;
  bedType: string;
  pricePerNight: number;
  originalPrice: number;
  discount: number;
  amenities: string[];
  images: string[];
  available: boolean;
  totalRooms: number;
  availableRooms: number;
}

export interface IReview {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  roomType: string;
  verified?: boolean;
  createdAt?: Date;
}

const roomTypeSchema = new mongoose.Schema<IRoomType>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  bedType: {
    type: String,
    required: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  amenities: [{
    type: String,
  }],
  images: [{
    type: String,
  }],
  available: {
    type: Boolean,
    default: true,
  },
  totalRooms: {
    type: Number,
    required: true,
  },
  availableRooms: {
    type: Number,
    required: true,
  },
});

const reviewSchema = new mongoose.Schema<IReview>({
  id: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  roomType: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const hotelSchema = new mongoose.Schema<IHotel>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  hotelName: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  amenities: [{
    type: String,
  }],
  phoneNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  website: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  checkInTime: {
    type: String,
    required: true,
  },
  checkOutTime: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  gallery: [{
    type: String,
  }],
  roomTypes: [roomTypeSchema],
  policies: {
    cancellation: {
      type: String,
      required: true,
    },
    childPolicy: {
      type: String,
      required: true,
    },
    petPolicy: {
      type: String,
      required: true,
    },
    smokingPolicy: {
      type: String,
      required: true,
    },
  },
  nearbyAttractions: [{
    name: {
      type: String,
      required: true,
    },
    distance: {
      type: String,
      required: true,
    },
  }],
  reviews: [reviewSchema],
}, {
  timestamps: true,
});

// Create indexes for better search performance
hotelSchema.index({ city: 1, state: 1, country: 1 });
hotelSchema.index({ hotelName: 'text', description: 'text' });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ 'roomTypes.pricePerNight': 1 });

const Hotel = mongoose.model<IHotel>('Hotel', hotelSchema);

export default Hotel;