# Storage Booking Application

A full-stack storage booking application with a Next.js frontend and Node.js/Express/PostgreSQL backend.

## Project Structure

\`\`\`
storage-booking-app/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js App Router pages
│   ├── package.json  # Frontend dependencies
│   └── ...
├── backend/          # Node.js Express API server
│   ├── server.js     # Main server file
│   ├── init-db.js    # Database initialization
│   ├── package.json  # Backend dependencies
│   └── .env          # Environment variables
└── README.md         # This file
\`\`\`

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Setup Instructions

### 1. Database Setup

First, set up PostgreSQL:

1. **Install PostgreSQL** on your system
2. **Create a database** named \`storage_booking\`:
   \`\`\`sql
   CREATE DATABASE storage_booking;
   \`\`\`
3. **Create a user** (optional, or use existing postgres user):
   \`\`\`sql
   CREATE USER storage_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE storage_booking TO storage_user;
   \`\`\`

### 2. Backend Setup

1. **Navigate to backend directory:**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables:**
   Copy \`.env\` file and update with your database credentials:
   \`\`\`
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=storage_booking
   DB_PASSWORD=your_password
   DB_PORT=5432
   PORT=5000
   \`\`\`

4. **Initialize database:**
   \`\`\`bash
   npm run init-db
   \`\`\`

5. **Start the backend server:**
   \`\`\`bash
   npm run dev
   \`\`\`

   The backend will run on \`http://localhost:5000\`

### 3. Frontend Setup

1. **Open a new terminal** and navigate to frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables:**
   The \`.env.local\` file should contain:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   \`\`\`

4. **Start the frontend development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

   The frontend will run on \`http://localhost:3000\`

## Usage

1. **Browse Units:** Visit \`http://localhost:3000\` to see available storage units
2. **Book a Unit:** Click "Book Now" on any available unit
3. **View Bookings:** Go to "My Bookings" and search by email

## API Endpoints

The backend provides these API endpoints:

- \`GET /api/units\` - Get all storage units
- \`GET /api/units/:id\` - Get specific unit details
- \`POST /api/bookings\` - Create a new booking
- \`GET /api/bookings?email=user@email.com\` - Get bookings by email
- \`GET /api/health\` - Health check endpoint

## Database Schema

### Units Table
\`\`\`sql
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  size VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Bookings Table
\`\`\`sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id),
  unit_name VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  duration INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Development Scripts

### Backend
- \`npm start\` - Start production server
- \`npm run dev\` - Start development server with nodemon
- \`npm run init-db\` - Initialize database with tables and sample data

### Frontend
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server

## Technologies Used

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - UI library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Production Deployment

### Backend Deployment
1. Set up PostgreSQL database on your hosting provider
2. Update environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Update \`NEXT_PUBLIC_API_URL\` to your production backend URL
2. Deploy to Vercel, Netlify, or any static hosting provider

## Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Check PostgreSQL is running
   - Verify database credentials in \`.env\`
   - Ensure database exists

2. **Frontend API Errors:**
   - Verify backend is running on port 5000
   - Check \`NEXT_PUBLIC_API_URL\` in frontend \`.env.local\`

3. **CORS Issues:**
   - Backend includes CORS middleware
   - Check if frontend URL is correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
\`\`\`

## Support

For issues and questions, please create an issue in the repository.
