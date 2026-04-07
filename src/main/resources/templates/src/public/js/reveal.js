const revealItems = document.querySelectorAll('.reveal');
const polaroidRow = document.querySelector('.polaroid-row');

// Preload GIFs immediately so they're cached before the timeline wipe reveals them
const gifUrls = [
    'images/icons/toast_9109257.gif',
    'images/icons/wedding_14025471.gif',
    'images/icons/vegan-food_9529411.gif',
    'images/icons/finish-line_17904550.gif'
];
const gifPromises = gifUrls.map(url => new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = url;
}));
const gifsReady = Promise.all(gifPromises);

if ('IntersectionObserver' in window) {
    // polaroid-row triggers immediately on load
    const polaroidObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); polaroidObs.unobserve(e.target); } });
    }, { threshold: 0.08 });
    if (polaroidRow) polaroidObs.observe(polaroidRow);

    // everything else only starts observing after first scroll
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                io.unobserve(e.target);
                e.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    // separate observer for timeline wipe — waits for GIFs first
    const timeline = document.querySelector('.timeline');
    const tlObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                tlObs.unobserve(e.target);
                gifsReady.then(() => e.target.classList.add('visible'));
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    const scrollHint = document.getElementById('scroll-hint');

    let scrolled = false;
    function startReveal() {
        if (scrolled) return;
        scrolled = true;
        if (scrollHint) scrollHint.classList.add('hidden');
        revealItems.forEach(el => io.observe(el));
        if (timeline) tlObs.observe(timeline);
        window.removeEventListener('scroll', startReveal);
    }

    function checkScrollPosition() {
        if (window.scrollY > 10 || document.documentElement.scrollTop > 10) {
            startReveal();
            return true;
        }
        return false;
    }

    // if page loaded already scrolled (refresh, back nav), reveal everything immediately
    if (!checkScrollPosition()) {
        setTimeout(() => {
            // re-check after browser may have restored scroll position (Safari bfcache)
            if (!checkScrollPosition()) {
                window.addEventListener('scroll', startReveal, { passive: true });
            }
        }, 300);
    }

    // also handle Safari page show from bfcache
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) startReveal();
    });
} else {
    revealItems.forEach(el => el.classList.add('visible'));
    if (polaroidRow) polaroidRow.classList.add('visible');
}
