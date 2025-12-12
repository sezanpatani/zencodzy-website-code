import { getRedisClient } from '../config/redis.js';

// @desc    Submit a form
// @route   POST /api/submit-form
// @access  Public
export const submitForm = async (req, res) => {
    try {
        const redis = getRedisClient();
        if (!redis) {
            return res.status(503).json({ success: false, error: 'Database service unavailable' });
        }

        const formData = req.body;
        const formType = formData.formType || 'unknown';

        // Generate ID
        const timestamp = Date.now();
        const id = `${formType}_${timestamp}`;

        // Prepare data
        const dataToStore = {
            ...formData,
            id,
            submittedAt: new Date().toISOString(),
            ip: req.ip // Audit logging (internal use only)
        };

        // Store in Redis
        // 1. Store the actual data hash
        await redis.set(id, JSON.stringify(dataToStore));
        // 2. Add ID to the specific set for this form type for easy retrieval
        await redis.sadd(`submissions:${formType}`, id);

        // Security: Remove sensitive internal fields before responding
        delete dataToStore.ip;

        console.log(`✅ Form submitted: ${formType} - ${id}`);

        res.status(201).json({
            success: true,
            message: 'Form submitted successfully',
            data: { id }
        });

    } catch (error) {
        console.error('❌ Form submission error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// @desc    Get submissions by type
// @route   GET /api/get-submissions
// @access  Private (should be protected in prod, strictly limited by CORS for now)
export const getSubmissions = async (req, res) => {
    try {
        const redis = getRedisClient();
        if (!redis) {
            return res.status(503).json({ success: false, error: 'Database service unavailable' });
        }

        const formType = req.query.type || 'quote';

        // Get all IDs from the set
        const ids = await redis.smembers(`submissions:${formType}`);

        if (!ids || ids.length === 0) {
            return res.status(200).json({ success: true, count: 0, submissions: [] });
        }

        // Fetch all data in parallel
        // Optimization: Use Redis MGET if frequent, but pipeline/parallel get is fine for now
        const submissions = await Promise.all(
            ids.map(async (id) => {
                const data = await redis.get(id);
                return data ? JSON.parse(data) : null;
            })
        );

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions: submissions.filter(Boolean)
        });

    } catch (error) {
        console.error('❌ Data retrieval error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve data' });
    }
};
