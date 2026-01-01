const fs = require('fs');

// Leggi HTML
const html = fs.readFileSync('index.html', 'utf8');

const menuData = {
    password: "skalette2024",
    sections: []
};

// Pattern per trovare sezioni
const sectionRegex = /<section id="([^"]+)" class="menu-section">/g;
const sections = [];
let match;

while ((match = sectionRegex.exec(html)) !== null) {
    const sectionId = match[1];
    const sectionStart = match.index;
    
    // Trova la fine della sezione (cerca il prossimo <section id= o fine file)
    const nextSectionMatch = html.indexOf('<section id="', sectionStart + 1);
    const sectionEnd = nextSectionMatch > 0 ? nextSectionMatch : html.length;
    const sectionContent = html.substring(sectionStart, sectionEnd);
    
    sections.push({ id: sectionId, content: sectionContent });
}

console.log(`Trovate ${sections.length} sezioni`);

// Elabora ogni sezione
sections.forEach(section => {
    // Salta sezione hours
    if (section.id === 'hours-section') return;
    
    console.log(`\nElaborando sezione: ${section.id}`);
    
    // Estrai titolo categoria
    const titleMatch = section.content.match(/class="category-title[^"]*"[^>]*data-it="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-es="([^"]*)"[^>]*data-fr="([^"]*)"[^>]*data-de="([^"]*)"[^>]*data-ru="([^"]*)"/);
    
    const sectionData = {
        id: section.id,
        name: titleMatch ? {
            it: titleMatch[1],
            en: titleMatch[2],
            es: titleMatch[3],
            fr: titleMatch[4],
            de: titleMatch[5],
            ru: titleMatch[6]
        } : { it: section.id, en: section.id, es: section.id, fr: section.id, de: section.id, ru: section.id },
        items: []
    };
    
    // Trova tutti i menu-item
    const itemRegex = /<div class="menu-item([^"]*)">/g;
    const items = [];
    let itemMatch;
    
    while ((itemMatch = itemRegex.exec(section.content)) !== null) {
        const itemClass = itemMatch[1];
        const itemStart = itemMatch.index;
        
        // Trova la fine dell'item
        let itemEnd = itemStart;
        let depth = 1;
        let pos = itemStart + itemMatch[0].length;
        
        while (depth > 0 && pos < section.content.length) {
            if (section.content.substring(pos, pos + 5) === '<div ') {
                depth++;
                pos += 5;
            } else if (section.content.substring(pos, pos + 6) === '</div>') {
                depth--;
                if (depth === 0) {
                    itemEnd = pos + 6;
                    break;
                }
                pos += 6;
            } else {
                pos++;
            }
        }
        
        const itemContent = section.content.substring(itemStart, itemEnd);
        
        // Estrai nome
        const nameMatch = itemContent.match(/class="item-name[^"]*"[^>]*data-it="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-es="([^"]*)"[^>]*data-fr="([^"]*)"[^>]*data-de="([^"]*)"[^>]*data-ru="([^"]*)"/);
        
        // Estrai descrizione (opzionale)
        const descMatch = itemContent.match(/class="item-description[^"]*"[^>]*data-it="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-es="([^"]*)"[^>]*data-fr="([^"]*)"[^>]*data-de="([^"]*)"[^>]*data-ru="([^"]*)"/);
        
        // Estrai prezzo
        const priceMatch = itemContent.match(/class="item-price">([^<]+)<\/span>/);
        
        if (nameMatch) {
            const item = {
                name: {
                    it: nameMatch[1],
                    en: nameMatch[2],
                    es: nameMatch[3],
                    fr: nameMatch[4],
                    de: nameMatch[5],
                    ru: nameMatch[6]
                },
                description: descMatch ? {
                    it: descMatch[1],
                    en: descMatch[2],
                    es: descMatch[3],
                    fr: descMatch[4],
                    de: descMatch[5],
                    ru: descMatch[6]
                } : { it: "", en: "", es: "", fr: "", de: "", ru: "" },
                price: priceMatch ? priceMatch[1].trim() : "",
                noBorder: itemClass.includes('no-border')
            };
            
            sectionData.items.push(item);
        }
    }
    
    // Se è la sezione vini, cerca wine-item invece di menu-item
    if (section.id === 'vini') {
        const wineRegex = /<div class="wine-item([^"]*)">/g;
        let wineMatch;
        
        while ((wineMatch = wineRegex.exec(section.content)) !== null) {
            const wineClass = wineMatch[1];
            const wineStart = wineMatch.index;
            
            // Trova la fine del wine-item
            let wineEnd = wineStart;
            let depth = 1;
            let pos = wineStart + wineMatch[0].length;
            
            while (depth > 0 && pos < section.content.length) {
                if (section.content.substring(pos, pos + 5) === '<div ') {
                    depth++;
                    pos += 5;
                } else if (section.content.substring(pos, pos + 6) === '</div>') {
                    depth--;
                    if (depth === 0) {
                        wineEnd = pos + 6;
                        break;
                    }
                    pos += 6;
                } else {
                    pos++;
                }
            }
            
            const wineContent = section.content.substring(wineStart, wineEnd);
            
            // Estrai nome vino
            const nameMatch = wineContent.match(/class="item-name[^"]*"[^>]*data-it="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-es="([^"]*)"[^>]*data-fr="([^"]*)"[^>]*data-de="([^"]*)"[^>]*data-ru="([^"]*)"/);
            
            // Estrai descrizione
            const descMatch = wineContent.match(/class="item-description[^"]*"[^>]*data-it="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-es="([^"]*)"[^>]*data-fr="([^"]*)"[^>]*data-de="([^"]*)"[^>]*data-ru="([^"]*)"/);
            
            // Estrai prezzi (bicchiere e bottiglia)
            const priceGlassMatch = wineContent.match(/class="wine-price-glass">([^<]+)<\/span>/);
            const priceBottleMatch = wineContent.match(/class="wine-price-bottle">([^<]+)<\/span>/);
            
            if (nameMatch) {
                const wine = {
                    name: {
                        it: nameMatch[1],
                        en: nameMatch[2],
                        es: nameMatch[3],
                        fr: nameMatch[4],
                        de: nameMatch[5],
                        ru: nameMatch[6]
                    },
                    description: descMatch ? {
                        it: descMatch[1],
                        en: descMatch[2],
                        es: descMatch[3],
                        fr: descMatch[4],
                        de: descMatch[5],
                        ru: descMatch[6]
                    } : { it: "", en: "", es: "", fr: "", de: "", ru: "" },
                    price: (priceGlassMatch ? priceGlassMatch[1].trim() : "") + " / " + (priceBottleMatch ? priceBottleMatch[1].trim() : ""),
                    noBorder: wineClass.includes('no-border')
                };
                
                sectionData.items.push(wine);
            }
        }
    }
    
    console.log(`  Trovati ${sectionData.items.length} items`);
    
    if (sectionData.items.length > 0) {
        menuData.sections.push(sectionData);
    }
});

// Genera file JS
const jsContent = `// Dati del menu - questo file viene generato automaticamente
window.menuDataSource = ${JSON.stringify(menuData, null, 2)};`;

fs.writeFileSync('menu-data.js', jsContent, 'utf8');

console.log('\n✅ File menu-data.js creato con successo!');
console.log(`   Sezioni totali: ${menuData.sections.length}`);
const totalItems = menuData.sections.reduce((sum, s) => sum + s.items.length, 0);
console.log(`   Items totali: ${totalItems}`);
