import mongoose, { Document, CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  id: string;
  name: string;
  address: string;
  country: string;
  phoneNo: string;
  email: string;
  password: string;
  userType: 'user' | 'admin';
  dateOfBirth: Date;
  gender: string;
  occupation: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  id: {
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
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
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
    required: true,
  },
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    required: true,
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