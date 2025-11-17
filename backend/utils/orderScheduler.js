// Order cleanup scheduler
// Runs automatic order cleanup at regular intervals

import cron from 'node-cron';
import { runOrderCleanup } from './orderCleanup.js';

let cleanupJob = null;

/**
 * Start the order cleanup scheduler
 * Runs every 6 hours to check and cancel pending orders older than 2 days
 */
export const startOrderCleanupScheduler = () => {
  // Stop any existing job
  if (cleanupJob) {
    cleanupJob.stop();
  }

  // Run every 6 hours: at 00:00, 06:00, 12:00, and 18:00
  // Cron pattern: "0 */6 * * *" means "at minute 0 of every 6th hour"
  cleanupJob = cron.schedule('0 */6 * * *', async () => {
    try {
      await runOrderCleanup();
    } catch (error) {
      console.error('Scheduled order cleanup failed:', error);
    }
  });

  console.log('✅ Order cleanup scheduler started (runs every 6 hours)');
  
  // Optionally run once immediately on startup
  console.log('🔄 Running initial order cleanup...');
  runOrderCleanup().catch(error => {
    console.error('Initial cleanup failed:', error);
  });
};

/**
 * Stop the order cleanup scheduler
 */
export const stopOrderCleanupScheduler = () => {
  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
    console.log('Order cleanup scheduler stopped');
  }
};

export default {
  startOrderCleanupScheduler,
  stopOrderCleanupScheduler
};
