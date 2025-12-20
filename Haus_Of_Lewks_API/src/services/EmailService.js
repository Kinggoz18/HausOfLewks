import nodemailer from 'nodemailer';
import { googleEnvVariables } from '../config/enviornment.js';
import EmailTransportModel from '../models/EmailTransport.js';
import logger from '../util/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.dailyLimit = this.getDailyLimit();
  }

  /**
   * Get daily sending limit based on Gmail account type
   * Personal: 500 recipients per 24 hours
   * Workspace: 2,000 recipients per 24 hours
   */
  getDailyLimit = () => {
    const accountType = (googleEnvVariables.googleAccountType || 'workspace').toLowerCase();
    return accountType === 'personal' ? 500 : 2000;
  };

  /**
   * Initialize the nodemailer transporter
   */
  initTransporter = async () => {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: googleEnvVariables.googleEmail,
          pass: googleEnvVariables.googleAppPassword
        }
      });
    }
    return this.transporter;
  };

  /**
   * Count total recipients from email options
   * Counts: to, cc, bcc addresses (each address counts as 1 recipient)
   * @param {Object} mailOptions - Nodemailer mail options
   * @returns {number} Total recipient count
   */
  countRecipients = (mailOptions) => {
    let count = 0;

    // Count 'to' recipients
    if (mailOptions.to) {
      const toArray = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
      count += toArray.length;
    }

    // Count 'cc' recipients
    if (mailOptions.cc) {
      const ccArray = Array.isArray(mailOptions.cc) ? mailOptions.cc : [mailOptions.cc];
      count += ccArray.length;
    }

    // Count 'bcc' recipients
    if (mailOptions.bcc) {
      const bccArray = Array.isArray(mailOptions.bcc) ? mailOptions.bcc : [mailOptions.bcc];
      count += bccArray.length;
    }

    return count || 1; // At least 1 recipient if none specified
  };

  /**
   * Check if we can send emails with the given recipient count
   * @param {number} recipientCount - Number of recipients for this email
   * @returns {Promise<Object>} { canSend: boolean, currentCount: number, remaining: number }
   */
  checkLimit = async (recipientCount) => {
    const canSend = await EmailTransportModel.canSendEmails(recipientCount, this.dailyLimit);
    const stats = await EmailTransportModel.getUsageStats(this.dailyLimit);

    return {
      canSend,
      ...stats,
      requestedCount: recipientCount
    };
  };

  /**
   * Get current email usage statistics
   * @returns {Promise<Object>} Usage stats object
   */
  getUsageStats = async () => {
    return await EmailTransportModel.getUsageStats(this.dailyLimit);
  };

  /**
   * Send an email with Gmail limit enforcement
   * @param {Object} mailOptions - Nodemailer mail options (to, cc, bcc, subject, text, html, etc.)
   * @param {string} emailType - Type of email (e.g., 'booking', 'notification', 'general')
   * @returns {Promise<Object>} { success: boolean, messageId?: string, error?: string, limitInfo?: Object }
   */
  sendEmail = async (mailOptions, emailType = 'general') => {
    try {
      // Initialize transporter if not already done
      await this.initTransporter();

      // Count recipients for this email
      const recipientCount = this.countRecipients(mailOptions);

      // Check if we can send within the limit
      const limitCheck = await this.checkLimit(recipientCount);

      if (!limitCheck.canSend) {
        const errorMessage = `Email sending limit exceeded. Current usage: ${limitCheck.currentCount}/${this.dailyLimit}. Requested: ${recipientCount}. Remaining: ${limitCheck.remaining}. Please wait for the 24-hour rolling window to reset.`;
        
        return {
          success: false,
          error: errorMessage,
          limitInfo: limitCheck,
          code: 'LIMIT_EXCEEDED'
        };
      }

      // Send the email
      const info = await this.transporter.sendMail(mailOptions);

      // Record the email send in the database
      await EmailTransportModel.recordEmailSend(recipientCount, emailType);

      // Get updated stats
      const updatedStats = await EmailTransportModel.getUsageStats(this.dailyLimit);

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        recipientCount,
        emailType,
        limitInfo: updatedStats
      });

      return {
        success: true,
        messageId: info.messageId,
        recipientCount,
        limitInfo: updatedStats
      };
    } catch (error) {
      // Handle SMTP errors (like 454 4.7.0 "Too many recipients")
      if (error.code === 'EENVELOPE' || error.responseCode === 454) {
        logger.error('SMTP limit exceeded error', error, {
          recipientCount,
          emailType,
          mailOptions: {
            to: mailOptions.to,
            subject: mailOptions.subject
          }
        });
        return {
          success: false,
          error: `Gmail SMTP error: Too many recipients. ${error.message}`,
          code: 'SMTP_LIMIT_EXCEEDED'
        };
      }

      // Handle authentication errors
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        logger.error('Email authentication error', error, {
          emailType
        });
        return {
          success: false,
          error: 'Email service authentication failed. Please check email configuration.',
          code: 'AUTH_ERROR'
        };
      }

      // Handle connection errors
      if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        logger.error('Email service connection error', error, {
          emailType
        });
        return {
          success: false,
          error: 'Failed to connect to email service. Please try again later.',
          code: 'CONNECTION_ERROR'
        };
      }

      // Log and return generic error
      logger.error('Email send error', error, {
        recipientCount,
        emailType,
        mailOptions: {
          to: mailOptions.to,
          subject: mailOptions.subject
        }
      });

      return {
        success: false,
        error: error.message || 'Failed to send email',
        code: 'SEND_ERROR'
      };
    }
  };
}

// Export singleton instance
export default new EmailService();
