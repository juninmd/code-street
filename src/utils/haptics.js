export const triggerHaptic = (type = 'click') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'success':
        navigator.vibrate([50, 50, 50]);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100, 50, 100]);
        break;
      case 'notification':
        navigator.vibrate([50, 100, 50]);
        break;
      case 'heavy':
        navigator.vibrate(200);
        break;
      case 'click':
      default:
        navigator.vibrate(15);
        break;
    }
  } catch (e) {
    // Ignore errors on unsupported devices
  }
};
