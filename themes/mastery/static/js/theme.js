(function () {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');

    const saved = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', saved);

    btn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
})();

function copyPostLink() {
    navigator.clipboard.writeText(window.location.href);

    const btn = document.querySelector('.share-copy-btn');
    const original = btn.textContent;

    btn.textContent = 'Copied!';

    setTimeout(() => {
        btn.textContent = original;
    }, 2000);
}
