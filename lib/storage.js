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
// RECENT BRIEFINGS (for delta-first generation)
// ============================================

export async function getRecentBriefings(count = 7) {
  try {
    const { blobs } = await list({ prefix: 'briefings/' });

    if (blobs.length === 0) {
      return [];
    }

    // Sort by pathname (date) descending
    blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));

    // Get the most recent N briefings
    const recentBlobs = blobs.slice(0, count);
    const briefings = [];

    for (const blob of recentBlobs) {
      try {
        const response = await fetch(blob.url);
        const data = await response.json();
        briefings.push(data);
      } catch (e) {
        console.error(`Failed to fetch briefing: ${blob.pathname}`, e);
      }
    }

    return briefings;
  } catch (error) {
    console.error('Error fetching recent briefings:', error);
    return [];
  }
}

// ============================================
// BRIEFING MEMORY STATE (trade/book/topic tracking)
// ============================================

const STATE_FILE = 'state/briefing-memory.json';

export async function getBriefingMemory() {
  try {
    const { blobs } = await list({ prefix: STATE_FILE });
    if (blobs.length === 0) {
      return { leadTopics: [], trades: [], books: [], forecasts: [] };
    }
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching briefing memory:', error);
    return { leadTopics: [], trades: [], books: [], forecasts: [] };
  }
}

export async function updateBriefingMemory(memory) {
  await put(STATE_FILE, JSON.stringify(memory), {
    access: 'public',
    addRandomSuffix: false,
  });
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
