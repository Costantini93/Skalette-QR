# Parsing HTML con BeautifulSoup
from bs4 import BeautifulSoup
import json
import re

# Leggi il file HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

menu_data = {
    "password": "skalette2024",
    "sections": []
}

# Trova tutte le sezioni menu
sections = soup.find_all('section', class_='menu-section')
print(f"Trovate {len(sections)} sezioni\n")

for section in sections:
    section_id = section.get('id', '')
    
    # Salta la sezione hours (non è menu)
    if section_id == 'hours-section':
        continue
    
    # Trova il titolo della categoria
    title_elem = section.find('h2', class_='category-title')
    
    if not title_elem:
        continue
    
    section_data = {
        "id": section_id,
        "name": {
            "it": title_elem.get('data-it', ''),
            "en": title_elem.get('data-en', ''),
            "es": title_elem.get('data-es', ''),
            "fr": title_elem.get('data-fr', ''),
            "de": title_elem.get('data-de', ''),
            "ru": title_elem.get('data-ru', '')
        },
        "items": []
    }
    
    # Trova tutti i menu items
    items = section.find_all('div', class_=re.compile(r'menu-item'))
    
    print(f"Sezione: {section_data['name']['it']} ({section_id}) - {len(items)} items")
    
    for item in items:
        # Nome
        name_elem = item.find('h3', class_='item-name')
        if not name_elem:
            continue
        
        # Descrizione (opzionale)
        desc_elem = item.find('p', class_='item-description')
        
        # Prezzo
        price_elem = item.find('span', class_='item-price')
        
        item_data = {
            "name": {
                "it": name_elem.get('data-it', ''),
                "en": name_elem.get('data-en', ''),
                "es": name_elem.get('data-es', ''),
                "fr": name_elem.get('data-fr', ''),
                "de": name_elem.get('data-de', ''),
                "ru": name_elem.get('data-ru', '')
            },
            "description": {
                "it": desc_elem.get('data-it', '') if desc_elem else '',
                "en": desc_elem.get('data-en', '') if desc_elem else '',
                "es": desc_elem.get('data-es', '') if desc_elem else '',
                "fr": desc_elem.get('data-fr', '') if desc_elem else '',
                "de": desc_elem.get('data-de', '') if desc_elem else '',
                "ru": desc_elem.get('data-ru', '') if desc_elem else ''
            },
            "price": price_elem.get_text(strip=True) if price_elem else '',
            "noBorder": 'no-border' in item.get('class', [])
        }
        
        section_data['items'].append(item_data)
    
    menu_data['sections'].append(section_data)

# Salva come file JS
js_content = f"""// Dati del menu - questo file viene generato automaticamente
window.menuDataSource = {json.dumps(menu_data, ensure_ascii=False, indent=2)};
"""

with open('menu-data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"\n✅ File menu-data.js creato con successo!")
print(f"   Sezioni totali: {len(menu_data['sections'])}")
total_items = sum(len(s['items']) for s in menu_data['sections'])
print(f"   Items totali: {total_items}")
