// Disabled legacy serverless function.
// Use the Express backend instead: POST http://localhost:5000/api/submit-form
module.exports = async (_req, res) => {
  res.status(410).json({
    success: false,
    message: 'This endpoint is disabled. Use the local Express backend at /api/submit-form.',
  });
};
