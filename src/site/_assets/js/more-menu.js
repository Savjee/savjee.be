document.addEventListener('DOMContentLoaded', function () {
    const menu = document.querySelector('#more-menu');
    if (!menu) return;

    document.addEventListener('click', (event) => {
        if (!menu.open) return;
        if (!menu.contains(event.target)) {
            menu.open = false;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            menu.open = false;
        }
    });

    menu.querySelectorAll('[data-more-menu-link]').forEach((link) => {
        link.addEventListener('click', () => {
            menu.open = false;
        });
    });
});
