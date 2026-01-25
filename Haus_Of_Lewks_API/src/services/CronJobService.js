import schedule from 'node-schedule';
import CronJob from '../models/CronJobs.js';
import logger from '../util/logger.js';

const restartCronJobs = async () => {
  logger.debug('Checking cron jobs...');
  const allJobs = await CronJob.find();

  for (const job of allJobs) {
    const jobDate = new Date(job.jobDateTime);
    const jobType = job.jobType;
    const jobName = job.name;

    if (jobDate < new Date()) {
      try {
        logger.info('Running missed cron job', { jobName });
      } catch (err) {
        logger.error(`Failed to resume cron job for ${jobName}`, err);
      }
    } else {
      logger.info('Resuming cron job', { jobName });
      schedule.scheduleJob(jobName, jobDate, async () => {
        try {
        } catch (err) {
          logger.error(`Failed to resume cron job for ${jobName}`, err);
        }
      });
    }
  }
};

const cancelCronJob = async (jobName) => {
  var jobToCancel = schedule.scheduledJobs[jobName];

  if (jobToCancel) {
    await CronJob.deleteOne({ name: jobName });
    jobToCancel.cancel();

    logger.info('Job canceled', { jobName });
  }
};

const startCronJob = async (jobType, jobDateTime, callback, ...args) => {
  logger.debug('Scheduling cron job...');
};

export { restartCronJobs, cancelCronJob, startCronJob };
