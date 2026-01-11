import { Request, Response } from 'express';
import User, { generateUserId } from '../models/User';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      address,
      country,
      phoneNo,
      email,
      password,
      userType = 'user',
      dateOfBirth,
      gender,
      occupation,
    } = req.body;

    // Validate required fields
    if (!name || !address || !country || !phoneNo || !email || !password || !dateOfBirth || !gender || !occupation) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate userType
    if (userType !== 'user' && userType !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'userType must be either "user" or "admin"',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Generate unique ID
    const id = generateUserId();

    // Create new user
    const newUser = new User({
      id,
      name,
      address,
      country,
      phoneNo,
      email,
      password,
      userType,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      occupation,
    });

    // Save user (password will be hashed by pre-save hook)
    await newUser.save();

    // Return user data without password
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      address: newUser.address,
      country: newUser.country,
      phoneNo: newUser.phoneNo,
      email: newUser.email,
      userType: newUser.userType,
      dateOfBirth: newUser.dateOfBirth,
      gender: newUser.gender,
      occupation: newUser.occupation,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};