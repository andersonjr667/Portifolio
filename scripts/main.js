const CAROUSEL_MIN_WIDTH = 768;
const PROJECTS_ENDPOINT = 'data/projects.json';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const scrollToTopBtn = document.getElementById('scrollToTop');
const projectsGrid = document.getElementById('projectsGrid');
const modal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
const modalOverlay = modal ? modal.querySelector('.modal-overlay') : null;
const contactForm = document.getElementById('contactForm');
const sections = Array.from(document.querySelectorAll('section[id]'));
const copyrightText = document.querySelector('.footer-bottom p');
const instagramSection = document.getElementById('instagram');
const projectsCountEl = document.getElementById('projectsCount');
const projectsTechCountEl = document.getElementById('projectsTechCount');
const heroProjectsCountEl = document.getElementById('heroProjectsCount');

const state = {
    projects: [],
    projectLayout: '',
    carouselCleanup: null,
    resizeTimer: null,
    scrollTicking: false,
    instagramScriptLoaded: false
};

function setMenuState(isOpen) {
    navLinks.classList.toggle('active', isOpen);
    const icon = menuToggle.querySelector('i');

    icon.classList.toggle('fa-bars', !isOpen);
    icon.classList.toggle('fa-times', isOpen);
}

function scrollToTarget(target) {
    const headerHeight = header.offsetHeight;
    const targetPosition = target.offsetTop - headerHeight;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

function getProjectLayout() {
    return window.innerWidth >= CAROUSEL_MIN_WIDTH ? 'carousel' : 'grid';
}

function createElement(tagName, className, attributes = {}) {
    const element = document.createElement(tagName);
    if (className) element.className = className;

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    return element;
}

function getImagePath(fileName) {
    return `images/${encodeURIComponent(fileName)}`;
}

function updateScrollUI() {
    scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
    header.classList.toggle('scrolled', window.scrollY > 50);
    highlightNavLink();
}

function updateProjectStats(projects) {
    const uniqueTags = new Set(projects.flatMap((project) => project.tags));
    if (projectsCountEl) projectsCountEl.textContent = String(projects.length);
    if (projectsTechCountEl) projectsTechCountEl.textContent = String(uniqueTags.size);
    if (heroProjectsCountEl) heroProjectsCountEl.textContent = `${projects.length}+`;
}

function handleScroll() {
    if (state.scrollTicking) return;

    state.scrollTicking = true;
    window.requestAnimationFrame(() => {
        updateScrollUI();
        state.scrollTicking = false;
    });
}

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== MOBILE MENU =====
menuToggle.addEventListener('click', () => {
    setMenuState(!navLinks.classList.contains('active'));
});

// Close menu when clicking on a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        setMenuState(false);
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {

        const href = this.getAttribute('href');

        // executa apenas se for âncora interna (#id)
        if (!href || !href.startsWith('#')) return;

        const target = document.querySelector(href);

        if (!target) return;

        e.preventDefault();

        scrollToTarget(target);
    });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
function highlightNavLink() {
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.querySelectorAll('a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== LOAD PROJECTS =====
async function loadProjects() {
    try {
        const response = await fetch(PROJECTS_ENDPOINT);
        state.projects = await response.json();
        updateProjectStats(state.projects);
        renderProjects();
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        projectsGrid.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Nao foi possivel carregar os projetos agora.</p>';
    }
}

function renderProjects() {
    if (typeof state.carouselCleanup === 'function') {
        state.carouselCleanup();
        state.carouselCleanup = null;
    }

    projectsGrid.innerHTML = '';
    state.projectLayout = getProjectLayout();

    const cards = state.projects.map((project, index) => createProjectCard(project, index));

    if (!cards.length) {
        projectsGrid.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Nenhum projeto disponivel no momento.</p>';
        return;
    }

    if (state.projectLayout === 'carousel') {
        const carousel = createCarousel(cards);
        projectsGrid.appendChild(carousel);
        state.carouselCleanup = initEnhancedCarousel(carousel, cards.length);
    } else {
        cards.forEach((card) => projectsGrid.appendChild(card));
    }

    observeAnimatedElements();
}

function createCarousel(cards) {
    const carousel = createElement('div', 'projects-carousel', { tabindex: '0' });
    const prev = createElement('button', 'carousel-prev', { 'aria-label': 'Anterior', type: 'button' });
    const next = createElement('button', 'carousel-next', { 'aria-label': 'Próximo', type: 'button' });
    const viewport = createElement('div', 'carousel-viewport');
    const track = createElement('div', 'carousel-track');
    const dots = createElement('div', 'carousel-dots');

    prev.innerHTML = '&#10094;';
    next.innerHTML = '&#10095;';

    // Render three full sets so the carousel can keep moving forward
    // and be silently recentered without a visible "jump back".
    for (let setIndex = 0; setIndex < 3; setIndex += 1) {
        cards.forEach((card, cardIndex) => {
            const item = card.cloneNode(true);
            item.dataset.sequence = String(cardIndex + 1);
            item.dataset.set = String(setIndex);
            track.appendChild(item);
        });
    }

    viewport.appendChild(track);
    carousel.append(prev, viewport, next, dots);

    return carousel;
}

// ===== CAROUSEL =====
function initEnhancedCarousel(carousel, originalCount) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const dotsContainer = carousel.querySelector('.carousel-dots');

    const items = Array.from(track.children);
    let index = originalCount; // start in the middle set
    let isTransitioning = false;
    let autoplay = null;

    function getWrappedIndex(value) {
        return ((value % originalCount) + originalCount) % originalCount;
    }

    function recenterIndex(currentIndex) {
        const normalizedIndex = getWrappedIndex(currentIndex);
        return originalCount + normalizedIndex;
    }

    // build dots
    const dots = [];
    for (let i = 0; i < originalCount; i++) {
        const d = createElement('button', 'carousel-dot', {
            'aria-label': `Ir para projeto ${i + 1}`,
            'data-slide': String(i + 1),
            type: 'button'
        });
        dotsContainer.appendChild(d);
        dots.push(d);
        d.addEventListener('click', () => {
            index = i + 1;
            moveToIndex();
            resetAutoplay();
        });
    }

    function updateDots() {
        const active = getWrappedIndex(index);
        dots.forEach((d, i) => d.classList.toggle('active', i === active));
    }

    function moveToIndex(noTransition = false) {
        track.classList.toggle('is-resetting', noTransition);
        track.style.transition = noTransition ? 'none' : '';

        const target = items[index];
        if (!target) return;

        const offset = target.offsetLeft - ((viewport.clientWidth - target.clientWidth) / 2);
        track.style.transform = `translateX(-${offset}px)`;

        const currentSequence = getWrappedIndex(index);
        const previousIndex = getWrappedIndex(index - 1);
        const nextIndex = getWrappedIndex(index + 1);

        items.forEach((item, itemIndex) => {
            const wrappedItemIndex = getWrappedIndex(itemIndex);

            item.classList.toggle('is-center', itemIndex === index);
            item.classList.toggle('is-prev', wrappedItemIndex === previousIndex && itemIndex !== index);
            item.classList.toggle('is-next', wrappedItemIndex === nextIndex && itemIndex !== index);
            item.classList.toggle('is-side', wrappedItemIndex === previousIndex || wrappedItemIndex === nextIndex);
            item.classList.toggle('is-current-sequence', wrappedItemIndex === currentSequence);
        });
        updateDots();

        if (noTransition) {
            // force reflow then restore
            requestAnimationFrame(() => {
                track.classList.remove('is-resetting');
                track.style.transition = '';
            });
        }
    }

    prev.addEventListener('click', () => {
        if (isTransitioning) return;
        index = index - 1;
        moveToIndex();
        resetAutoplay();
    });

    next.addEventListener('click', () => {
        if (isTransitioning) return;
        index = index + 1;
        moveToIndex();
        resetAutoplay();
    });

    track.addEventListener('transitionstart', () => {
        isTransitioning = true;
        carousel.classList.add('is-animating');
    });
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        carousel.classList.remove('is-animating');

        // Recenters to the middle set invisibly so the forward sequence
        // stays 1,2,3,1,2,3... without a visible rewind.
        if (index < originalCount || index >= originalCount * 2) {
            index = recenterIndex(index);
            moveToIndex(true);
        }
    });

    // keyboard
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prev.click();
        if (e.key === 'ArrowRight') next.click();
    });

    function startAutoplay() {
        if (autoplay) return;
        autoplay = setInterval(() => {
            index = (index + 1);
            moveToIndex();
        }, 3500);
    }

    function stopAutoplay() {
        if (!autoplay) return;
        clearInterval(autoplay);
        autoplay = null;
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    // initial layout after images load
    setTimeout(() => {
        moveToIndex(true);
        startAutoplay();
    }, 80);

    return () => {
        stopAutoplay();
    };
}

function createProjectCard(project, index) {
    const card = createElement('article', 'project-card', {
        'data-index': String(index),
        tabindex: '0'
    });
    const projectNumber = String(index + 1).padStart(2, '0');
    const imagePath = getImagePath(project.image);
    card.innerHTML = `
        <div class="project-image">
            <img src="${imagePath}" alt="${project.title}" loading="lazy" decoding="async" data-fallback-src="images/logo.png">
        </div>
        <div class="project-info">
            <div class="project-meta">
                <span class="project-index">Projeto ${projectNumber}</span>
                <span class="project-action">Ver detalhes <i class="fas fa-arrow-right"></i></span>
            </div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    const openProject = () => openModal(project);
    card.addEventListener('click', openProject);
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openProject();
        }
    });
    
    return card;
}

// ===== MODAL =====
function openModal(project) {
    const imagePath = getImagePath(project.image);

    const modalImage = document.getElementById('modalImage');
    modalImage.src = imagePath;
    modalImage.alt = project.title;
    modalImage.dataset.fallbackSrc = 'images/logo.png';
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDescription').textContent = project.description;
    
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = project.tags.map(tag => 
        `<span class="tech-tag">${tag}</span>`
    ).join('');
    
    document.getElementById('modalRepo').href = project.repo;
    document.getElementById('modalLive').href = project.url;
    const modalRepoEl = document.getElementById('modalRepo');
    if (project.repo) {
        modalRepoEl.href = project.repo;
        modalRepoEl.style.display = '';
    } else {
        modalRepoEl.style.display = 'none';
    }
    const modalLiveEl = document.getElementById('modalLive');
    if (project.url) {
        modalLiveEl.href = project.url;
        modalLiveEl.style.display = '';
    } else {
        modalLiveEl.style.display = 'none';
    }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function setupImageFallbacks() {
    document.querySelectorAll('img[data-fallback-src]').forEach((image) => {
        image.addEventListener('error', () => {
            const fallbackSrc = image.dataset.fallbackSrc;
            if (!fallbackSrc) return;
            image.src = fallbackSrc;
        }, { once: true });
    });
}

function setupPreferredImages() {
    document.querySelectorAll('img[data-preferred-src]').forEach((image) => {
        const preferredSrc = image.dataset.preferredSrc;
        if (!preferredSrc) return;

        const preferredImage = new Image();
        preferredImage.decoding = 'async';
        preferredImage.onload = () => {
            image.src = preferredSrc;
        };
        preferredImage.src = preferredSrc;
    });
}

function ensureInstagramEmbeds() {
    if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
        return Promise.resolve();
    }

    if (state.instagramScriptLoaded) {
        return Promise.resolve();
    }

    state.instagramScriptLoaded = true;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.onload = () => {
            window.instgrm?.Embeds?.process?.();
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

function setupInstagramEmbeds() {
    if (!instagramSection) return;

    const embedObserver = new IntersectionObserver((entries, observerInstance) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (!isVisible) return;

        ensureInstagramEmbeds().catch((error) => {
            console.error('Erro ao carregar embeds do Instagram:', error);
        });
        observerInstance.disconnect();
    }, {
        rootMargin: '200px 0px'
    });

    embedObserver.observe(instagramSection);
}

function updateFooterYear() {
    if (!copyrightText) return;
    copyrightText.textContent = `© ${new Date().getFullYear()} Anderson Jr. Todos os direitos reservados.`;
}

function handleResize() {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(() => {
        if (!state.projects.length) return;

        const nextLayout = getProjectLayout();
        if (nextLayout !== state.projectLayout || nextLayout === 'carousel') {
            renderProjects();
        }
    }, 120);
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// ===== FORM SUBMISSION =====
contactForm.addEventListener('submit', function(e) {
    // Netlify handles the form submission automatically when deployed
    // For local testing, show a message
    if (LOCAL_HOSTS.has(window.location.hostname)) {
        e.preventDefault();
        alert('✅ Mensagem enviada com sucesso!\n\nNota: Em produção (Netlify), as mensagens são enviadas automaticamente.');
        contactForm.reset();
    }
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

function observeAnimatedElements() {
    document.querySelectorAll('.skill-card, .project-card, .contact-card').forEach(el => {
        if (el.dataset.observed === 'true') return;

        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.dataset.observed = 'true';
        observer.observe(el);
    });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    setupImageFallbacks();
    setupPreferredImages();
    setupInstagramEmbeds();
    observeAnimatedElements();
    loadProjects();
    updateScrollUI();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    updateFooterYear();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
});

// ===== PERFORMANCE OPTIMIZATIONS =====

// Reduce animations on mobile
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
}

// Lazy load images
if (!('loading' in HTMLImageElement.prototype)) {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Console message
console.log('%c👨‍💻 Anderson Jr. - Desenvolvedor Full Stack', 'font-size: 20px; font-weight: bold; color: #7FA653;');
console.log('%cInteressado em trabalhar comigo? Entre em contato!', 'font-size: 14px; color: #666;');
console.log('%cWhatsApp: (31) 97153-3882', 'font-size: 12px; color: #7FA653;');
