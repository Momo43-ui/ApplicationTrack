# Script pour supprimer toutes les classes dark: de l'application
$frontendPath = "C:\Users\pasca\Desktop\ApplicationTrack\frontend\src"

# Fonction pour nettoyer les classes dark: d'un fichier
function Remove-DarkClasses {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Supprimer les classes dark:xxx
    $content = $content -replace '\s+dark:[a-zA-Z0-9\-\/\[\]\(\)\.]+', ''
    
    # Nettoyer les espaces multiples
    $content = $content -replace '\s{2,}', ' '
    
    if ($content -ne $originalContent) {
        Set-Content $filePath -Value $content -NoNewline
        Write-Host "Nettoye: $($filePath)" -ForegroundColor Green
        return $true
    }
    return $false
}

# Traiter tous les fichiers .jsx
Write-Host "Recherche des fichiers JSX..." -ForegroundColor Cyan
$jsxFiles = Get-ChildItem -Path $frontendPath -Recurse -Include *.jsx

$count = 0
foreach ($file in $jsxFiles) {
    if (Remove-DarkClasses $file.FullName) {
        $count++
    }
}

Write-Host "Termine! $count fichiers modifies." -ForegroundColor Green
