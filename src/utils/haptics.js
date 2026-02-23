export const triggerHaptic = (type = 'success') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  switch (type) {
    case 'success':
      navigator.vibrate(50);
      break;
    case 'error':
      navigator.vibrate([50, 50, 50]);
      break;
    case 'heavy':
      navigator.vibrate(200);
      break;
    case 'notification':
      navigator.vibrate([100, 50, 100]);
      break;
    default:
      navigator.vibrate(50);
  }
};
