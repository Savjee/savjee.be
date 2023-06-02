/**
 * 
 */
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll(".load-more-button");

    for(const button of buttons){
        button.addEventListener("click", () => {
            const container = button.parentNode.parentNode;
            const moreItems = container.querySelectorAll(".more-item.hidden");

            Array.from(moreItems)
                .slice(0, 10) // Show 10 more items
                .forEach(e => {
                    e.classList.remove("hidden");
                });
        });
    }
});