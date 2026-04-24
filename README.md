# Skalette Bistrò – Menu Digitale

Sito statico che mostra il menu del ristorante **Skalette Bistrò** con traduzioni multilingua (IT/EN/ES/FR/DE/RU), sfondo animato e indicazione degli allergeni per ogni piatto.

## Stack

- HTML / CSS / JavaScript vanilla
- [Three.js](https://threejs.org/) per lo sfondo animato (shader)

## Avvio in locale

Il sito è composto da file statici. Per uno sviluppo locale è sufficiente un qualsiasi web server statico, ad esempio:

```powershell
# Con Python 3
python -m http.server 8000

# Oppure con Node.js
npx serve .
```

Poi apri <http://localhost:8000> nel browser.

> Aprire `index.html` direttamente da `file://` può funzionare, ma alcune funzioni (es. fetch di JSON) potrebbero non comportarsi correttamente: meglio usare un server.

## Struttura del progetto

| File / cartella | Descrizione |
|---|---|
| `index.html` | Pagina principale del menu (con tutte le voci + traduzioni come `data-*`). |
| `style.css` | Stili e responsive. |
| `script.js` | Logica UI: lingua, navigazione, animazioni, sfondo Three.js. |
| `allergeni.js` | Mappa "nome piatto → lista allergeni". |
| `menu-data.json` | Dump strutturato del menu (output dello script di estrazione). |
| `flags/` | Bandiere per il selettore lingua. |
| `extract-menu.*` | Script di utilità per estrarre il menu dall'HTML. |

## Aggiungere una voce al menu

1. Inserire il nuovo `<div class="menu-item">…</div>` nella sezione corretta di `index.html`, popolando i `data-it`, `data-en`, `data-es`, `data-fr`, `data-de`, `data-ru` sia sul titolo che sulla descrizione.
2. Se il piatto contiene allergeni, aggiungere la voce in `allergeni.js` usando **esattamente** lo stesso titolo italiano (`data-it`).
3. Se vengono mostrati i badge allergeni anche in HTML (`<span class="allergen-badge">…</span>`), tenerli sincronizzati con `allergeni.js`.

## Deploy

Il sito è pubblicato tramite GitHub Pages (vedi file `CNAME`). Ogni `git push` su `main` aggiorna il sito.
