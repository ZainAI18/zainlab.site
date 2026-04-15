const grid = document.getElementById("catalog-grid");
const cards = Array.from(document.querySelectorAll("[data-card]"));
const overlay = document.getElementById("catalog-overlay");

let activeCard = null;
const openTimers = new WeakMap();
const HOVER_DELAY_MS = 180;
const CLOSE_DELAY_MS = 220;

const clearTimer = (card) => {
    const timer = openTimers.get(card);
    if (timer) {
        clearTimeout(timer);
        openTimers.delete(card);
    }
};

const closeActiveCard = () => {
    if (!activeCard) return;
    clearTimer(activeCard);
    const cardToClose = activeCard;
    cardToClose.classList.remove("expanded-visible");
    grid?.classList.remove("has-active");
    overlay?.classList.remove("visible");
    overlay?.setAttribute("aria-hidden", "true");
    activeCard = null;

    setTimeout(() => {
        cardToClose.classList.remove("expanded");
    }, CLOSE_DELAY_MS);
};

const openCard = (card) => {
    if (activeCard === card) return;
    if (activeCard) closeActiveCard();

    activeCard = card;
    requestAnimationFrame(() => {
        card.classList.add("expanded");
        grid?.classList.add("has-active");
        overlay?.classList.add("visible");
        overlay?.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => {
            card.classList.add("expanded-visible");
        });
    });
};

cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
        clearTimer(card);
        const timer = setTimeout(() => openCard(card), HOVER_DELAY_MS);
        openTimers.set(card, timer);
    });

    card.addEventListener("mouseleave", () => {
        clearTimer(card);
        if (card === activeCard) closeActiveCard();
    });
});

overlay?.addEventListener("click", closeActiveCard);

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeActiveCard();
});

/* Legacy interaction kept for future reuse (card1 flip version):
const HOVER_DELAY_MS = 180;
const openCard = (card) => {
    card.classList.add("expanded");
    // Old behavior used rotateY flip animation.
};
*/
