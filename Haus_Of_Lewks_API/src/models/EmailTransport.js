import mongoose from 'mongoose';

const EmailTransportSchema = new mongoose.Schema(
  {
    recipientCount: {
      type: Number,
      required: [true, 'Recipient count is required'],
      min: 1
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    emailType: {
      type: String,
      default: 'general'
    }
  },
  { timestamps: true }
);

// Auto-delete records after 24 hours to keep the collection lean
EmailTransportSchema.index({ sentAt: 1 }, { expireAfterSeconds: 86400 });

EmailTransportSchema.statics.getRecipientCountInLast24Hours = async function () {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        sentAt: { $gte: twentyFourHoursAgo }
      }
    },
    {
      $group: {
        _id: null,
        totalRecipients: { $sum: '$recipientCount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalRecipients : 0;
};

EmailTransportSchema.statics.canSendEmails = async function (recipientCount, dailyLimit) {
  const currentCount = await this.getRecipientCountInLast24Hours();
  return (currentCount + recipientCount) <= dailyLimit;
};

EmailTransportSchema.statics.recordEmailSend = async function (recipientCount, emailType = 'general') {
  return await this.create({
    recipientCount,
    sentAt: new Date(),
    emailType
  });
};

EmailTransportSchema.statics.getUsageStats = async function (dailyLimit) {
  const currentCount = await this.getRecipientCountInLast24Hours();
  const remaining = Math.max(0, dailyLimit - currentCount);
  const percentageUsed = dailyLimit > 0 ? (currentCount / dailyLimit) * 100 : 0;

  return {
    currentCount,
    dailyLimit,
    remaining,
    percentageUsed: Math.round(percentageUsed * 100) / 100
  };
};

const EmailTransportModel = mongoose.model('EmailTransport', EmailTransportSchema);
export default EmailTransportModel;
