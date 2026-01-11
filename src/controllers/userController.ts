import { Request, Response } from 'express';
import User, { generateUserId } from '../models/User';
import bcrypt from 'bcryptjs';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      userId, // Optional custom userId
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

    // Generate or use custom userId
    let finalUserId = userId;
    if (!finalUserId) {
      finalUserId = generateUserId();
    } else {
      // Check if custom userId already exists
      const existingUserId = await User.findOne({ 
        $or: [
          { userId: finalUserId },
          { id: finalUserId }
        ]
      });
      if (existingUserId) {
        return res.status(409).json({
          success: false,
          message: 'UserId already exists',
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      userId: finalUserId,
      name,
      address,
      country,
      phoneNo,
      email,
      password: hashedPassword,
      userType,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      occupation,
    });

    // Save user
    await newUser.save();

    // Return user data without password
    const userResponse = {
      userId: newUser.userId,
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

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    console.log('Login attempt with identifier:', identifier);

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (email or userId) and password are required',
      });
    }

    // Find user by email, userId, or id (for backward compatibility)
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { userId: identifier },
        { id: identifier } // For backward compatibility with old data
      ]
    });

    console.log('User found:', user ? user.userId : 'No user found');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Return user data without password
    const userResponse = {
      userId: user.userId || user.id, // Handle backward compatibility
      name: user.name,
      address: user.address,
      country: user.country,
      phoneNo: user.phoneNo,
      email: user.email,
      userType: user.userType,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userResponse,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required',
      });
    }

    // Find user by userId or id (for backward compatibility)
    const user = await User.findOne({
      $or: [
        { userId: userId },
        { id: userId }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return user data without password
    const userResponse = {
      userId: user.userId || user.id,
      name: user.name,
      address: user.address,
      country: user.country,
      phoneNo: user.phoneNo,
      email: user.email,
      userType: user.userType,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: userResponse,
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};