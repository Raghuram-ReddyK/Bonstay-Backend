import mongoose, { Document } from 'mongoose';

export interface IAdminCode extends Document {
  id: string;
  code: string;
  status: 'pending' | 'approved' | 'rejected';
  isUsed: boolean;
  createdAt: Date;
  approvedBy: string;
  requestId: string;
}

const adminCodeSchema = new mongoose.Schema<IAdminCode>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approvedBy: {
    type: String,
    required: true,
  },
  requestId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const AdminCode = mongoose.model<IAdminCode>('AdminCode', adminCodeSchema);

export default AdminCode;