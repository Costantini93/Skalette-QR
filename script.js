/* ========================================================== */
/* BACKGROUND SHADER (Three.js) */
/* ========================================================== */

let frag = `
vec4 abyssColor = vec4(0.05, 0.1, 0.2, 0.0); // blu navy scuro trasparente
vec4 tunnelColor = vec4(0.2, 0.4, 0.8, 1.5); // blu brillante con accenti turchesi

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
  // ========================================================== 
  // CACHE DOM ELEMENTS
  // ========================================================== 
  const elements = {
    mainButtonsGrid: document.getElementById('main-buttons-grid'),
    sections: document.querySelectorAll('.menu-section'),
    menuContainer: document.getElementById('menu-container'),
    secondaryNav: document.getElementById('secondary-navigation'),
    secondaryGrid: document.getElementById('secondary-buttons-grid'),
    currentLangBtn: document.getElementById('current-lang-btn'),
    langOptions: document.getElementById('lang-options'),
    langButtons: document.querySelectorAll('#lang-options .lang-btn'),
    translatableElements: document.querySelectorAll('[data-it]')
  };

  // Language configuration
  const langConfig = {
    supported: ['it', 'en', 'es', 'fr', 'de', 'ru'],
    fallback: 'it',
    saved: localStorage.getItem("preferredLang"),
    browser: (navigator.language || navigator.languages?.[0] || '').slice(0, 2).toLowerCase()
  };

  // Initialize language
  const activeLang = {
    current: langConfig.saved && langConfig.supported.includes(langConfig.saved) 
      ? langConfig.saved 
      : langConfig.supported.includes(langConfig.browser) 
        ? langConfig.browser 
        : langConfig.fallback
  };

  // Animation helpers
  const animations = {
    fadeIn: (element, duration = 300) => {
      element.style.opacity = '0';
      element.style.display = 'block';
      requestAnimationFrame(() => {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = '1';
      });
    },
    rotate: (element, degrees, duration = 300) => {
      element.style.transition = `transform ${duration}ms`;
      element.style.transform = `rotate(${degrees}deg)`;
    }
  };

  // ========================================================== 
  // CORE FUNCTIONS
  // ========================================================== 
  const core = {
    translatePage: (lang) => {
      elements.translatableElements.forEach(element => {
        const translation = element.getAttribute(`data-${lang}`);
        if (!translation) return;

        const isMenuItem = element.classList.contains('item-name');
        const hasIcon = element.querySelector('.whatsapp-icon-img, .review-icon');

        if (hasIcon) {
          element.childNodes.forEach(node => {
            if (node.nodeType === 3) node.remove();
          });
          element.appendChild(document.createTextNode(` ${translation}`));
          return;
        }

        element.textContent = translation;

        if (isMenuItem) {
          core.handleMenuItemTranslation(element, lang);
        }
      });

      if (elements.secondaryNav?.style.display !== 'none') {
        const activeSection = document.querySelector('.menu-section[style*="display: block"]');
        if (activeSection) core.buildSecondaryNavigation(activeSection.id);
      }
    },

    handleMenuItemTranslation: (element, lang) => {
      let translationSpan = element.nextElementSibling;
      const italian = element.getAttribute('data-it');

      if (!translationSpan?.classList.contains('item-translation-it')) {
        translationSpan = document.createElement('span');
        translationSpan.className = 'item-translation-it';
        element.parentNode.insertBefore(translationSpan, element.nextSibling);
      }

      translationSpan.textContent = lang !== 'it' ? italian : '';
      translationSpan.style.display = lang !== 'it' ? 'block' : 'none';
    },

    initBackground: () => {
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
    },

    animateBackground: () => {
      animationId = requestAnimationFrame(core.animateBackground);
      let elapsedMilliseconds = Date.now() - startTime;
      material.uniforms.time.value = elapsedMilliseconds / 1000.0;
      renderer.render(scene, camera);
    },

    resizeBackground: () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    },

    buildSecondaryNavigation: (activeTargetId) => {
      if (!elements.secondaryGrid) return;
      elements.secondaryGrid.innerHTML = '';

      elements.mainButtonsGrid.querySelectorAll('.menu-button').forEach(originalButton => {
        const targetId = originalButton.getAttribute('data-target');
        if (targetId === activeTargetId) return;

        const newButton = originalButton.cloneNode(true);
        const translation = originalButton.getAttribute(`data-${activeLang.current}`);
        if (translation) newButton.textContent = translation;

        newButton.removeAttribute('id');
        newButton.addEventListener('click', () => {
          handlers.menuNavigation(targetId);
        });

        elements.secondaryGrid.appendChild(newButton);
      });
    },

    setupSequentialNav: (targetId) => {
      const sectionOrder = Array.from(document.querySelectorAll('.menu-section')).map(s => s.id);
      const currentIndex = sectionOrder.indexOf(targetId);
      const currentSection = document.getElementById(targetId);

      const prevArrow = currentSection.querySelector('.nav-prev');
      const nextArrow = currentSection.querySelector('.nav-next');

      if (prevArrow) {
        prevArrow.style.display = currentIndex > 0 ? 'inline-block' : 'none';
        prevArrow.onclick = () => handlers.menuNavigation(sectionOrder[currentIndex - 1]);
      }

      if (nextArrow) {
        nextArrow.style.display = currentIndex < sectionOrder.length - 1 ? 'inline-block' : 'none';
        nextArrow.onclick = () => handlers.menuNavigation(sectionOrder[currentIndex + 1]);
      }
    },

    getNavigationDirection: (currentId, targetId) => {
      const allIds = Array.from(elements.mainButtonsGrid.querySelectorAll('.menu-button')).map(btn => btn.getAttribute('data-target'));
      const currentIndex = allIds.indexOf(currentId);
      const targetIndex = allIds.indexOf(targetId);
      return targetIndex > currentIndex ? 'backward' : 'forward';
    },

    animateMenuTransition: (current, target, direction) => {
      if (current) {
        const outClass = direction === 'forward' ? 'turn-out-forward' : 'turn-out-backward';
        const originOut = direction === 'forward' ? 'left center' : 'right center';
        current.style.transformOrigin = originOut;
        current.classList.add(outClass);

        // Attendi che l'animazione termini (500ms da CSS @keyframes)
        setTimeout(() => {
          current.classList.remove(outClass);
          current.style.display = 'none';
          current.style.transform = 'rotateY(0deg)';
          current.style.opacity = '1';
          core.showNewSection(target);
        }, 500); 
      } else {
        core.showNewSection(target);
      }
    },

    showNewSection: (targetSection) => {
      elements.sections.forEach(section => {
        section.style.display = section === targetSection ? 'block' : 'none';
      });
      if (elements.mainButtonsGrid) elements.mainButtonsGrid.style.display = 'none';
      if (elements.secondaryNav) elements.secondaryNav.style.display = 'block';
      if (elements.menuContainer) elements.menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Animazione page flip in
      targetSection.style.transformOrigin = 'left center';
      targetSection.classList.add('turn-in');

      setTimeout(() => {
        targetSection.classList.remove('turn-in');
        targetSection.style.transform = 'rotateY(0deg)';
        targetSection.style.opacity = '1';
      }, 500);

      setTimeout(() => {
        core.setupSequentialNav(targetSection.id);
      }, 50);

      core.buildSecondaryNavigation(targetSection.id);
    },

    // Initialize
    init: () => {
      core.translatePage(activeLang.current);
      core.initBackground();
      core.animateBackground();
      core.setupEventListeners();
      core.showHome();
    },

    setupEventListeners: () => {
      window.addEventListener('resize', core.resizeBackground);

      // Bottoni categorie
      elements.mainButtonsGrid.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', () => {
          const targetId = button.getAttribute('data-target');
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            core.showNewSection(targetSection);
          }
        });
      });

      // Frecce navigazione intestazioni
      document.querySelectorAll('.menu-header').forEach(header => {
        const targetId = header.getAttribute('data-target');
        const allIds = Array.from(document.querySelectorAll('.menu-header')).map(h => h.getAttribute('data-target'));
        const currentIndex = allIds.indexOf(targetId);

        const prevArrow = header.querySelector('.nav-prev');
        const nextArrow = header.querySelector('.nav-next');

        if (prevArrow && currentIndex > 0) {
          const prevId = allIds[currentIndex - 1];
          prevArrow.addEventListener('click', () => {
            const prevSection = document.getElementById(prevId);
            if (prevSection) core.showNewSection(prevSection);
          });
        }

        if (nextArrow && currentIndex < allIds.length - 1) {
          const nextId = allIds[currentIndex + 1];
          nextArrow.addEventListener('click', () => {
            const nextSection = document.getElementById(nextId);
            if (nextSection) core.showNewSection(nextSection);
          });
        }
      });

      // Lingua: selezione dal menu a tendina
      if (isLangDropdownReady) {
        elements.langButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            if (selectedLang === activeLang.current) {
              closeDropdown();
              return;
            }
            activeLang.current = selectedLang;
            localStorage.setItem("preferredLang", selectedLang);
            updateCurrentFlagAndButtons(selectedLang);
            core.translatePage(selectedLang);
            closeDropdown();
          });
        });
      }

      // ========================================================== 
      // TOUCH SWIPE SUPPORT (Mobile Page Flip)
      // ========================================================== 
      let touchStartX = 0;
      let touchStartY = 0;
      const swipeThreshold = 50; // Minimo pixels per registrare swipe

      document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      document.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 0) return;
        
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touch.clientY);

        // Solo se lo swipe è principalmente orizzontale (non verticale)
        if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
          // Trova la sezione attiva
          const activeSection = Array.from(elements.sections).find(
            s => s.style.display === 'block'
          );

          if (!activeSection) return; // Non c'è sezione attiva

          const allSectionIds = Array.from(elements.sections).map(s => s.id);
          const currentIndex = allSectionIds.indexOf(activeSection.id);

          if (diffX > 0) {
            // Swipe sinistro → Vai alla pagina SUCCESSIVA (forward)
            if (currentIndex < allSectionIds.length - 1) {
              const nextId = allSectionIds[currentIndex + 1];
              handlers.menuNavigation(nextId);
            }
          } else {
            // Swipe destro → Vai alla pagina PRECEDENTE (backward)
            if (currentIndex > 0) {
              const prevId = allSectionIds[currentIndex - 1];
              handlers.menuNavigation(prevId);
            }
          }
        }
      }, { passive: true });
    },

    showHome: () => {
      elements.sections.forEach(section => section.style.display = 'none');
      if (elements.mainButtonsGrid) elements.mainButtonsGrid.style.display = 'flex';
      if (elements.secondaryNav) elements.secondaryNav.style.display = 'none';
      if (elements.menuContainer) elements.menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // UI updates
  const ui = {
    updateLanguageUI: (lang) => {
      elements.langButtons.forEach(btn => {
        const isActive = btn.getAttribute('data-lang') === lang;
        btn.disabled = isActive;
        btn.classList.toggle('active-lang', isActive);
        btn.style.display = 'inline-flex';
      });

      const selectedBtn = elements.langOptions.querySelector(`.lang-btn[data-lang="${lang}"]`);
      if (selectedBtn) {
        const newFlag = selectedBtn.querySelector('.flag-icon')?.cloneNode(true);
        if (newFlag && elements.currentLangBtn.querySelector('.arrow')) {
          elements.currentLangBtn.insertBefore(newFlag, elements.currentLangBtn.querySelector('.arrow'));
        } else if (newFlag) {
          elements.currentLangBtn.appendChild(newFlag);
        }

        const newCode = document.createElement('span');
        newCode.className = 'lang-code';
        newCode.textContent = lang.toUpperCase();
        elements.currentLangBtn.appendChild(newCode);
      }
    }
  };

  // Event handlers
  const handlers = {
    languageChange: (lang) => {
      localStorage.setItem("preferredLang", lang);
      activeLang.current = lang;
      core.translatePage(lang);
      ui.updateLanguageUI(lang);
    },

    menuNavigation: (targetId) => {
      const current = document.querySelector('.menu-section[style*="display: block"]');
      const target = document.getElementById(targetId);
      
      if (!target) return;

      const direction = core.getNavigationDirection(current?.id, targetId);
      core.animateMenuTransition(current, target, direction);
    }
  };

  // === Dropdown lingua ===
  const arrow = elements.currentLangBtn?.querySelector('.arrow');
  const isLangDropdownReady = elements.currentLangBtn && elements.langOptions;

  // ========================================================== 
  // DROPDOWN FUNCTIONS
  // ========================================================== 
  const closeDropdown = () => {
    if (isLangDropdownReady) {
      elements.currentLangBtn.setAttribute('aria-expanded', 'false');
      elements.langOptions.style.display = 'none';
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
  };

  const openDropdown = () => {
    if (isLangDropdownReady) {
      elements.currentLangBtn.setAttribute('aria-expanded', 'true');
      elements.langOptions.style.display = 'flex';
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
  };

  const updateCurrentFlagAndButtons = (lang) => {
    activeLang.current = lang;
    elements.currentLangBtn.setAttribute('data-lang', lang);

    Array.from(elements.currentLangBtn.childNodes).forEach(node => {
      const isArrow = node.classList?.contains('arrow');
      if (node.nodeType === 3 || (node.nodeType === 1 && !isArrow)) {
        elements.currentLangBtn.removeChild(node);
      }
    });

    const selectedBtn = elements.langOptions.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (selectedBtn) {
      const newFlag = selectedBtn.querySelector('.flag-icon')?.cloneNode(true);
      if (newFlag && arrow) elements.currentLangBtn.insertBefore(newFlag, arrow);
      else if (newFlag) elements.currentLangBtn.appendChild(newFlag);

      const newCode = document.createElement('span');
      newCode.className = 'lang-code';
      newCode.textContent = lang.toUpperCase();
      if (arrow) elements.currentLangBtn.insertBefore(newCode, arrow);
      else elements.currentLangBtn.appendChild(newCode);
    }
    elements.langButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.disabled = isActive;
      btn.classList.toggle('active-lang', isActive);
      btn.style.display = 'inline-flex';
    });
  };

  // === Eventi lingua ===
  if (isLangDropdownReady) {
    elements.currentLangBtn.addEventListener('click', () => {
      const isExpanded = elements.currentLangBtn.getAttribute('aria-expanded') === 'true';
      isExpanded ? closeDropdown() : openDropdown();
    });

    elements.langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedLang = btn.getAttribute('data-lang');
        if (selectedLang === activeLang) {
          closeDropdown();
          return;
        }

        localStorage.setItem("preferredLang", selectedLang);
        updateCurrentFlagAndButtons(selectedLang);
        core.translatePage(selectedLang);
        closeDropdown();
      });
    });
  }

  // INIZIALIZZAZIONE
  if (elements.currentLangBtn) {
    updateCurrentFlagAndButtons(activeLang.current);
    closeDropdown();
  }

  core.init();
});

