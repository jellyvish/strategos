// Convert markdown briefing to styled HTML email

export function markdownToEmailHtml(markdown, date, recipientEmail = '') {
  // Basic markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 style="color: #fafafa; font-size: 15px; margin-top: 28px; margin-bottom: 10px; font-weight: 600; font-family: Inter, -apple-system, sans-serif;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #fafafa; font-size: 18px; margin-top: 36px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #27272a; font-weight: 600; font-family: Inter, -apple-system, sans-serif;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: #fafafa; font-size: 22px; margin-bottom: 16px; font-weight: 700; font-family: Inter, -apple-system, sans-serif;">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fafafa; font-weight: 600;">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em style="color: #a1a1aa;">$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #60a5fa; text-decoration: none; border-bottom: 1px solid rgba(96,165,250,0.3);">$1</a>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">')
    // Line breaks to paragraphs
    .replace(/\n\n/g, '</p><p style="margin: 14px 0; line-height: 1.7; color: #a1a1aa;">')
    // Bullet points
    .replace(/^- (.*$)/gim, '<li style="margin: 6px 0; line-height: 1.6; color: #a1a1aa;">$1</li>');

  // Wrap bullet points in ul
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin: 14px 0; padding-left: 20px;">$&</ul>');
  
  const unsubscribeUrl = recipientEmail 
    ? `https://philotic-web.com/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
    : 'https://philotic-web.com/unsubscribe';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Strategos — ${date}</title>
  <style>
    :root { color-scheme: dark; }
  </style>
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #a1a1aa; margin: 0; padding: 0; background-color: #09090b;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #09090b;">
    <!-- Header -->
    <div style="padding: 32px 24px 24px 24px; border-bottom: 1px solid #27272a;">
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td>
            <div style="display: inline-block; width: 8px; height: 8px; background-color: #22c55e; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></div>
            <span style="font-family: 'SF Mono', Monaco, monospace; font-size: 13px; font-weight: 500; letter-spacing: 0.1em; color: #fafafa; vertical-align: middle;">STRATEGOS</span>
          </td>
        </tr>
      </table>
      <p style="margin: 16px 0 0 0; font-family: 'SF Mono', Monaco, monospace; font-size: 12px; color: #71717a;">
        ${date}
      </p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px; color: #a1a1aa;">
      <p style="margin: 14px 0; line-height: 1.7; color: #a1a1aa;">
        ${html}
      </p>
    </div>
    
    <!-- Footer -->
    <div style="padding: 24px; border-top: 1px solid #27272a;">
      <p style="color: #52525b; font-size: 13px; margin: 0 0 8px 0; font-family: Inter, -apple-system, sans-serif;">
        Brought to you by Jane
      </p>
      <p style="font-family: 'SF Mono', Monaco, monospace; font-size: 11px; margin: 0; color: #3f3f46;">
        <a href="https://philotic-web.com" style="color: #52525b; text-decoration: none;">philotic-web.com</a>
        <span style="margin: 0 8px;">·</span>
        <a href="${unsubscribeUrl}" style="color: #52525b; text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function getPlainTextVersion(markdown, recipientEmail = '') {
  const unsubscribeUrl = recipientEmail 
    ? `https://philotic-web.com/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
    : 'https://philotic-web.com/unsubscribe';
    
  return `STRATEGOS
${markdown}

---
Brought to you by Jane
philotic-web.com

Unsubscribe: ${unsubscribeUrl}`;
}
