/* ========================================================== */
/* FILE: script.js (SOLUZIONE FINALE STABILE)                 */
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
    // ATTENZIONE: Se l'elemento arrow non esiste, lo script si blocca qui!
    const arrow = currentLangBtn ? currentLangBtn.querySelector('.arrow') : null; 
    const translatableElements = document.querySelectorAll('[data-it]');
    const initialLang = 'it'; 
    
    let activeLang = initialLang;


    /**
     * Funzione principale per la traduzione della pagina.
     * LOGICA AGGIORNATA per PRESERVARE ICONE! (più semplice e robusta)
     */
    const translatePage = (lang) => {
        translatableElements.forEach(element => {
            const translation = element.getAttribute(`data-${lang}`);
            
            if (translation) {
                // 1. Controlla se l'elemento è un bottone che contiene un'icona
                const iconElement = element.querySelector('.whatsapp-icon-img') || element.querySelector('.review-icon');
                
                if (iconElement) {
                    // **MODIFICA CHIAVE:** Elimina tutti i nodi di testo, ma preserva gli elementi HTML (le icone)
                    
                    // Rimuove tutti i nodi di testo (per eliminare il vecchio testo)
                    Array.from(element.childNodes).forEach(node => {
                        if (node.nodeType === 3) { // 3 è il codice per Text Node
                            element.removeChild(node);
                        }
                    });

                    // Aggiunge il nuovo nodo di testo DOPO l'icona e qualsiasi altro elemento
                    element.appendChild(document.createTextNode(` ${translation}`));
                    
                } else {
                    // 2. Per tutti gli altri elementi (orari, titoli, testo normale)
                    element.textContent = translation;
                }
            }
        });
        
        // Aggiorna la navigazione secondaria (se aperta)
        if (secondaryNav && secondaryNav.style.display !== 'none') {
            const activeSection = document.querySelector('.menu-section[style*="display: block"]');
            if (activeSection) {
                buildSecondaryNavigation(activeSection.id);
            }
        }
    };


    // Funzioni di supporto per la navigazione
    const buildSecondaryNavigation = (activeTargetId) => {
        if (!secondaryGrid) return;
        secondaryGrid.innerHTML = '';
        const currentLang = activeLang; 

        mainButtonsGrid.querySelectorAll('.menu-button').forEach(originalButton => {
            const targetId = originalButton.getAttribute('data-target');
            
            if (targetId !== activeTargetId) {
                const newButton = originalButton.cloneNode(true);
                
                const translation = originalButton.getAttribute(`data-${currentLang}`);
                if (translation) {
                    // Qui usiamo textContent perché i menu-button non dovrebbero avere icone interne
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
        if (mainButtonsGrid) mainButtonsGrid.style.display = 'flex'; 
        if (secondaryNav) secondaryNav.style.display = 'none';    
        
        if (menuContainer) menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleMenuNavigation = (targetId) => {
        const targetSection = document.getElementById(targetId);

        if (mainButtonsGrid) mainButtonsGrid.style.display = 'none';

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
        if (secondaryNav) secondaryNav.style.display = 'block';
        
        if (menuContainer) menuContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // FINE: Funzioni di supporto


    // 1. Logica di Navigazione
    if (mainButtonsGrid) {
        mainButtonsGrid.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                handleMenuNavigation(targetId);
            });
        });
    }
    
    // 2. Logica Pulsante "Home Page"
    if (homePageButton) {
        homePageButton.addEventListener('click', showHome);
    }

    // 3. Logica Dropdown Lingua (apertura/chiusura)
    if (currentLangBtn && langOptions && arrow) {
        currentLangBtn.addEventListener('click', () => {
            const isExpanded = currentLangBtn.getAttribute('aria-expanded') === 'true';
            currentLangBtn.setAttribute('aria-expanded', !isExpanded);
            langOptions.style.display = isExpanded ? 'none' : 'flex';
            arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }


    // 4. LOGICA CRITICA PER IL CAMBIO LINGUA
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Aggiungi un controllo di sicurezza in più
            if (!currentLangBtn || !arrow) return; 

            const selectedLang = btn.getAttribute('data-lang');
            const previousLang = activeLang; 
            
            // 1. Trova il pulsante della lingua precedentemente attiva
            const oldLangBtn = langOptions.querySelector(`.lang-btn[data-lang="${previousLang}"]`);
            
            // 2. Swap dei contenuti del pulsante principale
            const newText = btn.textContent.trim();
            const newFlag = btn.querySelector('.flag-icon') ? btn.querySelector('.flag-icon').cloneNode(true) : null; 
            
            // PULIZIA DEL PULSANTE ATTIVO
            Array.from(currentLangBtn.childNodes).forEach(node => {
                // Rimuovi tutto tranne la freccia (arrow)
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

            // 3. Gestione della visibilità nell'elenco a discesa
            if (oldLangBtn) {
                 oldLangBtn.style.setProperty('display', 'flex', 'important'); 
                 oldLangBtn.style.setProperty('opacity', '1', 'important'); 
                 oldLangBtn.style.setProperty('visibility', 'visible', 'important'); 
            }
            
            // Nasconde il pulsante della NUOVA lingua selezionata
            btn.style.display = 'none'; 
            
            // 4. Aggiorna la variabile globale e chiudi il dropdown
            activeLang = selectedLang;
            currentLangBtn.click(); 

            // 5. Chiama la funzione di traduzione (con la logica corretta per le icone)
            translatePage(selectedLang);
        });
    });
    
    // INIZIALIZZAZIONE:
    translatePage(initialLang);
    
    // 2. Nasconde la lingua predefinita (IT) nel dropdown all'avvio
    const initialLangBtn = langOptions ? langOptions.querySelector(`.lang-btn[data-lang="${initialLang}"]`) : null;
    if (initialLangBtn) {
        initialLangBtn.style.display = 'none';
    }

    // 3. Mostra la schermata iniziale dei bottoni
    showHome();
});