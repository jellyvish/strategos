import { getLatestBriefing, getSubscriberCount } from '../lib/storage.js';

// Convert markdown to HTML for display
function markdownToHtml(markdown) {
  if (!markdown) return '';
  
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^---$/gim, '<hr>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>');
}

export default async function handler(req, res) {
  // Get today's briefing
  const briefing = await getLatestBriefing();
  const subscriberCount = await getSubscriberCount().catch(() => 0);
  
  const html = getMainPage(briefing, subscriberCount);
  
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}

function getMainPage(briefing, subscriberCount) {
  const hasBriefing = briefing && briefing.content;
  const briefingHtml = hasBriefing ? markdownToHtml(briefing.content) : '';
  const briefingDate = briefing?.date || 'No briefing yet';
  const generatedAt = briefing?.generatedAt ? new Date(briefing.generatedAt).toLocaleTimeString('en-US', { 
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit'
  }) : '';
  const dateKey = briefing?.dateKey || '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strategos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 17px;
      line-height: 1.7;
      color: #e4e4e7;
      background: #09090b;
      min-height: 100vh;
    }
    
    .header {
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 0 24px;
      position: sticky;
      top: 0;
      background: rgba(9,9,11,0.9);
      backdrop-filter: blur(12px);
      z-index: 100;
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
    .header-actions {
      display: flex;
      gap: 8px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'Inter', sans-serif;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #fafafa;
      color: #09090b;
    }
    .btn-primary:hover { background: #e4e4e7; }
    .btn-ghost {
      background: transparent;
      color: #a1a1aa;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .btn-ghost:hover { 
      background: rgba(255,255,255,0.05); 
      color: #fafafa;
      border-color: rgba(255,255,255,0.2);
    }
    
    .meta-bar {
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 16px 24px;
    }
    .meta-inner {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 24px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #71717a;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .meta-label {
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .meta-value {
      color: #a1a1aa;
    }
    .status-live {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #22c55e;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }
    
    .briefing {
      color: #d4d4d8;
    }
    
    .no-briefing {
      text-align: center;
      padding: 120px 40px;
      color: #71717a;
    }
    .no-briefing h2 {
      color: #fafafa;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .briefing h1 {
      color: #fafafa;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
    }
    .briefing h2 {
      color: #fafafa;
      font-size: 20px;
      font-weight: 600;
      margin-top: 48px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      letter-spacing: -0.01em;
    }
    .briefing h3 {
      color: #e4e4e7;
      font-size: 16px;
      font-weight: 600;
      margin-top: 32px;
      margin-bottom: 12px;
    }
    .briefing p {
      margin-bottom: 16px;
      color: #a1a1aa;
    }
    .briefing strong {
      color: #fafafa;
      font-weight: 600;
    }
    .briefing a {
      color: #60a5fa;
      text-decoration: none;
      border-bottom: 1px solid rgba(96,165,250,0.3);
    }
    .briefing a:hover {
      border-color: #60a5fa;
    }
    .briefing hr {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 40px 0;
    }
    .briefing ul, .briefing ol {
      margin: 16px 0;
      padding-left: 24px;
      color: #a1a1aa;
    }
    .briefing li {
      margin: 8px 0;
    }
    .briefing em {
      font-style: italic;
      color: #a1a1aa;
    }
    
    .footer-section {
      text-align: center;
      padding: 48px 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #52525b;
    }
    .footer-section a {
      color: #71717a;
      text-decoration: none;
    }
    .footer-section a:hover {
      color: #a1a1aa;
    }
    .jane-credit {
      color: #71717a;
      margin-bottom: 8px;
    }
    
    /* Subscribe Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(4px);
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-overlay.show {
      display: flex;
    }
    .modal {
      background: #18181b;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 32px;
      border-radius: 12px;
      max-width: 400px;
      width: 90%;
    }
    .modal h2 {
      color: #fafafa;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .modal p {
      color: #71717a;
      margin-bottom: 24px;
      font-size: 14px;
      line-height: 1.5;
    }
    .modal input {
      width: 100%;
      padding: 12px 14px;
      background: #09090b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      font-size: 15px;
      color: #fafafa;
      margin-bottom: 16px;
      font-family: 'Inter', sans-serif;
    }
    .modal input:focus {
      outline: none;
      border-color: rgba(255,255,255,0.3);
    }
    .modal input::placeholder {
      color: #52525b;
    }
    .modal-actions {
      display: flex;
      gap: 12px;
    }
    .modal-actions button {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all 0.15s ease;
    }
    .modal .btn-cancel {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: #a1a1aa;
    }
    .modal .btn-cancel:hover {
      background: rgba(255,255,255,0.05);
    }
    .modal .btn-subscribe {
      background: #fafafa;
      border: none;
      color: #09090b;
    }
    .modal .btn-subscribe:hover {
      background: #e4e4e7;
    }
    .success-message {
      color: #22c55e;
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.2);
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      display: none;
      font-size: 14px;
    }
    .error-message {
      color: #ef4444;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      display: none;
      font-size: 14px;
    }
    
    @media (max-width: 640px) {
      .header-inner { height: 56px; }
      .logo-text { font-size: 12px; }
      .meta-inner { 
        flex-wrap: wrap; 
        gap: 12px;
        font-size: 11px;
      }
      .container { padding: 32px 20px 60px; }
      .briefing h1 { font-size: 24px; }
      .briefing h2 { font-size: 18px; }
      .btn { padding: 8px 12px; font-size: 12px; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="logo">
        <div class="logo-mark"></div>
        <span class="logo-text">STRATEGOS</span>
      </div>
      <div class="header-actions">
        ${hasBriefing ? `<a href="/download" class="btn btn-ghost">PDF</a>` : ''}
        <button class="btn btn-primary" onclick="showSubscribeModal()">Subscribe</button>
      </div>
    </div>
  </header>
  
  ${hasBriefing ? `
  <div class="meta-bar">
    <div class="meta-inner">
      <div class="status-live">
        <div class="status-dot"></div>
        <span>LIVE</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">DATE</span>
        <span class="meta-value">${dateKey}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">GEN</span>
        <span class="meta-value">${generatedAt} PT</span>
      </div>
    </div>
  </div>
  ` : ''}
  
  <div class="container">
    <div class="briefing">
      ${hasBriefing ? `
        <p>${briefingHtml}</p>
      ` : `
        <div class="no-briefing">
          <h2>Standby</h2>
          <p>Daily briefing generates at 06:00 PT</p>
        </div>
      `}
    </div>
  </div>
  
  <div class="footer-section">
    <p class="jane-credit">Brought to you by Jane</p>
    <p><a href="https://philotic-web.com">philotic-web.com</a> · <a href="/under-the-hood">Under the Hood</a></p>
  </div>
  
  <!-- Subscribe Modal -->
  <div class="modal-overlay" id="subscribeModal">
    <div class="modal">
      <h2>Subscribe</h2>
      <p>Daily intelligence briefing. Delivered 06:30 PT.</p>
      <div class="success-message" id="successMessage">
        ✓ Subscribed
      </div>
      <div class="error-message" id="errorMessage">
        Something went wrong
      </div>
      <form id="subscribeForm" onsubmit="handleSubscribe(event)">
        <input type="email" id="emailInput" placeholder="you@example.com" required>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" onclick="hideSubscribeModal()">Cancel</button>
          <button type="submit" class="btn-subscribe" id="subscribeBtn">Subscribe</button>
        </div>
      </form>
    </div>
  </div>
  
  <script>
    function showSubscribeModal() {
      document.getElementById('subscribeModal').classList.add('show');
      document.getElementById('emailInput').focus();
    }
    
    function hideSubscribeModal() {
      document.getElementById('subscribeModal').classList.remove('show');
      document.getElementById('successMessage').style.display = 'none';
      document.getElementById('errorMessage').style.display = 'none';
      document.getElementById('subscribeForm').reset();
    }
    
    async function handleSubscribe(e) {
      e.preventDefault();
      const email = document.getElementById('emailInput').value;
      const btn = document.getElementById('subscribeBtn');
      const successMsg = document.getElementById('successMessage');
      const errorMsg = document.getElementById('errorMessage');
      
      btn.disabled = true;
      btn.textContent = '...';
      successMsg.style.display = 'none';
      errorMsg.style.display = 'none';
      
      try {
        const response = await fetch('/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
          successMsg.style.display = 'block';
          document.getElementById('subscribeForm').reset();
          setTimeout(hideSubscribeModal, 2000);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        errorMsg.textContent = err.message || 'Something went wrong';
        errorMsg.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Subscribe';
      }
    }
    
    document.getElementById('subscribeModal').addEventListener('click', function(e) {
      if (e.target === this) hideSubscribeModal();
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') hideSubscribeModal();
    });
  </script>
</body>
</html>`;
}
