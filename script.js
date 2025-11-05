/* ========================================================== */
/* BACKGROUND SHADER (Three.js) */
/* ========================================================== */

let frag = `
vec4 abyssColor = vec4(0.0, 0.0, 0.0, 0.0);
vec4 tunnelColor = vec4(0.5, 1.0, 1.5, 2.0);

uniform float time;
uniform vec2 resolution;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y * 0.6;
    float r = length(uv);
    float y = fract(r / 0.005 / (r - 0.01) + time * 1.0);
    y = smoothstep(0.01, 4.0, y);
    float x = length(uv);
    x = smoothstep(0.5, 0.01, x);
    gl_FragColor = mix(tunnelColor, abyssColor, x) * y;
}
`;

let scene, camera, renderer, animationId;
let geometry, material, mesh;
let startTime = Date.now();

/* ========================================================== */
/* INTERFACCIA E TRADUZIONE */
/* ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // === 1. DEFINIZIONI INIZIALI (Shader) ===
    function initBackground() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2);
        camera.position.z = 1;

        geometry = new THREE.PlaneGeometry(10, 10);
        material = new THREE.ShaderMaterial({
            uniforms: {
                time: { type: 'f', value: 1.0 },
                resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            fragmentShader: frag
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
    }

    function animateBackground() {
        animationId = requestAnimationFrame(animateBackground);
        let elapsedMilliseconds = Date.now() - startTime;
        material.uniforms.time.value = elapsedMilliseconds / 1000.0;
        renderer.render(scene, camera);
    }

    function resizeBackground() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', resizeBackground);
    initBackground();
    animateBackground();

   // === 2. SELETTORI E VARIABILI GLOBALI (Lingua e Navigazione) ===
const mainButtonsGrid = document.getElementById('main-buttons-grid');
const sections = document.querySelectorAll('.menu-section');
const menuContainer = document.getElementById('menu-container');
const secondaryNav = document.getElementById('secondary-navigation');
const secondaryGrid = document.getElementById('secondary-buttons-grid');
const translatableElements = document.querySelectorAll('[data-it]');
const dropdownContainer = document.getElementById('language-dropdown');

const supportedLangs = ['it', 'en', 'es', 'fr', 'de', 'ru'];
const fallbackLang = 'it';

// Selettori Lingua
const currentLangBtn = document.getElementById('current-lang-btn');
const langOptions = document.getElementById('lang-options');
const langButtons = document.querySelectorAll('#lang-options .lang-btn');
const arrow = currentLangBtn?.querySelector('.arrow');
const dropdownInner = document.querySelector('.dropdown-inner');

// Calcolo lingua iniziale
const savedLang = localStorage.getItem("preferredLang");
const browserLangCode = (navigator.language || navigator.languages?.[0] || '').slice(0, 2).toLowerCase();

let initialLang = fallbackLang;
if (savedLang && supportedLangs.includes(savedLang)) {
  initialLang = savedLang;
} else if (supportedLangs.includes(browserLangCode)) {
  initialLang = browserLangCode;
}
let activeLang = initialLang;

// === 3. FUNZIONI DI BASE LINGUA ===
const closeDropdown = () => {
  if (!currentLangBtn || !langOptions) return;
  currentLangBtn.setAttribute('aria-expanded', 'false');
  langOptions.style.display = 'none';
  if (arrow) arrow.style.transform = 'rotate(0deg)';
};

const openDropdown = () => {
  if (!currentLangBtn || !langOptions) return;
  currentLangBtn.setAttribute('aria-expanded', 'true');
  langOptions.style.display = 'block'; // Usiamo 'block' come verificato
  if (arrow) arrow.style.transform = 'rotate(180deg)';
};


    const updateCurrentFlagAndButtons = (lang) => {
        if (!currentLangBtn || !langOptions || !arrow) return;

        activeLang = lang;
        currentLangBtn.setAttribute('data-lang', lang);

        // Pulisce il contenuto (codice lingua e bandiera)
        Array.from(currentLangBtn.childNodes).forEach(node => {
            const isArrow = node.classList?.contains('arrow');
            if (node.nodeType === 3 || (node.nodeType === 1 && !isArrow)) {
                currentLangBtn.removeChild(node);
            }
        });

        // Trova il bottone selezionato nel menu dropdown
        const selectedBtn = langOptions.querySelector(`.lang-btn[data-lang="${lang}"]`);
        
        if (selectedBtn) {
            // Clona e inserisce bandiera
            const newFlag = selectedBtn.querySelector('.flag-icon')?.cloneNode(true);
            if (newFlag) currentLangBtn.insertBefore(newFlag, arrow);

            // Inserisce il codice lingua
            const newCode = document.createElement('span');
            newCode.className = 'lang-code';
            newCode.textContent = lang.toUpperCase();
            currentLangBtn.insertBefore(newCode, arrow);

            // Aggiorna la classe 'active' nei bottoni del menu
            langButtons.forEach(btn => {
                const isActive = btn.getAttribute('data-lang') === lang;
                btn.classList.toggle('active-lang', isActive);
                btn.disabled = isActive;
            });
        }
        localStorage.setItem("preferredLang", lang);
    };

    // === 4. FUNZIONI DI TRADUZIONE E NAVIGAZIONE ===
    
    const translatePage = (lang) => {
        translatableElements.forEach(element => {
            const translation = element.getAttribute(`data-${lang}`);
            const italian = element.getAttribute('data-it');
            if (!translation) return;

            const iconElement = element.querySelector('.whatsapp-icon-img') || element.querySelector('.review-icon');
            if (iconElement) {
                // Gestisce pulsanti con icone (per non cancellare l'icona)
                Array.from(element.childNodes).forEach(node => {
                    if (node.nodeType === 3) element.removeChild(node);
                    if (node.nodeType === 1 && node.tagName !== 'IMG' && !node.classList.contains('review-icon')) element.removeChild(node);
                });
                element.appendChild(document.createTextNode(` ${translation}`));
                return;
            }

            element.textContent = translation;

            // Gestione della traduzione affiancata per i nomi degli item
            if (element.classList.contains('item-name')) {
                let translationSpan = element.nextElementSibling;
                if (!translationSpan || !translationSpan.classList.contains('item-translation-it')) {
                    translationSpan = document.createElement('span');
                    translationSpan.className = 'item-translation-it';
                    element.parentNode.insertBefore(translationSpan, element.nextSibling);
                }

                translationSpan.textContent = lang !== 'it' ? italian : '';
                translationSpan.style.display = lang !== 'it' ? 'block' : 'none';
            }
        });

        if (secondaryNav && secondaryNav.style.display !== 'none') {
            const activeSection = document.querySelector('.menu-section[style*="display: block"]');
            if (activeSection) buildSecondaryNavigation(activeSection.id);
        }
    };

    const buildSecondaryNavigation = (activeTargetId) => {
        if (!secondaryGrid) return;
        secondaryGrid.innerHTML = '';

        mainButtonsGrid.querySelectorAll('.menu-button').forEach(originalButton => {
            const targetId = originalButton.getAttribute('data-target');
            if (targetId === activeTargetId) return;

            const newButton = originalButton.cloneNode(true);
            const translation = originalButton.getAttribute(`data-${activeLang}`);
            if (translation) newButton.textContent = translation;

            newButton.removeAttribute('id');
            newButton.addEventListener('click', () => {
                handleMenuNavigation(targetId);
            });

            secondaryGrid.appendChild(newButton);
        });
    };

    function setupSequentialNav(targetId) {
        const sectionOrder = Array.from(document.querySelectorAll('.menu-section')).map(s => s.id);
        const currentIndex = sectionOrder.indexOf(targetId);
        const currentSection = document.getElementById(targetId);

        const prevArrow = currentSection.querySelector('.nav-prev');
        const nextArrow = currentSection.querySelector('.nav-next');

        if (prevArrow) {
            prevArrow.style.display = currentIndex > 0 ? 'inline-block' : 'none';
            prevArrow.onclick = () => handleMenuNavigation(sectionOrder[currentIndex - 1], 'forward');
        }

        if (nextArrow) {
            nextArrow.style.display = currentIndex < sectionOrder.length - 1 ? 'inline-block' : 'none';
            nextArrow.onclick = () => handleMenuNavigation(sectionOrder[currentIndex + 1], 'backward');
        }
    }

    const showHome = () => {
        sections.forEach(section => section.style.display = 'none');
        if (mainButtonsGrid) mainButtonsGrid.style.display = 'flex';
        if (secondaryNav) secondaryNav.style.display = 'none';
        if (menuContainer) menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const showNewSection = (targetSection, targetId, originIn = 'left center') => {
        if (mainButtonsGrid) mainButtonsGrid.style.display = 'none';
        sections.forEach(section => section.style.display = 'none');

        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.style.opacity = '0';
            targetSection.style.transformOrigin = originIn;
            targetSection.classList.remove('turn-in');
            targetSection.style.transform = 'rotateY(90deg)';
            void targetSection.offsetWidth;

            requestAnimationFrame(() => {
                targetSection.classList.add('turn-in');
                targetSection.style.opacity = '1';

                setTimeout(() => {
                    targetSection.classList.remove('turn-in');
                    targetSection.style.transform = 'rotateY(0deg)';
                }, 100);
            });

            setTimeout(() => {
                setupSequentialNav(targetId);
            }, 50);
        }

        buildSecondaryNavigation(targetId);
        if (secondaryNav) secondaryNav.style.display = 'block';
        if (menuContainer) menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleMenuNavigation = (targetId, explicitDirection = null) => {
        const targetSection = document.getElementById(targetId);
        const currentActiveSection = document.querySelector('.menu-section[style*="display: block"]');

        const allIds = Array.from(mainButtonsGrid.querySelectorAll('.menu-button')).map(btn => btn.getAttribute('data-target'));
        const currentIndex = allIds.indexOf(currentActiveSection?.id);
        const targetIndex = allIds.indexOf(targetId);
        
        let direction;
        if (explicitDirection) {
            direction = explicitDirection;
        } else {
            direction = targetIndex > currentIndex ? 'backward' : 'forward';
        }

        const outClass = direction === 'forward' ? 'turn-out-forward' : 'turn-out-backward';
        const originOut = direction === 'forward' ? 'left center' : 'right center';
        const originIn = direction === 'forward' ? 'left center' : 'right center';

        if (currentActiveSection) {
            currentActiveSection.style.transformOrigin = originOut;
            currentActiveSection.classList.add(outClass);

            setTimeout(() => {
                currentActiveSection.classList.remove(outClass);
                currentActiveSection.style.display = 'none';
                showNewSection(targetSection, targetId, originIn);
            }, 100);
        } else {
            showNewSection(targetSection, targetId, originIn);
        }
    };
    
    // === 5. REGISTRAZIONE EVENTI ===
    
    // 5.1 Navigazione Menu Principale
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            handleMenuNavigation(targetId);
        });
    });

    // 5.2 Navigazione Freccette Header
    document.querySelectorAll('.menu-header').forEach(header => {
        const targetId = header.getAttribute('data-target');
        const allIds = Array.from(document.querySelectorAll('.menu-header')).map(h => h.getAttribute('data-target'));
        const currentIndex = allIds.indexOf(targetId);

        const prevArrow = header.querySelector('.nav-prev');
        const nextArrow = header.querySelector('.nav-next');

        if (prevArrow && currentIndex > 0) {
            const prevId = allIds[currentIndex - 1];
            prevArrow.addEventListener('click', () => {
                handleMenuNavigation(prevId, 'forward'); 
            });
        }

        if (nextArrow && currentIndex < allIds.length - 1) {
            const nextId = allIds[currentIndex + 1];
            nextArrow.addEventListener('click', () => {
                handleMenuNavigation(nextId, 'backward'); 
            });
        }
    });


    // 5.3 Eventi Lingua
    
    
    // Toggle (Apertura/Chiusura)
    currentLangBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isExpanded = currentLangBtn.getAttribute('aria-expanded') === 'true';
        isExpanded ? closeDropdown() : openDropdown();
    });

   // Selezione Lingua
langButtons.forEach(btn => {
    btn.addEventListener('click', (event) => { // <-- Accetta l'oggetto event
        event.stopPropagation(); // ✅ AGGIUNGI QUESTO
        
        const selectedLang = btn.getAttribute('data-lang');
        if (selectedLang === activeLang) {
            closeDropdown();
            return;
        }
        updateCurrentFlagAndButtons(selectedLang);
        translatePage(selectedLang);
        closeDropdown();
    });
});

    
    // Chiudi il menu quando si clicca fuori (listener globale)
    // Usiamo il contenitore più esterno (#language-dropdown) che include sia il bottone che le opzioni.
    document.addEventListener('click', (event) => {
        const dropdownContainer = document.getElementById('language-dropdown'); // Rileggi l'elemento se non è già definito
        
        // Se l'elemento esiste E se il click NON è all'interno del contenitore del dropdown
        if (dropdownContainer && !dropdownContainer.contains(event.target)) {
            closeDropdown();
        }
    });

    // === 6. AVVIO INIZIALE ===
    
    // Inizializza lingua e traduce
    updateCurrentFlagAndButtons(initialLang);
    translatePage(initialLang);
    
    // Chiudi il menu e mostra la Home
    closeDropdown();
    showHome(); 

    // Esposizione delle funzioni globali (per uso esterno se necessario)
    window.applyLanguage = function(lang) {
        activeLang = lang;
        updateCurrentFlagAndButtons(lang);
        translatePage(lang);
    };

    window.updateCurrentFlag = function(lang) {
        updateCurrentFlagAndButtons(lang);
    };

    window.closeDropdown = closeDropdown;
    window.openDropdown = openDropdown;

});