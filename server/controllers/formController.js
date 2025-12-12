import Submission from '../models/Submission.js';

// @desc    Submit a form (Get a Quote / Contact)
// @route   POST /api/submit-form
// @access  Public
export const submitForm = async (req, res) => {
    try {
        const formData = req.body;

        // Basic validation handled by Mongoose, but we can do extra checks here
        if (!formData.formType) {
            formData.formType = 'unknown';
        }

        // Add IP address for audit (used internally)
        const ip = req.ip || req.connection.remoteAddress;

        // Create new submission in MongoDB
        const submission = await Submission.create({
            ...formData,
            ip
        });

        console.log(`✅ MongoDB: Form submitted [${submission.formType}] - ${submission._id}`);

        res.status(201).json({
            success: true,
            message: 'Form submitted successfully',
            submissionId: submission._id,
            data: {
                id: submission._id,
                createdAt: submission.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Form submission error:', error);

        // Handle Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server Error: Could not save submission'
        });
    }
};

// @desc    Get submissions by type
// @route   GET /api/get-submissions
// @access  Private (Restricted by CORS)
export const getSubmissions = async (req, res) => {
    try {
        const formType = req.query.type;
        const limit = parseInt(req.query.limit) || 50;

        let query = {};
        if (formType) {
            query.formType = formType;
        }

        const submissions = await Submission.find(query)
            .sort({ createdAt: -1 }) // Newest first
            .limit(limit);

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });

    } catch (error) {
        console.error('❌ Data retrieval error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve data' });
    }
};
