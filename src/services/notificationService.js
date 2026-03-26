let notificationPermission = 'default';

export async function requestPermission() {
  if ('Notification' in window) {
    notificationPermission = await Notification.requestPermission();
  }
  return notificationPermission;
}

export function scheduleQuizNotification(topic, subject, onReady) {
  // Schedule for 10 minutes (600000ms) – use 10s in dev for testing
  const delay = 10 * 60 * 1000; // 10 minutes

  setTimeout(() => {
    // Fire browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification('📝 Quiz Ready!', {
        body: `Your quiz on "${topic}" is ready and waiting for your participation!`,
        icon: '/vite.svg',
        badge: '/vite.svg',
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }

    // Call callback to update app state
    if (onReady) onReady(topic, subject);
  }, delay);
}
