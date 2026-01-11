import express from 'express';
import { registerUser, loginUser, getUserById } from '../controllers/userController';

const router = express.Router();

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

// GET /api/users/:userId
router.get('/:userId', getUserById);

export default router;