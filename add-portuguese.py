"""
Aggiunge l'attributo data-pt="..." accanto agli esistenti data-it / data-en
in index.html, usando una mappa di traduzioni IT -> PT.

Per voci non in mappa, NON aggiunge data-pt: il sito gia' fa fallback su data-en.

Uso:
    python add-portuguese.py
"""
import re
from pathlib import Path

HTML = Path(__file__).parent / "index.html"

# Dizionario IT -> PT (portoghese europeo, registro bistrot)
TR = {
    # --- UI / generale ---
    "Skalette Bistrò - Menu": "Skalette Bistro - Menu",
    "Benvenuto da Skalette Bistrò! ": "Bem-vindo ao Skalette Bistro! ",
    "Esplora il Menu": "Explore o Menu",
    "Colazione": "Pequeno-almoço",
    "Bevande Analcoliche": "Bebidas Sem Álcool",
    "Aperitivi & Birre": "Aperitivos e Cervejas",
    "Signatures": "Signatures",
    "I Nostri Vini": "Os Nossos Vinhos",
    "La nostra gastronomia": "A Nossa Gastronomia",
    "Dalla Cucina & Dolci": "Da Cozinha e Sobremesas",
    "Prenota un Tavolo": "Reservar uma Mesa",
    "Raccontaci la tua esperienza": "Conte-nos a sua experiência",
    "Seguici su Instagram": "Siga-nos no Instagram",
    "Nascondi piatti con:": "Ocultar pratos com:",
    "Applica Filtro": "Aplicar Filtro",
    "Rimuovi Filtri": "Remover Filtros",
    "I piatti contenenti gli allergeni selezionati verranno nascosti.":
        "Os pratos com os alérgenos selecionados serão ocultados.",

    # --- Categorie ---
    "Caffetteria": "Cafetaria",
    "Menu Colazione (10:00-12:00)": "Menu Pequeno-almoço (10:00-12:00)",
    "Birre": "Cervejas",
    "Vini Bianchi e Rosé": "Vinhos Brancos e Rosé",
    "Vini Rossi": "Vinhos Tintos",
    "Bollicine": "Espumantes",
    "I Nostri Piatti": "Os Nossos Pratos",
    "Dessert": "Sobremesas",

    # --- Caffetteria ---
    "Espresso": "Espresso",
    "L'autentico caffè italiano": "O autêntico café italiano",
    "Macchiatone": "Macchiatone",
    "Simile al cappuccino ma con meno latte": "Semelhante ao cappuccino mas com menos leite",
    "Cappuccino": "Cappuccino",
    "Caffè e latte montato con schiuma cremosa": "Café e leite vaporizado com espuma cremosa",
    "Caffè Americano": "Café Americano",
    "Caffè lungo con aggiunta di acqua calda": "Café longo com adição de água quente",
    "Latte macchiato": "Latte macchiato",
    "Latte caldo macchiato con un tocco di caffè": "Leite quente manchado com um toque de café",
    "Caffè Corretto": "Café Corretto",
    "Espresso con l'aggiunta di un liquore a scelta": "Espresso com adição de um licor à escolha",
    "Caffè Doppio": "Café Duplo",
    "Doppio espresso in tazza grande": "Espresso duplo em chávena grande",
    "Ginseng/Orzo": "Ginseng/Cevada",
    "Bevanda calda alternativa al caffè": "Bebida quente alternativa ao café",
    "Caffè Skalette": "Café Skalette",
    "Doppio espresso versato su ghiaccio": "Espresso duplo servido sobre gelo",
    "Infuso": "Infusão",
    "Selezione di erbe e frutta": "Seleção de ervas e frutas",
    "Croissant": "Croissant",
    "Sfoglia fresca, semplice o farcito": "Folhado fresco, simples ou recheado",
    "Biscotto": "Biscoito",
    "Biscotto singolo": "Biscoito individual",
    "Biscotti (4pz)": "Biscoitos (4 un.)",
    "Quattro biscotti assortiti": "Quatro biscoitos sortidos",
    "Spremuta": "Sumo Natural",
    "Arancia fresca appena spremuta": "Laranja acabada de espremer",

    # --- Colazione ---
    "Avocado Toast": "Avocado Toast",
    " Pane tostato, crema alla robiola, avocado, uovo in camicia. Con bacon croccante (+3€) o\n                                        salmone (+3€).":
        " Pão tostado, creme de robiola, abacate, ovo escalfado. Com bacon estaladiço (+3€) ou salmão (+3€).",
    "Club Sandwich": "Club Sandwich",
    "Pollo, bacon croccante, uovo, pomodoro, insalata e maionese.":
        "Frango, bacon estaladiço, ovo, tomate, alface e maionese.",
    "English Breakfast": "English Breakfast",
    "Uovo al tegamino, bacon, salsiccia di suino, funghi, pomodoro alla piastra, fagioli e pane tostato.":
        "Ovo estrelado, bacon, salsicha de porco, cogumelos, tomate grelhado, feijão e pão tostado.",
    "Croque Monsieur": "Croque Monsieur",
    "Pane, prosciutto cotto, formaggio e besciamella.":
        "Pão, fiambre, queijo e bechamel.",
    "Croque Madame": "Croque Madame",
    "Pane, prosciutto cotto, formaggio, besciamella e uovo all'occhio di bue.":
        "Pão, fiambre, queijo, bechamel e ovo estrelado.",

    # --- Bevande ---
    "Acqua 0,5 L": "Água 0,5 L",
    "Acqua 0,75 L": "Água 0,75 L",
    "Naturale o Frizzante": "Natural ou Com Gás",
    "Crodino XL": "Crodino XL",
    "Analcolico biondo in bottiglia grande": "Aperitivo sem álcool em garrafa grande",
    "Coca Cola": "Coca-Cola",
    "Classica bevanda gassata": "Clássica bebida gaseificada",
    "Coca Cola Zero": "Coca-Cola Zero",
    "Senza zuccheri aggiunti": "Sem açúcar adicionado",
    "Tonica": "Tónica",
    "Bevanda frizzante e rinfrescante": "Bebida com gás e refrescante",
    "Succo di Frutta": "Sumo de Fruta",
    "Gusti assortiti disponibili": "Vários sabores disponíveis",
    "Ginger Ale": "Ginger Ale",
    "Bevanda frizzante al gusto di zenzero": "Bebida com gás de gengibre",
    "Tè Limone/Pesca": "Chá Gelado Limão/Pêssego",
    "Tè freddo in bottiglia": "Chá gelado em garrafa",
    "Homemade Gingerbeer": "Ginger Beer Caseira",
    "Bevanda analcolica allo zenzero di nostra produzione":
        "Bebida sem álcool de gengibre de produção própria",
    "Pomodoro Condito": "Tomate Temperado",
    "Succo di pomodoro con sale, pepe e spezie": "Sumo de tomate com sal, pimenta e especiarias",
    "Soda al Pompelmo Rosa": "Soda de Toranja Rosa",
    "Gassosa al gusto di pompelmo rosa": "Bebida gaseificada de toranja rosa",

    # --- Aperitivi ---
    "Spritz Bianco": "Spritz Branco",
    "Vino bianco frizzante e seltz": "Vinho branco com gás e seltzer",
    "Spritz": "Spritz",
    "Scegli tra: Aperol, Campari, Hugo, Select, Cynar, Rabarbaro, Rosa, Sorbole, Misto.":
        "Escolha entre: Aperol, Campari, Hugo, Select, Cynar, Rabarbaro, Rosa, Sorbole, Misto.",
    "Campari Soda": "Campari Soda",
    "Classico aperitivo monoporzione, pronto da bere": "Clássico aperitivo individual, pronto a beber",
    "Americano": "Americano",
    "Campari, Blend di Vermouth Rossi, Soda": "Campari, blend de Vermutes Tintos, Soda",
    "Negroni": "Negroni",
    "Gin, Campari, Blend di Vermouth Rossi. Classico potente":
        "Gin, Campari, blend de Vermutes Tintos. Clássico potente",
    "Bloody Mary": "Bloody Mary",
    "Vodka, succo di pomodoro condito e spezie": "Vodka, sumo de tomate temperado e especiarias",
    "Cocktail": "Cocktail Clássico",
    "Richiedi il tuo cocktail preferito ai nostri barman":
        "Peça o seu cocktail preferido aos nossos barmen",
    "Cocktail Premium": "Cocktail Premium",
    "Cocktail preparati con distillati e ingredienti di alta gamma":
        "Cocktails preparados com destilados e ingredientes premium",
    "Lager belga leggera e rinfrescante con un tocco luppolato.":
        "Lager belga leve e refrescante com um toque de lúpulo.",

    # --- Signatures ---
    "Aperitivo 123, Sarti Rosa, bitter al limone, zenzero, succo di limone e soda":
        "Aperitivo 123, Sarti Rosa, bitter de limão, gengibre, sumo de limão e soda",
    "Tequila, liquore all'albicocca, liquore mora e lampone, succo di lime":
        "Tequila, licor de damasco, licor de amora e framboesa, sumo de lima",
    "Bitter Fusetti, Bitter Fusetti al cacao, liquore al mandarino, vermouth rosso e gin":
        "Bitter Fusetti, Bitter Fusetti de cacau, licor de tangerina, vermute tinto e gin",
    "Bourbon whiskey, Disaronno, passion fruit e succo di limone":
        "Whisky Bourbon, Disaronno, maracujá e sumo de limão",

    # --- Vini (descrizioni) ---
    "Fresco e sapido, con sentori di mandorla e fiori bianchi. Ideale per aperitivo.":
        "Fresco e saboroso, com notas de amêndoa e flores brancas. Ideal para aperitivo.",
    "Vino elegante e minerale del Veneto, profumo di biancospino e camomilla.":
        "Vinho elegante e mineral do Vêneto, com aroma de espinheiro e camomila.",
    "Vino dal gusto morbido con sentori di mela matura e vaniglia.":
        "Vinho de sabor suave com notas de maçã madura e baunilha.",
    "Acidità vibrante, note floreali e minerali.": "Acidez vibrante, notas florais e minerais.",
    "Rosato delicato e profumato con sentori di frutti rossi estivi. (Rosé DOC).":
        "Rosé delicado e perfumado com notas de frutos vermelhos de verão. (Rosé DOC).",
    "Bianco fresco e minerale della Campania, con note di agrumi e fiori bianchi. Perfetto come aperitivo.":
        "Branco fresco e mineral da Campânia, com notas de citrinos e flores brancas. Perfeito como aperitivo.",
    "Rosso giovane e vivace del Veneto, note di ciliegia e pepe nero. Leggero.":
        "Tinto jovem e vivo do Vêneto, notas de cereja e pimenta preta. Leve.",
    "Più strutturato e complesso del Classico, con note di frutta matura e spezie.":
        "Mais estruturado e complexo que o Classico, com notas de fruta madura e especiarias.",
    "Elegante e vellutato, con sentori di sottobosco e lampone.":
        "Elegante e aveludado, com notas de sub-bosque e framboesa.",
    "Corposo e robusto, con note decise di ribes nero e peperone verde.":
        "Encorpado e robusto, com notas marcadas de groselha preta e pimento verde.",
    "Rosso decisivo e strutturato dalla Campania, con note di ciliegia scura, prugna e spezie. Corposo e elegante.":
        "Tinto decisivo e estruturado da Campânia, com notas de cereja escura, ameixa e especiarias. Encorpado e elegante.",
    "Frizzante e aromatico, con sentori di mela e pera. Perfetto per ogni brindisi.":
        "Espumante e aromático, com notas de maçã e pera. Perfeito para qualquer brinde.",
    "Bollicina cremosa e setosa, con bollicine fini e note di pane tostato.":
        "Espumante cremoso e sedoso, com bolhas finas e notas de pão tostado.",
    "Metodo Classico elegante con un perlage fine. Note di crosta di pane e agrumi.":
        "Método Clássico elegante com perlage fino. Notas de côdea de pão e citrinos.",
    "Bollicina rosé fresca e vivace. Sentori di fragoline di bosco e ribes rosso.":
        "Espumante rosé fresco e vivo. Notas de morangos silvestres e groselha vermelha.",
    "Elegante Blanc de Blancs con note di agrumi freschi e mineralità.":
        "Elegante Blanc de Blancs com notas de citrinos frescos e mineralidade.",
    "Champagne senza dosaggio, puro e autentico con carattere deciso.":
        "Champagne sem dosagem, puro e autêntico com carácter decidido.",
    "Champagne iconico, complesso e raffinato con note di frutta matura e spezie.":
        "Champagne icónico, complexo e refinado com notas de fruta madura e especiarias.",
    "Cuvée prestigiosa millesimata, elegante e di grande finezza.":
        "Cuvée prestigiosa millesimada, elegante e de grande finura.",
    "Champagne leggendario, sublime espressione di eleganza e complessità.":
        "Champagne lendário, expressão sublime de elegância e complexidade.",

    # --- Gastronomia ---
    "Prodotti freschi del giorno. Chiedere al personale per la disponibilità e per gli allergeni.":
        "Produtos frescos do dia. Pergunte ao pessoal pela disponibilidade e alérgenos.",
    "Polpetta di Carne": "Almôndega de Carne",
    "Polpetta di carne mista.": "Almôndega de carne mista.",
    "Polpetta Vegetariana": "Almôndega Vegetariana",
    "Polpetta a base di verdure e ricotta.": "Almôndega à base de vegetais e ricotta.",
    "Arancino al Tastasal": "Arancino com Tastasal",
    "Ripieno di riso e tastasal (impasto di salsiccia).":
        "Recheio de arroz e tastasal (massa de salsicha).",
    "Pizza Margherita": "Pizza Margherita",
    "Impasto fresco, pomodoro, mozzarella e basilico.":
        "Massa fresca, tomate, mozzarella e manjericão.",
    "Pizza Farcita": "Pizza Recheada",
    "Impasto fresco con ripieno del giorno (chiedere al personale).":
        "Massa fresca com recheio do dia (pergunte ao pessoal).",
    "Toast": "Tosta",
    "Con prosciutto e formaggio.": "Com fiambre e queijo.",
    "Focaccia": "Focaccia",
    "Chiedere al personale per i gusti disponibili.": "Pergunte ao pessoal pelos sabores disponíveis.",
    "Pizzetta": "Mini Pizza",
    "Piccola porzione ideale per un assaggio veloce.":
        "Pequena porção ideal para uma prova rápida.",
    "Edamame": "Edamame",
    "Fagioli di soia al vapore leggermente salati.":
        "Feijão de soja a vapor levemente salgado.",
    "Nachos (fino alle 22:00)": "Nachos (até às 22:00)",
    "Croccanti nachos serviti con guacamole fresco, cheddar fuso e panna acida.":
        "Nachos estaladiços servidos com guacamole fresco, cheddar derretido e natas azedas.",

    # --- Piatti principali ---
    "Chiedere al personale per gli allergeni.": "Pergunte ao pessoal pelos alérgenos.",
    "Tagliere di Salumi e Formaggi": "Tábua de Enchidos e Queijos",
    "Con giardiniera della casa e mostarda.": "Com pickles da casa e mostarda.",
    "Pata Negra de Bellota 100%": "Pata Negra de Bellota 100%",
    "Con pan y tomate.": "Com pan y tomate.",
    "Vellutata di Verdure": "Creme de Legumes",
    "Con crostini e pecorino. Con bacon croccante (+3€) o gamberi (+3€).":
        "Com crostini e pecorino. Com bacon estaladiço (+3€) ou camarão (+3€).",
    "Battuta di Manzo alla Francese": "Tártaro de Vaca à Francesa",
    "Tagliata al coltello, con senape, scalogno, capperi e tuorlo d'uovo. Con tartufo nero (+5€).":
        "Cortada à faca, com mostarda, chalota, alcaparras e gema de ovo. Com trufa preta (+5€).",
    "Insalata Mista di Pollo": "Salada Mista de Frango",
    "Con bacon croccante, avocado, salsa yogurt e ravanelli.":
        "Com bacon estaladiço, abacate, molho de iogurte e rabanetes.",
    "Acciuga del Cantabrico": "Anchova do Cantábrico",
    "Con pane tostato e burro.": "Com pão tostado e manteiga.",
    "Pad Thai": "Pad Thai",
    "Spaghetti di riso saltati con verdure croccanti, pollo, gamberi e salsa tamarindo.":
        "Esparguete de arroz salteado com legumes estaladiços, frango, camarão e molho de tamarindo.",
    "Gyoza (6pz)": "Gyoza (6 un.)",
    "Ravioli giapponesi croccanti ripieni di maiale, con salsa teriyaki, erba cipollina fresca e semi di sesamo.":
        "Ravioli japoneses estaladiços recheados de porco, com molho teriyaki, cebolinho fresco e sementes de sésamo.",
    "Maccheroncini Pomodoro": "Maccheroncini ao Tomate",
    "Burrata e basilico.": "Burrata e manjericão.",
    "Gnocchi Pesto": "Gnocchi ao Pesto",

    # --- Birre nomi ---
    "Birra Pils 'Maes' 0,25L": "Cerveja Pils 'Maes' 0,25L",
    "Birra Pils 'Maes' 0,5L": "Cerveja Pils 'Maes' 0,5L",

    # --- Signatures (nomi) ---
    "Clearence Sale": "Clearence Sale",
    "Jammy Tramp": "Jammy Tramp",
    "Midnight Negroni": "Midnight Negroni",
    "Solero": "Solero",

    # --- Vini (nomi) ---
    "Lugana 'Tenuta Roveglia'": "Lugana 'Tenuta Roveglia'",
    "Soave 'Coffele'": "Soave 'Coffele'",
    "Chardonnay 'Dolfo'": "Chardonnay 'Dolfo'",
    "Ribolla Gialla 'Dolfo'": "Ribolla Gialla 'Dolfo'",
    "Rosé 'San Salvatore Vetere'": "Rosé 'San Salvatore Vetere'",
    "Falanghina 'San Salvatore'": "Falanghina 'San Salvatore'",
    "Valpolicella Classico 'Speri'": "Valpolicella Classico 'Speri'",
    "Valpolicella Superiore 'Speri'": "Valpolicella Superiore 'Speri'",
    "Pinot Nero 'Ploner'": "Pinot Noir 'Ploner'",
    "Cabernet Sauvignon 'Dolfo'": "Cabernet Sauvignon 'Dolfo'",
    "Jungano 'San Salvatore'": "Jungano 'San Salvatore'",
    "Prosecco 'Follador'": "Prosecco 'Follador'",
    "Franciacorta Satèn 'Berlucchi'": "Franciacorta Satèn 'Berlucchi'",
    "Trento DOC 'Altemasi'": "Trento DOC 'Altemasi'",
    "Rosé 'Terra dei Re'": "Rosé 'Terra dei Re'",
    "Champagne 'Diebolt Vallois' Blanc de Blancs": "Champagne 'Diebolt Vallois' Blanc de Blancs",
    "Champagne 'Drappier' Brut Nature": "Champagne 'Drappier' Brut Nature",
    "'Bollinger' Special Cuvée": "'Bollinger' Special Cuvée",
    "'Bollinger' La Grande Année": "'Bollinger' La Grande Année",
    "'Dom Pérignon' Vintage 2013": "'Dom Pérignon' Vintage 2013",

    # --- Piatti ---
    "Fettuccine Salmone": "Fettuccine de Salmão",
    "Panna acida, vodka e scorza di lime.": "Natas azedas, vodka e raspas de lima.",
    "Ravioli Artigianali alla Gricia": "Ravioli Artesanais à Gricia",
    "Ravioli ripieni di cacio e pepe, serviti con guanciale croccante.":
        "Ravioli recheados de cacio e pepe, servidos com guanciale estaladiço.",
    "Tagliata di Manzo": "Tagliata de Vaca",
    "Controfiletto di manzo scottato, con porcini e scaglie di Monte Veronese stagionato. Con tartufo nero (+5€).":
        "Lombo de vaca selado, com porcini e lascas de Monte Veronese curado. Com trufa preta (+5€).",
    "Yakitori": "Yakitori",
    "Spiedini di pollo glassati alla teriyaki, con riso basmati, edamame e semi di sesamo.":
        "Espetadas de frango glaceadas com teriyaki, com arroz basmati, edamame e sementes de sésamo.",
    "Moscardini in Umido": "Polvinhos Estufados",
    "Con crema di polenta.": "Com creme de polenta.",
    "Burrito": "Burrito",
    "Burrito farcito con manzo e maiale, fagioli neri, formaggio Monterrey Jack, guacamole, panna acida, insalata e riso basmati. Servito con nachos croccanti.":
        "Burrito recheado com vaca e porco, feijão preto, queijo Monterrey Jack, guacamole, natas azedas, alface e arroz basmati. Servido com nachos estaladiços.",
    "Bacon Cheeseburger": "Bacon Cheeseburger",
    "Hamburger di manzo, formaggio cheddar, pomodoro, insalata, bacon croccante, e salsa BBQ. Servito con patate spadellate.":
        "Hambúrguer de vaca, queijo cheddar, tomate, alface, bacon estaladiço e molho BBQ. Servido com batatas salteadas.",
    "Veggie Burger": "Veggie Burger",
    "Pane bun nero, burger vegetale, maionese al tartufo, formaggio brie, spinacino fresco, cipolla caramellata e patate spadellate.":
        "Pão bun preto, hambúrguer vegetal, maionese de trufa, queijo brie, espinafres frescos, cebola caramelizada e batatas salteadas.",
    "Bao (2pz)": "Bao (2 un.)",
    "Con pulled pork, coleslaw di cappuccio viola e pickles.":
        "Com pulled pork, coleslaw de couve roxa e pickles.",
    "Vitello Tonnato": "Vitela Tonnato",
    "Carne Salà": "Carne Salà",
    "Con misticanza, porcini, Monte Veronese e pomodorini.":
        "Com mesclun, porcini, Monte Veronese e tomate cereja.",

    # --- Dessert ---
    "Tiramisù della Casa": "Tiramisù da Casa",
    "Panna Cotta": "Panna Cotta",
    "Gusto a scelta: cioccolato o caramello.": "Sabor à escolha: chocolate ou caramelo.",
    "Sformatino al Cioccolato": "Bolinho de Chocolate",
    "Con gelato alla stracciatella.": "Com gelado de stracciatella.",
    "Sbrisolona e Grappa": "Sbrisolona e Grappa",
    "Torta secca mantovana con farina di mais e mandorle, servita con un bicchierino di grappa veneta.":
        "Bolo seco de Mântua com farinha de milho e amêndoa, servido com um copinho de grappa do Vêneto.",
    "Banana Bread": "Banana Bread",
    "Soffice dolce alla banana, perfetto per una pausa golosa.":
        "Bolo macio de banana, perfeito para uma pausa gulosa.",

    # --- Altre UI ---
    "Scopri gli altri menù": "Descubra os outros menus",
    "Home Page": "Página Inicial",
    "E tartare di gambero.": "E tártaro de camarão.",
}


def add_pt_attr(html: str, it_text: str, pt_text: str) -> tuple[str, int]:
    """
    Trova ogni elemento che ha data-it="it_text" e aggiunge data-pt="pt_text"
    se non gia' presente. Inserisce data-pt subito dopo data-it.
    Ritorna (nuovo_html, num_sostituzioni).
    """
    # Escape regex special chars nella stringa IT
    esc = re.escape(it_text)
    # Match: data-it="..." (possibilmente seguito da altri attributi prima di data-pt)
    # Aggiungiamo data-pt subito dopo data-it.
    pattern = re.compile(r'(data-it="' + esc + r'")(?![^>]*\bdata-pt=)')
    pt_attr = f' data-pt="{pt_text}"'
    new_html, count = pattern.subn(r'\1' + pt_attr, html)
    return new_html, count


def main():
    html = HTML.read_text(encoding="utf-8")
    total = 0
    not_found = []
    for it, pt in TR.items():
        html, n = add_pt_attr(html, it, pt)
        if n == 0:
            not_found.append(it[:60])
        total += n
    HTML.write_text(html, encoding="utf-8")
    print(f"Totale attributi data-pt aggiunti: {total}")
    if not_found:
        print(f"\nVoci non trovate ({len(not_found)}):")
        for nf in not_found:
            print(f"  - {nf}")


if __name__ == "__main__":
    main()
