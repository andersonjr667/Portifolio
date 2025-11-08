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
        
        projects.forEach((project, index) => {
            const card = createProjectCard(project, index);
            projectsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        projectsGrid.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Erro ao carregar projetos.</p>';
    }
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-index', index);
    
    const imagePath = `images/optimized/${project.id}`;
    
    card.innerHTML = `
        <div class="project-image">
            <picture>
                <source srcset="${imagePath}.webp" type="image/webp">
                <img src="${imagePath}-thumb.jpg" alt="${project.title}" loading="lazy">
            </picture>
        </div>
        <div class="project-info">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openModal(project));
    
    return card;
}

// ===== MODAL =====
function openModal(project) {
    const imagePath = `images/optimized/${project.id}`;
    
    document.getElementById('modalImage').src = `${imagePath}.jpg`;
    document.getElementById('modalImage').alt = project.title;
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDescription').textContent = project.description;
    
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = project.tags.map(tag => 
        `<span class="tech-tag">${tag}</span>`
    ).join('');
    
    document.getElementById('modalRepo').href = project.repo;
    document.getElementById('modalLive').href = project.url;
    
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
