export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cuteenglishteacher.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' });

    // Notify Judith
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'cuteenglishteacher.ai <onboarding@resend.dev>',
        to: ['judithsmetana@gmail.com'],
        subject: `New contact from ${name}${company ? ' — ' + company : ''}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <h2 style="color:#085041">New Contact Form Submission 🎓</h2>
            <div style="background:#E1F5EE;border-radius:8px;padding:16px;margin:16px 0">
              <div style="margin-bottom:8px"><strong>Name:</strong> ${name}</div>
              <div style="margin-bottom:8px"><strong>Email:</strong> ${email}</div>
              ${company ? `<div style="margin-bottom:8px"><strong>Company:</strong> ${company}</div>` : ''}
              <div><strong>Message:</strong><br>${message}</div>
            </div>
            <p style="color:#333">Reply directly to this email to respond to ${name}.</p>
          </div>
        `
      })
    });

    // Auto-reply to sender
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'cuteenglishteacher.ai <onboarding@resend.dev>',
        to: [email],
        subject: 'Thank you for contacting cuteenglishteacher.ai® 🎓',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f7faf9;padding:32px 24px;">
            <div style="background:#1D9E75;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <div style="font-size:36px;margin-bottom:8px">🎓</div>
              <div style="color:#fff;font-size:22px;font-weight:800">cuteenglishteacher.ai®</div>
              <div style="color:rgba(255,255,255,0.8);font-size:14px">English Coaching · Powered by AI</div>
            </div>
            <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:16px">
              <h2 style="color:#085041;margin:0 0 16px">Message Received! ✅</h2>
              <p style="color:#333;font-size:15px">Hi ${name},</p>
              <p style="color:#333;font-size:15px">Thank you for reaching out to cuteenglishteacher LLC®. I've received your message and will get back to you within 24 hours.</p>
              <p style="color:#333;font-size:15px">In the meantime, feel free to explore the platform or book a session:</p>
              <div style="text-align:center;margin:24px 0">
                <a href="https://cuteenglishteacher.ai/app.html" style="background:#1D9E75;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Explore the Platform →</a>
              </div>
            </div>
            <div style="text-align:center;font-size:12px;color:#888">
              cuteenglishteacher LLC® · Southport, NC<br>
              <a href="https://cuteenglishteacher.ai/terms.html" style="color:#1D9E75">Terms & Conditions</a>
            </div>
          </div>
        `
      })
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
