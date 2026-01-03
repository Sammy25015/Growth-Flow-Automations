const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const validator = require('validator');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://assets.calendly.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://assets.calendly.com"],
            frameSrc: ["'self'", "https://calendly.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 contact form submissions per hour
    message: 'Too many contact form submissions, please try again later.'
});

app.use(limiter);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database('./contacts.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Create contacts table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            business TEXT NOT NULL,
            revenue TEXT,
            automation TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT
        )`);
    }
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'sameer.growthflow@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password-here'
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Contact form submission endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, email, business, revenue, automation } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        // Validation
        if (!name || !email || !business || !automation) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        if (name.length > 100 || automation.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Input too long. Please keep your message concise.'
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            name: validator.escape(name.trim()),
            email: validator.normalizeEmail(email),
            business: validator.escape(business.trim()),
            revenue: revenue ? validator.escape(revenue.trim()) : '',
            automation: validator.escape(automation.trim())
        };

        // Save to database
        const stmt = db.prepare(`INSERT INTO contacts 
            (name, email, business, revenue, automation, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run([
            sanitizedData.name,
            sanitizedData.email,
            sanitizedData.business,
            sanitizedData.revenue,
            sanitizedData.automation,
            ipAddress,
            userAgent
        ], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error. Please try again.'
                });
            }

            console.log(`New contact saved with ID: ${this.lastID}`);
        });

        stmt.finalize();

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER || 'sameer.growthflow@gmail.com',
            to: 'sameer.growthflow@gmail.com',
            subject: `New Contact Form Submission - ${sanitizedData.name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${sanitizedData.name}</p>
                <p><strong>Email:</strong> ${sanitizedData.email}</p>
                <p><strong>Business Type:</strong> ${sanitizedData.business}</p>
                <p><strong>Revenue Range:</strong> ${sanitizedData.revenue || 'Not specified'}</p>
                <p><strong>Automation Needs:</strong></p>
                <p>${sanitizedData.automation}</p>
                <hr>
                <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
                <p><small>IP Address: ${ipAddress}</small></p>
            `,
            text: `
                New Contact Form Submission
                
                Name: ${sanitizedData.name}
                Email: ${sanitizedData.email}
                Business Type: ${sanitizedData.business}
                Revenue Range: ${sanitizedData.revenue || 'Not specified'}
                Automation Needs: ${sanitizedData.automation}
                
                Submitted at: ${new Date().toLocaleString()}
                IP Address: ${ipAddress}
            `
        };

        // Send auto-reply to user
        const autoReplyOptions = {
            from: process.env.EMAIL_USER || 'sameer.growthflow@gmail.com',
            to: sanitizedData.email,
            subject: 'Thank you for contacting Growth Flow Automations',
            html: `
                <h2>Thank you for your interest!</h2>
                <p>Hi ${sanitizedData.name},</p>
                <p>Thank you for reaching out to Growth Flow Automations. We've received your inquiry about automating your business processes.</p>
                <p>Our team will review your requirements and get back to you within 24 hours to schedule your free strategy call.</p>
                <p>In the meantime, feel free to book a call directly using our Calendly link: <a href="https://calendly.com/sameer-growthflow">https://calendly.com/sameer-growthflow</a></p>
                <p>Best regards,<br>The Growth Flow Automations Team</p>
                <hr>
                <p><small>This is an automated response. Please do not reply to this email.</small></p>
            `,
            text: `
                Thank you for your interest!
                
                Hi ${sanitizedData.name},
                
                Thank you for reaching out to Growth Flow Automations. We've received your inquiry about automating your business processes.
                
                Our team will review your requirements and get back to you within 24 hours to schedule your free strategy call.
                
                In the meantime, feel free to book a call directly using our Calendly link: https://calendly.com/sameer-growthflow
                
                Best regards,
                The Growth Flow Automations Team
                
                This is an automated response. Please do not reply to this email.
            `
        };

        try {
            // Send notification email
            await transporter.sendMail(mailOptions);
            console.log('Notification email sent successfully');

            // Send auto-reply
            await transporter.sendMail(autoReplyOptions);
            console.log('Auto-reply email sent successfully');

            res.json({
                success: true,
                message: 'Thank you! Your message has been sent successfully. We\'ll contact you within 24 hours.'
            });

        } catch (emailError) {
            console.error('Email error:', emailError);
            // Still return success since the form was saved to database
            res.json({
                success: true,
                message: 'Thank you! Your message has been received. We\'ll contact you within 24 hours.'
            });
        }

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again later.'
        });
    }
});

// Get all contacts (admin endpoint - should be protected in production)
app.get('/api/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        res.json({
            success: true,
            contacts: rows
        });
    });
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
    const queries = [
        'SELECT COUNT(*) as total FROM contacts',
        'SELECT business, COUNT(*) as count FROM contacts GROUP BY business',
        'SELECT DATE(created_at) as date, COUNT(*) as count FROM contacts GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30'
    ];

    Promise.all(queries.map(query => {
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }))
    .then(([total, byBusiness, byDate]) => {
        res.json({
            success: true,
            analytics: {
                totalContacts: total[0].total,
                byBusinessType: byBusiness,
                byDate: byDate
            }
        });
    })
    .catch(error => {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Analytics error'
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Growth Flow Automations server running on port ${PORT}`);
    console.log(`📧 Email configured for: ${process.env.EMAIL_USER || 'sameer.growthflow@gmail.com'}`);
    console.log(`🗄️  Database: SQLite (contacts.db)`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
});