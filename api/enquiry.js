// Vercel serverless function: POST /api/enquiry. Same logic as backend/server.mjs. Settings come from Vercel "Environment Variables".
import { handleEnquiry } from '../backend/enquiry.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method' });
  }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const out = await handleEnquiry(body, { ip });
  return res.status(out.status).json(out.json);
}
