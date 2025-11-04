require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Redis } = require('@upstash/redis');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '1mb' }));

// CORS configuration: allow frontend at http://localhost:3000
const corsOptions = {
  origin: [/^http:\/\/localhost:3000$/],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};
app.use(cors(corsOptions));

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'zencodzy-backend', time: new Date().toISOString() });
});

// Redis client from env
let redis;
try {
  redis = Redis.fromEnv();
} catch (e) {
  console.warn('Redis not configured yet. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env');
}

// Submit form (migrated from api/submit-form.js)
app.options('/api/submit-form', cors(corsOptions));
app.post('/api/submit-form', async (req, res) => {
  try {
    const formData = req.body || {};

    if (!formData.name || !formData.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    if (!redis) {
      return res.status(500).json({ success: false, message: 'Redis not configured' });
    }

    const submissionId = `form:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

    formData.submittedAt = new Date().toISOString();
    formData.submissionId = submissionId;

    await redis.hset(submissionId, formData);

    const timestamp = Date.now();
    await redis.zadd('form:submissions', {
      score: timestamp,
      member: submissionId
    });

    await redis.expire(submissionId, 60 * 60 * 24 * 90);

    const formType = formData.formType || 'get-a-quote';
    await redis.lpush(`form:${formType}`, submissionId);

    return res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully!',
      submissionId
    });
  } catch (error) {
    console.error('Error storing form data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit form. Please try again.',
      error: error.message
    });
  }
});

// Get submissions (migrated from api/get-submissions.js)
app.options('/api/get-submissions', cors(corsOptions));
app.get('/api/get-submissions', async (req, res) => {
  try {
    if (!redis) {
      return res.status(500).json({ success: false, message: 'Redis not configured' });
    }

    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const formType = req.query.formType;

    let submissionIds;
    if (formType) {
      submissionIds = await redis.lrange(`form:${formType}`, offset, offset + limit - 1);
    } else {
      submissionIds = await redis.zrevrange('form:submissions', offset, offset + limit - 1);
    }

    const submissions = await Promise.all(
      (submissionIds || []).map(async (id) => {
        const data = await redis.hgetall(id);
        return { id, ...data };
      })
    );

    const total = formType 
      ? await redis.llen(`form:${formType}`)
      : await redis.zcard('form:submissions');

    return res.status(200).json({ 
      success: true,
      total,
      offset,
      limit,
      submissions
    });
  } catch (error) {
    console.error('Error retrieving submissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
