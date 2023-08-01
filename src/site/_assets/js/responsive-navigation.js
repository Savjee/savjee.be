/**
 * On mobile, show the main navigation when the user presses the menu button.
 */
document.addEventListener('DOMContentLoaded', function () {
    const button = document.querySelector("#toggle-navigation");
    const nav = document.querySelector("nav");

    button.addEventListener("click", () => {
        nav.classList.toggle("hidden");
    });
});