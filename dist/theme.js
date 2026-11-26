'use strict';

const LernhausTheme = (() => {
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem('lernhaus-theme'); } catch {}

  function apply() {
    const dark = preference ? preference === 'dark' : system.matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#17221f' : '#faf8f2';
    window.dispatchEvent(new Event('lernhaus-theme-changed'));
  }

  apply();
  system.addEventListener('change', apply);
  return {
    toggle() {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('lernhaus-theme', preference); } catch {}
      apply();
    }
  };
})();
