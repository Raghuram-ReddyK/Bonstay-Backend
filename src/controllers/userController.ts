import { Request, Response } from 'express';
import User, { generateUserId } from '../models/User';
import AdminCode from '../models/AdminCode';
import AdminCodeRequest from '../models/AdminCodeRequest';
import bcrypt from 'bcryptjs';
import { firebaseAuth } from '../utilities/firebase';
import { sendEmail, generateWelcomeEmailTemplate, generatePasswordResetEmailTemplate } from '../utilities/emailService';

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
      adminCode, // Required for admin registration
    } = req.body;

    // Validate userType
    if (userType !== 'user' && userType !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'userType must be either "user" or "admin"',
      });
    }

    // Common required fields for all users
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    let adminCodeDoc = null;
    let adminRequest = null;
    let adminRequestData = null;

    if (userType === 'admin') {
      // For admin registration, adminCode is required
      if (!adminCode) {
        return res.status(400).json({
          success: false,
          message: 'adminCode is required for admin registration',
        });
      }

      // Validate admin code
      adminCodeDoc = await AdminCode.findOne({ code: adminCode });
      if (!adminCodeDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin code',
        });
      }

      if (adminCodeDoc.isUsed) {
        return res.status(400).json({
          success: false,
          message: 'Admin code has already been used',
        });
      }

      if (adminCodeDoc.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Admin code is not approved',
        });
      }

      // Get the admin request data
      adminRequest = await AdminCodeRequest.findOne({ id: adminCodeDoc.requestId });
      if (adminRequest) {
        adminRequestData = {
          department: adminRequest.department,
          organization: adminRequest.organization,
          position: adminRequest.position,
        };
      }

      // For admin users, make personal fields optional if not provided
      // Use admin request data as fallback where possible
    } else {
      // For regular users, require all fields
      if (!address || !country || !phoneNo || !dateOfBirth || !gender || !occupation) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required for user registration',
        });
      }
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

    // Prepare user data
    const userData: any = {
      userId: finalUserId,
      name,
      email,
      password: hashedPassword,
      userType,
      authProvider: 'local',
    };

    if (userType === 'admin') {
      // For admin users, use provided data or defaults
      userData.address = address || '';
      userData.country = country || '';
      userData.phoneNo = phoneNo || '';
      userData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      userData.gender = gender || '';
      userData.occupation = occupation || adminRequestData?.position || '';
    } else {
      // For regular users, all fields are required
      userData.address = address;
      userData.country = country;
      userData.phoneNo = phoneNo;
      userData.dateOfBirth = new Date(dateOfBirth);
      userData.gender = gender;
      userData.occupation = occupation;
    }

    // Create new user
    const newUser = new User(userData);

    // Save user
    await newUser.save();

    // If admin registration, mark the admin code as used
    if (userType === 'admin' && adminCodeDoc) {
      adminCodeDoc.isUsed = true;
      await adminCodeDoc.save();

      // Update the admin request with registered user ID
      if (adminRequest) {
        adminRequest.codeUsed = true;
        adminRequest.codeUsedDate = new Date();
        adminRequest.registeredUserId = finalUserId;
        await adminRequest.save();
      }
    }

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

    // Send welcome email asynchronously (don't wait for it to complete)
    try {
      const emailTemplate = generateWelcomeEmailTemplate({
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
      });

      // Send email in background
      sendEmail({
        to: newUser.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }).catch(emailError => {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      });
    } catch (emailError) {
      console.error('Error preparing welcome email:', emailError);
      // Continue with registration even if email preparation fails
    }

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

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body; // Can be email or userId

    // Validate required field
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email or User ID is required',
      });
    }

    // Find user by email or userId
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { userId: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with the provided email or user ID',
      });
    }

    // Generate reset token (simple approach - in production, use JWT or more secure method)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Save reset token to user (you might want to create a separate collection for this)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      const emailTemplate = generatePasswordResetEmailTemplate({
        userId: user.userId,
        name: user.name,
        email: user.email,
        resetToken: resetToken,
      });

      // Send email asynchronously (don't wait for it to complete)
      sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }).catch(emailError => {
        console.error('Failed to send password reset email:', emailError);
        // Don't fail the request if email fails
      });

      res.json({
        success: true,
        message: 'Password reset email sent successfully. Please check your email.',
      });

    } catch (emailError) {
      console.error('Error preparing password reset email:', emailError);
      // Still return success to avoid revealing if email exists
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Find user by userId
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'name',
      'address',
      'country',
      'phoneNo',
      'dateOfBirth',
      'gender',
      'occupation',
      'photoURL'
    ];

    // Filter update data to only allowed fields
    const filteredUpdateData: any = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'dateOfBirth' && updateData[key]) {
          filteredUpdateData[key] = new Date(updateData[key]);
        } else {
          filteredUpdateData[key] = updateData[key];
        }
      }
    });

    // Check if there's anything to update
    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: filteredUpdateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return updated user data without sensitive information
    const userResponse = {
      userId: updatedUser.userId,
      name: updatedUser.name,
      address: updatedUser.address,
      country: updatedUser.country,
      phoneNo: updatedUser.phoneNo,
      email: updatedUser.email,
      userType: updatedUser.userType,
      dateOfBirth: updatedUser.dateOfBirth,
      gender: updatedUser.gender,
      occupation: updatedUser.occupation,
      photoURL: updatedUser.photoURL,
      authProvider: updatedUser.authProvider,
      updatedAt: updatedUser.updatedAt,
    };

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: userResponse,
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update user information
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Find the user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Define allowed fields for update (exclude sensitive fields)
    const allowedFields = [
      'name',
      'address',
      'country',
      'phoneNo',
      'dateOfBirth',
      'gender',
      'occupation',
      'photoURL'
    ];

    // Filter update data to only include allowed fields
    const filteredUpdateData: any = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'dateOfBirth' && updateData[key]) {
          // Convert dateOfBirth to Date object
          filteredUpdateData[key] = new Date(updateData[key]);
        } else {
          filteredUpdateData[key] = updateData[key];
        }
      }
    });

    // Check if there's anything to update
    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    // Update user
    Object.assign(user, filteredUpdateData);
    await user.save();

    // Return updated user data (exclude password and sensitive fields)
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
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      message: 'User information updated successfully',
      data: userResponse,
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};