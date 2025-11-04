// Serverless Function to Retrieve Form Submissions
// Admin endpoint to view all submissions

const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { limit = 50, offset = 0, formType } = req.query;

    let submissionIds;

    if (formType) {
      // Get submissions by form type
      submissionIds = await redis.lrange(`form:${formType}`, offset, offset + limit - 1);
    } else {
      // Get all submissions from sorted set (newest first)
      submissionIds = await redis.zrevrange('form:submissions', offset, offset + limit - 1);
    }

    // Fetch full data for each submission
    const submissions = await Promise.all(
      submissionIds.map(async (id) => {
        const data = await redis.hgetall(id);
        return { id, ...data };
      })
    );

    // Get total count
    const total = formType 
      ? await redis.llen(`form:${formType}`)
      : await redis.zcard('form:submissions');

    return res.status(200).json({ 
      success: true,
      total,
      offset: parseInt(offset),
      limit: parseInt(limit),
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
};
