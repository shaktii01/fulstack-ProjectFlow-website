import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'join_request_accepted',
        'project_added',
        'task_assigned',
        'task_updated',
        'task_completed',
        'mentioned_in_comment',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId, // Could be task, project, or joinRequest
      required: true,
    },
    referenceModel: {
      type: String,
      enum: ['Task', 'Project', 'JoinRequest'], // Defines what model referenceId points to
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
