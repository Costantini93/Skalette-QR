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

  const supportedLangs = ['it', 'en', 'es', 'fr', 'de', 'ru'];
  const fallbackLang = 'it';
  const savedLang = localStorage.getItem("preferredLang");
  const browserLangCode = (navigator.language || navigator.languages?.[0] || '').slice(0, 2).toLowerCase();

  let initialLang = fallbackLang;
  if (savedLang && supportedLangs.includes(savedLang)) {
    initialLang = savedLang;
  } else if (supportedLangs.includes(browserLangCode)) {
    initialLang = browserLangCode;
  }

  let activeLang = initialLang;

  // --- FUNZIONI ---

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

  const setupSequentialNav = (currentId) => {
    const activeSection = document.getElementById(currentId);
    if (!activeSection) return;

    const navNextButton = activeSection.querySelector('#nav-next, .nav-next');
    const navPrevButton = activeSection.querySelector('#nav-prev, .nav-prev');

    const allIds = Array.from(mainButtonsGrid.querySelectorAll('.menu-button')).map(btn => btn.getAttribute('data-target'));
    const currentIndex = allIds.indexOf(currentId);
    const nextId = allIds[(currentIndex + 1) % allIds.length];
    const prevId = allIds[(currentIndex - 1 + allIds.length) % allIds.length];

    if (navNextButton) {
      navNextButton.onclick = () => handleMenuNavigation(nextId);
    }

    if (navPrevButton) {
      navPrevButton.onclick = () => handleMenuNavigation(prevId);
    }
  };

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
    targetSection.style.transform = 'rotateY(90deg)';
    targetSection.style.transformOrigin = originIn;
    targetSection.classList.remove('turn-in');
    void targetSection.offsetWidth;

    requestAnimationFrame(() => {
      targetSection.classList.add('turn-in');
      targetSection.style.opacity = '1';

      setTimeout(() => {
        targetSection.classList.remove('turn-in');
        targetSection.style.transform = 'rotateY(0deg)';
      }, 300);
    });

    setTimeout(() => {
      setupSequentialNav(targetId);
    }, 50);
  }

  buildSecondaryNavigation(targetId);
  if (secondaryNav) secondaryNav.style.display = 'block';
  if (menuContainer) menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
};






  const handleMenuNavigation = (targetId) => {
  const targetSection = document.getElementById(targetId);
  const currentActiveSection = document.querySelector('.menu-section[style*="display: block"]');

  const allIds = Array.from(mainButtonsGrid.querySelectorAll('.menu-button')).map(btn => btn.getAttribute('data-target'));
  const currentIndex = allIds.indexOf(currentActiveSection?.id);
  const targetIndex = allIds.indexOf(targetId);

  // ✅ Direzione corretta
  let direction = 'forward';
  if (targetIndex < currentIndex) direction = 'backward';
  if (targetIndex > currentIndex) direction = 'forward';

  const outClass = direction === 'forward' ? 'turn-out-forward' : 'turn-out-backward';
  const originOut = direction === 'forward' ? 'right center' : 'left center';
const originIn = direction === 'forward' ? 'right center' : 'left center';


  if (currentActiveSection) {
    currentActiveSection.style.transformOrigin = originOut;
    currentActiveSection.classList.add(outClass);

    setTimeout(() => {
      currentActiveSection.classList.remove(outClass);
      currentActiveSection.style.display = 'none';
      showNewSection(targetSection, targetId, originIn);
    }, 600);
  } else {
    showNewSection(targetSection, targetId, originIn);
  }
};







  // --- DROPDOWN LINGUA ---
  const arrow = currentLangBtn?.querySelector('.arrow');
  const isLangDropdownReady = currentLangBtn && langOptions;

  const closeDropdown = () => {
    if (isLangDropdownReady) {
      currentLangBtn.setAttribute('aria-expanded', 'false');
      langOptions.style.display = 'none';
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
  };

  const openDropdown = () => {
    if (isLangDropdownReady) {
      currentLangBtn.setAttribute('aria-expanded', 'true');
      langOptions.style.display = 'flex';
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
  };

  const updateCurrentFlagAndButtons = (lang) => {
    activeLang = lang;
    currentLangBtn.setAttribute('data-lang', lang);

    Array.from(currentLangBtn.childNodes).forEach(node => {
      const isArrow = node.classList?.contains('arrow');
      if (node.nodeType === 3 || (node.nodeType === 1 && !isArrow)) {
        currentLangBtn.removeChild(node);
      }
    });

    const selectedBtn = langOptions.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (selectedBtn) {
      const newFlag = selectedBtn.querySelector('.flag-icon')?.cloneNode(true);
      if (newFlag && arrow) currentLangBtn.insertBefore(newFlag, arrow);
      else if (newFlag) currentLangBtn.appendChild(newFlag);

      const newCode = document.createElement('span');
      newCode.className = 'lang-code';
      newCode.textContent = lang.toUpperCase();
      if (arrow) currentLangBtn.insertBefore(newCode, arrow);
      else currentLangBtn.appendChild(newCode);
    }

    langButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.disabled = isActive;
      btn.classList.toggle('active-lang', isActive);
      btn.style.display = 'inline-flex';
    });
  };

  // --- EVENTI ---

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

  if (isLangDropdownReady) {
    currentLangBtn.addEventListener('click', () => {
      const isExpanded = currentLangBtn.getAttribute('aria-expanded') === 'true';
      isExpanded ? closeDropdown() : openDropdown();
    });

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

  // --- INIZIALIZZAZIONE ---
  if (currentLangBtn) {
    updateCurrentFlagAndButtons(initialLang);
    closeDropdown();
  }

  translatePage(initialLang);
  showHome();
});
