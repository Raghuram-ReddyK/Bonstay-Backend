import mongoose, { Document } from 'mongoose';

export interface IAdminCodeRequest extends Document {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  department: string;
  reason: string;
  organization: string;
  position: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  adminCode: string | null;
  approvedBy: string | null;
  approvedDate: Date | null;
  codeUsed: boolean;
  codeUsedDate: Date | null;
  registeredUserId: string | null;
  rejectedBy?: string | null;
  rejectedDate?: Date | null;
  rejectionReason?: string | null;
}

const adminCodeRequestSchema = new mongoose.Schema<IAdminCodeRequest>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  adminCode: {
    type: String,
    required: false,
  },
  approvedBy: {
    type: String,
    required: false,
  },
  approvedDate: {
    type: Date,
    required: false,
  },
  codeUsed: {
    type: Boolean,
    default: false,
  },
  codeUsedDate: {
    type: Date,
    required: false,
  },
  registeredUserId: {
    type: String,
    required: false,
  },
  rejectedBy: {
    type: String,
    required: false,
  },
  rejectedDate: {
    type: Date,
    required: false,
  },
  rejectionReason: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

const AdminCodeRequest = mongoose.model<IAdminCodeRequest>('AdminCodeRequest', adminCodeRequestSchema);

export default AdminCodeRequest;