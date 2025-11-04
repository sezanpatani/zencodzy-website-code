// Serverless Function to Handle Form Submissions
// Deploy this to Vercel/Netlify Functions

const { Redis } = require('@upstash/redis');

// Initialize Upstash Redis client
const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const formData = req.body;
    
    // Validate required fields
    if (!formData.name || !formData.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    // Generate unique ID for this submission
    const submissionId = `form:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    // Add timestamp
    formData.submittedAt = new Date().toISOString();
    formData.submissionId = submissionId;

    // Store in Redis Hash
    await redis.hset(submissionId, formData);

    // Add to sorted set for easy retrieval (score = timestamp)
    const timestamp = Date.now();
    await redis.zadd('form:submissions', {
      score: timestamp,
      member: submissionId
    });

    // Set expiration (optional - 90 days)
    await redis.expire(submissionId, 60 * 60 * 24 * 90);

    // Also add to a list by form type
    const formType = formData.formType || 'get-a-quote';
    await redis.lpush(`form:${formType}`, submissionId);

    console.log('Form submitted successfully:', submissionId);

    return res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully!',
      submissionId: submissionId
    });

  } catch (error) {
    console.error('Error storing form data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to submit form. Please try again.',
      error: error.message
    });
  }
};
