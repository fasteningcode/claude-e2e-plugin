import type { NextApiRequest, NextApiResponse } from 'next';

interface AuthResponse {
  token?: string;
  error?: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse>): void {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  if (email === 'test@example.com' && password === 'secret') {
    res.status(200).json({ token: 'mock-jwt-token' });
    return;
  }

  res.status(401).json({ error: 'Invalid credentials' });
}
