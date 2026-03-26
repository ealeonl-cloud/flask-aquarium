document.addEventListener("DOMContentLoaded", function () {

    // ========== DOM ELEMENTS ==========
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Login modal elements
    const loginModal = document.getElementById('loginModal');
    const btnOpenLogin = document.getElementById('btnOpenLogin');
    const btnCloseLogin = document.getElementById('btnCloseLogin');
    const footerLogin = document.getElementById('footerLogin');
    const loginForm = document.getElementById('loginForm');
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginPasswordInput = document.getElementById('loginPassword');

    // Register modal elements
    const registerModal = document.getElementById('registerModal');
    const btnCloseRegister = document.getElementById('btnCloseRegister');
    const registerForm = document.getElementById('registerForm');
    const toggleRegPassword = document.getElementById('toggleRegPassword');
    const regPasswordInput = document.getElementById('regPassword');
    const regConfirmPasswordInput = document.getElementById('regConfirmPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');

    // Modal switching links
    const linkToRegister = document.getElementById('linkToRegister');
    const linkToLogin = document.getElementById('linkToLogin');


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


    // ========== MODAL HELPERS ==========
    function openModal(modal) {
        if (modal) {
            modal.classList.remove('closing');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.classList.remove('active', 'closing');
                document.body.style.overflow = '';
            }, 350);
        }
    }

    function switchModals(fromModal, toModal) {
        closeModal(fromModal);
        setTimeout(() => {
            openModal(toModal);
        }, 450);
    }


    // ========== LOGIN MODAL ==========
    if (btnOpenLogin) {
        btnOpenLogin.addEventListener('click', () => openModal(loginModal));
    }

    if (btnCloseLogin) {
        btnCloseLogin.addEventListener('click', () => closeModal(loginModal));
    }

    if (footerLogin) {
        footerLogin.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    }

    // Click outside to close login modal
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeModal(loginModal);
            }
        });
    }


    // ========== REGISTER MODAL ==========
    if (btnCloseRegister) {
        btnCloseRegister.addEventListener('click', () => closeModal(registerModal));
    }

    // Click outside to close register modal
    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) {
                closeModal(registerModal);
            }
        });
    }


    // ========== SWITCH BETWEEN MODALS ==========
    if (linkToRegister) {
        linkToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchModals(loginModal, registerModal);
        });
    }

    if (linkToLogin) {
        linkToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchModals(registerModal, loginModal);
        });
    }


    // ========== ESCAPE KEY TO CLOSE MODALS ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (loginModal && loginModal.classList.contains('active')) {
                closeModal(loginModal);
            }
            if (registerModal && registerModal.classList.contains('active')) {
                closeModal(registerModal);
            }
        }
    });


    // ========== TOGGLE PASSWORD VISIBILITY ==========
    function setupTogglePassword(toggleBtn, passwordField) {
        if (toggleBtn && passwordField) {
            toggleBtn.addEventListener('click', () => {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        }
    }

    setupTogglePassword(toggleLoginPassword, loginPasswordInput);
    setupTogglePassword(toggleRegPassword, regPasswordInput);


    // ========== PASSWORD STRENGTH CHECKER ==========
    function checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return score;
    }

    function updateStrengthUI(score) {
        const bars = document.querySelectorAll('#passwordStrength .strength-bar');
        const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
        const classes = ['', 'weak', 'fair', 'good', 'strong'];

        bars.forEach((bar, index) => {
            bar.className = 'strength-bar';
            if (index < score) {
                bar.classList.add(classes[score]);
            }
        });

        if (strengthText) {
            strengthText.textContent = labels[score] || '';
            strengthText.className = 'strength-text';
            if (score > 0) {
                strengthText.classList.add(classes[score]);
            }
        }
    }

    if (regPasswordInput && passwordStrength) {
        regPasswordInput.addEventListener('input', () => {
            const value = regPasswordInput.value;
            if (value.length > 0) {
                passwordStrength.classList.add('active');
                const score = checkPasswordStrength(value);
                updateStrengthUI(score);
            } else {
                passwordStrength.classList.remove('active');
                updateStrengthUI(0);
            }
        });
    }


    // ========== LOGIN FORM SUBMIT ==========
    if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const btn = loginForm.querySelector('.btn');
        const originalContent = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            const res = await fetch("/auth/login", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                // Redirección según rol
                window.location.href = "/dashboard";
            } else {
                alert(data.error || "Error al iniciar sesión");
            }

        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }

        btn.innerHTML = originalContent;
        btn.disabled = false;
    });
}


    // ========== REGISTER FORM SUBMIT ==========
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('regNombre').value;
            const email = document.getElementById('regEmail').value;
            const password = regPasswordInput.value;
            const confirmPassword = regConfirmPasswordInput.value;

            // Validate passwords match
            if (password !== confirmPassword) {
                regConfirmPasswordInput.classList.add('input-error');
                regConfirmPasswordInput.classList.remove('input-success');

                // Show a temporary error
                let errorEl = regConfirmPasswordInput.closest('.form-group').querySelector('.form-error');
                if (!errorEl) {
                    errorEl = document.createElement('div');
                    errorEl.className = 'form-error visible';
                    errorEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Las contraseñas no coinciden';
                    regConfirmPasswordInput.closest('.form-group').appendChild(errorEl);
                } else {
                    errorEl.classList.add('visible');
                }

                setTimeout(() => {
                    regConfirmPasswordInput.classList.remove('input-error');
                    if (errorEl) errorEl.classList.remove('visible');
                }, 3000);

                return;
            }

            // Validate password strength
            if (password.length < 8) {
                regPasswordInput.classList.add('input-error');
                setTimeout(() => regPasswordInput.classList.remove('input-error'), 3000);
                return;
            }

            const btn = registerForm.querySelector('.btn');
            const originalContent = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
            btn.disabled = true;

            if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('regNombre').value;
        const email = document.getElementById('regEmail').value;
        const password = regPasswordInput.value;
        const confirmPassword = regConfirmPasswordInput.value;

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        const btn = registerForm.querySelector('.btn');
        const originalContent = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("nombre", nombre);
            formData.append("email", email);
            formData.append("password", password);

            const res = await fetch("/auth/register", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                alert("Usuario registrado correctamente");

                closeModal(registerModal);
                registerForm.reset();

            } else {
                alert(data.error || "Error al registrar");
            }

        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }

        btn.innerHTML = originalContent;
        btn.disabled = false;
    });
}


    // Real-time confirm password validation
    if (regConfirmPasswordInput && regPasswordInput) {
        regConfirmPasswordInput.addEventListener('input', () => {
            if (regConfirmPasswordInput.value.length > 0) {
                if (regConfirmPasswordInput.value === regPasswordInput.value) {
                    regConfirmPasswordInput.classList.remove('input-error');
                    regConfirmPasswordInput.classList.add('input-success');
                } else {
                    regConfirmPasswordInput.classList.remove('input-success');
                    regConfirmPasswordInput.classList.add('input-error');
                }
            } else {
                regConfirmPasswordInput.classList.remove('input-error', 'input-success');
            }
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


    // Initial calls
    revealOnScroll();
    animateCounters();

});
