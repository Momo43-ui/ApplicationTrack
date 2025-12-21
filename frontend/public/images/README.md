# Dossier Images & Logos

Ce dossier contient tous les assets visuels du site ApplicationTrack.

## Structure recommandée

```
images/
├── logo.svg          # Logo principal (format SVG recommandé)
├── logo.png          # Logo principal (format PNG, alternative)
├── favicon.ico       # Icône du navigateur (16x16, 32x32, 48x48)
├── favicon.svg       # Icône du navigateur (format SVG)
├── og-image.png      # Image pour partage sur réseaux sociaux (1200x630)
└── backgrounds/      # Images de fond si nécessaire
```

## Formats recommandés

- **Logo principal** : SVG (vectoriel, redimensionnable) ou PNG (haute résolution)
- **Favicon** : ICO ou SVG
- **Images sociales** : PNG ou JPG (1200x630 pixels)

## Utilisation

1. Déposez vos fichiers dans ce dossier
2. Pour le logo principal : nommez-le `logo.svg` ou `logo.png`
3. Pour le favicon : nommez-le `favicon.ico` ou `favicon.svg`
4. Ensuite, mettez à jour les références dans :
   - `index.html` (ligne 5) pour le favicon
   - Composants React qui utilisent le logo

## Exemples d'utilisation dans le code

### Dans index.html
```html
<link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
```

### Dans un composant React
```jsx
<img src="/images/logo.svg" alt="ApplicationTrack Logo" />
```

## Note importante
Les fichiers dans `/public/` sont servis directement. Utilisez des chemins relatifs commençant par `/`.
