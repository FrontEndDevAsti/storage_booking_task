const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, StorageUnit, syncDatabase, testConnection } = require('./models');
const routes = require('./routes');
const { errorHandler, notFound, requestLogger, basicRateLimit } = require('./middleware/errorHandler');

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * CORS Configuration
 * Allow requests from frontend applications
 */
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-production-domain.com',
        'https://your-frontend-app.vercel.app'
      ]
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * Middleware Configuration
 */
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Basic rate limiting
app.use(basicRateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

/**
 * API Routes
 * All routes are prefixed with /api
 */
app.use('/api', routes);

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Storage Booking API Server',
    version: '1.0.0',
    status: 'Running',
    api: '/api',
    health: '/api/health',
    documentation: '/api/info',
    timestamp: new Date().toISOString()
  });
});

/**
 * Error Handling Middleware
 * Must be defined after all routes
 */
app.use(notFound);      // Handle 404 errors
app.use(errorHandler);  // Handle all other errors

/**
 * Database Initialization Function
 * Sets up database connection, syncs models, and seeds initial data
 */
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Sync database models (create tables if they don't exist)
    await syncDatabase(false); // Set to true to force recreate tables
    
    // Seed initial data
    await seedDatabase();
    
    console.log('✅ Database initialization completed successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Database Seeding Function
 * Populates the database with initial storage units data
 */
const seedDatabase = async () => {
  try {
    // Check if storage units already exist
    const existingUnitsCount = await StorageUnit.count();
    
    if (existingUnitsCount > 0) {
      console.log(`📦 Database already contains ${existingUnitsCount} storage units`);
      return;
    }

    console.log('🌱 Seeding database with initial storage units...');
    
    // Sample storage units data
    const storageUnitsData = [
      {
        name: 'Small Storage Unit A1',
        size: '5x5 ft',
        location: 'Downtown',
        pricePerDay: 15.00,
        isAvailable: true,
        description: 'Perfect for storing seasonal items, documents, and small furniture pieces.'
      },
      {
        name: 'Medium Storage Unit B2',
        size: '10x10 ft',
        location: 'Downtown',
        pricePerDay: 25.00,
        isAvailable: true,
        description: 'Ideal for apartment contents, business inventory, and medium-sized furniture.'
      },
      {
        name: 'Large Storage Unit C3',
        size: '10x20 ft',
        location: 'Midtown',
        pricePerDay: 40.00,
        isAvailable: true,
        description: 'Great for house contents, vehicles, and large business inventory.'
      },
      {
        name: 'Extra Large Unit D4',
        size: '20x20 ft',
        location: 'Uptown',
        pricePerDay: 60.00,
        isAvailable: true,
        description: 'Perfect for commercial use, multiple vehicles, or large household moves.'
      },
      {
        name: 'Small Storage Unit A5',
        size: '5x5 ft',
        location: 'Midtown',
        pricePerDay: 12.00,
        isAvailable: true,
        description: 'Compact and affordable option for personal belongings and documents.'
      },
      {
        name: 'Medium Storage Unit B6',
        size: '10x10 ft',
        location: 'Uptown',
        pricePerDay: 28.00,
        isAvailable: true,
        description: 'Climate-controlled unit perfect for sensitive items and electronics.'
      },
      {
        name: 'Compact Unit E7',
        size: '5x8 ft',
        location: 'Downtown',
        pricePerDay: 18.00,
        isAvailable: true,
        description: 'Narrow but deep unit, great for storing long items like skis or artwork.'
      },
      {
        name: 'Standard Unit F8',
        size: '8x10 ft',
        location: 'Midtown',
        pricePerDay: 22.00,
        isAvailable: true,
        description: 'Popular size for studio apartment contents and small business needs.'
      },
      {
        name: 'Premium Unit G9',
        size: '15x15 ft',
        location: 'Uptown',
        pricePerDay: 45.00,
        isAvailable: false,
        description: 'Premium climate-controlled unit with enhanced security features.'
      },
      {
        name: 'Economy Unit H10',
        size: '5x5 ft',
        location: 'Downtown',
        pricePerDay: 10.00,
        isAvailable: true,
        description: 'Budget-friendly option for basic storage needs and seasonal items.'
      }
    ];

    // Create storage units in database
    const createdUnits = await StorageUnit.bulkCreate(storageUnitsData);
    console.log(`✅ Successfully created ${createdUnits.length} storage units`);
    
    // Log summary of created units
    const locationSummary = createdUnits.reduce((acc, unit) => {
      acc[unit.location] = (acc[unit.location] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Storage units by location:', locationSummary);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

/**
 * Server Startup Function
 * Initializes database and starts the Express server
 */
const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API documentation: http://localhost:${PORT}/api/info`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('💡 Try using a different port or stop the existing process');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown Handlers
 * Properly close database connections and server when process is terminated
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
  
  try {
    // Close database connection
    await sequelize.close();
    console.log('✅ Database connection closed');
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle different termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

/**
 * Start the application
 */
console.log('🔄 Starting Storage Booking API Server...');
console.log(`📅 Timestamp: ${new Date().toISOString()}`);
console.log(`🔧 Node.js version: ${process.version}`);
console.log(`💾 Platform: ${process.platform}`);

startServer().catch((error) => {
  console.error('❌ Critical error starting server:', error);
  process.exit(1);
});