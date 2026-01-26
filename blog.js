/**
 * Blog Functionality
 * - Reading progress indicator
 * - Reading time calculation
 * - Table of contents scroll spy
 * - Code copy functionality
 * - Share buttons
 * - Content fade-in animations
 * - Smooth scrolling
 */

(function() {
    'use strict';

    // ============================================
    // READING PROGRESS
    // ============================================
    const progressBar = document.getElementById('reading-progress');
    const articleContent = document.getElementById('article-content');

    function updateReadingProgress() {
        if (!progressBar || !articleContent) return;

        const articleRect = articleContent.getBoundingClientRect();
        const articleTop = articleContent.offsetTop;
        const articleHeight = articleContent.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;

        // Calculate progress based on how much of the article has been scrolled
        const start = articleTop;
        const end = articleTop + articleHeight - windowHeight;
        const progress = Math.min(Math.max((scrollTop - start) / (end - start), 0), 1);

        progressBar.style.width = `${progress * 100}%`;
    }

    // ============================================
    // READING TIME CALCULATION
    // ============================================
    function calculateReadingTime() {
        const content = document.getElementById('article-content');
        const readingTimeEl = document.getElementById('reading-time');

        if (!content || !readingTimeEl) return;

        const text = content.textContent || content.innerText;
        const wordCount = text.trim().split(/\s+/).length;
        const wordsPerMinute = 200;
        const minutes = Math.ceil(wordCount / wordsPerMinute);

        readingTimeEl.textContent = `${minutes} min read`;
    }

    // ============================================
    // TABLE OF CONTENTS SCROLL SPY
    // ============================================
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.article-content section[id]');

    function updateTocHighlight() {
        if (!sections.length || !tocLinks.length) return;

        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // ============================================
    // SMOOTH SCROLLING
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 100;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // CODE COPY FUNCTIONALITY
    // ============================================
    document.querySelectorAll('.code-copy').forEach(button => {
        button.addEventListener('click', async function() {
            const codeId = this.getAttribute('data-copy');
            const codeEl = document.getElementById(codeId);

            if (!codeEl) return;

            try {
                await navigator.clipboard.writeText(codeEl.textContent);

                // Update button state
                this.classList.add('copied');
                const span = this.querySelector('span');
                const originalText = span.textContent;
                span.textContent = 'Copied!';

                // Show toast
                showToast('Code copied to clipboard', 'success');

                // Reset after 2 seconds
                setTimeout(() => {
                    this.classList.remove('copied');
                    span.textContent = originalText;
                }, 2000);

            } catch (err) {
                showToast('Failed to copy code', 'error');
            }
        });
    });

    // ============================================
    // SHARE BUTTONS
    // ============================================
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const shareType = this.getAttribute('data-share');
            const url = window.location.href;
            const title = document.title;

            switch (shareType) {
                case 'twitter':
                    window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
                        '_blank',
                        'width=550,height=420'
                    );
                    break;

                case 'linkedin':
                    window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                        '_blank',
                        'width=550,height=420'
                    );
                    break;

                case 'copy':
                    try {
                        await navigator.clipboard.writeText(url);
                        showToast('Link copied to clipboard', 'success');
                    } catch (err) {
                        showToast('Failed to copy link', 'error');
                    }
                    break;
            }
        });
    });

    // ============================================
    // TOAST NOTIFICATION
    // ============================================
    function showToast(message, type = 'default') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = 'toast show';
        if (type === 'success') {
            toast.classList.add('success');
        }

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ============================================
    // CONTENT FADE-IN ANIMATIONS
    // ============================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.article-content section').forEach(section => {
        fadeInObserver.observe(section);
    });

    // ============================================
    // SCROLL EVENT HANDLER
    // ============================================
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateReadingProgress();
                updateTocHighlight();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', (e) => {
        // Escape to close any open modals/focus
        if (e.key === 'Escape') {
            document.activeElement.blur();
        }

        // Ctrl/Cmd + Home to scroll to top
        if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // ============================================
    // INITIALIZE
    // ============================================
    function init() {
        calculateReadingTime();
        updateReadingProgress();
        updateTocHighlight();

        // Make first section visible immediately
        const firstSection = document.querySelector('.article-content section');
        if (firstSection) {
            firstSection.classList.add('visible');
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
