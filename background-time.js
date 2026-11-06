(() => {
  const dayBackground = 'url("Images/FullBackground.gif")';
  const nightBackground = 'url("Images/FullBackground-Night.gif")';
  let boundaryTimer;

  function applyBackgroundForLocalTime() {
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour >= 18 || hour < 6;
    document.documentElement.style.setProperty('--full-background-image', isNight ? nightBackground : dayBackground);

    const next = new Date(now);
    next.setHours(hour >= 18 || hour < 6 ? 6 : 18, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    clearTimeout(boundaryTimer);
    boundaryTimer = setTimeout(applyBackgroundForLocalTime, next - now + 50);
  }

  applyBackgroundForLocalTime();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) applyBackgroundForLocalTime();
  });
})();
