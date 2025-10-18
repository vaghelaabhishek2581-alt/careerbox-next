import { connectToDatabase } from "@/lib/db/mongodb";
import { sendEmail } from "./email-service";
import { ObjectId } from "mongodb";
import { User } from "@/src/models";
import { Notification } from "@/src/models/Notification";

export interface Notification {
  _id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface EmailTemplate {
  subject: string;
  text?: string;
  html: string;
}

export interface NotificationTemplate {
  title: string;
  message: string;
  email: EmailTemplate;
}

const templates: Record<string, (data: any) => NotificationTemplate> = {
  welcome: (data: { name: string }) => ({
    title: "Welcome to CareerBox",
    message: `Welcome ${data.name}! We're excited to have you on board.`,
    email: {
      subject: "Welcome to CareerBox",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to CareerBox!</h2>
          <p>Hi ${data.name},</p>
          <p>We're excited to have you on board. Get started by completing your profile and exploring our features.</p>
          <div style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding"
               style="background-color: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              Complete Your Profile
            </a>
          </div>
        </div>
      `,
    },
  }),

  profile_update: (data: { name: string; field: string }) => ({
    title: "Profile Updated",
    message: `Your ${data.field} has been updated successfully.`,
    email: {
      subject: "Profile Update Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Profile Update</h2>
          <p>Hi ${data.name},</p>
          <p>Your ${data.field} has been updated successfully.</p>
          <div style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile"
               style="background-color: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              View Profile
            </a>
          </div>
        </div>
      `,
    },
  }),

  new_message: (data: { name: string; sender: string; message: string }) => ({
    title: "New Message",
    message: `You have a new message from ${data.sender}`,
    email: {
      subject: "New Message on CareerBox",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Message</h2>
          <p>Hi ${data.name},</p>
          <p>You have a new message from ${data.sender}:</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 6px;">
            ${data.message}
          </div>
          <div style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages"
               style="background-color: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              Reply
            </a>
          </div>
        </div>
      `,
    },
  }),

  admin_alert: (data: { title: string; message: string }) => ({
    title: data.title,
    message: data.message,
    email: {
      subject: `[Admin Alert] ${data.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">[Admin Alert] ${data.title}</h2>
          <div style="margin: 20px 0; padding: 15px; background-color: #fee2e2; border-radius: 6px;">
            ${data.message}
          </div>
          <div style="margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin"
               style="background-color: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px;">
              Go to Admin Dashboard
            </a>
          </div>
        </div>
      `,
    },
  }),
};

export async function sendNotification(
  userId: string,
  type: string,
  data: any,
  options: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  } = { email: true, push: true, inApp: true }
) {
  try {
    const db = await connectToDatabase();
    const user = await User.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    // Get notification template
    const template = templates[type]?.(data);
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    // Create notification
    const notification: Notification = {
      userId,
      type,
      title: template.title,
      message: template.message,
      read: false,
      createdAt: new Date(),
      metadata: data,
    };

    // Save notification to database if in-app notification is enabled
    if (options.inApp) {
      await Notification.create(notification);
    }

    // Send email if enabled
    if (options.email && user.email) {
      await sendEmail({
        to: user.email,
        subject: template.email.subject,
        html: template.email.html,
      });
    }

    // Send push notification if enabled
    if (options.push) {
      // TODO: Implement push notifications
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error };
  }
}

export async function getNotifications(
  userId: string,
  options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}
) {
  try {
    const db = await connectToDatabase();

    const query = {
      userId,
      ...(options.unreadOnly ? { read: false } : {}),
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 10);

    const total = await Notification.countDocuments(query);

    return {
      success: true,
      notifications,
      total,
    };
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return { success: false, error };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const db = await connectToDatabase();

    await Notification.updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { read: true } }
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false, error };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await Notification.deleteOne({
      _id: new ObjectId(notificationId),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return { success: false, error };
  }
}

export async function deleteAllNotifications(userId: string) {
  try {
    await Notification.deleteMany({ userId });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete all notifications:", error);
    return { success: false, error };
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
    types?: Record<
      string,
      {
        email?: boolean;
        push?: boolean;
        inApp?: boolean;
      }
    >;
  }
) {
  try {
    await User.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          notificationPreferences: preferences,
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    return { success: false, error };
  }
}

export async function getNotificationPreferences(userId: string) {
  try {
    const db = await connectToDatabase();

    const user = await User.findOne(
      { _id: new ObjectId(userId) },
      { projection: { notificationPreferences: 1 } }
    );

    return {
      success: true,
      preferences: user?.notificationPreferences || {
        email: true,
        push: true,
        inApp: true,
      },
    };
  } catch (error) {
    console.error("Failed to get notification preferences:", error);
    return { success: false, error };
  }
}
