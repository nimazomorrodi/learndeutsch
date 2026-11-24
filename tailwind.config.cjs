module.exports = {
  content: ['./dist/**/*.{php,js}', './app/views/*.php'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: { pine: 'var(--pine)', muted: 'var(--muted)', surface: 'var(--surface)', line: 'var(--line)' }
    }
  }
};
