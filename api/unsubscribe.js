import { getAllSubscribers, removeSubscriber } from '../lib/storage.js';

export default async function handler(req, res) {
  const email = req.query.email?.toLowerCase().trim();
  
  if (!email) {
    return res.status(400).send(getPage('Missing email', 'No email address provided.', false));
  }
  
  try {
    const subscribers = await getAllSubscribers();
    
    if (!subscribers.includes(email)) {
      return res.status(200).send(getPage('Not found', `${email} was not subscribed.`, false));
    }
    
    await removeSubscriber(email);
    
    console.log(`Unsubscribed: ${email}`);
    
    return res.status(200).send(getPage('Unsubscribed', `${email} has been removed from Strategos.`, true));
    
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).send(getPage('Error', 'Something went wrong. Please try again.', false));
  }
}

function getPage(title, message, success) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Strategos</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #09090b;
      color: #e4e4e7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 400px;
      text-align: center;
    }
    .icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 24px;
      background: ${success ? 'rgba(34,197,94,0.1)' : 'rgba(161,161,170,0.1)'};
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #fafafa;
    }
    p {
      color: #a1a1aa;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    a {
      color: #60a5fa;
      text-decoration: none;
      font-size: 14px;
    }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✓' : '•'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">← Back to Strategos</a>
  </div>
</body>
</html>`;
}
