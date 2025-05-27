const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const StorageUnit = require('./StorageUnit');

/**
 * Booking Model Class
 * Represents storage unit bookings made by users
 */
class Booking extends Model {}

/**
 * Initialize the Booking model with database schema
 */
Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Unique identifier for booking'
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'User name cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'User name must be between 1 and 255 characters'
        }
      },
      comment: 'Name of the person making the booking'
    },
    userEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        }
      },
      comment: 'Optional email address of the user'
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: StorageUnit,
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // Prevent deletion of units with active bookings
      comment: 'Foreign key reference to storage_units table'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterToday(value) {
          if (value < new Date()) {
            throw new Error('Start date cannot be in the past');
          }
        }
      },
      comment: 'Start date of the booking period'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterStartDate(value) {
          if (value <= this.startDate) {
            throw new Error('End date must be after start date');
          }
        }
      },
      comment: 'End date of the booking period'
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total cost must be a positive number'
        },
        isDecimal: {
          msg: 'Total cost must be a valid decimal number'
        }
      },
      comment: 'Total cost of the booking in dollars'
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'upcoming',
      comment: 'Current status of the booking'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional notes or special instructions for the booking'
    }
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      {
        fields: ['userName'] // Index for faster user-based queries
      },
      {
        fields: ['unitId'] // Index for faster unit-based queries
      },
      {
        fields: ['status'] // Index for status-based filtering
      },
      {
        fields: ['startDate', 'endDate'] // Composite index for date range queries
      }
    ]
  }
);

/**
 * Define associations between Booking and StorageUnit models
 */
Booking.belongsTo(StorageUnit, { 
  foreignKey: 'unitId', 
  as: 'storageUnit',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

StorageUnit.hasMany(Booking, { 
  foreignKey: 'unitId', 
  as: 'bookings',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

module.exports = Booking;