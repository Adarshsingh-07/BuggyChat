export function timeAgo(date) {
  if (!date) return "";

  let past;
  if (Array.isArray(date)) {
    past = new Date(date[0], date[1] - 1, date[2], date[3] || 0, date[4] || 0, date[5] || 0);
  } else {
    // trim nanoseconds and treat as UTC
    const trimmed = typeof date === "string"
      ? date.replace(/(\.\d{3})\d+/, "$1") + "Z"
      : date;
    past = new Date(trimmed);
  }

  const now = new Date();
  const secondsAgo = Math.floor((now - past) / 1000);
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo}d ago`;
}