import re
import json
from html.parser import HTMLParser

class MenuParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.menu_data = {"sections": []}
        self.current_section = None
        self.current_item = None
        self.current_tag = None
        self.current_attrs = {}
        self.in_item_name = False
        self.in_item_description = False
        self.in_item_price = False
        self.in_category_title = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.current_tag = tag
        self.current_attrs = attrs_dict
        
        # Nuova sezione menu
        if tag == 'section' and attrs_dict.get('class') == 'menu-section':
            section_id = attrs_dict.get('id', 'unknown')
            self.current_section = {
                "id": section_id,
                "name": {},
                "items": []
            }
            
        # Titolo categoria
        if tag == 'h2' and 'category-title' in attrs_dict.get('class', ''):
            self.in_category_title = True
            if self.current_section:
                self.current_section['name'] = {
                    'it': attrs_dict.get('data-it', ''),
                    'en': attrs_dict.get('data-en', ''),
                    'es': attrs_dict.get('data-es', ''),
                    'fr': attrs_dict.get('data-fr', ''),
                    'de': attrs_dict.get('data-de', ''),
                    'ru': attrs_dict.get('data-ru', '')
                }
        
        # Nuovo item menu
        if tag == 'div' and 'menu-item' in attrs_dict.get('class', ''):
            self.current_item = {
                "name": {},
                "description": {},
                "price": "",
                "noBorder": "no-border" in attrs_dict.get('class', '')
            }
            
        # Nome item
        if tag == 'h3' and 'item-name' in attrs_dict.get('class', ''):
            self.in_item_name = True
            if self.current_item:
                self.current_item['name'] = {
                    'it': attrs_dict.get('data-it', ''),
                    'en': attrs_dict.get('data-en', ''),
                    'es': attrs_dict.get('data-es', ''),
                    'fr': attrs_dict.get('data-fr', ''),
                    'de': attrs_dict.get('data-de', ''),
                    'ru': attrs_dict.get('data-ru', '')
                }
                
        # Descrizione item
        if tag == 'p' and 'item-description' in attrs_dict.get('class', ''):
            self.in_item_description = True
            if self.current_item:
                self.current_item['description'] = {
                    'it': attrs_dict.get('data-it', ''),
                    'en': attrs_dict.get('data-en', ''),
                    'es': attrs_dict.get('data-es', ''),
                    'fr': attrs_dict.get('data-fr', ''),
                    'de': attrs_dict.get('data-de', ''),
                    'ru': attrs_dict.get('data-ru', '')
                }
                
        # Prezzo item
        if tag == 'span' and 'item-price' in attrs_dict.get('class', ''):
            self.in_item_price = True
    
    def handle_endtag(self, tag):
        if tag == 'h2' and self.in_category_title:
            self.in_category_title = False
            
        if tag == 'h3' and self.in_item_name:
            self.in_item_name = False
            
        if tag == 'p' and self.in_item_description:
            self.in_item_description = False
            
        if tag == 'span' and self.in_item_price:
            self.in_item_price = False
            
        # Fine item - salva
        if tag == 'div' and self.current_item and self.current_item.get('price'):
            if self.current_section:
                self.current_section['items'].append(self.current_item)
            self.current_item = None
            
        # Fine sezione
        if tag == 'section' and self.current_section and len(self.current_section['items']) > 0:
            self.menu_data['sections'].append(self.current_section)
            self.current_section = None
    
    def handle_data(self, data):
        data = data.strip()
        if not data:
            return
            
        # Cattura prezzo
        if self.in_item_price and self.current_item:
            self.current_item['price'] = data

# Leggi file HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Parsa HTML
parser = MenuParser()
parser.feed(html_content)

# Salva JSON
with open('menu-data.json', 'w', encoding='utf-8') as f:
    json.dump(parser.menu_data, f, ensure_ascii=False, indent=2)

print(f"✅ Estratti {len(parser.menu_data['sections'])} sezioni")
for section in parser.menu_data['sections']:
    print(f"  - {section['name']['it']}: {len(section['items'])} items")
