import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Redis } from '@upstash/redis';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '1mb' }));

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    /^http:\/\/localhost:3000$/,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};
app.use(cors(corsOptions));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'zencodzy-backend',
    time: new Date().toISOString()
  });
});

// Redis client
let redis;
try {
  redis = Redis.fromEnv();
  console.log('✅ Redis connected successfully');
} catch (e) {
  console.warn('⚠️  Redis not configured. Forms will not persist data.');
  console.warn('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env');
}

// API Routes
app.post('/api/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    const formType = formData.formType || 'unknown';

    if (!redis) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // Generate unique ID
    const timestamp = Date.now();
    const id = `${formType}_${timestamp}`;

    // Store in Redis
    const dataToStore = {
      ...formData,
      id,
      submittedAt: new Date().toISOString(),
    };

    await redis.set(id, JSON.stringify(dataToStore));
    await redis.sadd(`submissions:${formType}`, id);

    console.log(`✅ Form submitted: ${formType} - ${id}`);

    res.json({
      success: true,
      message: 'Form submitted successfully',
      id
    });
  } catch (error) {
    console.error('❌ Form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit form'
    });
  }
});

app.get('/api/get-submissions', async (req, res) => {
  try {
    const formType = req.query.type || 'quote';

    if (!redis) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const ids = await redis.smembers(`submissions:${formType}`);
    const submissions = await Promise.all(
      ids.map(async (id) => {
        const data = await redis.get(id);
        return data ? JSON.parse(data) : null;
      })
    );

    res.json({
      success: true,
      submissions: submissions.filter(Boolean)
    });
  } catch (error) {
    console.error('❌ Get submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submissions'
    });
  }
});

// Root route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ZENCODZY Backend API',
    endpoints: {
      health: '/health',
      submitForm: '/api/submit-form',
      getSubmissions: '/api/get-submissions'
    }
  });
});

// API root route
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'ZENCODZY API v1',
    status: 'running'
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ZENCODZY Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});
