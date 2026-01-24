import { Request, Response } from 'express';
import AdminCodeRequest from '../models/AdminCodeRequest';
import AdminCode from '../models/AdminCode';

// Generate unique ID for requests
const generateRequestId = (): string => {
  return Date.now().toString();
};

// Generate admin code
const generateAdminCode = (): string => {
  const prefix = 'ADMIN';
  const length = 15;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create admin code request
export const createAdminCodeRequest = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phoneNo,
      department,
      reason,
      organization,
      position,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNo || !department || !reason || !organization || !position) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if email already has a pending request
    const existingRequest = await AdminCodeRequest.findOne({
      email,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'A pending request already exists for this email',
      });
    }

    // Create new request
    const newRequest = new AdminCodeRequest({
      id: generateRequestId(),
      name,
      email,
      phoneNo,
      department,
      reason,
      organization,
      position,
      status: 'pending',
      requestDate: new Date(),
      adminCode: null,
      approvedBy: null,
      approvedDate: null,
      codeUsed: false,
      codeUsedDate: null,
      registeredUserId: null,
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Admin code request submitted successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error('Error creating admin code request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all admin code requests
export const getAdminCodeRequests = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await AdminCodeRequest.find(query)
      .sort({ requestDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AdminCodeRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching admin code requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get admin code request by ID
export const getAdminCodeRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const request = await AdminCodeRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Admin code request not found',
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Error fetching admin code request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Approve admin code request
export const approveAdminCodeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({
        success: false,
        message: 'approvedBy is required',
      });
    }

    const request = await AdminCodeRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Admin code request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not in pending status',
      });
    }

    // Generate admin code
    const adminCode = generateAdminCode();

    // Update request
    request.status = 'approved';
    request.adminCode = adminCode;
    request.approvedBy = approvedBy;
    request.approvedDate = new Date();
    await request.save();

    // Create admin code record
    const newAdminCode = new AdminCode({
      id: Date.now().toString(),
      code: adminCode,
      status: 'approved',
      isUsed: false,
      createdAt: new Date(),
      approvedBy,
      requestId: id,
    });
    await newAdminCode.save();

    res.json({
      success: true,
      message: 'Admin code request approved successfully',
      data: request,
    });
  } catch (error) {
    console.error('Error approving admin code request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Reject admin code request
export const rejectAdminCodeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectedBy, rejectionReason } = req.body;

    if (!rejectedBy) {
      return res.status(400).json({
        success: false,
        message: 'rejectedBy is required',
      });
    }

    const request = await AdminCodeRequest.findOne({ id });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Admin code request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not in pending status',
      });
    }

    request.status = 'rejected';
    request.rejectedBy = rejectedBy;
    request.rejectedDate = new Date();
    request.rejectionReason = rejectionReason || '';
    await request.save();

    res.json({
      success: true,
      message: 'Admin code request rejected successfully',
      data: request,
    });
  } catch (error) {
    console.error('Error rejecting admin code request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all admin codes
export const getAdminCodes = async (req: Request, res: Response) => {
  try {
    const { status, isUsed, page = 1, limit = 10 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (isUsed !== undefined) {
      query.isUsed = isUsed === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const codes = await AdminCode.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AdminCode.countDocuments(query);

    res.json({
      success: true,
      data: codes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching admin codes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Use admin code (for registration)
export const useAdminCode = async (req: Request, res: Response) => {
  try {
    const { code, registeredUserId } = req.body;

    if (!code || !registeredUserId) {
      return res.status(400).json({
        success: false,
        message: 'Code and registeredUserId are required',
      });
    }

    // Find the admin code
    const adminCode = await AdminCode.findOne({ code });
    if (!adminCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid admin code',
      });
    }

    if (adminCode.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Admin code has already been used',
      });
    }

    // Find the request
    const request = await AdminCodeRequest.findOne({ id: adminCode.requestId });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Associated request not found',
      });
    }

    // Update code and request
    adminCode.isUsed = true;
    await adminCode.save();

    request.codeUsed = true;
    request.codeUsedDate = new Date();
    request.registeredUserId = registeredUserId;
    await request.save();

    res.json({
      success: true,
      message: 'Admin code used successfully',
    });
  } catch (error) {
    console.error('Error using admin code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Validate admin code
export const validateAdminCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const adminCode = await AdminCode.findOne({ code });
    if (!adminCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid admin code',
      });
    }

    const isValid = !adminCode.isUsed && adminCode.status === 'approved';

    res.json({
      success: true,
      data: {
        code: adminCode.code,
        isValid,
        isUsed: adminCode.isUsed,
        status: adminCode.status,
      },
    });
  } catch (error) {
    console.error('Error validating admin code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};