<script>
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.3
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// Video hover播放
const videoCard = document.querySelector('.video-card');

if(videoCard){
    const video = videoCard.querySelector('video');

    videoCard.addEventListener('mouseenter', () => {
        video.play();
    });

    videoCard.addEventListener('mouseleave', () => {
        video.pause();
    });
}
</script>
