import { JANE_SYSTEM_PROMPT } from '../lib/jane-prompt.js';

export default async function handler(req, res) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Under the Hood — Strategos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: #e4e4e7;
      background: #09090b;
      min-height: 100vh;
    }
    
    .header {
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 0 24px;
    }
    .header-inner {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .logo-mark {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(34,197,94,0.5);
    }
    .logo-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1em;
      color: #fafafa;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #fafafa;
      margin-bottom: 12px;
    }
    
    .description {
      color: #71717a;
      margin-bottom: 40px;
      font-size: 15px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.05em;
      color: #52525b;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    
    .info-list {
      list-style: none;
    }
    
    .info-list li {
      padding: 8px 0;
      border-bottom: 1px solid #18181b;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
    }
    
    .info-list li:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #71717a;
      font-size: 14px;
    }
    
    .info-value {
      color: #a1a1aa;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      text-align: right;
    }
    
    .prompt-section {
      margin-top: 48px;
      padding-top: 40px;
      border-top: 1px solid #27272a;
    }
    
    .prompt-section h2 {
      font-size: 20px;
      font-weight: 600;
      color: #fafafa;
      margin-bottom: 12px;
    }
    
    .prompt-description {
      color: #71717a;
      margin-bottom: 24px;
      font-size: 15px;
    }
    
    .prompt-container {
      position: relative;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .prompt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #27272a;
      border-bottom: 1px solid #3f3f46;
    }
    
    .prompt-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #71717a;
    }
    
    .copy-btn {
      padding: 6px 12px;
      background: transparent;
      border: 1px solid #3f3f46;
      border-radius: 4px;
      color: #a1a1aa;
      font-size: 12px;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .copy-btn:hover {
      background: rgba(255,255,255,0.05);
      border-color: #52525b;
      color: #fafafa;
    }
    .copy-btn.copied {
      background: rgba(34,197,94,0.1);
      border-color: #22c55e;
      color: #22c55e;
    }
    
    .prompt-content {
      padding: 20px;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .prompt-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #a1a1aa;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .footer {
      text-align: center;
      padding: 48px 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #52525b;
    }
    .footer a {
      color: #71717a;
      text-decoration: none;
    }
    .footer a:hover {
      color: #a1a1aa;
    }
    
    @media (max-width: 640px) {
      .header-inner { height: 56px; }
      .logo-text { font-size: 12px; }
      .container { padding: 32px 20px 60px; }
      h1 { font-size: 20px; }
      .info-list li { flex-direction: column; gap: 4px; }
      .info-value { text-align: left; }
      .prompt-text { font-size: 11px; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="/" class="logo">
        <div class="logo-mark"></div>
        <span class="logo-text">STRATEGOS</span>
      </a>
    </div>
  </header>
  
  <div class="container">
    <h1>Under the Hood</h1>
    <p class="description">How this briefing gets made, for the curious.</p>
    
    <div class="section">
      <div class="section-title">The Stack</div>
      <ul class="info-list">
        <li>
          <span class="info-label">Model</span>
          <span class="info-value">Claude Opus 4.5 with extended thinking</span>
        </li>
        <li>
          <span class="info-label">Hosting</span>
          <span class="info-value">Vercel (serverless functions + cron)</span>
        </li>
        <li>
          <span class="info-label">Storage</span>
          <span class="info-value">Vercel Blob</span>
        </li>
        <li>
          <span class="info-label">Email</span>
          <span class="info-value">Resend</span>
        </li>
        <li>
          <span class="info-label">Generation</span>
          <span class="info-value">6:00 AM PT daily</span>
        </li>
        <li>
          <span class="info-label">Delivery</span>
          <span class="info-value">6:30 AM PT to subscribers</span>
        </li>
      </ul>
    </div>
    
    <div class="section">
      <div class="section-title">Per Briefing</div>
      <ul class="info-list">
        <li>
          <span class="info-label">Generation time</span>
          <span class="info-value">5–12 minutes</span>
        </li>
        <li>
          <span class="info-label">Thinking budget</span>
          <span class="info-value">20,000 tokens</span>
        </li>
        <li>
          <span class="info-label">Output budget</span>
          <span class="info-value">24,000 tokens</span>
        </li>
        <li>
          <span class="info-label">Cost</span>
          <span class="info-value">~$2–4 per briefing</span>
        </li>
        <li>
          <span class="info-label">Monthly run rate</span>
          <span class="info-value">~$60–120</span>
        </li>
      </ul>
    </div>
    
    <div class="prompt-section">
      <h2>The Prompt</h2>
      <p class="prompt-description">This is the system prompt that generates the Strategos daily briefing. Feel free to repurpose and modify as you see fit.</p>
      
      <div class="prompt-container">
        <div class="prompt-header">
          <span class="prompt-label">system-prompt.txt</span>
          <button class="copy-btn" onclick="copyPrompt()">Copy</button>
        </div>
        <div class="prompt-content">
          <pre class="prompt-text" id="promptText">${escapeHtml(JANE_SYSTEM_PROMPT)}</pre>
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Built by Jane · <a href="https://philotic-web.com">philotic-web.com</a></p>
  </div>
  
  <script>
    function copyPrompt() {
      const text = document.getElementById('promptText').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
