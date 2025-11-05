export function timeAgo(timestamp: string | undefined): string {
  // Handle missing or invalid timestamp
  if (!timestamp) {
    return "just now";
  }

  const now = new Date();
  const past = new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(past.getTime())) {
    return "just now";
  }
  
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  // Handle future dates or negative values
  if (seconds < 0) {
    return "just now";
  }

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " year" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " month" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " day" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hour" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minute" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  
  if (seconds < 10) {
    return "just now";
  }
  
  return Math.floor(seconds) + " second" + (Math.floor(seconds) > 1 ? "s" : "") + " ago";
}
