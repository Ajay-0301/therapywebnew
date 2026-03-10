# 🧠 Therapy Notes - Professional Mental Health Platform

A modern, professional web application for psychologists and mental health professionals to manage patient notes and therapy sessions securely.

## 🎯 Features (Phase 1 - Frontend)

### Authentication System
- **Login Page**: Email and password-based authentication
- **Register Page**: Professional registration with ID verification
- **Password Strength Indicator**: Real-time password validation
- **Password Toggle**: Eye icon to show/hide passwords
- **Modern UI/UX**: Gradient design with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Form Validation**: Real-time error messages and validation

## 📁 Project Structure

```
therapy-app/
├── index.html           # Main HTML file (Login & Register pages)
├── css/
│   └── style.css       # Complete styling with animations
├── js/
│   └── auth.js         # Authentication logic and form handling
├── README.md           # Project documentation
└── .gitignore          # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (optional, for version control)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ajayarumugam0301-svg/therapywebnew.git
cd therapy-app
```

2. Open in browser:
   - Double-click `index.html` to open locally
   - OR use a local server: `python -m http.server 8000`

## 🎨 Design Features

### Color Scheme
- **Primary**: Indigo (#6366f1) - Professional and calming
- **Secondary**: Green (#10b981) - Success and trust
- **Backgrounds**: Light grays for easy reading

### UI Elements
- Smooth gradient backgrounds
- Card-based layout with shadow effects
- Smooth transitions and animations
- Input fields with focus states
- Error messages with color coding
- Password strength indicator

## 🔐 Form Validation

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

## 🛠️ Development

### Making Changes
1. Edit HTML, CSS, or JavaScript files
2. Refresh browser to see changes
3. Check browser console for any errors

### Testing Forms
- **Login**: Any email, password (8+ chars)
- **Register**: Fill all fields with valid data
- **Password Toggle**: Click eye icon to show/hide
- **Validation**: Try submitting with empty fields

## 📄 License

This project is created for educational and professional purposes.

## 👨‍💻 Author

Created for: Therapy Notes Platform
Date: February 2026

## 📞 Support

For issues or questions, please contact the development team.

---

**Status**: ✅ Frontend Login & Register Completed | ⏳ Backend Development Coming Soon
