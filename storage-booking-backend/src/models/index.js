/**
 * Models Index File
 * Centralizes all database models and their associations
 */

const sequelize = require('../config/database');
const StorageUnit = require('./StorageUnit');
const Booking = require('./Booking');

/**
 * Initialize all model associations
 * This ensures that foreign key relationships are properly set up
 */
const initializeAssociations = () => {
  // Associations are already defined in the individual model files
  // This function can be used for any additional complex associations
  console.log('✅ Model associations initialized');
};

/**
 * Sync all models with the database
 * Creates tables if they don't exist
 */
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log(`✅ Database synchronized ${force ? '(forced)' : ''}`);
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    return false;
  }
};

// Initialize associations when this module is imported
initializeAssociations();

// Export all models and utilities
module.exports = {
  sequelize,
  StorageUnit,
  Booking,
  syncDatabase,
  testConnection
};