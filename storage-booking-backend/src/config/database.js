const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Database configuration and connection setup
 * Uses PostgreSQL with Sequelize ORM
 */
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'storage_booking',
  username: process.env.DB_USER || 'storage_user',
  password: process.env.DB_PASSWORD || 'storage123',
  dialect: 'postgres',
  
  // Logging configuration - show SQL queries in development
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Connection pool configuration for better performance
  pool: {
    max: 5,        // Maximum number of connections
    min: 0,        // Minimum number of connections
    acquire: 30000, // Maximum time to get connection (ms)
    idle: 10000    // Maximum time connection can be idle (ms)
  },
  
  // Additional options
  define: {
    timestamps: true,     // Add createdAt and updatedAt automatically
    underscored: false,   // Use camelCase instead of snake_case
    freezeTableName: true // Don't pluralize table names
  }
});

module.exports = sequelize;