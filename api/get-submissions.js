// Disabled legacy serverless function.
// Use the Express backend instead: GET http://localhost:5000/api/get-submissions
module.exports = async (_req, res) => {
  res.status(410).json({
    success: false,
    message: 'This endpoint is disabled. Use the local Express backend at /api/get-submissions.',
  });
};
