// Duration utility functions

export const DURATION_OPTIONS = [
  { value: '30 minutes', label: '30 minutes', minutes: 30 },
  { value: '1 hour', label: '1 hour', minutes: 60 },
  { value: '2 hours', label: '2 hours', minutes: 120 },
  { value: '3 hours', label: '3 hours', minutes: 180 },
  { value: '4 hours', label: '4 hours', minutes: 240 },
  { value: '6 hours', label: '6 hours', minutes: 360 },
  { value: '8 hours', label: '8 hours (full day)', minutes: 480 },
  { value: '1 day', label: '1 day', minutes: 1440 },
  { value: '2 days', label: '2 days', minutes: 2880 },
  { value: '3 days', label: '3 days', minutes: 4320 },
  { value: '1 week', label: '1 week', minutes: 10080 },
  { value: 'custom', label: 'Custom duration', minutes: 0 }
];

export const parseDurationToMinutes = (durationStr) => {
  const duration = durationStr.toLowerCase();
  
  if (duration.includes('minute')) {
    return parseInt(duration) || 30;
  } else if (duration.includes('hour')) {
    const hours = parseInt(duration) || 1;
    return hours * 60;
  } else if (duration.includes('day')) {
    const days = parseInt(duration) || 1;
    return days * 24 * 60;
  } else if (duration.includes('week')) {
    const weeks = parseInt(duration) || 1;
    return weeks * 7 * 24 * 60;
  }
  
  // If just a number, assume minutes
  const num = parseInt(duration);
  return isNaN(num) ? 30 : num;
};

export const formatDuration = (durationStr) => {
  if (!durationStr) return 'Not specified';
  
  const minutes = parseDurationToMinutes(durationStr);
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
      : `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes < 10080) {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    return remainingHours > 0
      ? `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
      : `${days} day${days !== 1 ? 's' : ''}`;
  } else {
    const weeks = Math.floor(minutes / 10080);
    const remainingDays = Math.floor((minutes % 10080) / 1440);
    return remainingDays > 0
      ? `${weeks} week${weeks !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`
      : `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
};

export const validateCustomDuration = (customDuration) => {
  if (!customDuration || customDuration.trim() === '') {
    return { isValid: false, error: 'Duration is required' };
  }

  const duration = customDuration.toLowerCase().trim();
  
  // Check for valid patterns
  const patterns = [
    /^\d+\s*(minute|minutes|min|mins)$/,
    /^\d+\s*(hour|hours|hr|hrs|h)$/,
    /^\d+\s*(day|days|d)$/,
    /^\d+\s*(week|weeks|w)$/
  ];

  const isValid = patterns.some(pattern => pattern.test(duration));
  
  if (!isValid) {
    return { 
      isValid: false, 
      error: 'Please use format like "2 hours", "30 minutes", "1 day", etc.' 
    };
  }

  const minutes = parseDurationToMinutes(duration);
  
  if (minutes < 15) {
    return { 
      isValid: false, 
      error: 'Duration must be at least 15 minutes' 
    };
  }

  if (minutes > 20160) { // 2 weeks
    return { 
      isValid: false, 
      error: 'Duration cannot exceed 2 weeks' 
    };
  }

  return { isValid: true, minutes };
};