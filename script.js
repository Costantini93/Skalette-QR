/* ========================================================== */
/* FILE: script.js (SOLUZIONE FINALE ESTREMA)                 */
/* ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const mainButtonsGrid = document.getElementById('main-buttons-grid');
    const sections = document.querySelectorAll('.menu-section');
    const menuContainer = document.getElementById('menu-container');
    
    // Elementi di navigazione secondaria
    const secondaryNav = document.getElementById('secondary-navigation');
    const secondaryGrid = document.getElementById('secondary-buttons-grid');
    const homePageButton = document.getElementById('home-page-btn'); 

    // Elementi del dropdown lingua
    const currentLangBtn = document.getElementById('current-lang-btn');
    const langOptions = document.getElementById('lang-options');
    const langButtons = document.querySelectorAll('#lang-options .lang-btn'); 
    const arrow = currentLangBtn.querySelector('.arrow');
    const translatableElements = document.querySelectorAll('[data-it]');
    const initialLang = 'it'; 
    
    let activeLang = initialLang;


    /**
     * Funzione principale per la traduzione della pagina.
     */
    const translatePage = (lang) => {
        translatableElements.forEach(element => {
            const translation = element.getAttribute(`data-${lang}`);
            if (translation) {
                element.textContent = translation;
            }
        });
        
        if (secondaryNav.style.display !== 'none') {
            const activeSection = document.querySelector('.menu-section[style*="display: block"]');
            if (activeSection) {
                buildSecondaryNavigation(activeSection.id);
            }
        }
    };


    // Funzioni di supporto (omesse per brevità, sono le stesse)
    const buildSecondaryNavigation = (activeTargetId) => {
        secondaryGrid.innerHTML = '';
        const currentLang = activeLang; 

        mainButtonsGrid.querySelectorAll('.menu-button').forEach(originalButton => {
            const targetId = originalButton.getAttribute('data-target');
            
            if (targetId !== activeTargetId) {
                const newButton = originalButton.cloneNode(true);
                
                const translation = originalButton.getAttribute(`data-${currentLang}`);
                if (translation) {
                    newButton.textContent = translation;
                }
                
                newButton.removeAttribute('id'); 
                
                newButton.addEventListener('click', () => {
                    handleMenuNavigation(targetId);
                });
                secondaryGrid.appendChild(newButton);
            }
        });
    };

    const showHome = () => {
        sections.forEach(section => {
            section.style.display = 'none';
        });
        mainButtonsGrid.style.display = 'flex'; 
        secondaryNav.style.display = 'none';    
        
        menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleMenuNavigation = (targetId) => {
        const targetSection = document.getElementById(targetId);

        mainButtonsGrid.style.display = 'none';

        sections.forEach(section => {
            section.style.display = 'none';
        });

        if (targetSection) {
            targetSection.style.opacity = '0';
            targetSection.style.display = 'block';
            void targetSection.offsetWidth; 
            targetSection.style.opacity = '1';
        }
        
        buildSecondaryNavigation(targetId);
        secondaryNav.style.display = 'block';
        
        menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // FINE: Funzioni di supporto


    // 1. Logica di Navigazione
    mainButtonsGrid.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            handleMenuNavigation(targetId);
        });
    });
    
    // 2. Logica Pulsante "Home Page"
    homePageButton.addEventListener('click', showHome);

    // 3. Logica Dropdown Lingua (apertura/chiusura)
    currentLangBtn.addEventListener('click', () => {
        const isExpanded = currentLangBtn.getAttribute('aria-expanded') === 'true';
        currentLangBtn.setAttribute('aria-expanded', !isExpanded);
        langOptions.style.display = isExpanded ? 'none' : 'flex';
        arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    // 4. LOGICA CRITICA PER IL CAMBIO LINGUA (FIX DEFINITIVO ESTREMO)
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            const previousLang = activeLang; 
            
            // 1. Trova il pulsante della lingua precedentemente attiva
            const oldLangBtn = langOptions.querySelector(`.lang-btn[data-lang="${previousLang}"]`);
            
            // 2. Swap dei contenuti del pulsante principale (pulizia e ricostruzione robusta)
            const newText = btn.textContent.trim();
            const newFlag = btn.querySelector('.flag-icon') ? btn.querySelector('.flag-icon').cloneNode(true) : null; 
            
            // PULIZIA DEL PULSANTE ATTIVO
            Array.from(currentLangBtn.childNodes).forEach(node => {
                if (node !== arrow) {
                    node.remove();
                }
            });
            
            // RICOSTRUZIONE DEL PULSANTE ATTIVO
            if (newFlag) {
                 currentLangBtn.insertBefore(newFlag, arrow);
            }
            currentLangBtn.insertBefore(document.createTextNode(` ${newText} `), arrow);
            
            currentLangBtn.setAttribute('data-lang', selectedLang);

            // 3. Gestione della visibilità nell'elenco a discesa (IL FIX ESTREMO)
            if (oldLangBtn) {
                 // **AZIONAMENTO CRITICO:** Forziamo TUTTE le proprietà di nascondimento.
                 // Ciò supera qualsiasi CSS esterno che nasconda con display:none, opacity:0 o visibility:hidden.
                 oldLangBtn.style.setProperty('display', 'flex', 'important'); 
                 oldLangBtn.style.setProperty('opacity', '1', 'important'); 
                 oldLangBtn.style.setProperty('visibility', 'visible', 'important'); 
            }
            
            // Nasconde il pulsante della NUOVA lingua selezionata
            btn.style.display = 'none'; 
            
            // 4. Aggiorna la variabile globale e chiudi il dropdown
            activeLang = selectedLang;
            currentLangBtn.click(); 

            // 5. Chiama la funzione di traduzione
            translatePage(selectedLang);
        });
    });
    
    // Inizializzazione:
    translatePage(initialLang);
    
    // 2. Nasconde la lingua predefinita (IT) nel dropdown all'avvio
    const initialLangBtn = langOptions.querySelector(`.lang-btn[data-lang="${initialLang}"]`);
    if (initialLangBtn) {
        initialLangBtn.style.display = 'none';
    }

    // 3. Mostra la schermata iniziale dei bottoni
    showHome();
});