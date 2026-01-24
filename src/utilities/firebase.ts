import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require('../config/firebase-service-account.json'); // You'll need to add this file

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Add your Firebase project config if needed
  });
}

export const firebaseAuth = admin.auth();

// Middleware to verify Firebase ID token
export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    // Add user info to request
    (req as any).firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export default admin;