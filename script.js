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
/* INTERFACCIA E TRADUZIONE */
/* ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const mainButtonsGrid = document.getElementById('main-buttons-grid');
  const sections = document.querySelectorAll('.menu-section');
  const menuContainer = document.getElementById('menu-container');

  const secondaryNav = document.getElementById('secondary-navigation');
  const secondaryGrid = document.getElementById('secondary-buttons-grid');
  const homePageButton = document.getElementById('home-page-btn');

  const currentLangBtn = document.getElementById('current-lang-btn');
  const langOptions = document.getElementById('lang-options');
  const langButtons = document.querySelectorAll('#lang-options .lang-btn');
  const arrow = currentLangBtn?.querySelector('.arrow');
  const translatableElements = document.querySelectorAll('[data-it]');
  const initialLang = localStorage.getItem("preferredLang") || 'it';

  let activeLang = initialLang;

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
    if (mainButtonsGrid) mainButtonsGrid.style.display = 'none';
    sections.forEach(section => section.style.display = 'none');
    if (targetSection) {
      targetSection.style.opacity = '0';
      targetSection.style.display = 'block';
      void targetSection.offsetWidth;
      targetSection.style.opacity = '1';
    }
    buildSecondaryNavigation(targetId);
    if (secondaryNav) secondaryNav.style.display = 'block';
    if (menuContainer) menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  // === Dropdown lingua ===
  if (currentLangBtn && langOptions && arrow) {
    currentLangBtn.addEventListener('click', () => {
      const isExpanded = currentLangBtn.getAttribute('aria-expanded') === 'true';
      currentLangBtn.setAttribute('aria-expanded', !isExpanded);
      langOptions.style.display = isExpanded ? 'none' : 'flex';
      arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    
  langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedLang = btn.getAttribute('data-lang');
    if (selectedLang === activeLang) return;

    activeLang = selectedLang;
    localStorage.setItem("preferredLang", selectedLang);

    // 🔁 Rimuove tutto tranne la freccia
Array.from(currentLangBtn.childNodes).forEach(node => {
  const isArrow = node.classList?.contains('arrow');
  if (!isArrow) {
    currentLangBtn.removeChild(node);
  }
});


    // ✅ Inserisce la nuova bandiera
    const newFlag = btn.querySelector('.flag-icon')?.cloneNode(true);
    if (newFlag) currentLangBtn.insertBefore(newFlag, arrow);

    // ✅ Inserisce il codice lingua
    const newCode = document.createElement('span');
    newCode.className = 'lang-code';
    newCode.textContent = selectedLang.toUpperCase();
    currentLangBtn.insertBefore(newCode, arrow);

    currentLangBtn.setAttribute('data-lang', selectedLang);

    // 🔄 Aggiorna stato dei bottoni
    langButtons.forEach(langBtn => {
      const isActive = langBtn.getAttribute('data-lang') === selectedLang;
      langBtn.disabled = isActive;
      langBtn.classList.toggle('active-lang', isActive);
      langBtn.style.display = 'inline-flex';
    });

    currentLangBtn.click();
    translatePage(selectedLang);
  });
});



    langButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === initialLang;
      btn.disabled = isActive;
      btn.classList.toggle('active-lang', isActive);
      btn.style.display = 'inline-flex';
    });

    const initialBtn = langOptions.querySelector(`.lang-btn[data-lang="${initialLang}"]`);
    if (initialBtn) {
      const flag = initialBtn.querySelector('.flag-icon')?.cloneNode(true);
      const code = document.createElement('span');
      code.className = 'lang-code';
      code.textContent = initialLang.toUpperCase();
      if (flag) currentLangBtn.insertBefore(flag, arrow);
      currentLangBtn.insertBefore(code, arrow);
      currentLangBtn.setAttribute('data-lang', initialLang);
    }
  }

  translatePage(initialLang);
  showHome();
});
