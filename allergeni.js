// Traduzioni allergeni in tutte le lingue
const traduzioniAllergeni = {
  "Glutine": {
    it: "Glutine",
    en: "Gluten",
    es: "Gluten",
    fr: "Gluten",
    de: "Gluten",
    ru: "Глютен"
  },
  "Lattosio": {
    it: "Lattosio",
    en: "Lactose",
    es: "Lactosa",
    fr: "Lactose",
    de: "Laktose",
    ru: "Лактоза"
  },
  "Uova": {
    it: "Uova",
    en: "Eggs",
    es: "Huevos",
    fr: "Œufs",
    de: "Eier",
    ru: "Яйца"
  },
  "Pesce": {
    it: "Pesce",
    en: "Fish",
    es: "Pescado",
    fr: "Poisson",
    de: "Fisch",
    ru: "Рыба"
  },
  "Crostacei": {
    it: "Crostacei",
    en: "Crustaceans",
    es: "Crustáceos",
    fr: "Crustacés",
    de: "Krebstiere",
    ru: "Ракообразные"
  },
  "Molluschi": {
    it: "Molluschi",
    en: "Molluscs",
    es: "Moluscos",
    fr: "Mollusques",
    de: "Weichtiere",
    ru: "Моллюски"
  },
  "Arachidi": {
    it: "Arachidi",
    en: "Peanuts",
    es: "Cacahuetes",
    fr: "Arachides",
    de: "Erdnüsse",
    ru: "Арахис"
  },
  "Frutta a guscio": {
    it: "Frutta a guscio",
    en: "Tree nuts",
    es: "Frutos de cáscara",
    fr: "Fruits à coque",
    de: "Schalenfrüchte",
    ru: "Орехи"
  },
  "Soia": {
    it: "Soia",
    en: "Soy",
    es: "Soja",
    fr: "Soja",
    de: "Soja",
    ru: "Соя"
  },
  "Sedano": {
    it: "Sedano",
    en: "Celery",
    es: "Apio",
    fr: "Céleri",
    de: "Sellerie",
    ru: "Сельдерей"
  },
  "Senape": {
    it: "Senape",
    en: "Mustard",
    es: "Mostaza",
    fr: "Moutarde",
    de: "Senf",
    ru: "Горчица"
  },
  "Sesamo": {
    it: "Sesamo",
    en: "Sesame",
    es: "Sésamo",
    fr: "Sésame",
    de: "Sesam",
    ru: "Кунжут"
  },
  "Solfiti": {
    it: "Solfiti",
    en: "Sulphites",
    es: "Sulfitos",
    fr: "Sulfites",
    de: "Sulfite",
    ru: "Сульфиты"
  }
};

// Mappatura allergeni per piatti
const allergeniPiatti = {
  // Gastronomia
  "Polpetta di Carne": ["Glutine", "Uova", "Lattosio"],
  "Polpetta Vegetariana": ["Glutine", "Uova", "Lattosio"],
  "Arancino al Tastasal": ["Glutine", "Lattosio"],
  "Pizza Margherita": ["Glutine", "Lattosio"],
  "Pizza Farcita": ["Glutine", "Lattosio"],
  "Toast": ["Glutine", "Lattosio"],
  "Focaccia": ["Glutine", "Lattosio"],
  "Pizzetta": ["Glutine", "Lattosio"],
  "Edamame": ["Soia"],
  "Nachos (fino alle 22:00)": ["Glutine", "Lattosio"],
  
  // Colazioni
  "English Breakfast": ["Glutine", "Uova", "Lattosio"],
  "Croque Monsieur": ["Glutine", "Lattosio"],
  "Croque Madame": ["Glutine", "Lattosio", "Uova"],
  
  // Cucina & Dolci
  "Pata Negra de Bellota 100%": ["Glutine"],
  "Vellutata di Verdure": ["Lattosio", "Sedano", "Crostacei"],
  "Battuta di Manzo alla Francese": ["Uova", "Senape"],
  "Insalata Mista di Pollo": ["Lattosio"],
  "Acciuga del Cantabrico": ["Pesce", "Glutine", "Lattosio"],
  "Ovetto Poché": ["Uova", "Lattosio", "Glutine"],
  "Tagliatelle al Ragù di Quaglia": ["Glutine", "Uova", "Lattosio"],
  "Pad Thai": ["Arachidi", "Crostacei", "Soia", "Sesamo"],
  "Gyoza (6pz)": ["Glutine", "Soia", "Sesamo"],
  "Gnocchi alla Zucca": ["Glutine", "Lattosio"],
  "Ravioli Artigianali alla Gricia": ["Glutine", "Uova", "Lattosio"],
  "Tagliata di Manzo": ["Lattosio"],
  "Yakitori": ["Soia", "Sesamo"],
  "Guancetta di Maiale": ["Solfiti"],
  "Moscardini in Umido": ["Molluschi"],
  "Trancio di Salmone": ["Pesce"],
  "Burrito": ["Glutine", "Lattosio"],
  "Bacon Cheeseburger": ["Glutine", "Lattosio", "Uova"],
  "Club Sandwich": ["Glutine", "Uova", "Lattosio"],
  "Avocado Toast": ["Glutine", "Lattosio", "Uova", "Frutta a guscio"],
  "Veggie Burger": ["Glutine", "Lattosio"],
  
  // Dessert
  "Tiramisù della Casa": ["Glutine", "Uova", "Lattosio"],
  "Panna Cotta": ["Lattosio"],
  "Crema Catalana": ["Uova", "Lattosio"],
  "Sbrisolona e Grappa": ["Glutine", "Frutta a guscio"],
  "Banana Bread": ["Glutine", "Uova", "Lattosio"]
};

// Funzione per ottenere la lingua corrente
function getLinguaCorrente() {
  const savedLang = localStorage.getItem("preferredLang");
  if (savedLang && ['it', 'en', 'es', 'fr', 'de', 'ru'].includes(savedLang)) {
    return savedLang;
  }
  const browserLang = (navigator.language || navigator.languages?.[0] || '').slice(0, 2).toLowerCase();
  return ['it', 'en', 'es', 'fr', 'de', 'ru'].includes(browserLang) ? browserLang : 'it';
}

// Funzione per tradurre un allergene
function traduciAllergene(allergene, lingua) {
  if (traduzioniAllergeni[allergene] && traduzioniAllergeni[allergene][lingua]) {
    return traduzioniAllergeni[allergene][lingua];
  }
  return allergene; // Fallback all'originale
}

// Funzione per aggiungere/aggiornare allergeni
function aggiungiAllergeni(lingua) {
  if (!lingua) lingua = getLinguaCorrente();
  
  document.querySelectorAll('.menu-item .item-details').forEach(itemDetails => {
    const itemName = itemDetails.querySelector('.item-name');
    if (!itemName) return;
    
    // Usa sempre il nome italiano (data-it) come chiave, non il testo visualizzato
    const nomePiatto = itemName.getAttribute('data-it') || itemName.textContent.trim();
    const allergeni = allergeniPiatti[nomePiatto];
    
    // Rimuovi container esistente se presente
    const existingContainer = itemDetails.querySelector('.allergen-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    if (allergeni && allergeni.length > 0) {
      const container = document.createElement('div');
      container.className = 'allergen-container';
      
      allergeni.forEach(allergene => {
        const badge = document.createElement('span');
        badge.className = 'allergen-badge';
        const allergenoTradotto = traduciAllergene(allergene, lingua);
        badge.title = `${lingua === 'it' ? 'Contiene' : lingua === 'en' ? 'Contains' : lingua === 'es' ? 'Contiene' : lingua === 'fr' ? 'Contient' : lingua === 'de' ? 'Enthält' : 'Содержит'} ${allergenoTradotto.toLowerCase()}`;
        badge.textContent = allergenoTradotto;
        container.appendChild(badge);
      });
      
      itemDetails.appendChild(container);
    }
  });
}

// Ascolta i cambi di lingua
function initAllergeniListener() {
  // Observer per il cambio di attributi sulla pagina
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' || mutation.type === 'characterData') {
        const nuovaLingua = getLinguaCorrente();
        aggiungiAllergeni(nuovaLingua);
      }
    });
  });

  // Intercetta i click sui bottoni lingua
  document.addEventListener('click', (e) => {
    if (e.target.closest('.lang-btn')) {
      setTimeout(() => {
        const nuovaLingua = getLinguaCorrente();
        aggiungiAllergeni(nuovaLingua);
      }, 100);
    }
  });
}

// Esegui quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    aggiungiAllergeni();
    initAllergeniListener();
  });
} else {
  aggiungiAllergeni();
  initAllergeniListener();
}
