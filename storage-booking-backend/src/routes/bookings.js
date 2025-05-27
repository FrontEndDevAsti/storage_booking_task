const express = require('express');
const { Op } = require('sequelize');
const { Booking, StorageUnit } = require('../models');
const { validateBookingData, validateUserName, validateBookingId } = require('../utils/validation');
const { differenceInDays } = require('date-fns');

const router = express.Router();

/**
 * Helper function to calculate total cost for a booking
 * @param {Date} startDate - Booking start date
 * @param {Date} endDate - Booking end date
 * @param {number} pricePerDay - Daily rate for the storage unit
 * @returns {number} Total cost for the booking period
 */
const calculateTotalCost = (startDate, endDate, pricePerDay) => {
  // Calculate number of days (inclusive of both start and end dates)
  const days = differenceInDays(endDate, startDate) + 1;
  return Math.round(days * pricePerDay * 100) / 100; // Round to 2 decimal places
};

/**
 * Helper function to check for booking conflicts
 * @param {number} unitId - Storage unit ID
 * @param {Date} startDate - Proposed booking start date
 * @param {Date} endDate - Proposed booking end date
 * @param {number} excludeBookingId - Optional booking ID to exclude from conflict check (for updates)
 * @returns {Promise<boolean>} - True if there are conflicts
 */
const checkBookingConflict = async (unitId, startDate, endDate, excludeBookingId) => {
  const whereClause = {
    unitId,
    status: {
      [Op.in]: ['upcoming', 'active'] // Only check active and upcoming bookings
    },
    [Op.or]: [
      // New booking starts during existing booking
      {
        startDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      // New booking ends during existing booking
      {
        endDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      // New booking completely encompasses existing booking
      {
        [Op.and]: [
          { startDate: { [Op.gte]: startDate } },
          { endDate: { [Op.lte]: endDate } }
        ]
      },
      // Existing booking completely encompasses new booking
      {
        [Op.and]: [
          { startDate: { [Op.lte]: startDate } },
          { endDate: { [Op.gte]: endDate } }
        ]
      }
    ]
  };

  // Exclude specific booking from conflict check (useful for updates)
  if (excludeBookingId) {
    whereClause.id = { [Op.ne]: excludeBookingId };
  }

  const conflictingBookings = await Booking.findAll({
    where: whereClause,
    attributes: ['id', 'startDate', 'endDate', 'status']
  });

  return conflictingBookings.length > 0;
};

/**
 * Helper function to determine booking status based on dates
 * @param {Date} startDate - Booking start date
 * @param {Date} endDate - Booking end date
 * @returns {string} Booking status
 */
const determineBookingStatus = (startDate, endDate) => {
  const now = new Date();
  
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'completed';
  return 'active';
};

/**
 * POST /api/bookings
 * Create a new storage unit booking
 */
router.post('/', validateBookingData, async (req, res, next) => {
  try {
    const { validatedData } = req.body;
    const { userName, unitId, startDate, endDate } = validatedData;

    console.log(`📝 Creating booking for user: ${userName}, unit: ${unitId}`);

    // Check if storage unit exists and is available
    const storageUnit = await StorageUnit.findByPk(unitId);
    if (!storageUnit) {
      return res.status(404).json({ 
        error: 'Storage unit not found',
        unitId 
      });
    }

    if (!storageUnit.isAvailable) {
      return res.status(400).json({ 
        error: 'Storage unit is not available for booking',
        unitId,
        unitName: storageUnit.name
      });
    }

    // Check for booking conflicts
    const hasConflict = await checkBookingConflict(unitId, startDate, endDate);
    if (hasConflict) {
      return res.status(409).json({ 
        error: 'This unit is already booked for the selected dates',
        unitId,
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
    }

    // Calculate total cost
    const totalCost = calculateTotalCost(startDate, endDate, storageUnit.pricePerDay);
    
    // Determine initial status
    const status = determineBookingStatus(startDate, endDate);

    // Create the booking
    const booking = await Booking.create({
      userName,
      unitId,
      startDate,
      endDate,
      totalCost,
      status
    });

    // Fetch the complete booking with unit details
    const bookingWithUnit = await Booking.findByPk(booking.id, {
      include: [{
        model: StorageUnit,
        as: 'storageUnit',
        attributes: ['id', 'name', 'size', 'location', 'pricePerDay']
      }]
    });

    console.log(`✅ Booking created successfully: ID ${booking.id}`);
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookingWithUnit,
      summary: {
        bookingId: booking.id,
        userName,
        unitName: storageUnit.name,
        duration: `${differenceInDays(endDate, startDate) + 1} days`,
        totalCost: `$${totalCost}`,
        status
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    next(error);
  }
});

/**
 * GET /api/bookings
 * Retrieve bookings for a specific user
 * Query parameters:
 * - userName: Name of the user (required)
 * - status: Filter by booking status (optional)
 */
router.get('/', validateUserName, async (req, res, next) => {
  try {
    const userName = req.query.validatedUserName;
    const { status } = req.query;

    console.log(`🔍 Fetching bookings for user: ${userName}`);

    // Build where clause
    const whereClause = {
      userName: {
        [Op.iLike]: `%${userName}%` // Case-insensitive partial match
      }
    };

    // Filter by status if provided
    if (status && typeof status === 'string') {
      const validStatuses = ['upcoming', 'active', 'completed', 'cancelled'];
      if (validStatuses.includes(status)) {
        whereClause.status = status;
      }
    }

    // Fetch bookings with unit details
    const bookings = await Booking.findAll({
      where: whereClause,
      include: [{
        model: StorageUnit,
        as: 'storageUnit',
        attributes: ['id', 'name', 'size', 'location', 'pricePerDay']
      }],
      order: [['createdAt', 'DESC']] // Most recent bookings first
    });

    // Update booking statuses based on current date and save if changed
    const now = new Date();
    const updatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const currentStatus = booking.status;
        let newStatus = currentStatus;
        
        // Only update status for non-cancelled bookings
        if (currentStatus !== 'cancelled') {
          newStatus = determineBookingStatus(booking.startDate, booking.endDate);
        }

        // Update status in database if it changed
        if (newStatus !== currentStatus) {
          await booking.update({ status: newStatus });
          console.log(`📅 Updated booking ${booking.id} status: ${currentStatus} → ${newStatus}`);
        }

        return booking.reload(); // Reload to get updated data
      })
    );

    // Calculate summary statistics
    const summary = {
      total: updatedBookings.length,
      upcoming: updatedBookings.filter(b => b.status === 'upcoming').length,
      active: updatedBookings.filter(b => b.status === 'active').length,
      completed: updatedBookings.filter(b => b.status === 'completed').length,
      cancelled: updatedBookings.filter(b => b.status === 'cancelled').length,
      totalValue: updatedBookings.reduce((sum, b) => sum + parseFloat(b.totalCost.toString()), 0)
    };

    console.log(`✅ Retrieved ${updatedBookings.length} bookings for ${userName}`);
    
    res.json({
      bookings: updatedBookings,
      summary,
      user: userName
    });
    
  } catch (error) {
    console.error(`❌ Error fetching bookings for user ${req.query.userName}:`, error);
    next(error);
  }
});

/**
 * GET /api/bookings/:id
 * Retrieve a specific booking by ID
 */
router.get('/:id', validateBookingId, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.validatedBookingId);

    console.log(`🔍 Fetching booking: ${bookingId}`);

    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: StorageUnit,
        as: 'storageUnit',
        attributes: ['id', 'name', 'size', 'location', 'pricePerDay', 'description']
      }]
    });

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found',
        bookingId 
      });
    }

    // Update status if needed
    const currentStatus = booking.status;
    if (currentStatus !== 'cancelled') {
      const newStatus = determineBookingStatus(booking.startDate, booking.endDate);
      if (newStatus !== currentStatus) {
        await booking.update({ status: newStatus });
        await booking.reload();
        console.log(`📅 Updated booking ${bookingId} status: ${currentStatus} → ${newStatus}`);
      }
    }

    console.log(`✅ Retrieved booking ${bookingId}`);
    res.json(booking);
    
  } catch (error) {
    console.error(`❌ Error fetching booking ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * PUT /api/bookings/:id/cancel
 * Cancel a specific booking
 */
router.put('/:id/cancel', validateBookingId, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.validatedBookingId);

    console.log(`🚫 Cancelling booking: ${bookingId}`);

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found',
        bookingId 
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        error: 'Booking is already cancelled',
        bookingId,
        currentStatus: booking.status
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        error: 'Cannot cancel a completed booking',
        bookingId,
        currentStatus: booking.status
      });
    }

    // Cancel the booking
    await booking.update({ status: 'cancelled' });

    console.log(`✅ Booking ${bookingId} cancelled successfully`);
    
    res.json({
      message: 'Booking cancelled successfully',
      bookingId,
      previousStatus: booking.status,
      newStatus: 'cancelled'
    });
    
  } catch (error) {
    console.error(`❌ Error cancelling booking ${req.params.id}:`, error);
    next(error);
  }
});

module.exports = router;