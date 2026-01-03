# Growth Flow Automations - Full-Stack Website

A modern, full-stack website for Growth Flow Automations featuring AI automation services, contact management, and email integration.

## 🚀 Features

### Frontend
- **Modern Design**: Premium SaaS-style dark theme with blue/purple gradients
- **Responsive**: Mobile-first design that works on all devices
- **Interactive**: Smooth animations, hover effects, and scroll animations
- **Calendly Integration**: Direct booking links and embedded widget
- **Contact Form**: Real-time validation and submission

### Backend
- **Express.js Server**: RESTful API with security middleware
- **Email Integration**: Automated email notifications and auto-replies
- **Database**: SQLite database for contact storage
- **Security**: Rate limiting, input validation, and sanitization
- **Admin Dashboard**: Real-time analytics and contact management

### API Endpoints
- `GET /` - Main website
- `GET /admin` - Admin dashboard
- `POST /api/contact` - Contact form submission
- `GET /api/contacts` - Get all contacts (admin)
- `GET /api/analytics` - Analytics data
- `GET /api/health` - Health check

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Gmail account for email functionality

## 🛠 Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Edit the `.env` file with your settings:
   ```env
   # Email Configuration
   EMAIL_USER=sameer.growthflow@gmail.com
   EMAIL_PASS=your-gmail-app-password-here
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up Gmail App Password**
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Generate an App Password for "Mail"
   - Use this password in the `EMAIL_PASS` field

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📊 Admin Dashboard

Access the admin dashboard at `http://localhost:3000/admin` to view:
- Contact submissions
- Analytics and statistics
- Business type distribution
- Recent activity

## 🔧 Configuration

### Email Settings
The application uses Nodemailer with Gmail. Configure your email settings in the `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Database
The application uses SQLite for simplicity. The database file (`contacts.db`) is created automatically on first run.

### Security Features
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Sanitizes all user inputs
- **CORS Protection**: Configured for security
- **Helmet**: Security headers
- **SQL Injection Protection**: Parameterized queries

## 📁 Project Structure

```
├── server.js              # Main Express server
├── index.html             # Main website
├── admin.html             # Admin dashboard
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── contacts.db            # SQLite database (auto-created)
└── README.md             # This file
```

## 🔄 API Usage

### Contact Form Submission
```javascript
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "business": "agency",
  "revenue": "10k-50k",
  "automation": "I need help with lead generation automation"
}
```

### Get Analytics
```javascript
GET /api/analytics

Response:
{
  "success": true,
  "analytics": {
    "totalContacts": 25,
    "byBusinessType": [...],
    "byDate": [...]
  }
}
```

## 📧 Email Features

### Automatic Notifications
- **Admin Notification**: Sent to `sameer.growthflow@gmail.com` for each submission
- **Auto-Reply**: Sent to the user confirming receipt
- **HTML & Text**: Both formats supported

### Email Templates
- Professional HTML formatting
- Contact details and submission info
- Timestamp and IP tracking
- Calendly booking link in auto-reply

## 🔒 Security

### Rate Limiting
- **General**: 100 requests per 15 minutes per IP
- **Contact Form**: 5 submissions per hour per IP

### Input Validation
- Email format validation
- Input length limits
- HTML escaping
- SQL injection prevention

### Headers Security
- Content Security Policy
- XSS Protection
- HSTS
- Frame Options

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
EMAIL_USER=sameer.growthflow@gmail.com
EMAIL_PASS=your-production-app-password
```

### Recommended Hosting
- **Vercel**: Easy deployment with automatic HTTPS
- **Heroku**: Simple scaling and add-ons
- **DigitalOcean**: Full control and customization
- **AWS**: Enterprise-grade infrastructure

## 📈 Analytics & Monitoring

The admin dashboard provides:
- **Real-time Statistics**: Total contacts, daily/weekly counts
- **Business Type Analysis**: Distribution of client types
- **Contact Management**: View and search all submissions
- **Activity Tracking**: Recent submissions and trends

## 🛠 Customization

### Styling
- Edit CSS in `index.html` for frontend changes
- Modify `admin.html` for dashboard styling

### Email Templates
- Update email content in `server.js`
- Customize HTML and text versions

### Database Schema
- Modify the contacts table structure in `server.js`
- Add new fields as needed

## 📞 Support

For technical support or questions:
- **Email**: sameer.growthflow@gmail.com
- **Website**: Visit the contact form
- **Calendly**: Direct booking available

## 📄 License

This project is proprietary software for Growth Flow Automations.

---

**Growth Flow Automations** - AI-powered automation solutions for global businesses