import express from 'express';
import { registerUser, loginUser, getUserById, oauthLogin, forgotPassword, updateUser } from '../controllers/userController';

const router = express.Router();

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

// POST /api/users/oauth-login
router.post('/oauth-login', oauthLogin);

// POST /api/users/forgot-password
router.post('/forgot-password', forgotPassword);

// PUT /api/users/:userId
router.put('/:userId', updateUser);

// GET /api/users/:userId
router.get('/:userId', getUserById);

export default router;