let currentIndex = 0;
let autoSlideInterval;

function moveCarousel(direction) {
    const items = document.querySelectorAll('.carousel img');
    const totalItems = items.length;

    // Esconde a imagem atual
    items[currentIndex].style.display = 'none';
    items[currentIndex].classList.remove('active');

    // Atualiza o índice
    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = totalItems - 1;
    } else if (currentIndex >= totalItems) {
        currentIndex = 0;
    }

    // Mostra a nova imagem
    items[currentIndex].style.display = 'block';
    items[currentIndex].classList.add('active');
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        moveCarousel(1);
    }, 3000); // Alternar a cada 3 segundos
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

function openImage(src) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImage.src = src;
    stopAutoSlide();
}

function closeImage() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    startAutoSlide();
}

// Inicializa o carrossel quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.carousel img');
    items.forEach((item, index) => {
        if (index === 0) {
            item.style.display = 'block';
            item.classList.add('active');
        } else {
            item.style.display = 'none';
        }
    });
    startAutoSlide();
});
