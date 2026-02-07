import { Resend } from 'resend';
import { getLatestBriefing, getAllSubscribers } from '../lib/storage.js';
import { markdownToEmailHtml, getPlainTextVersion } from '../lib/email-template.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow Vercel cron or authorized requests
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const authHeader = req.headers.authorization;
  const isAuthorized = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
  
  if (!isVercelCron && !isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('Starting daily email send...');
    
    // Get today's briefing
    const briefing = await getLatestBriefing();
    
    if (!briefing || !briefing.content) {
      console.log('No briefing found for today');
      return res.status(200).json({
        success: false,
        error: 'No briefing available'
      });
    }
    
    // Get all subscribers
    const subscribers = await getAllSubscribers();
    
    if (subscribers.length === 0) {
      console.log('No subscribers to send to');
      return res.status(200).json({
        success: true,
        message: 'No subscribers',
        sent: 0
      });
    }
    
    console.log(`Sending to ${subscribers.length} subscribers`);
    
    const fromEmail = process.env.EMAIL_FROM || 'Strategos <onboarding@resend.dev>';
    
    // Send emails individually for personalized unsubscribe links
    let sent = 0;
    let failed = 0;
    
    for (const email of subscribers) {
      try {
        // Generate personalized email content with unsubscribe link
        const htmlContent = markdownToEmailHtml(briefing.content, briefing.date, email);
        const plainTextContent = getPlainTextVersion(briefing.content, email);
        
        await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: `Strategos: ${briefing.date}`,
          html: htmlContent,
          text: plainTextContent,
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error.message);
        failed++;
      }
      // Delay between sends to avoid Resend rate limits
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    console.log(`Email send complete: ${sent} sent, ${failed} failed`);
    
    return res.status(200).json({
      success: true,
      sent: sent,
      failed: failed,
      total: subscribers.length
    });
    
  } catch (error) {
    console.error('Error sending emails:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export const config = {
  maxDuration: 300,
};
