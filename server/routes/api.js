import express from 'express';
import { body, validationResult } from 'express-validator';
import { submitForm, getSubmissions } from '../controllers/formController.js';

const router = express.Router();

// Validation Middleware
const validateForm = [
    body('formType').trim().notEmpty().withMessage('Form type is required').escape(),
    // Allow dynamic fields but sanitize known common ones if they exist
    body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
    body('name').optional().trim().escape(),
    body('message').optional().trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// Routes
router.post('/submit-form', validateForm, submitForm);
router.get('/get-submissions', getSubmissions);

// API Welcome Route
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ZENCODZY API v1',
        status: 'active'
    });
});

export default router;
