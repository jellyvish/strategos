import Anthropic from '@anthropic-ai/sdk';
import { JANE_SYSTEM_PROMPT, getBriefingInstructions } from '../lib/jane-prompt.js';
import { saveBriefing } from '../lib/storage.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // Only allow Vercel cron or authorized requests
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const authHeader = req.headers.authorization;
  const isAuthorized = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;
  
  if (!isVercelCron && !isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('Starting Strategos briefing generation...');
    
    // Get today's date in PT
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'America/Los_Angeles'
    });
    
    const dateKey = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Los_Angeles'
    }); // YYYY-MM-DD format
    
    console.log(`Generating briefing for ${today} (${dateKey})`);
    
    // Generate briefing using Claude Opus 4.5 with extended thinking and web search
    // Use streaming for long-running operations
    const stream = await anthropic.messages.stream({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 24000,
      thinking: {
        type: 'enabled',
        budget_tokens: 20000
      },
      system: JANE_SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search"
        }
      ],
      messages: [
        {
          role: 'user',
          content: getBriefingInstructions(today)
        }
      ]
    });
    
    // Collect the streamed response
    const response = await stream.finalMessage();
    
    // Extract the text content (skip thinking blocks)
    let briefingContent = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        briefingContent += block.text;
      }
      // Skip 'thinking' blocks - they're internal reasoning
    }
    
    // Strip any preamble before the actual briefing
    // Look for common briefing start patterns and remove everything before
    const briefingStartPatterns = [
      /^.*?(# Strategos)/is,
      /^.*?(## I\. The Lead)/is,
      /^.*?(## I\.)/is,
      /^.*?(\*\*I\. The Lead)/is,
    ];
    
    for (const pattern of briefingStartPatterns) {
      const match = briefingContent.match(pattern);
      if (match) {
        briefingContent = briefingContent.slice(match.index + match[0].length - match[1].length);
        break;
      }
    }
    
    if (!briefingContent) {
      throw new Error('No briefing content generated');
    }
    
    console.log(`Briefing generated: ${briefingContent.length} characters`);
    
    // Save to Vercel Blob
    const briefingData = {
      date: today,
      dateKey: dateKey,
      content: briefingContent,
      generatedAt: new Date().toISOString(),
      wordCount: briefingContent.split(/\s+/).length
    };
    
    const blobUrl = await saveBriefing(dateKey, briefingData);
    console.log(`Briefing saved to: ${blobUrl}`);
    
    return res.status(200).json({
      success: true,
      date: today,
      dateKey: dateKey,
      wordCount: briefingData.wordCount,
      blobUrl: blobUrl
    });
    
  } catch (error) {
    console.error('Error generating briefing:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export const config = {
  maxDuration: 800,
};
