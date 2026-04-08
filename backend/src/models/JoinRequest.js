import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure an employee can only have one pending request to a specific company
joinRequestSchema.index({ employeeId: 1, companyId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

export default JoinRequest;
