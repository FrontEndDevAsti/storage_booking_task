const express = require('express');
const unitsRoutes = require('./units');
const bookingsRoutes = require('./bookings');

const router = express.Router();

/**
 * API Routes Configuration
 * All routes are prefixed with /api in the main server file
 */

// Storage Units routes
router.use('/units', unitsRoutes);

// Bookings routes  
router.use('/bookings', bookingsRoutes);

/**
 * Health check endpoint
 * GET /api/health
 * Returns server status and basic information
 */
router.get('/health', (req, res) => {
  const healthInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
  };
  
  console.log('🏥 Health check requested');
  res.json(healthInfo);
});

/**
 * API Information endpoint
 * GET /api/info
 * Returns available endpoints and their descriptions
 */
router.get('/info', (req, res) => {
  const apiInfo = {
    name: 'Storage Booking API',
    version: '1.0.0',
    description: 'RESTful API for storage unit booking system',
    endpoints: {
      health: {
        method: 'GET',
        path: '/api/health',
        description: 'Check API health status'
      },
      units: {
        list: {
          method: 'GET',
          path: '/api/units',
          description: 'Get all storage units with optional filtering',
          queryParams: ['location', 'available', 'minPrice', 'maxPrice', 'size']
        },
        getById: {
          method: 'GET',
          path: '/api/units/:id',
          description: 'Get specific storage unit by ID'
        },
        checkAvailability: {
          method: 'GET',
          path: '/api/units/:id/availability',
          description: 'Check unit availability for date range',
          queryParams: ['startDate', 'endDate']
        }
      },
      bookings: {
        create: {
          method: 'POST',
          path: '/api/bookings',
          description: 'Create a new booking',
          bodyParams: ['userName', 'unitId', 'startDate', 'endDate']
        },
        getByUser: {
          method: 'GET',
          path: '/api/bookings',
          description: 'Get bookings for a user',
          queryParams: ['userName', 'status']
        },
        getById: {
          method: 'GET',
          path: '/api/bookings/:id',
          description: 'Get specific booking by ID'
        },
        cancel: {
          method: 'PUT',
          path: '/api/bookings/:id/cancel',
          description: 'Cancel a booking'
        }
      }
    },
    examples: {
      createBooking: {
        url: 'POST /api/bookings',
        body: {
          userName: 'John Doe',
          unitId: 1,
          startDate: '2024-02-01T00:00:00.000Z',
          endDate: '2024-02-15T00:00:00.000Z'
        }
      },
      getUserBookings: {
        url: 'GET /api/bookings?userName=John%20Doe'
      },
      filterUnits: {
        url: 'GET /api/units?location=Downtown&available=true&maxPrice=30'
      }
    }
  };
  
  res.json(apiInfo);
});

/**
 * Root endpoint
 * GET /api/
 * Welcome message and basic API information
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Storage Booking API',
    version: '1.0.0',
    documentation: '/api/info',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;