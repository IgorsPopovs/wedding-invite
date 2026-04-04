const revealItems = document.querySelectorAll('.reveal');
const polaroidRow = document.querySelector('.polaroid-row');

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
                e.target.classList.add('visible');
                io.unobserve(e.target);
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
