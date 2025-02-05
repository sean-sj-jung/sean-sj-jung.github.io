// This script is just to ensure the page complies with the system's theme.
document.body.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
