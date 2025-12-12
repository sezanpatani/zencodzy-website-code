import 'dotenv/config';
import express from 'express';
import setupSecurity from './middleware/security.js';
import apiRoutes from './routes/api.js';
import connectDB from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Initialize Database (MongoDB)
connectDB();

// 2. Setup Security & Middleware
setupSecurity(app);
app.use(express.json({ limit: '1mb' })); // Body parser limited to 1mb

// 3. Routes
app.use('/api', apiRoutes);

// Root Route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ZENCODZY Backend API',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'zencodzy-backend',
    time: new Date().toISOString(),
    memory: process.memoryUsage().rss
  });
});

// 4. Error Handling
// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Captured Error:', err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message
  });
});

// 5. Start Server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ZENCODZY Backend Server (Refactored & Secure)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🛡️  Security:        Active (Helmet, RateLimit, XSS)`);
  console.log(`🏥 Health check:    http://localhost:${PORT}/health`);
  console.log(`📝 API Base:        http://localhost:${PORT}/api`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
