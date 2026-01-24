import express from 'express';
import {
  createAdminCodeRequest,
  getAdminCodeRequests,
  getAdminCodeRequestById,
  approveAdminCodeRequest,
  rejectAdminCodeRequest,
  getAdminCodes,
  useAdminCode,
  validateAdminCode,
} from '../controllers/adminCodeController';

const router = express.Router();

// Admin Code Request routes
// POST /api/admin-codes/requests
router.post('/requests', createAdminCodeRequest);

// GET /api/admin-codes/requests
router.get('/requests', getAdminCodeRequests);

// GET /api/admin-codes/requests/:id
router.get('/requests/:id', getAdminCodeRequestById);

// PUT /api/admin-codes/requests/:id/approve
router.put('/requests/:id/approve', approveAdminCodeRequest);

// PUT /api/admin-codes/requests/:id/reject
router.put('/requests/:id/reject', rejectAdminCodeRequest);

// Admin Code routes
// GET /api/admin-codes
router.get('/', getAdminCodes);

// POST /api/admin-codes/use
router.post('/use', useAdminCode);

// GET /api/admin-codes/validate/:code
router.get('/validate/:code', validateAdminCode);

export default router;