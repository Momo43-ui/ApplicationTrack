# Script pour supprimer le mode sombre PROPREMENT
$frontendPath = "C:\Users\pasca\Desktop\ApplicationTrack\frontend\src"

Write-Host "Suppression du mode sombre..." -ForegroundColor Cyan

# Traiter tous les fichiers JSX
$files = Get-ChildItem -Path $frontendPath -Recurse -Include *.jsx

foreach ($file in $files) {
    Write-Host "Traitement: $($file.Name)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    
    # Supprimer toutes les classes dark: avec regex plus précis
    # Cible: dark:text-xxx dark:bg-xxx dark:border-xxx etc.
    $content = $content -replace '\s+dark:[a-zA-Z\-0-9\/\[\]]+', ''
    
    # Sauvegarder
    $content | Set-Content $file.FullName -NoNewline -Encoding UTF8
}

Write-Host "`nTermine!" -ForegroundColor Green
Write-Host "Verifier manuellement App.jsx pour supprimer darkMode state et toggle" -ForegroundColor Yellow
