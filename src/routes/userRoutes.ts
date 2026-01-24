import express from 'express';
import { registerUser, loginUser, getUserById, oauthLogin } from '../controllers/userController';

const router = express.Router();

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

// POST /api/users/oauth-login
router.post('/oauth-login', oauthLogin);

// GET /api/users/:userId
router.get('/:userId', getUserById);

export default router;