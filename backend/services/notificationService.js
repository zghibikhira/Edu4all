const Notification = require('../models/notification');
const UserPreferences = require('../models/userPreferences');
const DeliveryLog = require('../models/deliveryLog');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.providers = {
      email: null, // Will be initialized with SMTP provider
      sms: null,   // Will be initialized with Twilio provider
      inApp: null  // Will be initialized with Socket.IO
    };
  }

  // Initialize providers
  initializeProviders(io) {
    this.providers.inApp = io;
    // Initialize email provider (Nodemailer)
    try {
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
      if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
        this.providers.email = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT || 587),
          secure: String(SMTP_SECURE || 'false') === 'true',
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        });
        // Optional verify on startup (non-blocking)
        this.providers.email.verify().catch(() => {});
      }
    } catch (err) {
      console.error('Failed to initialize SMTP provider:', err);
    }

    // Initialize SMS provider (Twilio)
    try {
      const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_FROM } = process.env;
      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_FROM) {
        this.providers.sms = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        this.providers.smsFrom = TWILIO_PHONE_FROM;
      }
    } catch (err) {
      console.error('Failed to initialize Twilio provider:', err);
    }
  }

  // Create and send notification
  async createAndSendNotification(notificationData) {
    try {
      // Get user preferences
      const userPreferences = await UserPreferences.getOrCreatePreferences(notificationData.userId);
      
      // Check which channels are enabled for this notification type
      const channelPreferences = userPreferences.getAllChannelPreferences(notificationData.type);
      
      // Create notification with channel preferences
      const notification = await Notification.createNotification({
        ...notificationData,
        channels: channelPreferences
      });

      // Send to enabled channels
      const deliveryPromises = [];
      
      if (channelPreferences.inApp) {
        deliveryPromises.push(this.sendInAppNotification(notification));
      }
      
      if (channelPreferences.email) {
        deliveryPromises.push(this.sendEmailNotification(notification));
      }
      
      if (channelPreferences.sms) {
        deliveryPromises.push(this.sendSMSNotification(notification));
      }

      // Wait for all deliveries to complete
      await Promise.allSettled(deliveryPromises);

      return notification;
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      throw error;
    }
  }

  // Send in-app notification via Socket.IO
  async sendInAppNotification(notification) {
    try {
      if (!this.providers.inApp) {
        throw new Error('Socket.IO provider not initialized');
      }

      // Get user's socket connection
      const userSocket = this.providers.inApp.sockets.sockets.get(notification.userId);
      
      if (userSocket) {
        userSocket.emit('notification', {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          link: notification.link,
          metadata: notification.metadata,
          priority: notification.priority,
          createdAt: notification.createdAt
        });
      }

      // Mark as delivered
      await this.markNotificationDelivered(notification._id, 'inApp');
      
      return { success: true, channel: 'inApp' };
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      await this.logDeliveryFailure(notification._id, 'inApp', error);
      return { success: false, channel: 'inApp', error: error.message };
    }
  }

  // Send email notification
  async sendEmailNotification(notification) {
    try {
      if (!this.providers.email) {
        return { success: false, channel: 'email', error: 'Email provider not configured' };
      }

      // Get user email
      const user = await User.findById(notification.userId).select('email firstName lastName');
      if (!user || !user.email) {
        throw new Error('User email not found');
      }

      const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@edu4all.local';
      const subject = notification.title || 'Notification Edu4All';
      const text = `${notification.body || ''}${notification.link ? `\n\nLien: ${notification.link}` : ''}`;
      const html = `
        <div style="font-family:Arial, Helvetica, sans-serif; line-height:1.5; color:#111">
          <h2 style="margin:0 0 12px">${subject}</h2>
          <p>${(notification.body || '').replace(/\n/g, '<br/>')}</p>
          ${notification.link ? `<p><a href="${notification.link}">Ouvrir dans Edu4All</a></p>` : ''}
          <hr style="margin:16px 0; border:none; border-top:1px solid #eee"/>
          <p style="font-size:12px; color:#666">Vous recevez cet email car cette notification est activée dans vos préférences.</p>
        </div>`;

      await this.providers.email.sendMail({
        from,
        to: user.email,
        subject,
        text,
        html
      });

      // Mark as delivered
      await this.markNotificationDelivered(notification._id, 'email');
      
      return { success: true, channel: 'email' };
    } catch (error) {
      console.error('Error sending email notification:', error);
      await this.logDeliveryFailure(notification._id, 'email', error);
      return { success: false, channel: 'email', error: error.message };
    }
  }

  // Send SMS notification
  async sendSMSNotification(notification) {
    try {
      if (!this.providers.sms) {
        return { success: false, channel: 'sms', error: 'SMS provider not configured' };
      }

      // Get user phone number
      const user = await User.findById(notification.userId).select('phone firstName lastName');
      if (!user || !user.phone) {
        throw new Error('User phone number not found');
      }

      const body = `${notification.title ? `${notification.title}: ` : ''}${notification.body || ''}${notification.link ? `\n${notification.link}` : ''}`.slice(0, 140);
      await this.providers.sms.messages.create({
        to: user.phone,
        from: this.providers.smsFrom,
        body
      });

      // Mark as delivered
      await this.markNotificationDelivered(notification._id, 'sms');
      
      return { success: true, channel: 'sms' };
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      await this.logDeliveryFailure(notification._id, 'sms', error);
      return { success: false, channel: 'sms', error: error.message };
    }
  }

  // Mark notification as delivered for a specific channel
  async markNotificationDelivered(notificationId, channel) {
    try {
      await DeliveryLog.findOneAndUpdate(
        { notificationId, channel },
        { status: 'delivered', deliveredAt: new Date() },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error marking notification as delivered:', error);
    }
  }

  // Log delivery failure
  async logDeliveryFailure(notificationId, channel, error) {
    try {
      await DeliveryLog.findOneAndUpdate(
        { notificationId, channel },
        {
          status: 'failed',
          error: {
            code: error.code || 'UNKNOWN',
            message: error.message || 'Unknown error',
            details: error
          },
          attempts: 1,
          updatedAt: new Date()
        },
        { upsert: true }
      );
    } catch (logError) {
      console.error('Error logging delivery failure:', logError);
    }
  }

  // Create session-related notifications
  async createSessionNotification(type, sessionData, recipients) {
    const notifications = [];
    
    for (const recipient of recipients) {
      const notificationData = {
        userId: recipient.userId,
        type: type,
        title: this.getSessionNotificationTitle(type, sessionData),
        body: this.getSessionNotificationBody(type, sessionData),
        link: `/sessions/${sessionData._id}`,
        metadata: {
          entityType: 'session',
          entityId: sessionData._id,
          sessionDate: sessionData.date,
          courseTitle: sessionData.course?.title || 'Session',
          teacherName: sessionData.teacher?.firstName + ' ' + sessionData.teacher?.lastName,
          studentName: recipient.studentName
        },
        priority: this.getSessionNotificationPriority(type)
      };
      
      notifications.push(notificationData);
    }

    // Send notifications in parallel
    const results = await Promise.allSettled(
      notifications.map(notification => this.createAndSendNotification(notification))
    );

    return results;
  }

  // Create payment-related notifications
  async createPaymentNotification(type, paymentData, userId) {
    const notificationData = {
      userId,
      type,
      title: this.getPaymentNotificationTitle(type, paymentData),
      body: this.getPaymentNotificationBody(type, paymentData),
      link: `/payments/${paymentData._id}`,
      metadata: {
        entityType: 'payment',
        entityId: paymentData._id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'EUR'
      },
      priority: this.getPaymentNotificationPriority(type)
    };

    return await this.createAndSendNotification(notificationData);
  }

  // Create evaluation-related notifications
  async createEvaluationNotification(type, evaluationData, recipients) {
    const notifications = [];
    
    for (const recipient of recipients) {
      const notificationData = {
        userId: recipient.userId,
        type,
        title: this.getEvaluationNotificationTitle(type, evaluationData),
        body: this.getEvaluationNotificationBody(type, evaluationData),
        link: `/evaluations/${evaluationData._id}`,
        metadata: {
          entityType: 'evaluation',
          entityId: evaluationData._id,
          courseTitle: evaluationData.course?.title || 'Cours',
          teacherName: evaluationData.teacher?.firstName + ' ' + evaluationData.teacher?.lastName,
          studentName: evaluationData.student?.firstName + ' ' + evaluationData.student?.lastName
        },
        priority: 'normal'
      };
      
      notifications.push(notificationData);
    }

    const results = await Promise.allSettled(
      notifications.map(notification => this.createAndSendNotification(notification))
    );

    return results;
  }

  // Helper methods for notification content
  getSessionNotificationTitle(type, sessionData) {
    const courseTitle = sessionData.course?.title || 'Session';
    
    switch (type) {
      case 'SESSION_BOOKED':
        return `Session réservée: ${courseTitle}`;
      case 'SESSION_UPDATED':
        return `Session modifiée: ${courseTitle}`;
      case 'SESSION_CANCELLED':
        return `Session annulée: ${courseTitle}`;
      case 'SESSION_REMINDER':
        return `Rappel: Session ${courseTitle} dans 1 heure`;
      default:
        return `Notification de session: ${courseTitle}`;
    }
  }

  getSessionNotificationBody(type, sessionData) {
    const courseTitle = sessionData.course?.title || 'Session';
    const date = new Date(sessionData.date).toLocaleString('fr-FR');
    
    switch (type) {
      case 'SESSION_BOOKED':
        return `Votre session "${courseTitle}" a été réservée pour le ${date}.`;
      case 'SESSION_UPDATED':
        return `Votre session "${courseTitle}" a été modifiée. Nouvelle date: ${date}.`;
      case 'SESSION_CANCELLED':
        return `Votre session "${courseTitle}" prévue pour le ${date} a été annulée.`;
      case 'SESSION_REMINDER':
        return `Rappel: Votre session "${courseTitle}" commence dans 1 heure (${date}).`;
      default:
        return `Notification concernant votre session "${courseTitle}".`;
    }
  }

  getSessionNotificationPriority(type) {
    switch (type) {
      case 'SESSION_CANCELLED':
      case 'SESSION_REMINDER':
        return 'high';
      case 'SESSION_BOOKED':
      case 'SESSION_UPDATED':
        return 'normal';
      default:
        return 'normal';
    }
  }

  getPaymentNotificationTitle(type, paymentData) {
    const amount = paymentData.amount;
    const currency = paymentData.currency || 'EUR';
    
    switch (type) {
      case 'PAYMENT_CONFIRMED':
        return `Paiement confirmé: ${amount} ${currency}`;
      case 'PAYMENT_FAILED':
        return `Échec du paiement: ${amount} ${currency}`;
      case 'PAYMENT_REFUNDED':
        return `Remboursement effectué: ${amount} ${currency}`;
      default:
        return `Notification de paiement: ${amount} ${currency}`;
    }
  }

  getPaymentNotificationBody(type, paymentData) {
    const amount = paymentData.amount;
    const currency = paymentData.currency || 'EUR';
    
    switch (type) {
      case 'PAYMENT_CONFIRMED':
        return `Votre paiement de ${amount} ${currency} a été confirmé avec succès.`;
      case 'PAYMENT_FAILED':
        return `Votre paiement de ${amount} ${currency} a échoué. Veuillez réessayer.`;
      case 'PAYMENT_REFUNDED':
        return `Un remboursement de ${amount} ${currency} a été effectué sur votre compte.`;
      default:
        return `Notification concernant votre paiement de ${amount} ${currency}.`;
    }
  }

  getPaymentNotificationPriority(type) {
    switch (type) {
      case 'PAYMENT_FAILED':
        return 'high';
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_REFUNDED':
        return 'normal';
      default:
        return 'normal';
    }
  }

  getEvaluationNotificationTitle(type, evaluationData) {
    const courseTitle = evaluationData.course?.title || 'Cours';
    
    switch (type) {
      case 'EVALUATION_SUBMITTED':
        return `Évaluation soumise: ${courseTitle}`;
      case 'EVALUATION_GRADED':
        return `Évaluation notée: ${courseTitle}`;
      default:
        return `Notification d'évaluation: ${courseTitle}`;
    }
  }

  getEvaluationNotificationBody(type, evaluationData) {
    const courseTitle = evaluationData.course?.title || 'Cours';
    
    switch (type) {
      case 'EVALUATION_SUBMITTED':
        return `Une nouvelle évaluation a été soumise pour le cours "${courseTitle}".`;
      case 'EVALUATION_GRADED':
        return `Votre évaluation pour le cours "${courseTitle}" a été notée.`;
      default:
        return `Notification concernant une évaluation du cours "${courseTitle}".`;
    }
  }

  // Get unread count for a user
  async getUnreadCount(userId) {
    return await Notification.getUnreadCount(userId);
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    return await notification.markAsRead();
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, readAt: null },
      { readAt: new Date() }
    );
  }

  // Get user notifications with pagination
  async getUserNotifications(userId, options = {}) {
    return await Notification.getUserNotifications(userId, options);
  }

  // Delete expired notifications
  async cleanupExpiredNotifications() {
    const result = await Notification.deleteMany({
      expiresAt: { $lte: new Date() }
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result;
  }
}

module.exports = new NotificationService();
