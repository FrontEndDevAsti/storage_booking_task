# Storage Booking Application

A full-stack storage booking application with a Next.js frontend and Node.js/Express/PostgreSQL backend.

![image](https://github.com/user-attachments/assets/4e6c5b80-7a33-46df-a02f-05a3782aa127)



## Project Structure

```
storage-booking-project/
├── backend/                    # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── models/
│   │   │   ├── index.ts
│   │   │   ├── StorageUnit.ts
│   │   │   └── Booking.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── units.ts
│   │   │   └── bookings.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── utils/
│   │   │   └── validation.ts
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
└── frontend/                   # Next.js + Tailwind CSS
    ├── app/
    │   ├── api/
    │   │   ├── units/
    │   │   │   └── route.ts
    │   │   ├── book/
    │   │   │   └── route.ts
    │   │   └── bookings/
    │   │       └── route.ts
    │   ├── book/
    │   │   └── page.tsx
    │   ├── bookings/
    │   │   └── page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── .env.local
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.js
```


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
```
   cd storage-booking-backend
  ```

2. **Install dependencies:**
```
   npm install
```

3. **Configure environment variables:**
   Copy \`.env\` file and update with your database credentials:
```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=storage_booking
DB_USER=storage_user (your_username)
DB_PASSWORD=storage123 (your_password)

# Server Configuration
PORT=5000
NODE_ENV=development

```

4. **Start the backend server:**
```
   npm run dev
   ```
   The backend will run on \`http://localhost:5000`

### 3. Frontend Setup

1. **Open a new terminal** and navigate to frontend directory:
```
   cd storage-booking-frontend
```

2. **Install dependencies:**
```
   npm install --legacy-peer-deps
```

3. **Configure environment variables:**
   The \`.env\` file should contain:
```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
4. **Start the frontend development server:**
 ```
   npm run dev
 ```

   The frontend will run on \`http://localhost:3000`

## Usage

1. **Browse Units:** Visit \`http://localhost:3000` to see available storage units
2. **Book a Unit:** Click "Book Now" on any available unit
3. **My Bookings:** Go to "My Bookings" and search by name

## API Endpoints

The backend provides these API endpoints:

1. **Health Check:**

   URL: `GET http://localhost:5000/api/health`
   Expected: Status 200, server info



2. **Get All Units:**

   URL: `GET http://localhost:5000/api/units`
   Expected: Array of 10 storage units



3. **Filter Units:**

   URL: `GET http://localhost:5000/api/units?location=Downtown`
   Expected: Only Downtown units



4. **Get Specific Unit:**

   URL: `GET http://localhost:5000/api/units/1`
   Expected: Unit details with ID 1



5. **Create Booking:**

   URL: `POST http://localhost:5000/api/bookings`
   Headers: `Content-Type: application/json`
   Body:


```json
{
  "userName": "Test User",
  "unitId": 1,
  "startDate": "2024-03-01T00:00:00.000Z",
  "endDate": "2024-03-15T00:00:00.000Z"
}
```

Expected: Booking created successfully



6. **Get User Bookings:**

   URL: `GET http://localhost:5000/api/bookings?userName=Test User`
   Expected: List of bookings for Test User



7. **Check Availability:**

   URL: `GET http://localhost:5000/api/units/1/availability?startDate=2024-03-01&endDate=2024-03-15`
   Expected: Available = false (due to existing booking)



8. **Try Conflicting Booking:**

   URL: `POST http://localhost:5000/api/bookings`
   Body: Same dates as above but different user
   Expected: 409 Conflict error



## Technologies Used

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
  
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


## Support

For issues and questions, please create an issue in the repository.
