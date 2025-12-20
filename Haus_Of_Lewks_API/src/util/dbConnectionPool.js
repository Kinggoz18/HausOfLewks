/**
 * Database connection pool manager
 * Manages MongoDB client connections for transactions to avoid creating/closing clients frequently
 */

import { MongoClient } from 'mongodb';
import { serverEnvVaiables } from '../config/enviornment.js';
import mongoose from 'mongoose';
import logger from './logger.js';

class DbConnectionPool {
  constructor() {
    this.client = null;
    this.dbName = null;
    this.isConnecting = false;
    this.connectionPromise = null;
  }

  /**
   * Get or create MongoDB client for transactions
   * Reuses existing connection if available
   * @returns {Promise<MongoClient>}
   */
  async getClient() {
    // If client is already connected, return it
    if (this.client && this.isConnected()) {
      return this.client;
    }

    // If connection is in progress, wait for it
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start new connection
    this.isConnecting = true;
    this.connectionPromise = this._createClient();

    try {
      const client = await this.connectionPromise;
      this.isConnecting = false;
      return client;
    } catch (error) {
      this.isConnecting = false;
      this.connectionPromise = null;
      throw error;
    }
  }

  /**
   * Create a new MongoDB client
   * @private
   * @returns {Promise<MongoClient>}
   */
  async _createClient() {
    try {
      if (!serverEnvVaiables?.mongoDbUrl) {
        throw new Error('MongoDB URL is not configured');
      }

      // If mongoose is already connected, reuse its connection
      if (mongoose.connection.readyState === 1) {
        this.client = mongoose.connection.getClient();
        this.dbName = mongoose.connection.db.databaseName;
        logger.debug('Reusing existing mongoose connection for transactions');
        return this.client;
      }

      // Create new client connection
      const client = new MongoClient(serverEnvVaiables.mongoDbUrl, {
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
      });

      await client.connect();
      this.client = client;
      
      // Extract database name from connection string
      const url = new URL(serverEnvVaiables.mongoDbUrl);
      this.dbName = url.pathname.substring(1) || 'test';
      
      logger.info('MongoDB client connected for transactions', {
        dbName: this.dbName
      });

      // Handle connection errors
      client.on('error', (error) => {
        logger.error('MongoDB client error', error);
      });

      client.on('close', () => {
        logger.warn('MongoDB client connection closed');
        this.client = null;
      });

      return client;
    } catch (error) {
      logger.error('Failed to create MongoDB client', error);
      throw error;
    }
  }

  /**
   * Check if client is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  /**
   * Close the database connection
   * Only use this for cleanup (e.g., on server shutdown)
   */
  async close() {
    if (this.client && this.isConnected()) {
      try {
        await this.client.close();
        logger.info('MongoDB client connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB client', error);
      } finally {
        this.client = null;
      }
    }
  }

  /**
   * Get database name
   * @returns {string}
   */
  getDbName() {
    return this.dbName || 'test';
  }
}

// Export singleton instance
export default new DbConnectionPool();


