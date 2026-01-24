import mongoose, { Document, CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  id?: string; // For backward compatibility
  userId: string;
  name: string;
  address?: string;
  country?: string;
  phoneNo?: string;
  email: string;
  password?: string; // Optional for OAuth users
  userType: 'user' | 'admin';
  dateOfBirth?: Date;
  gender?: string;
  occupation?: string;
  firebaseUid?: string; 
  authProvider: 'local' | 'firebase'; 
  photoURL?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  phoneNo: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional for OAuth users
  },
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  occupation: {
    type: String,
    required: false,
  },
  firebaseUid: {
    type: String,
    required: false,
    unique: true,
    sparse: true, 
  },
  authProvider: {
    type: String,
    enum: ['local', 'firebase'],
    default: 'local',
  },
  photoURL: {
    type: String,
    required: false,
  },
  lastLogin: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
// Removed pre-save hook, hashing will be done in controller

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate unique ID
export const generateUserId = (): string => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); 
  return `BONSTAY-${year}${randomDigits}`;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;