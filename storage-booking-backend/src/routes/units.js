const express = require('express');
const { StorageUnit } = require('../models');
const { validateUnitId } = require('../utils/validation');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * GET /api/units
 * Retrieve all storage units with optional filtering
 * Query parameters:
 * - location: Filter by location
 * - available: Filter by availability (true/false)
 * - minPrice: Minimum price per day
 * - maxPrice: Maximum price per day
 */
router.get('/', async (req, res, next) => {
  try {
    const { location, available, minPrice, maxPrice, size } = req.query;
    
    // Build dynamic where clause based on query parameters
    const whereClause = {};
    
    // Filter by location (case-insensitive)
    if (location && typeof location === 'string') {
      whereClause.location = {
        [Op.iLike]: `%${location.trim()}%`
      };
    }
    
    // Filter by availability
    if (available !== undefined) {
      whereClause.isAvailable = available === 'true';
    }
    
    // Filter by size (case-insensitive)
    if (size && typeof size === 'string') {
      whereClause.size = {
        [Op.iLike]: `%${size.trim()}%`
      };
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      whereClause.pricePerDay = {};
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) {
          whereClause.pricePerDay[Op.gte] = min;
        }
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) {
          whereClause.pricePerDay[Op.lte] = max;
        }
      }
    }

    // Fetch storage units with filtering and sorting
    const units = await StorageUnit.findAll({
      where: whereClause,
      order: [
        ['isAvailable', 'DESC'], // Available units first
        ['pricePerDay', 'ASC'],  // Then by price (lowest first)
        ['createdAt', 'ASC']     // Then by creation date
      ],
      attributes: [
        'id', 
        'name', 
        'size', 
        'location', 
        'pricePerDay', 
        'isAvailable',
        'description'
      ]
    });

    // Add metadata to response
    const response = {
      units,
      metadata: {
        total: units.length,
        available: units.filter(unit => unit.isAvailable).length,
        unavailable: units.filter(unit => !unit.isAvailable).length,
        filters: {
          location: location || null,
          available: available || null,
          size: size || null,
          priceRange: {
            min: minPrice || null,
            max: maxPrice || null
          }
        }
      }
    };

    console.log(`📦 Retrieved ${units.length} storage units with filters:`, whereClause);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error fetching storage units:', error);
    next(error);
  }
});

/**
 * GET /api/units/:id
 * Retrieve a specific storage unit by ID
 */
router.get('/:id', validateUnitId, async (req, res, next) => {
  try {
    const unitId = parseInt(req.params.validatedUnitId);
    
    // Find unit with associated bookings for availability checking
    const unit = await StorageUnit.findByPk(unitId, {
      include: [{
        model: require('../models').Booking,
        as: 'bookings',
        where: {
          status: ['upcoming', 'active']
        },
        required: false, // LEFT JOIN to include units without bookings
        attributes: ['id', 'startDate', 'endDate', 'status']
      }]
    });
    
    if (!unit) {
      return res.status(404).json({ 
        error: 'Storage unit not found',
        unitId 
      });
    }

    console.log(`📦 Retrieved storage unit ${unitId}`);
    res.json(unit);
    
  } catch (error) {
    console.error(`❌ Error fetching storage unit ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * GET /api/units/:id/availability
 * Check availability of a specific unit for given date range
 * Query parameters:
 * - startDate: Start date (ISO format)
 * - endDate: End date (ISO format)
 */
router.get('/:id/availability', validateUnitId, async (req, res, next) => {
  try {
    const unitId = parseInt(req.params.validatedUnitId);
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Both startDate and endDate query parameters are required',
        example: '/api/units/1/availability?startDate=2024-01-01&endDate=2024-01-07'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use ISO format (YYYY-MM-DD)'
      });
    }
    
    if (start >= end) {
      return res.status(400).json({
        error: 'End date must be after start date'
      });
    }
    
    // Check if unit exists
    const unit = await StorageUnit.findByPk(unitId);
    if (!unit) {
      return res.status(404).json({ 
        error: 'Storage unit not found',
        unitId 
      });
    }
    
    // Check for conflicting bookings
    const conflictingBookings = await require('../models').Booking.findAll({
      where: {
        unitId,
        status: {
          [Op.in]: ['upcoming', 'active']
        },
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [start, end]
            }
          },
          {
            endDate: {
              [Op.between]: [start, end]
            }
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: start } },
              { endDate: { [Op.gte]: end } }
            ]
          }
        ]
      }
    });
    
    const isAvailable = unit.isAvailable && conflictingBookings.length === 0;
    
    res.json({
      unitId,
      available: isAvailable,
      dateRange: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      conflicts: conflictingBookings.map(booking => ({
        bookingId: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status
      }))
    });
    
  } catch (error) {
    console.error(`❌ Error checking availability for unit ${req.params.id}:`, error);
    next(error);
  }
});

module.exports = router;