import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

const setupSecurity = (app) => {
    // 1. Secure HTTP Headers
    app.use(helmet());

    // 2. Prevent Parameter Pollution
    app.use(hpp());

    // 3. XSS Protection
    app.use(xss());

    // 4. Rate Limiting (Prevent DDoS)
    const limiter = rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: {
            success: false,
            error: 'Too many requests, please try again later.'
        }
    });
    app.use('/api/', limiter);

    // 5. CORS Configuration (Strict)
    const allowedOrigins = [
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ];

    const corsOptions = {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true
    };

    app.use(cors(corsOptions));
};

export default setupSecurity;
