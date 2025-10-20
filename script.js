/* ========================================================== */
/* BACKGROUND SHADER (Three.js) */
/* ========================================================== */

let frag = `
vec4 abyssColor = vec4(0, 0, 0, 0);
vec4 tunnelColor = vec4(1.5, 1.2, 1.1, 1);

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

/* ========================================================== */
/* INTERFACCIA E TRADUZIONE - VERSIONE CORRETTA E CONSOLIDATA */
/* ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Variabili e Selettori
    const mainButtonsGrid = document.getElementById('main-buttons-grid');
    const sections = document.querySelectorAll('.menu-section');
    const menuContainer = document.getElementById('menu-container');

    const secondaryNav = document.getElementById('secondary-navigation');
    const secondaryGrid = document.getElementById('secondary-buttons-grid');
    const homePageButton = document.getElementById('home-page-btn');

    const currentLangBtn = document.getElementById('current-lang-btn');
    const langOptions = document.getElementById('lang-options');
    const langButtons = document.querySelectorAll('#lang-options .lang-btn');
    const translatableElements = document.querySelectorAll('[data-it]');
    
    // Lingue supportate e Fallback
    const supportedLangs = ['it', 'en', 'es', 'fr', 'de', 'ru'];
    const fallbackLang = 'it';
    
    // 2. Logica di Inizializzazione della Lingua
    const savedLang = localStorage.getItem("preferredLang");
    const browserLangCode = (navigator.language || navigator.languages?.[0] || '').slice(0, 2).toLowerCase();

    let initialLang = fallbackLang;
    if (savedLang && supportedLangs.includes(savedLang)) {
        initialLang = savedLang;
    } else if (supportedLangs.includes(browserLangCode)) {
        initialLang = browserLangCode;
    }

    let activeLang = initialLang;
    
    // --- FUNZIONI DI BASE (Traduzione e Navigazione) ---
    // Le funzioni devono essere definite prima di essere utilizzate negli addEventListener!

    const translatePage = (lang) => {
        translatableElements.forEach(element => {
            const translation = element.getAttribute(`data-${lang}`);
            if (translation) {
                const iconElement = element.querySelector('.whatsapp-icon-img') || element.querySelector('.review-icon');
                if (iconElement) {
                    Array.from(element.childNodes).forEach(node => {
                        if (node.nodeType === 3) element.removeChild(node);
                    });
                    element.appendChild(document.createTextNode(` ${translation}`));
                } else {
                    element.textContent = translation;
                }
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
            if (targetId !== activeTargetId) {
                const newButton = originalButton.cloneNode(true);
                const translation = originalButton.getAttribute(`data-${activeLang}`);
                if (translation) newButton.textContent = translation;
                newButton.removeAttribute('id');
                newButton.addEventListener('click', () => handleMenuNavigation(targetId));
                secondaryGrid.appendChild(newButton);
            }
        });
    };

    const showHome = () => {
        sections.forEach(section => section.style.display = 'none');
        if (mainButtonsGrid) mainButtonsGrid.style.display = 'flex';
        if (secondaryNav) secondaryNav.style.display = 'none';
        if (menuContainer) menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

   const handleMenuNavigation = (targetId) => {
        const targetSection = document.getElementById(targetId);
        const currentActiveSection = document.querySelector('.menu-section[style*="display: block"]');
        
        // 1. GESTIONE ANIMAZIONE DI USCITA
        if (currentActiveSection) {
            
            // Applica la classe di rotazione per far chiudere la pagina (animazione 0.6s)
            currentActiveSection.classList.add('turn-out'); 

            // Dopo la durata dell'animazione, procedi con il cambio effettivo
            setTimeout(() => {
                
                // Rimuovi la classe e nascondi la sezione vecchia
                currentActiveSection.classList.remove('turn-out');
                currentActiveSection.style.display = 'none';

                // 2. GESTIONE ANIMAZIONE DI ENTRATA (Sezione Nuova)
                showNewSection(targetSection, targetId);
                
            }, 600); // Durata dell'animazione CSS in millisecondi
            
        } else {
            // Se non c'è una sezione attiva (es. dalla Home), vai direttamente
            showNewSection(targetSection, targetId);
        }
    };
    
    // Funzione helper per evitare codice duplicato
    const showNewSection = (targetSection, targetId) => {
        
        if (mainButtonsGrid) mainButtonsGrid.style.display = 'none';

        // Nascondi TUTTE le sezioni per pulizia (anche se l'animata è già nascosta)
        sections.forEach(section => section.style.display = 'none');
        
        if (targetSection) {
            // Animazione di ingresso (il tuo fade-in esistente)
            targetSection.style.opacity = '0';
            targetSection.style.display = 'block';
            
            // Forza il reflow prima del cambio di opacità
            void targetSection.offsetWidth; 
            targetSection.style.opacity = '1';
        }
        
        buildSecondaryNavigation(targetId);
        if (secondaryNav) secondaryNav.style.display = 'block';
        if (menuContainer) menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

// --- LOGICA DEL DROPDOWN LINGUA (dal codice funzionante) ---
    
    const arrow = currentLangBtn?.querySelector('.arrow');
    
    // Controlliamo che gli elementi essenziali per il toggle esistano
    const isLangDropdownReady = currentLangBtn && langOptions; // Lasciato come controllo MINIMO

    const closeDropdown = () => {
        if (isLangDropdownReady) {
            currentLangBtn.setAttribute('aria-expanded', 'false');
            langOptions.style.display = 'none';
            // ✅ CORREZIONE: Controlla se 'arrow' esiste prima di usarlo
            if (arrow) arrow.style.transform = 'rotate(0deg)'; 
        }
    };

    const openDropdown = () => {
        if (isLangDropdownReady) {
            currentLangBtn.setAttribute('aria-expanded', 'true');
            langOptions.style.display = 'flex';
            // ✅ CORREZIONE: Controlla se 'arrow' esiste prima di usarlo
            if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
    };

    const updateCurrentFlagAndButtons = (lang) => {
        activeLang = lang;
        currentLangBtn.setAttribute('data-lang', lang);
        
        // 1. Pulizia: Rimuovi bandiera e codice precedenti
        Array.from(currentLangBtn.childNodes).forEach(node => {
            const isArrow = node.classList?.contains('arrow');
            if (node.nodeType === 3 || (node.nodeType === 1 && !isArrow)) { 
                currentLangBtn.removeChild(node);
            }
        });
        
        // 2. Trova il bottone corrispondente nel dropdown
        const selectedBtn = langOptions.querySelector(`.lang-btn[data-lang="${lang}"]`);

        if (selectedBtn) {
            // 3. Inserisce la nuova bandiera clonando
            const newFlag = selectedBtn.querySelector('.flag-icon')?.cloneNode(true);
            
            // ✅ CORREZIONE CRITICA (Aggiunto Fallback 1): Inserisce PRIMA della freccia, o in fondo
            if (newFlag && arrow) currentLangBtn.insertBefore(newFlag, arrow);
            else if (newFlag) currentLangBtn.appendChild(newFlag);

            // 4. Inserisce il codice lingua
            const newCode = document.createElement('span');
            newCode.className = 'lang-code';
            newCode.textContent = lang.toUpperCase();
            
            // ✅ CORREZIONE CRITICA (Aggiunto Fallback 2): Inserisce PRIMA della freccia, o in fondo
            if (arrow) currentLangBtn.insertBefore(newCode, arrow);
            else currentLangBtn.appendChild(newCode); 
        }

        // 5. Aggiorna stato dei bottoni
        langButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-lang') === lang;
            btn.disabled = isActive;
            btn.classList.toggle('active-lang', isActive);
            btn.style.display = 'inline-flex';
        });
    };

    // --- GESTIONE EVENTI INTERFACCIA E NAVIGAZIONE ---
    
    // 1. NAVIGAZIONE CATEGORIE 👈 FUNZIONA DI NUOVO PERCHÉ LE FUNZIONI SONO SOPRA
    if (mainButtonsGrid) {
        mainButtonsGrid.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                handleMenuNavigation(targetId);
            });
        });
    }

    if (homePageButton) {
        homePageButton.addEventListener('click', showHome);
    }

    // 2. DROPDOWN LINGUA
    if (isLangDropdownReady) {
        // Toggle (Apre/Chiude il menu)
        currentLangBtn.addEventListener('click', () => {
            const isExpanded = currentLangBtn.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        // Cambio Lingua
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedLang = btn.getAttribute('data-lang');
                
                if (selectedLang === activeLang) {
                    closeDropdown();
                    return;
                }

                localStorage.setItem("preferredLang", selectedLang);
                
                updateCurrentFlagAndButtons(selectedLang);
                closeDropdown();
                translatePage(selectedLang);
            });
        });
    }

    // --- INIZIALIZZAZIONE FINALE ---
    
    // Esegui l'aggiornamento visuale e la traduzione con la lingua iniziale
    if (currentLangBtn) {
        updateCurrentFlagAndButtons(initialLang);
        closeDropdown(); // Assicura che il menu sia CHIUSO all'avvio
    }

    translatePage(initialLang);
    showHome();
});
