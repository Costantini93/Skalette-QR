# Script per estrarre tutto il menu da index.html e creare menu-data.js

$html = Get-Content "index.html" -Raw -Encoding UTF8

# Funzione per estrarre attributo data-*
function Get-DataAttribute($text, $attr) {
    if ($text -match "$attr=`"([^`"]*)`"") {
        return $matches[1]
    }
    return ""
}

# Funzione per estrarre tutte le lingue
function Get-AllTranslations($match) {
    return @{
        it = Get-DataAttribute $match "data-it"
        en = Get-DataAttribute $match "data-en"
        es = Get-DataAttribute $match "data-es"
        fr = Get-DataAttribute $match "data-fr"
        de = Get-DataAttribute $match "data-de"
        ru = Get-DataAttribute $match "data-ru"
    }
}

$sections = @()

# Trova tutte le sezioni
$sectionPattern = '<section id="([^"]+)" class="menu-section">(.*?)</section>\s*</section>'
$sectionMatches = [regex]::Matches($html, $sectionPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)

Write-Host "Trovate $($sectionMatches.Count) sezioni" -ForegroundColor Cyan

foreach ($sectionMatch in $sectionMatches) {
    $sectionId = $sectionMatch.Groups[1].Value
    $sectionContent = $sectionMatch.Groups[2].Value
    
    Write-Host "  Elaborando sezione: $sectionId" -ForegroundColor Yellow
    
    # Trova titolo categoria
    $titlePattern = 'class="category-title[^"]*"([^>]*)>([^<]+)</h2>'
    $titleMatch = [regex]::Match($sectionContent, $titlePattern)
    
    $sectionName = Get-AllTranslations $titleMatch.Groups[1].Value
    
    # Trova tutti gli items
    $items = @()
    $itemPattern = '<div class="menu-item([^"]*)">(.*?)</div>\s*(?:<div class="menu-item|</section)'
    $itemMatches = [regex]::Matches($sectionContent, $itemPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    Write-Host "    Trovati $($itemMatches.Count) items" -ForegroundColor Green
    
    foreach ($itemMatch in $itemMatches) {
        $itemClass = $itemMatch.Groups[1].Value
        $itemContent = $itemMatch.Groups[2].Value
        
        # Nome
        $namePattern = 'class="item-name[^"]*"([^>]*)>'
        $nameMatch = [regex]::Match($itemContent, $namePattern)
        $itemName = Get-AllTranslations $nameMatch.Groups[1].Value
        
        # Descrizione (opzionale)
        $descPattern = 'class="item-description[^"]*"([^>]*)>'
        $descMatch = [regex]::Match($itemContent, $descPattern)
        $itemDesc = Get-AllTranslations $descMatch.Groups[1].Value
        
        # Prezzo
        $pricePattern = 'class="item-price">([^<]+)</span>'
        $priceMatch = [regex]::Match($itemContent, $pricePattern)
        $itemPrice = if ($priceMatch.Success) { $priceMatch.Groups[1].Value.Trim() } else { "" }
        
        $item = @{
            name = $itemName
            description = $itemDesc
            price = $itemPrice
            noBorder = $itemClass -like "*no-border*"
        }
        
        $items += $item
    }
    
    $section = @{
        id = $sectionId
        name = $sectionName
        items = $items
    }
    
    $sections += $section
}

# Crea struttura finale
$menuData = @{
    password = "skalette2024"
    sections = $sections
}

# Converti in JSON
$json = $menuData | ConvertTo-Json -Depth 10

# Crea file JS
$jsContent = @"
// Dati del menu - questo file viene generato automaticamente
window.menuDataSource = $json;
"@

$jsContent | Out-File "menu-data.js" -Encoding UTF8 -NoNewline

Write-Host "`n✅ File menu-data.js creato con successo!" -ForegroundColor Green
Write-Host "   Sezioni totali: $($sections.Count)" -ForegroundColor Cyan
$totalItems = ($sections | ForEach-Object { $_.items.Count } | Measure-Object -Sum).Sum
Write-Host "   Items totali: $totalItems" -ForegroundColor Cyan
