# Script per estrarre dati menu dall'HTML
$html = Get-Content "index.html" -Raw -Encoding UTF8

# Pattern regex per estrarre sezioni e items
$sections = @()

# Trova tutte le sezioni
$sectionMatches = [regex]::Matches($html, '<section id="([^"]+)" class="menu-section">(.*?)</section>\s*</section>', [System.Text.RegularExpressions.RegexOptions]::Singleline)

foreach ($sectionMatch in $sectionMatches) {
    $sectionId = $sectionMatch.Groups[1].Value
    $sectionContent = $sectionMatch.Groups[2].Value
    
    # Trova il titolo della categoria
    $titleMatch = [regex]::Match($sectionContent, 'class="category-title[^"]*"[^>]*data-it="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-es="([^"]*)"[^>]*data-fr="([^"]*)"[^>]*data-de="([^"]*)"[^>]*data-ru="([^"]*)"')
    
    $section = @{
        id = $sectionId
        name = @{
            it = if ($titleMatch.Success) { $titleMatch.Groups[1].Value } else { "" }
            en = if ($titleMatch.Success) { $titleMatch.Groups[2].Value } else { "" }
            es = if ($titleMatch.Success) { $titleMatch.Groups[3].Value } else { "" }
            fr = if ($titleMatch.Success) { $titleMatch.Groups[4].Value } else { "" }
            de = if ($titleMatch.Success) { $titleMatch.Groups[5].Value } else { "" }
            ru = if ($titleMatch.Success) { $titleMatch.Groups[6].Value } else { "" }
        }
        items = @()
    }
    
    # Trova tutti gli items nella sezione
    $itemMatches = [regex]::Matches($sectionContent, '<div class="menu-item([^"]*)">(.*?)</div>\s*(?=<div class="menu-item|</section|$)', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    foreach ($itemMatch in $itemMatches) {
        $itemClass = $itemMatch.Groups[1].Value
        $itemContent = $itemMatch.Groups[2].Value
        
        # Nome item
        $nameMatch = [regex]::Match($itemContent, 'class="item-name[^"]*"[^>]*data-it="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-es="([^"]*)"[^>]*data-fr="([^"]*)"[^>]*data-de="([^"]*)"[^>]*data-ru="([^"]*)"')
        
        # Descrizione item
        $descMatch = [regex]::Match($itemContent, 'class="item-description[^"]*"[^>]*data-it="([^"]*)"[^>]*data-en="([^"]*)"[^>]*data-es="([^"]*)"[^>]*data-fr="([^"]*)"[^>]*data-de="([^"]*)"[^>]*data-ru="([^"]*)"')
        
        # Prezzo item
        $priceMatch = [regex]::Match($itemContent, 'class="item-price">([^<]+)</span>')
        
        if ($nameMatch.Success) {
            $item = @{
                name = @{
                    it = $nameMatch.Groups[1].Value
                    en = $nameMatch.Groups[2].Value
                    es = $nameMatch.Groups[3].Value
                    fr = $nameMatch.Groups[4].Value
                    de = $nameMatch.Groups[5].Value
                    ru = $nameMatch.Groups[6].Value
                }
                description = @{
                    it = if ($descMatch.Success) { $descMatch.Groups[1].Value } else { "" }
                    en = if ($descMatch.Success) { $descMatch.Groups[2].Value } else { "" }
                    es = if ($descMatch.Success) { $descMatch.Groups[3].Value } else { "" }
                    fr = if ($descMatch.Success) { $descMatch.Groups[4].Value } else { "" }
                    de = if ($descMatch.Success) { $descMatch.Groups[5].Value } else { "" }
                    ru = if ($descMatch.Success) { $descMatch.Groups[6].Value } else { "" }
                }
                price = if ($priceMatch.Success) { $priceMatch.Groups[1].Value.Trim() } else { "" }
                noBorder = $itemClass -like "*no-border*"
            }
            $section.items += $item
        }
    }
    
    if ($section.items.Count -gt 0) {
        $sections += $section
    }
}

$menuData = @{
    sections = $sections
}

# Salva in JSON
$json = $menuData | ConvertTo-Json -Depth 10 -Compress:$false
$json | Out-File "menu-data.json" -Encoding UTF8

Write-Host "✅ Estratte $($sections.Count) sezioni" -ForegroundColor Green
foreach ($section in $sections) {
    Write-Host "  - $($section.name.it): $($section.items.Count) items" -ForegroundColor Cyan
}
