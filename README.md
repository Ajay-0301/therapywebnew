# 🧠 Therapy Notes - Professional Mental Health Management Platform

A full-stack web application for mental health professionals to manage clients, therapy sessions, appointments, and clinical insights securely.

---

## ✨ Features Implemented

### 🔐 Authentication & User Management
- User registration and login with JWT authentication
- Secure password handling with hashed storage
- User avatar upload with image optimization
- Avatar persistence across login sessions
- Multi-user data isolation by user ID

# 🧠 Therapy Notes - Professional Mental Health Management Platform

A full-stack web application for mental health professionals to manage clients, therapy sessions, appointments, and clinical insights securely. Built with React, Express, MongoDB, and modern web technologies.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Frontend Features](#frontend-features)
- [Backend Features](#backend-features)
- [Technology Stack](#technology-stack)
- [Database Collections](#database-collections)
- [Architecture Highlights](#architecture-highlights)

---

## 🎯 Project Overview

**Therapy Notes** is a complete mental health management system designed to help psychologists and therapists:
- Manage multiple clients with comprehensive clinical profiles
- Track therapy sessions with detailed notes and follow-ups
- Schedule and manage appointments
- Monitor earnings and payments
- Generate insights from session data
- Securely recover deleted records
- Customize practice settings and preferences
- Access data across multiple devices with real-time synchronization

---

## ✨ Frontend Features

### 🔐 Authentication & User Management
- **User Registration**: Email/password signup with validation
- **User Login**: Secure login with JWT token generation
- **Profile Management**: 
	- Avatar upload with image optimization
	- Avatar resize to 512x512px
	- Image compression (80% quality, ~50KB max)
	- Avatar persistence across logout/login
	- Profile name editing

### 👥 Client Management Page
- **Create Clients**:
	- Client ID auto-generation
	- Personal info (name, email, phone, age, gender)
	- Relationship status and occupation
	- Client status (active, completed, on-hold)
	- Clinical data (chief complaints, HOPI)
- **View Clients**:
	- List all active clients
	- Search by name, ID, email, phone, gender
	- Filter by status
	- Client count display
- **Edit Clients**: Update all client information
- **Delete Clients**: Soft-delete with recovery capability

### 📱 Client Profile Page
- **Detailed Client View**:
	- Complete client information display
	- Age and occupation details
	- Relationship status
	- Clinical information
	- Session history counter
- **Session Management**:
	- Add new therapy sessions
	- Enter session date and detailed notes
	- Schedule follow-ups with date/time
	- Follow-up notes and reminders
	- View complete session history
	- Delete individual sessions
- **Clinical Notes**:
	- Edit chief complaints
	- Edit HOPI (History of Present Illness)
	- Save in real-time
- **Profile Editing**:
	- Edit name, age, occupation
	- Update client status
	- Track session count

### 📅 Calendar Page
- **Calendar Interface**:
	- Monthly calendar view
	- Date picker navigation
	- Appointment display on dates
	- Upcoming appointments highlighting
	- Click to view appointment details

### 📊 Dashboard Page
- **Overview Widgets**:
	- Total active clients count
	- Total appointments count
	- Total follow-ups count
- **Recently Added Clients**:
	- Last 5 added clients display
	- Client avatars/initials
- **Upcoming Appointments**:
	- Next 5 scheduled appointments
	- Date and time display
	- Client name reference
	- Delete capability
- **This Week's Follow-ups**:
	- Follow-ups due this week
	- Client and date information
	- Follow-up notes display
- **Recently Deleted Clients**:
	- Last 5 deleted clients display
	- Deletion timestamp
	- One-click restore button (↺)
	- Permanent delete button (×)
	- Success/error toast notifications
- **Completed Cases**:
	- Clients marked as completed
	- Status indicator

### 📈 Insights Page
- **Session Analytics**:
	- Total sessions completed
	- Completion percentage
	- Session trends
- **Client Statistics**:
	- Active clients count
	- Completed clients count
	- On-hold clients count
	- Status breakdown
- **Monthly Trends**:
	- Sessions by month
	- Chart visualization
	- Trend analysis
- **Age Distribution**:
	- Client age groups
	- Distribution visualization
- **Earnings Analytics**:
	- Total earnings sum
	- Monthly earnings breakdown
	- Payment trends
- **Custom Date Range**:
	- Filter insights by date
	- Dynamic chart updates,

### ⚙️ Settings Page
- **Theme Customization**:
	- Light/Dark theme selector
	- Real-time theme switching
- **Accent Color**:
	- Color picker
	- Custom brand color selection
- **Practice Settings**:
	- Practice name configuration
	- Display in sidebar
	- Persistent across sessions
- **Behavior Settings**:
	- Sidebar collapse/expand preference
	- Save sidebar state
- **Time Format**:
	- 12-hour format option
	- 24-hour format option
- **Language Settings**:
	- Language preference selection
- **Settings Management**:
	- Draft/Save pattern
	- Explicit Save button
	- Cancel button to revert changes
	- Saved badge with timestamp
	- Real-time preview of changes
	- Dual persistence (localStorage + MongoDB)

### 📌 Sidebar Navigation
- **User Profile Card**:
	- Display user avatar
	- Display user name
	- Edit user name inline
	- Upload new avatar
	- Logout button
- **Navigation Menu**:
	- Dashboard link
	- Clients link
	- Calendar link
	- Insights link
	- Settings link
- **Responsive Design**:
	- Collapse/expand toggle
	- Mobile-friendly navigation
	- Practice name display
	- Dynamic theme colors

### 🔄 Real-Time Features
- **Auto-Refresh Data**:
	- Listen to `clientDataUpdated` event
	- Listen to `visibilitychange` event
	- Auto-refresh on tab switch
	- Instant updates without manual refresh
- **Cross-Page Synchronization**:
	- Changes sync across all open pages
	- Window event broadcasting
	- Real-time state updates
- **Toast Notifications**:
	- Success notifications (green)
	- Error notifications (red)
	- Auto-hide after 2.2 seconds
	- Fixed position display
	- Smooth fade animations

### 📱 Responsive Design
- **360px+ Devices**: Mobile phone support
- **768px+ Devices**: Tablet optimization
- **1024px+ Devices**: Desktop full features
- **Adaptive Layouts**: Component reorganization per screen size
- **Touch-Friendly**: Optimized buttons and interactions
- **Flexible Grids**: Responsive grid layouts

---

## 🛠️ Backend Features

### 🔐 Authentication System
- **User Registration**:
	- Email validation
	- Password strength validation
	- Bcrypt password hashing
	- User model creation
- **User Login**:
	- Email/password verification
	- JWT token generation (7-day expiry)
	- User data return with avatar
	- Secure token storage instructions
- **Profile Management**:
	- Get current user profile (`GET /auth/me`)
	- Update user profile (`PUT /auth/me`)
	- Avatar storage in User model
	- Name update capability
	- Persistent across sessions

### 👥 Client Management API
- **CRUD Operations**:
	- `GET /clients` - Fetch all clients (user-scoped)
	- `GET /clients/:id` - Get single client
	- `POST /clients` - Create new client
	- `PUT /clients/:id` - Update client info
	- `DELETE /clients/:id` - Soft-delete client
- **Client Data Fields**:
	- clientId, name, email, phone
	- age, gender, occupation
	- relationshipStatus
	- status (active/completed/on-hold)
	- chiefComplaints, HOPI
	- sessionHistory array
- **Session Management**:
	- `POST /clients/:id/session` - Add session to client
	- Store session date, notes, follow-up info
	- Auto-sync to Session collection
- **Deleted Client Recovery**:
	- `GET /clients/deleted` - Get soft-deleted clients
	- `POST /clients/deleted/:id/restore` - Restore with full data
	- `DELETE /clients/deleted/:id` - Permanent delete
	- Store complete snapshots for recovery

### 📅 Appointment Management API
- `GET /appointments` - Fetch all appointments
- `GET /appointments/:id` - Get single appointment
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment
- Fields: clientId, dateTime, duration, status, notes

### 💰 Earnings Tracking API
- `GET /earnings` - Get all earnings
- `POST /earnings` - Create earnings record
- `PUT /earnings/:id` - Update earnings
- `DELETE /earnings/:id` - Delete earnings
- Fields: clientId, amount, date, notes

### ⚙️ Settings API
- `GET /settings` - Get user settings
- `PUT /settings` - Update settings
- Store in MongoDB for persistence
- Fields: theme, language, practiceName, timeFormat, sidebar preferences

### 📊 Dashboard API
- `GET /dashboard` - Overview data
	- Client count, appointment count, follow-up count
	- Recently added clients
	- Upcoming appointments
	- Weekly follow-ups
	- Deleted clients list

### 📈 Insights Analytics API
- `GET /insights` - Get insights data
- Session completion statistics
- Client status breakdown
- Monthly trends analysis
- Age distribution data
- Earnings analytics
- Custom date range filtering

### 🔒 Security Features
- **JWT Authentication**: All routes protected with Bearer token
- **User Scoping**: Every query includes `{ userId }` filter
- **Password Security**: Bcrypt hashing with salt
- **Error Handling**: Comprehensive error middleware
- **Validation**: Request validation on all endpoints
- **CORS Support**: Cross-origin request handling

### 🗂️ Data Persistence
- **MongoDB Integration**: All data stored in MongoDB Atlas
- **Mongoose ODM**: Schema validation and modeling
- **User Isolation**: Complete data separation between users
- **Soft Deletes**: Deleted data retained for recovery
- **Snapshot Storage**: Full data backups for restoration
- **Indexed Queries**: Fast lookups on userId, clientId

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI component library |
| TypeScript | Latest | Type-safe development |
| Vite | 5.4+ | Build tool & dev server |
| React Router | Latest | Client-side routing |
| CSS3 | Latest | Styling & responsive design |
| Fetch API | Native | HTTP requests |
| LocalStorage | Native | Client-side persistence |

### **Backend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22+ | JavaScript runtime |
| Express.js | Latest | REST API framework |
| Mongoose | Latest | MongoDB ODM |
| JWT | Latest | Token authentication |
| Bcrypt | Latest | Password hashing |

### **Database**
| Technology | Type | Purpose |
|-----------|------|---------|
| MongoDB Atlas | Cloud NoSQL | Data storage & retrieval |

---

## 📊 Database Collections & Schema

### **Users Collection**
```
- _id: ObjectId
- email: String (unique)
- password: String (hashed with bcrypt)
- fullName: String
- avatar: String (base64 data URL)
- role: String (therapist, admin)
- createdAt: Date
```

### **Clients Collection**
```
- _id: ObjectId
- userId: ObjectId (ref User)
- username: String
- clientId: String
- name: String
- email: String
- phone: String
- age: Number
- gender: String
- relationshipStatus: String
- occupation: String
- status: String (active, completed, on-hold)
- chiefComplaints: String
- hopi: String
- sessionHistory: Array
	- id: String
	- date: String
	- notes: String
	- followUpDate: String
	- followUpNotes: String
- createdAt: Date
- updatedAt: Date
```

### **DeletedClients Collection**
```
- _id: ObjectId
- userId: ObjectId (ref User)
- username: String
- originalClientMongoId: ObjectId
- originalClientData: Mixed (full snapshot)
- clientId: String
- name: String
- email: String
- phone: String
- status: String
- deletedAt: Date (auto-set)
- deletedReason: String
```

### **Sessions Collection**
```
- _id: ObjectId
- userId: ObjectId (ref User)
- username: String
- clientId: ObjectId (ref Client)
- externalRecordId: String
- clientName: String
- sessionDate: Date
- sessionNotes: String
- followUpDate: Date
- followUpNotes: String
- status: String (completed, pending)
- createdAt: Date
- updatedAt: Date
```

### **FollowUps Collection**
```
- _id: ObjectId
- userId: ObjectId (ref User)
- username: String
- clientId: ObjectId (ref Client)
- externalRecordId: String
- clientName: String
- followUpDate: Date
- followUpNotes: String
- status: String (pending, completed)
- createdAt: Date
- updatedAt: Date
```

### **Appointments Collection**
```
- _id: ObjectId
- userId: ObjectId (ref User)
- username: String
- clientId: ObjectId (ref Client)
- clientName: String
- dateTime: Date
- duration: Number (minutes)
- notes: String
- status: String (scheduled, completed, cancelled)
- createdAt: Date
- updatedAt: Date
```

### **Earnings Collection**
```
- _id: ObjectId
- userId: ObjectId (ref User)
- username: String
- clientId: ObjectId (ref Client)
- clientName: String
- amount: Number
- date: Date
- notes: String
- createdAt: Date
- updatedAt: Date
```

### **Settings Collection**
```
- _id: ObjectId
- userId: ObjectId (ref User)
- theme: String (light, dark)
- accentColor: String (hex)
- language: String
- practiceName: String
- timeFormat: String (12h, 24h)
- sidebarCollapsed: Boolean
- createdAt: Date
- updatedAt: Date
```

---

## 🏗️ Architecture Highlights

### **Authentication Flow**
```
User Registration/Login
		↓
Backend validates credentials & hashes password
		↓
Server generates JWT token (7-day expiry)
		↓
Returns token + user data (including avatar)
		↓
Frontend stores token in localStorage
		↓
All API requests include Bearer token header
		↓
Backend authMiddleware validates token
		↓
Extracts userId from JWT
		↓
All database queries scoped by userId (security)
```

### **Data Persistence Strategy**
- **Dual-Layer**: Data in both localStorage (quick access) and MongoDB (durability)
- **User Scoping**: Every query filtered by `{ userId: req.user.id }` (prevents cross-user access)
- **Real-Time Sync**: Window events broadcast changes across all open pages
- **Event Broadcasting**: Components listen to `clientDataUpdated` and `site-settings-updated` events

### **Client Deletion & Recovery Flow**
```
User Deletes Client
		↓
Full snapshot stored in DeletedClient collection
		↓
Original MongoDB ID saved for recovery
		↓
Client removed from active Clients collection
		↓
Related Sessions & FollowUps deleted
		↓ 
(When user clicks Restore)
		↓
Snapshot retrieved from DeletedClient
		↓
New Client created with original ID
		↓
Sessions & FollowUps recreated from snapshot
		↓
DeletedClient record removed
		↓
Toast: "Client restored successfully"
```

### **Real-Time Data Synchronization**
- **Auto-refresh on page visibility** (tab switching)
- **Cross-page event listeners** (`clientDataUpdated` event)
- **Instant updates** without manual refresh
- **Dashboard auto-refresh** when returning to page
- **Clients page auto-refresh** on new client creation
- **Client Profile auto-refresh** when data changes

### **Image Optimization Pipeline**
1. User uploads avatar (JPEG/PNG)
2. Image resized to 512x512px
3. Compressed to 80% quality
4. File size reduced 60-80% (~50KB max)
5. Converted to base64 data URL
6. Stored in User model in MongoDB
7. Retrieved on login and displayed in sidebar

---

## 📈 Key Implementation Achievements

✅ **User Isolation**: All data filtered by userId - complete multi-user separation  
✅ **Snapshot Recovery**: Full lossless data recovery for deleted clients  
✅ **Draft/Save Pattern**: Settings changes staged before commit (prevents data loss)  
✅ **Real-Time Sync**: Cross-page event broadcasting for instant updates  
✅ **Image Optimization**: Efficient avatar storage and loading  
✅ **Toast Notifications**: User feedback for all key actions  
✅ **Responsive Design**: Mobile (360px) to desktop (4K) support  
✅ **Error Handling**: Graceful errors with user messaging  
✅ **Type Safety**: TypeScript for frontend type checking  
✅ **RESTful API**: Standard HTTP methods (GET, POST, PUT, DELETE)  
✅ **JWT Security**: Token-based authentication with expiry  
✅ **MongoDB Indexes**: Performance optimization on key fields  
- Clinical data storage (chief complaints, HOPI)
- Search and filter by status and name
- Smooth transitions and animations
- Input fields with focus states
- Error messages with color coding
- Password strength indicator

## 🔐 Form Validation
**Built with ❤️ - A complete therapy management solution**
### Login Form
- Email validation
- Password minimum 8 characters
- Real-time error messages

### Register Form
- Full name (minimum 2 characters)
- Valid email address
- Professional ID (minimum 3 characters)
- Password (minimum 8 characters)
- Password confirmation
- Terms & conditions agreement
- Password strength indicator (weak/medium/strong)

## 💻 Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Interactive functionality
- **Responsive Design**: Mobile-first approach

## 🔄 Form Submission

Currently, the forms validate and display success messages. For backend integration:
1. Login data is logged to console
2. Register data is logged to console
3. Replace alert messages with actual API calls

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🎯 Next Steps (Phase 2 & 3)

### Phase 2 - Backend (Node.js/Express)
- User authentication API
- Database integration
- User session management
- Password hashing and security

### Phase 3 - Database (MongoDB/PostgreSQL)
- User data storage
- Patient notes storage
- Session management
- Audit logs

## 📝 Features Coming Soon

- Dashboard with patient management
- Therapy notes editor
- Appointment scheduling
- Patient progress tracking
- Secure file upload
- Real-time notifications
- Admin panel

## 🛠️ Technology Stack
Backend
Runtime: Node.js
Framework: Express.js
Authentication: JWT (JSON Web Tokens)
Database Driver: Mongoose (ODM for MongoDB)
API Pattern: RESTful

Frontend
Library: React 18
Language: TypeScript
Build Tool: Vite
Styling: CSS3
State Management: React Hooks (useState, useContext)
HTTP Client: Fetch API

Database
Type: MongoDB (NoSQL)
Hosting: MongoDB Atlas (Cloud)

## 📄 License

This project is created for educational and professional purposes.

## 👨‍💻 Author

Created for: Therapy Notes Platform
Date: February 2026

## 📞 Support

For issues or questions, please contact 
gmail-ajayarumugam0301@gmail.com

---


