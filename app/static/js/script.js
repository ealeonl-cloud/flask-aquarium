document.addEventListener("DOMContentLoaded", function () {

    // ========== DOM ELEMENTS ==========
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const loginModal = document.getElementById('loginModal');
    const btnOpenLogin = document.getElementById('btnOpenLogin');
    const btnCloseLogin = document.getElementById('btnCloseLogin');
    const footerLogin = document.getElementById('footerLogin');
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');


    // ========== NAVBAR SCROLL EFFECT ==========
    window.addEventListener('scroll', () => {

        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        updateActiveNavLink();
        revealOnScroll();
        animateCounters();
    });


    // ========== MOBILE MENU ==========
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle) navToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        });
    });


    // ========== ACTIVE NAV LINK ==========
    function updateActiveNavLink() {

        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {

            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {

                navLinks.forEach(link => {

                    link.classList.remove('active');

                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }

                });

            }

        });

    }


    // ========== LOGIN MODAL ==========
    function openLoginModal() {

        if (loginModal) {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

    }

    function closeLoginModal() {

        if (loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        }

    }

    if (btnOpenLogin) {
        btnOpenLogin.addEventListener('click', openLoginModal);
    }

    if (btnCloseLogin) {
        btnCloseLogin.addEventListener('click', closeLoginModal);
    }

    if (footerLogin) {

        footerLogin.addEventListener('click', (e) => {
            e.preventDefault();
            openLoginModal();
        });

    }

    if (loginModal) {

        loginModal.addEventListener('click', (e) => {

            if (e.target === loginModal) {
                closeLoginModal();
            }

        });

    }

    document.addEventListener('keydown', (e) => {

        if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
            closeLoginModal();
        }

    });


    // ========== TOGGLE PASSWORD ==========
    if (togglePassword && passwordInput) {

        togglePassword.addEventListener('click', () => {

            const type = passwordInput.getAttribute('type') === 'password'
                ? 'text'
                : 'password';

            passwordInput.setAttribute('type', type);

            const icon = togglePassword.querySelector('i');

            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }

        });

    }


    // ========== LOGIN FORM ==========
    if (loginForm) {

        loginForm.addEventListener('submit', (e) => {

            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = passwordInput.value;

            const btn = loginForm.querySelector('.btn');
            const originalContent = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
            btn.disabled = true;

            setTimeout(() => {

                alert(`Inicio de sesión simulado.\nCorreo: ${email}`);

                btn.innerHTML = originalContent;
                btn.disabled = false;

                closeLoginModal();
                loginForm.reset();

            }, 1500);

        });

    }


    // ========== SCROLL REVEAL ==========
    function revealOnScroll() {

        const reveals = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up');

        reveals.forEach(el => {

            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const revealPoint = 120;

            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('visible');
            }

        });

    }


    // ========== COUNTER ==========
    function animateCounters() {

        const counters = document.querySelectorAll('.stat-number');

        counters.forEach(counter => {

            const target = parseInt(counter.getAttribute('data-target'));
            const windowHeight = window.innerHeight;
            const elementTop = counter.getBoundingClientRect().top;

            if (elementTop < windowHeight - 100 && !counter.classList.contains('counted')) {

                counter.classList.add('counted');

                let current = 0;
                const increment = target / 60;
                const duration = 2000;
                const stepTime = duration / 60;

                const updateCounter = () => {

                    current += increment;

                    if (current < target) {

                        counter.textContent = Math.ceil(current).toLocaleString();
                        setTimeout(updateCounter, stepTime);

                    } else {

                        counter.textContent = target.toLocaleString() + '+';

                    }

                };

                updateCounter();

            }

        });

    }


    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener('click', function (e) {

            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            e.preventDefault();

            const targetElement = document.querySelector(targetId);

            if (targetElement) {

                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

            }

        });

    });


    revealOnScroll();
    animateCounters();

});