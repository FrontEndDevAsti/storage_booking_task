/**
 * Validation middleware for booking creation requests
 * Validates all required fields and business rules
 */
const validateBookingData = (req, res, next) => {
  const { userName, unitId, startDate, endDate } = req.body;

  // Check for required fields
  if (!userName || !unitId || !startDate || !endDate) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['userName', 'unitId', 'startDate', 'endDate'],
      received: Object.keys(req.body)
    });
  }

  // Validate userName
  if (typeof userName !== 'string' || userName.trim().length === 0) {
    return res.status(400).json({
      error: 'userName must be a non-empty string'
    });
  }

  if (userName.trim().length > 255) {
    return res.status(400).json({
      error: 'userName must be less than 255 characters'
    });
  }

  // Validate unitId
  if (!Number.isInteger(unitId) || unitId <= 0) {
    return res.status(400).json({
      error: 'unitId must be a positive integer'
    });
  }

  // Validate and parse dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  // Reset time to start of day for fair comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)'
    });
  }

  if (start >= end) {
    return res.status(400).json({
      error: 'End date must be after start date'
    });
  }

  if (start < today) {
    return res.status(400).json({
      error: 'Start date cannot be in the past'
    });
  }

  // Check if booking period is reasonable (not more than 1 year)
  const maxBookingDays = 365;
  const bookingDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  if (bookingDays > maxBookingDays) {
    return res.status(400).json({
      error: `Booking period cannot exceed ${maxBookingDays} days`
    });
  }

  // Add validated data to request object for use in route handlers
  req.body.validatedData = {
    userName: userName.trim(),
    unitId,
    startDate: start,
    endDate: end,
    bookingDays
  };

  next();
};

/**
 * Validation middleware for user name query parameter
 * Used in GET /bookings endpoint
 */
const validateUserName = (req, res, next) => {
  const { userName } = req.query;

  if (!userName || typeof userName !== 'string' || userName.trim().length === 0) {
    return res.status(400).json({
      error: 'userName query parameter is required and must be a non-empty string',
      example: '/api/bookings?userName=John%20Doe'
    });
  }

  if (userName.trim().length > 255) {
    return res.status(400).json({
      error: 'userName must be less than 255 characters'
    });
  }

  // Add validated userName to request object
  req.query.validatedUserName = userName.trim();

  next();
};

/**
 * Validation middleware for unit ID parameter
 * Used in GET /units/:id endpoint
 */
const validateUnitId = (req, res, next) => {
  const { id } = req.params;
  const unitId = parseInt(id);

  if (isNaN(unitId) || unitId <= 0) {
    return res.status(400).json({
      error: 'Unit ID must be a positive integer'
    });
  }

  // Add validated unitId to request object
  req.params.validatedUnitId = unitId.toString();

  next();
};

/**
 * Validation middleware for booking ID parameter
 * Used in GET /bookings/:id endpoint
 */
const validateBookingId = (req, res, next) => {
  const { id } = req.params;
  const bookingId = parseInt(id);

  if (isNaN(bookingId) || bookingId <= 0) {
    return res.status(400).json({
      error: 'Booking ID must be a positive integer'
    });
  }

  // Add validated bookingId to request object
  req.params.validatedBookingId = bookingId.toString();

  next();
};

/**
 * General purpose email validation function
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input to prevent XSS attacks
 */
const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

module.exports = {
  validateBookingData,
  validateUserName,
  validateUnitId,
  validateBookingId,
  isValidEmail,
  sanitizeInput
};