import { Request, Response } from 'express';
import User, { generateUserId } from '../models/User';
import bcrypt from 'bcryptjs';
import { firebaseAuth } from '../utilities/firebase';

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
        userId: finalUserId
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
      authProvider: 'local', // Explicitly set for local registration
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
      authProvider: newUser.authProvider,
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

    // Find user by email or userId
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { userId: identifier }
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
      userId: user.userId,
      name: user.name,
      address: user.address,
      country: user.country,
      phoneNo: user.phoneNo,
      email: user.email,
      userType: user.userType,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      authProvider: user.authProvider,
      photoURL: user.photoURL,
      lastLogin: user.lastLogin,
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

export const oauthLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
      });
    }

    // Verify Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required from OAuth provider',
      });
    }

    // Check if user exists by Firebase UID or email
    let user = await User.findOne({
      $or: [
        { firebaseUid: uid },
        { email: email }
      ]
    });

    if (!user) {
      // Create new user for OAuth
      const newUserId = generateUserId();
      user = new User({
        userId: newUserId,
        name: name || email.split('@')[0], // Use name from OAuth or email prefix
        email: email,
        firebaseUid: uid,
        authProvider: 'firebase',
        photoURL: picture,
        lastLogin: new Date(),
        userType: 'user',
      });

      await user.save();
    } else {
      // Update existing user with Firebase UID if not already set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.authProvider = 'firebase';
      }
      // Update photoURL and lastLogin
      user.photoURL = picture;
      user.lastLogin = new Date();
      await user.save();
    }

    // Return user data
    const userResponse = {
      userId: user.userId,
      name: user.name,
      address: user.address,
      country: user.country,
      phoneNo: user.phoneNo,
      email: user.email,
      userType: user.userType,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      authProvider: user.authProvider,
      photoURL: user.photoURL,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'OAuth login successful',
      data: userResponse,
    });

  } catch (error) {
    console.error('OAuth login error:', error);
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

    // Find user by userId
    const user = await User.findOne({
      userId: userId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return user data without password
    const userResponse = {
      userId: user.userId,
      name: user.name,
      address: user.address,
      country: user.country,
      phoneNo: user.phoneNo,
      email: user.email,
      userType: user.userType,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      occupation: user.occupation,
      authProvider: user.authProvider,
      photoURL: user.photoURL,
      lastLogin: user.lastLogin,
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