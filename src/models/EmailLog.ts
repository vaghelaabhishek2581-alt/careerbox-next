import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog extends Document {
  _id: mongoose.Types.ObjectId;
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  type: 'registration_confirmation' | 'registration_approved' | 'registration_rejected' | 'payment_confirmation' | 'subscription_granted' | 'system_notification' | 'admin_notification';
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  provider: 'gmail' | 'sendgrid' | 'ses' | 'other';
  messageId?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  relatedEntityId?: mongoose.Types.ObjectId;
  relatedEntityType?: 'User' | 'RegistrationIntent' | 'Payment' | 'Subscription';
  notificationId?: mongoose.Types.ObjectId;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    templateUsed?: string;
    variables?: Record<string, any>;
    attachments?: {
      filename: string;
      contentType: string;
      size: number;
    }[];
  };
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>({
  to: [{
    type: String,
    required: true
  }],
  cc: [String],
  bcc: [String],
  from: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: 300
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: String,
  type: {
    type: String,
    enum: ['registration_confirmation', 'registration_approved', 'registration_rejected', 'payment_confirmation', 'subscription_granted', 'system_notification', 'admin_notification'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'bounced'],
    default: 'pending',
    index: true
  },
  provider: {
    type: String,
    enum: ['gmail', 'sendgrid', 'ses', 'other'],
    default: 'gmail'
  },
  messageId: String,
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  relatedEntityId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  relatedEntityType: {
    type: String,
    enum: ['User', 'RegistrationIntent', 'Payment', 'Subscription']
  },
  notificationId: {
    type: Schema.Types.ObjectId,
    ref: 'Notification'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    templateUsed: String,
    variables: Schema.Types.Mixed,
    attachments: [{
      filename: String,
      contentType: String,
      size: Number
    }]
  },
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
EmailLogSchema.index({ to: 1, createdAt: -1 });
EmailLogSchema.index({ type: 1, status: 1, createdAt: -1 });
EmailLogSchema.index({ relatedEntityId: 1, relatedEntityType: 1 });
EmailLogSchema.index({ status: 1, createdAt: -1 });

export const EmailLog = mongoose.models.EmailLog || mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
