import { getLatestBriefing } from '../lib/storage.js';

export default async function handler(req, res) {
  try {
    const briefing = await getLatestBriefing();
    
    if (!briefing || !briefing.content) {
      return res.status(404).json({ error: 'No briefing available' });
    }
    
    // Convert markdown to print-friendly HTML
    const html = generatePrintableHtml(briefing);
    
    // Set headers for HTML response that prompts print dialog
    res.setHeader('Content-Type', 'text/html');
    
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

function markdownToHtml(markdown) {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^---$/gim, '<hr>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>');
}

function generatePrintableHtml(briefing) {
  const content = markdownToHtml(briefing.content);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Strategos — ${briefing.date}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: 0.6in;
    }
    
    @media print {
      body { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
        background: #09090b !important;
        color: #a1a1aa !important;
      }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #a1a1aa;
      background: #09090b;
      max-width: 8in;
      margin: 0 auto;
      padding: 20px;
    }
    
    .print-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
      z-index: 100;
    }
    
    .print-controls button {
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Inter', -apple-system, sans-serif;
      transition: all 0.15s ease;
    }
    
    .btn-print {
      background: #fafafa;
      color: #09090b;
      border: none;
    }
    .btn-print:hover { background: #e4e4e7; }
    
    .btn-back {
      background: transparent;
      color: #a1a1aa;
      border: 1px solid #27272a;
    }
    .btn-back:hover { 
      background: rgba(255,255,255,0.05);
      border-color: #3f3f46;
    }
    
    .header {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid #27272a;
    }
    
    .header-top {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
    }
    
    .header .wordmark {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12pt;
      font-weight: 500;
      letter-spacing: 0.1em;
      color: #fafafa;
    }
    
    .header .date {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9pt;
      color: #52525b;
    }
    
    .content h1 {
      font-size: 14pt;
      font-weight: 700;
      color: #fafafa;
      margin-top: 28px;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }
    
    .content h2 {
      font-size: 12pt;
      font-weight: 600;
      color: #fafafa;
      margin-top: 24px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #27272a;
    }
    
    .content h3 {
      font-size: 10pt;
      font-weight: 600;
      color: #e4e4e7;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    
    .content p {
      margin-bottom: 10px;
    }
    
    .content strong {
      font-weight: 600;
      color: #fafafa;
    }
    
    .content em {
      font-style: italic;
      color: #71717a;
    }
    
    .content a {
      color: #60a5fa;
      text-decoration: none;
    }
    
    .content hr {
      border: none;
      border-top: 1px solid #27272a;
      margin: 24px 0;
    }
    
    .content ul, .content ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .content li {
      margin: 5px 0;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #27272a;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #3f3f46;
    }
    
    .footer p {
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="print-controls no-print">
    <button class="btn-back" onclick="window.location.href='/'">← Back</button>
    <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
  </div>
  
  <div class="header">
    <div class="header-top">
      <div class="status-dot"></div>
      <span class="wordmark">STRATEGOS</span>
    </div>
    <p class="date">${briefing.date}</p>
  </div>
  
  <div class="content">
    <p>${content}</p>
  </div>
  
  <div class="footer">
    <p>Brought to you by Jane</p>
    <p>philotic-web.com</p>
  </div>
</body>
</html>`;
}
