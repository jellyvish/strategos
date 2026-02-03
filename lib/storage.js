import { put, list, head } from '@vercel/blob';

// ============================================
// BRIEFING STORAGE (Vercel Blob)
// ============================================

export async function saveBriefing(date, briefingData) {
  // date format: "2026-01-27"
  const filename = `briefings/${date}.json`;
  
  const blob = await put(filename, JSON.stringify(briefingData), {
    access: 'public',
    addRandomSuffix: false,
  });
  
  return blob.url;
}

export async function getBriefing(date) {
  // date format: "2026-01-27"
  try {
    const { blobs } = await list({ prefix: `briefings/${date}` });
    
    if (blobs.length === 0) {
      return null;
    }
    
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching briefing:', error);
    return null;
  }
}

export async function getLatestBriefing() {
  try {
    const { blobs } = await list({ prefix: 'briefings/' });
    
    if (blobs.length === 0) {
      return null;
    }
    
    // Sort by name (date) descending to get latest
    blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
    
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching latest briefing:', error);
    return null;
  }
}

// ============================================
// SUBSCRIBER STORAGE (Vercel Blob)
// ============================================

const SUBSCRIBERS_FILE = 'data/subscribers.json';

async function getSubscribersData() {
  try {
    const { blobs } = await list({ prefix: SUBSCRIBERS_FILE });
    
    if (blobs.length === 0) {
      return { subscribers: [], updatedAt: null };
    }
    
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return { subscribers: [], updatedAt: null };
  }
}

async function saveSubscribersData(data) {
  const blob = await put(SUBSCRIBERS_FILE, JSON.stringify({
    ...data,
    updatedAt: new Date().toISOString()
  }), {
    access: 'public',
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function addSubscriber(email) {
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();
  
  // Get current subscribers
  const data = await getSubscribersData();
  const subscribers = data.subscribers || [];
  
  // Check if already subscribed
  if (subscribers.includes(normalizedEmail)) {
    return { success: true, alreadySubscribed: true };
  }
  
  // Add new subscriber
  subscribers.push(normalizedEmail);
  
  // Save
  await saveSubscribersData({ subscribers });
  
  return { success: true, alreadySubscribed: false };
}

export async function removeSubscriber(email) {
  const normalizedEmail = email.toLowerCase().trim();
  
  const data = await getSubscribersData();
  const subscribers = (data.subscribers || []).filter(e => e !== normalizedEmail);
  
  await saveSubscribersData({ subscribers });
  
  return { success: true };
}

export async function getAllSubscribers() {
  const data = await getSubscribersData();
  return data.subscribers || [];
}

export async function getSubscriberCount() {
  const data = await getSubscribersData();
  return (data.subscribers || []).length;
}
