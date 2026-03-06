// ===================================
// ANDERSON JR. - PORTFÓLIO PROFISSIONAL
// Main JavaScript File
// ===================================

// DOM Elements
const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const scrollToTopBtn = document.getElementById('scrollToTop');
const projectsGrid = document.getElementById('projectsGrid');
const modal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
const modalOverlay = modal.querySelector('.modal-overlay');

// ===== SCROLL TO TOP =====
window.addEventListener('scroll', () => {
    // Show/hide scroll to top button
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
    
    // Add shadow to header on scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== MOBILE MENU =====
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close menu when clicking on a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');

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

window.addEventListener('scroll', highlightNavLink);

// ===== LOAD PROJECTS =====
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const projects = await response.json();
        const cards = projects.map((project, index) => createProjectCard(project, index));

        // Desktop/tablet: render improved infinite carousel; small phones: render grid
        const CAROUSEL_MIN_WIDTH = 600;
        if (window.innerWidth >= CAROUSEL_MIN_WIDTH && cards.length > 0) {
            projectsGrid.innerHTML = '';

            const carousel = document.createElement('div');
            carousel.className = 'projects-carousel';
            carousel.setAttribute('tabindex', '0');

            const prev = document.createElement('button');
            prev.className = 'carousel-prev';
            prev.setAttribute('aria-label', 'Anterior');
            prev.innerHTML = '&#10094;';

            const next = document.createElement('button');
            next.className = 'carousel-next';
            next.setAttribute('aria-label', 'Próximo');
            next.innerHTML = '&#10095;';

            const viewport = document.createElement('div');
            viewport.className = 'carousel-viewport';

            const track = document.createElement('div');
            track.className = 'carousel-track';

            // clones for infinite looping
            const firstClone = cards[0].cloneNode(true);
            const lastClone = cards[cards.length - 1].cloneNode(true);
            firstClone.dataset.clone = 'first';
            lastClone.dataset.clone = 'last';

            track.appendChild(lastClone);
            cards.forEach(card => track.appendChild(card));
            track.appendChild(firstClone);

            viewport.appendChild(track);

            const dots = document.createElement('div');
            dots.className = 'carousel-dots';

            carousel.appendChild(prev);
            carousel.appendChild(viewport);
            carousel.appendChild(next);
            carousel.appendChild(dots);

            projectsGrid.appendChild(carousel);

            initEnhancedCarousel(carousel, cards.length);
        } else {
            cards.forEach(card => projectsGrid.appendChild(card));
        }
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        projectsGrid.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Erro ao carregar projetos.</p>';
    }
}

// ===== CAROUSEL =====
function initEnhancedCarousel(carousel, originalCount) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const dotsContainer = carousel.querySelector('.carousel-dots');

    const items = Array.from(track.children);
    let index = 1; // start at first real item (after lastClone)
    let isTransitioning = false;
    let autoplay = null;

    // build dots
    const dots = [];
    for (let i = 0; i < originalCount; i++) {
        const d = document.createElement('button');
        d.className = 'carousel-dot';
        d.setAttribute('aria-label', `Ir para projeto ${i + 1}`);
        d.dataset.slide = i + 1; // corresponds to index in items
        dotsContainer.appendChild(d);
        dots.push(d);
        d.addEventListener('click', () => {
            index = i + 1;
            moveToIndex();
            resetAutoplay();
        });
    }

    function updateDots() {
        const active = index - 1;
        dots.forEach((d, i) => d.classList.toggle('active', i === active));
    }

    function moveToIndex(noTransition = false) {
        if (noTransition) track.style.transition = 'none';
        else track.style.transition = 'transform 0.5s cubic-bezier(0.2,0.8,0.2,1)';

        const target = items[index];
        if (!target) return;

        const viewportRect = viewport.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const offset = (target.offsetLeft + targetRect.width / 2) - (viewportRect.width / 2);
        track.style.transform = `translateX(-${offset}px)`;

        items.forEach((it, i) => it.classList.toggle('is-center', i === index));
        updateDots();

        if (noTransition) {
            // force reflow then restore
            requestAnimationFrame(() => { track.style.transition = ''; });
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

    track.addEventListener('transitionstart', () => { isTransitioning = true; });
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        // handle clones
        if (items[index].dataset.clone === 'first') {
            index = 1;
            moveToIndex(true);
        } else if (items[index].dataset.clone === 'last') {
            index = items.length - 2;
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

            window.addEventListener('resize', () => {
        if (window.innerWidth < CAROUSEL_MIN_WIDTH) location.reload();
        requestAnimationFrame(moveToIndex);
    });

    // initial layout after images load
    setTimeout(() => {
        moveToIndex(true);
        startAutoplay();
    }, 80);
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-index', index);
    const imagePath = `images/${project.image}`;
    card.innerHTML = `
        <div class="project-image">
            <img src="${imagePath}" alt="${project.title}" loading="lazy">
        </div>
        <div class="project-info">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        openModal(project);
    });
    
    return card;
}

// ===== MODAL =====
function openModal(project) {
    const imagePath = `images/${project.image}`;

    document.getElementById('modalImage').src = imagePath;
    document.getElementById('modalImage').alt = project.title;
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

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// ===== FORM SUBMISSION =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    // Netlify handles the form submission automatically when deployed
    // For local testing, show a message
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
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

// Observe elements for fade-in animation
document.querySelectorAll('.skill-card, .project-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    highlightNavLink();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Copyright year
    const year = new Date().getFullYear();
    const copyrightText = document.querySelector('.footer-bottom p');
    if (copyrightText && !copyrightText.textContent.includes(year)) {
        copyrightText.textContent = `© ${year} Anderson Jr. Todos os direitos reservados.`;
    }
});

// ===== PERFORMANCE OPTIMIZATIONS =====

// Reduce animations on mobile
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
}

// Lazy load images
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Console message
console.log('%c👨‍💻 Anderson Jr. - Desenvolvedor Full Stack', 'font-size: 20px; font-weight: bold; color: #7FA653;');
console.log('%cInteressado em trabalhar comigo? Entre em contato!', 'font-size: 14px; color: #666;');
console.log('%cWhatsApp: (31) 97153-3882', 'font-size: 12px; color: #7FA653;');
