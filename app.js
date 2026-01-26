/**
 * Cryptic UI - Interactive Components
 * Makes all UI components functional
 */

(function() {
    'use strict';

    // ============================================
    // TABS
    // ============================================
    function initTabs() {
        document.querySelectorAll('.tabs').forEach(tabContainer => {
            const tabs = tabContainer.querySelectorAll('.tab');
            const contents = tabContainer.querySelectorAll('.tabs-content');

            // If no separate content divs, use single content area
            const singleContent = tabContainer.querySelector('.tabs-content');

            tabs.forEach((tab, index) => {
                tab.addEventListener('click', () => {
                    // Remove active from all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    // Add active to clicked tab
                    tab.classList.add('active');

                    // If multiple content sections exist, toggle them
                    if (contents.length > 1) {
                        contents.forEach((content, i) => {
                            content.style.display = i === index ? 'block' : 'none';
                        });
                    }

                    // Dispatch custom event
                    tabContainer.dispatchEvent(new CustomEvent('tab-change', {
                        detail: { index, tab }
                    }));
                });
            });
        });
    }

    // ============================================
    // DROPDOWN MENUS
    // ============================================
    function initDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!trigger || !menu) return;

            // Toggle on click
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdown.classList.contains('open');

                // Close all other dropdowns
                document.querySelectorAll('.dropdown.open').forEach(d => {
                    d.classList.remove('open');
                });

                // Toggle this one
                if (!isOpen) {
                    dropdown.classList.add('open');
                }
            });

            // Close when clicking menu items
            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    dropdown.classList.remove('open');
                });
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown.open').forEach(d => {
                d.classList.remove('open');
            });
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.dropdown.open').forEach(d => {
                    d.classList.remove('open');
                });
            }
        });
    }

    // ============================================
    // DIALOGS / MODALS
    // ============================================
    function initDialogs() {
        document.querySelectorAll('.dialog').forEach(dialog => {
            // Close on backdrop click
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.close();
                }
            });

            // Close on Escape (native behavior, but ensure it works)
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dialog.close();
                }
            });

            // Add close buttons functionality
            dialog.querySelectorAll('[data-close-dialog]').forEach(btn => {
                btn.addEventListener('click', () => dialog.close());
            });
        });
    }

    // ============================================
    // PAGINATION
    // ============================================
    function initPagination() {
        document.querySelectorAll('.pagination').forEach(pagination => {
            const buttons = pagination.querySelectorAll('.page-btn:not(.page-prev):not(.page-next):not(:disabled)');
            const prevBtn = pagination.querySelector('.page-prev');
            const nextBtn = pagination.querySelector('.page-next');

            let currentPage = 1;
            const totalPages = buttons.length;

            function updatePagination() {
                buttons.forEach((btn, index) => {
                    btn.classList.toggle('active', index + 1 === currentPage);
                });

                if (prevBtn) prevBtn.disabled = currentPage === 1;
                if (nextBtn) nextBtn.disabled = currentPage === totalPages;

                pagination.dispatchEvent(new CustomEvent('page-change', {
                    detail: { page: currentPage }
                }));
            }

            buttons.forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    currentPage = index + 1;
                    updatePagination();
                });
            });

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        updatePagination();
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        updatePagination();
                    }
                });
            }
        });
    }

    // ============================================
    // CALENDAR
    // ============================================
    function initCalendar() {
        document.querySelectorAll('.calendar').forEach(calendar => {
            const title = calendar.querySelector('.calendar-title');
            const prevBtn = calendar.querySelector('.calendar-nav:first-child');
            const nextBtn = calendar.querySelector('.calendar-nav:last-child');
            const grid = calendar.querySelector('.calendar-grid');

            let currentDate = new Date();
            let selectedDate = null;

            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];

            function renderCalendar() {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();

                title.textContent = `${months[month]} ${year}`;

                // Get first day of month and total days
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();

                // Clear existing days (keep day names)
                const dayNames = grid.querySelectorAll('.calendar-day-name');
                grid.innerHTML = '';
                dayNames.forEach(dn => grid.appendChild(dn));

                // Previous month days
                for (let i = firstDay - 1; i >= 0; i--) {
                    const btn = document.createElement('button');
                    btn.className = 'calendar-day other';
                    btn.textContent = daysInPrevMonth - i;
                    btn.addEventListener('click', () => {
                        currentDate.setMonth(month - 1);
                        renderCalendar();
                    });
                    grid.appendChild(btn);
                }

                // Current month days
                const today = new Date();
                for (let day = 1; day <= daysInMonth; day++) {
                    const btn = document.createElement('button');
                    btn.className = 'calendar-day';
                    btn.textContent = day;

                    // Check if today
                    if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                        btn.classList.add('today');
                    }

                    // Check if selected
                    if (selectedDate && year === selectedDate.getFullYear() &&
                        month === selectedDate.getMonth() && day === selectedDate.getDate()) {
                        btn.classList.add('selected');
                    }

                    btn.addEventListener('click', () => {
                        selectedDate = new Date(year, month, day);
                        renderCalendar();
                        calendar.dispatchEvent(new CustomEvent('date-select', {
                            detail: { date: selectedDate }
                        }));
                    });

                    grid.appendChild(btn);
                }

                // Next month days
                const totalCells = 42; // 6 rows
                const currentCells = firstDay + daysInMonth;
                for (let i = 1; i <= totalCells - currentCells; i++) {
                    const btn = document.createElement('button');
                    btn.className = 'calendar-day other';
                    btn.textContent = i;
                    btn.addEventListener('click', () => {
                        currentDate.setMonth(month + 1);
                        renderCalendar();
                    });
                    grid.appendChild(btn);
                }
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    currentDate.setMonth(currentDate.getMonth() - 1);
                    renderCalendar();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    renderCalendar();
                });
            }

            // Initial render
            renderCalendar();
        });
    }

    // ============================================
    // SLIDERS (Range Inputs)
    // ============================================
    function initSliders() {
        document.querySelectorAll('.slider').forEach(slider => {
            // Update CSS custom property for styling
            function updateSlider() {
                const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
                slider.style.setProperty('--value', `${percent}%`);
            }

            slider.addEventListener('input', updateSlider);
            updateSlider();
        });
    }

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });

                    // Update URL without jump
                    history.pushState(null, null, href);
                }
            });
        });
    }

    // ============================================
    // RAIL NAVIGATION HIGHLIGHT
    // ============================================
    function initRailNav() {
        const sections = document.querySelectorAll('section[id]');
        const railLinks = document.querySelectorAll('.rail-link[href^="#"]');

        if (!sections.length || !railLinks.length) return;

        let ticking = false;

        function updateActiveLink() {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            railLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        updateActiveLink();
    }

    // ============================================
    // CONTACT FORM
    // ============================================
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const formSuccess = document.getElementById('form-success');

        // Real-time validation
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('input-invalid')) {
                    validateField(input);
                }
            });
        });

        function validateField(field) {
            const errorEl = document.getElementById(`${field.id}-error`);
            let isValid = true;
            let errorMsg = '';

            if (field.required && !field.value.trim()) {
                isValid = false;
                errorMsg = 'This field is required';
            } else if (field.type === 'email' && field.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    errorMsg = 'Please enter a valid email';
                }
            } else if (field.minLength && field.value.length > 0 && field.value.length < field.minLength) {
                isValid = false;
                errorMsg = `Minimum ${field.minLength} characters required`;
            }

            if (errorEl) {
                errorEl.textContent = errorMsg;
            }
            field.classList.toggle('input-invalid', !isValid);
            return isValid;
        }

        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate all fields
            let isFormValid = true;
            form.querySelectorAll('input:not([type="hidden"]), textarea').forEach(input => {
                if (!validateField(input)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) return;

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoading = submitBtn.querySelector('.btn-loading');
                const btnIcon = submitBtn.querySelector('.btn-icon');

                if (btnText) btnText.style.display = 'none';
                if (btnLoading) btnLoading.style.display = 'inline';
                if (btnIcon) btnIcon.style.display = 'none';
            }

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    form.reset();
                    if (formSuccess) {
                        formSuccess.style.display = 'flex';
                        setTimeout(() => {
                            formSuccess.style.display = 'none';
                        }, 5000);
                    }
                    showToast('Message sent successfully!', 'success');
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                showToast('Error sending message. Please try again.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    const btnText = submitBtn.querySelector('.btn-text');
                    const btnLoading = submitBtn.querySelector('.btn-loading');
                    const btnIcon = submitBtn.querySelector('.btn-icon');

                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoading) btnLoading.style.display = 'none';
                    if (btnIcon) btnIcon.style.display = 'inline';
                }
            }
        });
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    let toastTimeout;

    function showToast(message, type = 'default') {
        let toast = document.getElementById('toast');

        // Create toast if it doesn't exist
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        clearTimeout(toastTimeout);

        toast.textContent = message;
        toast.className = 'toast show';
        if (type === 'success') toast.classList.add('success');
        if (type === 'error') toast.classList.add('error');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Expose globally
    window.showToast = showToast;

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Elements to animate
        document.querySelectorAll('.p-section, .p-project-card, .p-blog-card, .p-timeline-item, .comp-section').forEach(el => {
            el.classList.add('fade-in-element');
            fadeInObserver.observe(el);
        });
    }

    // ============================================
    // CODE COPY FUNCTIONALITY
    // ============================================
    function initCodeCopy() {
        document.querySelectorAll('.code-copy').forEach(button => {
            button.addEventListener('click', async function() {
                const codeId = this.getAttribute('data-copy');
                const codeEl = document.getElementById(codeId);

                if (!codeEl) return;

                try {
                    await navigator.clipboard.writeText(codeEl.textContent);

                    this.classList.add('copied');
                    const span = this.querySelector('span');
                    const originalText = span?.textContent || 'Copy';
                    if (span) span.textContent = 'Copied!';

                    showToast('Code copied to clipboard', 'success');

                    setTimeout(() => {
                        this.classList.remove('copied');
                        if (span) span.textContent = originalText;
                    }, 2000);
                } catch (err) {
                    showToast('Failed to copy code', 'error');
                }
            });
        });
    }

    // ============================================
    // SHARE BUTTONS
    // ============================================
    function initShareButtons() {
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
    }

    // ============================================
    // READING PROGRESS (Blog)
    // ============================================
    function initReadingProgress() {
        const progressBar = document.getElementById('reading-progress');
        const articleContent = document.getElementById('article-content');

        if (!progressBar || !articleContent) return;

        function updateProgress() {
            const articleTop = articleContent.offsetTop;
            const articleHeight = articleContent.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.scrollY;

            const start = articleTop;
            const end = articleTop + articleHeight - windowHeight;
            const progress = Math.min(Math.max((scrollTop - start) / (end - start), 0), 1);

            progressBar.style.width = `${progress * 100}%`;
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // ============================================
    // TABLE OF CONTENTS SCROLL SPY
    // ============================================
    function initTocScrollSpy() {
        const tocLinks = document.querySelectorAll('.toc-link');
        const sections = document.querySelectorAll('.article-content section[id]');

        if (!tocLinks.length || !sections.length) return;

        function updateToc() {
            let current = '';

            sections.forEach(section => {
                if (window.scrollY >= section.offsetTop - 150) {
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

        window.addEventListener('scroll', updateToc, { passive: true });
        updateToc();
    }

    // ============================================
    // READING TIME CALCULATION
    // ============================================
    function initReadingTime() {
        const content = document.getElementById('article-content');
        const readingTimeEl = document.getElementById('reading-time');

        if (!content || !readingTimeEl) return;

        const text = content.textContent || content.innerText;
        const wordCount = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(wordCount / 200);

        readingTimeEl.textContent = `${minutes} min read`;
    }

    // ============================================
    // PROJECTS LOADER
    // ============================================
    async function initProjects() {
        const container = document.getElementById('projects-grid');
        if (!container) return;

        try {
            const response = await fetch('projects.json');
            if (!response.ok) throw new Error('Failed to load projects');

            const projects = await response.json();
            renderProjects(container, projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            // Keep existing HTML as fallback
        }
    }

    function renderProjects(container, projects) {
        container.innerHTML = projects.map(project => `
            <article class="p-project-card ${project.featured ? 'p-project-featured' : ''}">
                <div class="p-project-img">
                    ${project.image ?
                        `<img src="${project.image}" alt="${project.title}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'p-project-placeholder\\'>${project.title}</span>'">` :
                        `<span class="p-project-placeholder">${project.title}</span>`
                    }
                </div>
                <div class="p-project-content">
                    ${project.featured ? '<span class="badge badge-peach">Featured</span>' : ''}
                    <h3 class="p-project-title">${project.title}</h3>
                    <p class="p-project-desc">${project.description}</p>
                    <div class="p-project-tags">
                        ${project.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
                    </div>
                    ${(project.links.demo || project.links.code) ? `
                    <div class="p-project-links">
                        ${project.links.demo ? `
                        <a href="${project.links.demo}" class="btn btn-sm btn-ghost" target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Live
                        </a>` : ''}
                        ${project.links.code ? `
                        <a href="${project.links.code}" class="btn btn-sm btn-ghost" target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            Code
                        </a>` : ''}
                    </div>` : ''}
                </div>
            </article>
        `).join('');
    }

    // ============================================
    // BLOG LOADER
    // ============================================
    async function initBlog() {
        const container = document.getElementById('blog-grid');
        if (!container) return;

        try {
            const response = await fetch('blog.json');
            if (!response.ok) throw new Error('Failed to load blog posts');

            const posts = await response.json();
            renderBlog(container, posts);
        } catch (error) {
            console.error('Error loading blog:', error);
        }
    }

    function renderBlog(container, posts) {
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        container.innerHTML = posts.map(post => `
            <article class="p-blog-card">
                <div class="p-blog-meta">
                    <span class="p-blog-date">${formatDate(post.date)}</span>
                    <span class="badge badge-${post.categoryColor || 'peach'}">${post.category}</span>
                </div>
                <h3 class="p-blog-title">${post.title}</h3>
                <p class="p-blog-excerpt">${post.excerpt}</p>
                <a href="${post.url || '#'}" class="p-blog-link">
                    Read more
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            </article>
        `).join('');
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Escape to close modals/dropdowns
            if (e.key === 'Escape') {
                document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
                document.querySelectorAll('dialog[open]').forEach(d => d.close());
            }

            // 'h' to go home
            if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
                const home = document.querySelector('#home');
                if (home) home.scrollIntoView({ behavior: 'smooth' });
            }

            // '/' to focus search (if exists)
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                const search = document.querySelector('input[type="search"], .input-with-icon');
                if (search) {
                    e.preventDefault();
                    search.focus();
                }
            }
        });
    }

    // ============================================
    // INITIALIZE ALL
    // ============================================
    function init() {
        initTabs();
        initDropdowns();
        initDialogs();
        initPagination();
        initCalendar();
        initSliders();
        initSmoothScroll();
        initRailNav();
        initContactForm();
        initProjects();
        initBlog();
        initScrollAnimations();
        initCodeCopy();
        initShareButtons();
        initReadingProgress();
        initTocScrollSpy();
        initReadingTime();
        initKeyboardShortcuts();

        console.log('Cryptic UI initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
