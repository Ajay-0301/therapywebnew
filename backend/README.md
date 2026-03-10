# Therapy App Backend

A comprehensive Node.js + Express backend for the Therapy Management Application with MongoDB database.

## Features

- **Authentication**: User registration and JWT-based login
- **Client Management**: Full CRUD operations for therapy clients
- **Appointments**: Schedule and manage client appointments
- **Earnings Tracking**: Monitor and track daily/monthly earnings
- **Dashboard**: Real-time analytics and statistics
- **Insights**: Comprehensive data analytics and visualizations
- **Settings**: User preferences and application settings
- **Error Handling**: Comprehensive error handling middleware

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/therapy-app
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

3. Ensure MongoDB is running on your system.

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `POST /api/clients/:id/session` - Add session to client
- `GET /api/clients/deleted` - Get deleted clients

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Earnings
- `GET /api/earnings` - Get all earnings
- `GET /api/earnings/month` - Get earnings by month
- `POST /api/earnings` - Add earnings
- `PUT /api/earnings/:id` - Update earnings
- `DELETE /api/earnings/:id` - Delete earnings

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/preferences` - Save preferences

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/activity` - Get recent activity

### Insights
- `GET /api/insights` - Get insights data
- `GET /api/insights/stats` - Get client statistics
- `GET /api/insights/age-distribution` - Get age distribution
- `GET /api/insights/earnings` - Get earnings statistics

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User schema
│   ├── Client.js          # Client schema
│   ├── Appointment.js     # Appointment schema
│   ├── Earning.js         # Earning schema
│   ├── Setting.js         # Settings schema
│   └── DeletedClient.js   # Deleted client schema
├── controllers/
│   ├── authController.js
│   ├── clientController.js
│   ├── appointmentController.js
│   ├── earningController.js
│   ├── settingsController.js
│   ├── dashboardController.js
│   └── insightsController.js
├── routes/
│   ├── auth.js
│   ├── clients.js
│   ├── appointments.js
│   ├── earnings.js
│   ├── settings.js
│   ├── dashboard.js
│   └── insights.js
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── errorHandler.js    # Error handling
├── utils/
│   └── validators.js      # Input validators
├── server.js              # Main server file
├── package.json
├── .env
└── .gitignore
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Models

### User
- username (unique)
- password (hashed with bcrypt)
- email
- fullName
- role (therapist/admin)

### Client
- name
- email
- phone
- age
- status (active/completed/on-hold)
- diagnosis
- location
- sessionHistory
- createdAt

### Appointment
- clientId (reference to Client)
- clientName
- type
- dateTime
- location
- notes
- status (scheduled/completed/cancelled)

### Earning
- day
- month
- year
- amount
- timestamp

### Setting
- userId
- theme (light/dark)
- density (comfortable/compact)
- language
- notifications
- timezone

## Error Handling

All endpoints return consistent error responses:
```json
{
  "message": "Error message here"
}
```

## License

MIT
