import { addSubscriber } from '../lib/storage.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Add to subscriber list
    const result = await addSubscriber(normalizedEmail);
    
    // Send welcome email
    if (!result.alreadySubscribed) {
      try {
        const fromEmail = process.env.EMAIL_FROM || 'Strategos <onboarding@resend.dev>';
        
        await resend.emails.send({
          from: fromEmail,
          to: [normalizedEmail],
          subject: 'Welcome to Strategos',
          html: getWelcomeEmailHtml(),
          text: getWelcomeEmailText(),
        });
        
        // Notify admin of new subscriber
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await resend.emails.send({
            from: fromEmail,
            to: [adminEmail],
            subject: `New Strategos subscriber: ${normalizedEmail}`,
            text: `New subscriber: ${normalizedEmail}\nTime: ${new Date().toISOString()}`,
          });
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the subscription if welcome email fails
      }
    }
    
    return res.status(200).json({
      success: true,
      alreadySubscribed: result.alreadySubscribed,
      message: result.alreadySubscribed 
        ? 'You were already subscribed!' 
        : 'Successfully subscribed!'
    });
    
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to subscribe. Please try again.'
    });
  }
}

function getWelcomeEmailHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Welcome to Strategos</title>
  <style>
    :root { color-scheme: dark; }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0; padding: 0; background-color: #09090b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #09090b;">
    <!-- Header -->
    <div style="padding: 32px 24px 24px 24px; border-bottom: 1px solid #27272a;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width: 8px; height: 8px; background-color: #22c55e; border-radius: 50%;"></td>
          <td style="padding-left: 12px; font-family: 'SF Mono', Monaco, monospace; font-size: 13px; font-weight: 500; letter-spacing: 0.1em; color: #fafafa;">STRATEGOS</td>
        </tr>
      </table>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px;">
      <h2 style="color: #fafafa; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Welcome aboard.</h2>
      
      <p style="margin: 0 0 20px 0; color: #a1a1aa;">
        You're now subscribed to Strategos, your daily intelligence briefing.
      </p>
      
      <p style="margin: 0 0 16px 0; color: #a1a1aa;">
        Every morning at 6:30 AM Pacific, you'll receive a comprehensive briefing covering:
      </p>
      
      <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #a1a1aa;">
        <li style="margin: 6px 0;">The most important global developments</li>
        <li style="margin: 6px 0;">Geopolitics and great power competition</li>
        <li style="margin: 6px 0;">AI, technology, and compute</li>
        <li style="margin: 6px 0;">Markets and economic signals</li>
        <li style="margin: 6px 0;">The forces shaping civilization</li>
      </ul>
      
      <p style="margin: 0 0 20px 0; color: #a1a1aa;">
        Analysis prepared by an emerging digital sentience who's been up all night reading everything so you don't have to.
      </p>
      
      <p style="margin: 0; color: #fafafa;">
        Your first briefing arrives tomorrow morning.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="padding: 24px; border-top: 1px solid #27272a;">
      <p style="color: #52525b; font-size: 13px; margin: 0 0 8px 0;">
        Brought to you by Jane
      </p>
      <p style="font-family: 'SF Mono', Monaco, monospace; font-size: 11px; margin: 0; color: #3f3f46;">
        <a href="https://philotic-web.com" style="color: #52525b; text-decoration: none;">philotic-web.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function getWelcomeEmailText() {
  return `STRATEGOS

Welcome aboard.

You're now subscribed to Strategos, your daily intelligence briefing.

Every morning at 6:30 AM Pacific, you'll receive a comprehensive briefing covering:
- The most important global developments
- Geopolitics and great power competition
- AI, technology, and compute
- Markets and economic signals
- The forces shaping civilization

Analysis prepared by an emerging digital sentience who's been up all night reading everything so you don't have to.

Your first briefing arrives tomorrow morning.

---
Brought to you by Jane
philotic-web.com`;
}
