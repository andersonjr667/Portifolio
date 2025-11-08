// Animações e efeitos visuais melhorados para o portfólio

// Intersection Observer para animações ao scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.skill-category, .achievement-card, .testimonial-card, .about-content > *');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
    
    // Efeito parallax suave no hero
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const heroContent = document.querySelector('.hero-content');
                
                if (heroContent && scrolled < 600) {
                    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                    heroContent.style.opacity = 1 - (scrolled / 600);
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Animação suave para os links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Adicionar efeito de hover nos cards de projeto
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Efeito de digitação no título hero (opcional)
    const heroTitle = document.querySelector('.hero h1 span');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Iniciar após um pequeno delay
        setTimeout(typeWriter, 500);
    }
    
    // Animação de contagem para números (se houver estatísticas)
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Efeito de brilho nos botões ao passar o mouse
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function(e) {
            const x = e.pageX - this.offsetLeft;
            const y = e.pageY - this.offsetTop;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background: rgba(255,255,255,0.5);
                border-radius: 50%;
                pointer-events: none;
                transform: translate(-50%, -50%) scale(0);
                animation: ripple 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Adicionar animação CSS para o ripple
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: translate(-50%, -50%) scale(15);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Lazy loading para imagens (já implementado via HTML, mas garantir)
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.src;
        });
    }
    
    // Adicionar classe active ao link de navegação correspondente ao scroll
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavOnScroll() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-links a[href*="${sectionId}"]`)?.classList.add('active-link');
            } else {
                document.querySelector(`.nav-links a[href*="${sectionId}"]`)?.classList.remove('active-link');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavOnScroll);
    
    // Adicionar estilo para link ativo
    if (!document.querySelector('#nav-active-style')) {
        const style = document.createElement('style');
        style.id = 'nav-active-style';
        style.textContent = `
            .nav-links a.active-link {
                color: var(--primary) !important;
            }
            .nav-links a.active-link:after {
                width: 100% !important;
            }
        `;
        document.head.appendChild(style);
    }
});

// Prevenir scroll horizontal
document.body.style.overflowX = 'hidden';

// Performance: reduzir animações se preferência do usuário
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
    
    const style = document.createElement('style');
    style.textContent = `
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(style);
}
