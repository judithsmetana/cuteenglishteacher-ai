export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cuteenglishteacher.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { studentEmail, studentName, date, time } = req.body;

    if (!studentEmail || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' });

    // Send confirmation to student
    const studentEmail_body = {
      from: 'cuteenglishteacher.ai <onboarding@resend.dev>',
      to: [studentEmail],
      subject: 'Your session is booked! 🎓 cuteenglishteacher.ai',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f7faf9;padding:32px 24px;">
          <div style="background:#1D9E75;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <div style="font-size:36px;margin-bottom:8px">🎓</div>
            <div style="color:#fff;font-size:22px;font-weight:800">cuteenglishteacher.ai</div>
            <div style="color:rgba(255,255,255,0.8);font-size:14px">English Pronunciation Coaching</div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:16px">
            <h2 style="color:#085041;margin:0 0 16px">Session Confirmed! ✅</h2>
            <p style="color:#333;font-size:15px">Hi ${studentName || 'there'},</p>
            <p style="color:#333;font-size:15px">Your pronunciation coaching session has been booked successfully.</p>
            <div style="background:#E1F5EE;border-radius:8px;padding:16px;margin:20px 0">
              <div style="font-size:14px;color:#085041;margin-bottom:6px"><strong>📅 Date:</strong> ${date}, 2026</div>
              <div style="font-size:14px;color:#085041"><strong>⏰ Time:</strong> ${time} ET</div>
            </div>
            <p style="color:#333;font-size:15px">To start your session, go to your coaching app and pay for your session when you arrive. The AI coach will be ready for you!</p>
            <div style="text-align:center;margin:24px 0">
              <a href="https://cuteenglishteacher.ai/app.html" style="background:#1D9E75;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Go to My Session →</a>
            </div>
          </div>
          <div style="text-align:center;font-size:12px;color:#888">
            cuteenglishteacher LLC · Boiling Spring Lakes, NC<br>
            <a href="https://cuteenglishteacher.ai/terms.html" style="color:#1D9E75">Terms & Conditions</a>
          </div>
        </div>
      `
    };

    // Send notification to Judith
    const judithEmail_body = {
      from: 'cuteenglishteacher.ai <onboarding@resend.dev>',
      to: ['judithsmetana@gmail.com'],
      subject: `New booking: ${date} at ${time} — ${studentEmail}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#085041">New Session Booking 🎓</h2>
          <div style="background:#E1F5EE;border-radius:8px;padding:16px;margin:16px 0">
            <div style="margin-bottom:8px"><strong>Student:</strong> ${studentEmail}</div>
            <div style="margin-bottom:8px"><strong>Date:</strong> ${date}, 2026</div>
            <div><strong>Time:</strong> ${time} ET</div>
          </div>
          <p style="color:#333">Log into your <a href="https://dashboard.stripe.com" style="color:#1D9E75">Stripe dashboard</a> to track payments.</p>
        </div>
      `
    };

    // Send both emails
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify(studentEmail_body)
    });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify(judithEmail_body)
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
