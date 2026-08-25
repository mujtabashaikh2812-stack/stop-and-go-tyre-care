export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    message: 'STOP & GO Garage Management API is Active & Healthy',
    timestamp: new Date().toISOString(),
    service: 'Render / Vercel Keep-Alive Health Route'
  });
}
