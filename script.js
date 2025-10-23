/* ========================================================== */
/* BACKGROUND SHADER (Three.js) */
/* ========================================================== */

let frag = `
vec4 abyssColor = vec4(0.0, 0.0, 0.0, 0.0); // nero trasparente
vec4 tunnelColor = vec4(0.5, 1.0, 1.5, 2.0); // blu notte brillante

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
  // === Shader ===
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

  // === Selettori ===
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

  // === Traduzione ===
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
        newButton.addEventListener('click', () => {
          const pageIndex = Array.from(document.querySelectorAll('#flipbook .page')).findIndex(
            page => page.id === targetId
          );
          if (pageIndex >= 0) {
            $("#flipbook").turn("page", pageIndex + 1);
          }
        });
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

  // === Turn.js ===
  $("#flipbook").turn({
  width: window.innerWidth,
  height: window.innerHeight,
  autoCenter: true,
  duration: 500,
  elevation: 50,
  gradients: true
});


  document.getElementById('nav-next').onclick = () => $("#flipbook").turn("next");
  document.getElementById('nav-prev').onclick = () => $("#flipbook").turn("previous");

  document.querySelectorAll('.menu-button').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      document.getElementById('main-buttons-grid').style.display = 'none';
      document.getElementById('flipbook').style.display = 'block';
      document.querySelector('.nav-buttons').style.display = 'block';

      const pageIndex = Array.from(document.querySelectorAll('#flipbook .page')).findIndex(
        page => page.id === targetId
      );
      if (pageIndex >= 0) {
        $("#flipbook").turn("page", pageIndex + 1);
      }
    });
  });

  // === Dropdown lingua ===
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

  // === Eventi lingua ===
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
        translatePage(selectedLang);
        closeDropdown();
      });
    });
  }

  // === Inizializzazione ===
  if (currentLangBtn) {
    updateCurrentFlagAndButtons(initialLang);
    closeDropdown();
  }

  translatePage(initialLang);
  showHome();
});

