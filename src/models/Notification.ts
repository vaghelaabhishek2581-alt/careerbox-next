import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'registration_submitted' | 'registration_approved' | 'registration_rejected' | 'payment_received' | 'subscription_granted' | 'subscription_purchased' | 'system_alert' | 'admin_message';
  title: string;
  message: string;
  data?: {
    registrationIntentId?: string;
    paymentId?: string;
    subscriptionId?: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  sentVia: ('in_app' | 'email' | 'socket')[];
  emailSent: boolean;
  emailLogId?: mongoose.Types.ObjectId;
  socketSent: boolean;
  createdAt: Date;
  readAt?: Date;
  archivedAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['registration_submitted', 'registration_approved', 'registration_rejected', 'payment_received', 'subscription_granted', 'subscription_purchased', 'system_alert', 'admin_message'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    registrationIntentId: String,
    paymentId: String,
    subscriptionId: String,
    actionUrl: String,
    metadata: Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread',
    index: true
  },
  sentVia: [{
    type: String,
    enum: ['in_app', 'email', 'socket']
  }],
  emailSent: {
    type: Boolean,
    default: false
  },
  emailLogId: {
    type: Schema.Types.ObjectId,
    ref: 'EmailLog'
  },
  socketSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  readAt: Date,
  archivedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
