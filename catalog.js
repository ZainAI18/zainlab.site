const catalogItems = document.querySelectorAll(".catalog-item");

catalogItems.forEach((item) => {
    const book = item.querySelector("[data-book]");
    if (!book) return;

    const pages = Array.from(book.querySelectorAll(".page"));
    const prevBtn = item.querySelector("[data-prev]");
    const nextBtn = item.querySelector("[data-next]");
    let currentPage = 0;

    const updateBook = () => {
        pages.forEach((page, index) => {
            page.classList.toggle("flipped", index < currentPage);
            page.style.zIndex = String(pages.length - index);
        });
    };

    prevBtn?.addEventListener("click", () => {
        currentPage = Math.max(0, currentPage - 1);
        updateBook();
    });

    nextBtn?.addEventListener("click", () => {
        currentPage = Math.min(pages.length, currentPage + 1);
        updateBook();
    });

    // Click book area to continue page flipping quickly.
    book.addEventListener("click", () => {
        currentPage = currentPage >= pages.length ? 0 : currentPage + 1;
        updateBook();
    });

    updateBook();
});
