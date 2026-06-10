(function () {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const burger = document.getElementById('navBurger');
    const navLinks = document.querySelector('.nav-links');

    // Init theme from localStorage or default dark
    const saved = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', saved);

    btn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // Mobile burger
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        burger.classList.toggle('open');
    });
})();
