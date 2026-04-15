const grid = document.getElementById("catalog-grid");
const cards = Array.from(document.querySelectorAll("[data-card]"));
const overlay = document.getElementById("catalog-overlay");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let activeCard = null;
const hoverTimers = new WeakMap();
const HOVER_DELAY_MS = 150;
const FLIP_DELAY_MS = 520;
const COLLAPSE_DELAY_MS = 500;

const getVideo = (card) => card.querySelector("video");

const playVideo = (card) => {
    const video = getVideo(card);
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise) {
        playPromise.catch(() => {
            card.classList.remove("previewing");
        });
    }
};

const pauseVideo = (card) => {
    const video = getVideo(card);
    if (!video || card === activeCard) return;
    video.pause();
};

const clearHoverTimer = (card) => {
    const timer = hoverTimers.get(card);
    if (!timer) return;
    clearTimeout(timer);
    hoverTimers.delete(card);
};

const startPreview = (card) => {
    if (activeCard || !canHover) return;

    clearHoverTimer(card);
    const timer = setTimeout(() => {
        card.classList.add("previewing");
        playVideo(card);
    }, HOVER_DELAY_MS);

    hoverTimers.set(card, timer);
};

const stopPreview = (card) => {
    clearHoverTimer(card);
    if (card === activeCard) return;
    card.classList.remove("previewing");
    pauseVideo(card);
};

const closeActiveCard = () => {
    if (!activeCard) return;

    const closingCard = activeCard;
    const closingItem = closingCard.closest(".catalog-item");
    activeCard = null;
    closingCard.classList.remove("flipped", "expanded", "previewing");
    grid?.classList.remove("has-active");
    overlay?.classList.remove("visible");
    overlay?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    pauseVideo(closingCard);

    setTimeout(() => {
        closingCard.classList.remove("active");
        closingCard.removeAttribute("style");
        closingItem?.classList.remove("is-active");
    }, COLLAPSE_DELAY_MS);
};

const openCard = (card) => {
    if (activeCard === card) return;
    if (activeCard) closeActiveCard();

    const rect = card.getBoundingClientRect();
    const item = card.closest(".catalog-item");
    cards.forEach(clearHoverTimer);
    activeCard = card;
    card.style.setProperty("--start-top", `${rect.top}px`);
    card.style.setProperty("--start-left", `${rect.left}px`);
    card.style.setProperty("--start-width", `${rect.width}px`);
    card.style.setProperty("--start-height", `${rect.height}px`);
    card.classList.remove("previewing");
    card.classList.add("active");
    item?.classList.add("is-active");
    grid?.classList.add("has-active");
    overlay?.classList.add("visible");
    overlay?.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    playVideo(card);

    requestAnimationFrame(() => {
        if (activeCard === card) {
            card.classList.add("expanded");
            setTimeout(() => {
                if (activeCard === card) {
                    card.classList.add("flipped");
                }
            }, FLIP_DELAY_MS);
        }
    });
};

cards.forEach((card) => {
    card.addEventListener("mouseenter", () => startPreview(card));
    card.addEventListener("mouseleave", () => stopPreview(card));

    card.addEventListener("click", (event) => {
        if (event.target.closest(".close-card")) {
            closeActiveCard();
            return;
        }

        if (!activeCard) {
            openCard(card);
        }
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openCard(card);
        }
    });
});

overlay?.addEventListener("click", closeActiveCard);

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeActiveCard();
});

cards.forEach((card) => pauseVideo(card));
