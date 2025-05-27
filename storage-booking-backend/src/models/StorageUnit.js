const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

/**
 * StorageUnit Model Class
 * Represents storage units available for booking
 */
class StorageUnit extends Model {}

/**
 * Initialize the StorageUnit model with database schema
 */
StorageUnit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Unique identifier for storage unit'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Storage unit name cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'Storage unit name must be between 1 and 255 characters'
        }
      },
      comment: 'Display name of the storage unit'
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Size cannot be empty'
        },
        len: {
          args: [1, 50],
          msg: 'Size must be between 1 and 50 characters'
        }
      },
      comment: 'Physical dimensions of the storage unit (e.g., "10x10 ft")'
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Location cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'Location must be between 1 and 255 characters'
        }
      },
      comment: 'Physical location/address of the storage unit'
    },
    pricePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Price per day must be a positive number'
        },
        isDecimal: {
          msg: 'Price per day must be a valid decimal number'
        }
      },
      comment: 'Daily rental price in dollars'
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the storage unit is available for booking'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional detailed description of the storage unit'
    }
  },
  {
    sequelize,
    tableName: 'storage_units',
    timestamps: true,
    indexes: [
      {
        fields: ['location'] // Index for faster location-based queries
      },
      {
        fields: ['isAvailable'] // Index for faster availability queries
      },
      {
        fields: ['pricePerDay'] // Index for price-based sorting
      }
    ]
  }
);

module.exports = StorageUnit;