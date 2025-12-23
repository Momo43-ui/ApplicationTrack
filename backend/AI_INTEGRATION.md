# 🤖 Intégration IA - Générateur de Lettres de Motivation

## Vue d'ensemble

ApplicationTrack intègre maintenant un **générateur de lettres de motivation propulsé par l'Intelligence Artificielle**. Cette fonctionnalité permet de créer automatiquement des lettres personnalisées et professionnelles pour chaque candidature.

## ✨ Fonctionnalités

- 🎯 **Génération automatique** basée sur l'annonce et le profil
- 🎨 **Personnalisation** avec vos informations (nom, expérience, compétences)
- 📋 **Copier/Télécharger** facilement le résultat
- 🔄 **Multi-providers** : OpenAI, Claude, ou Gemini
- 🆓 **Mode fallback** : template basique sans clé API

## 🚀 Configuration

### Option 1 : OpenAI GPT-4 (Recommandé)

**Avantages :**
- Très performant et naturel
- Excellente compréhension du contexte
- Modèle `gpt-4o-mini` économique (~0.03$/1000 tokens)

**Configuration :**
1. Créez un compte sur [OpenAI](https://platform.openai.com/)
2. Ajoutez du crédit (minimum $5)
3. Générez une clé API dans [API Keys](https://platform.openai.com/api-keys)
4. Ajoutez dans votre `.env` :
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### Option 2 : Anthropic Claude

**Avantages :**
- Excellent pour l'analyse et la rédaction
- Moins cher (~0.008$/1000 tokens)
- Très créatif

**Configuration :**
1. Créez un compte sur [Anthropic Console](https://console.anthropic.com/)
2. Générez une clé API
3. Ajoutez dans votre `.env` :
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### Option 3 : Google Gemini (Gratuit)

**Avantages :**
- **Gratuit** jusqu'à 60 requêtes/minute
- Performant
- Idéal pour tester

**Configuration :**
1. Obtenez une clé sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Ajoutez dans votre `.env` :
```bash
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
```

### Option 4 : Sans IA (Template)

Si aucune clé API n'est configurée, le système génère une lettre template basique que vous pouvez personnaliser manuellement.

## 📖 Utilisation

### Depuis l'interface

1. Ouvrez une candidature (bouton "👁️ Voir détails")
2. Cliquez sur **"✨ Lettre IA"**
3. (Optionnel) Remplissez votre profil :
   - Votre nom
   - Votre expérience
   - Vos compétences clés
4. Sélectionnez le moteur IA
5. Cliquez sur **"Générer la lettre de motivation"**
6. Copiez ou téléchargez le résultat

### Depuis l'API

```bash
POST /api/ai/generate-cover-letter
Content-Type: application/json

{
  "candidature_id": 123,
  "provider": "openai",
  "user_profile": {
    "nom": "Jean Dupont",
    "experience": "5 ans en développement web",
    "competences": "React, Python, TypeScript"
  }
}
```

**Réponse :**
```json
{
  "success": true,
  "letter": "Madame, Monsieur,\n\nC'est avec un vif intérêt...",
  "provider": "OpenAI GPT-4o-mini",
  "tokens_used": 450
}
```

## 💰 Coûts estimés

### OpenAI GPT-4o-mini
- **Prix :** ~$0.03 par 1000 tokens
- **Coût moyen par lettre :** ~$0.02 (environ 500 tokens)
- **100 lettres :** ~$2.00

### Anthropic Claude Haiku
- **Prix :** ~$0.008 par 1000 tokens
- **Coût moyen par lettre :** ~$0.005
- **100 lettres :** ~$0.50

### Google Gemini
- **Gratuit** jusqu'à 60 requêtes/minute

## 🔒 Sécurité

- Les clés API ne sont **jamais exposées** au frontend
- Toutes les requêtes passent par le backend Flask
- Les clés sont stockées dans `.env` (non versionné)
- Timeout de 30 secondes pour éviter les blocages

## 🛠️ Architecture technique

```
Frontend (React)
    ↓
CoverLetterGenerator.jsx
    ↓ POST /api/ai/generate-cover-letter
Backend (Flask)
    ↓
ai_service.py
    ↓
[OpenAI | Claude | Gemini | Template]
    ↓
Lettre de motivation
```

## 🧪 Test sans clé API

Pour tester sans configurer d'API :
1. Lancez l'application normalement
2. Le système utilisera automatiquement le mode template
3. Vous verrez : `"Template (aucune clé API configurée)"`

## 📝 Personnalisation

### Modifier le prompt

Éditez `backend/ai_service.py`, méthode `_build_prompt()` pour ajuster les instructions données à l'IA.

### Ajouter un nouveau provider

1. Ajoutez la clé dans `.env`
2. Créez une méthode `_generate_with_[provider]()` dans `ai_service.py`
3. Ajoutez le cas dans `generate_cover_letter()`

## ❓ Troubleshooting

### "Erreur OpenAI: 401"
→ Clé API invalide. Vérifiez votre clé dans `.env`

### "Erreur OpenAI: 429"
→ Quota dépassé. Ajoutez du crédit sur votre compte OpenAI

### "Template (aucune clé API configurée)"
→ Aucune clé API n'est configurée. C'est normal si vous voulez utiliser le mode template.

### La génération est lente
→ Normal, l'IA prend 5-15 secondes pour générer une lettre de qualité.

## 🎯 Prochaines améliorations possibles

- [ ] Sauvegarde des lettres générées
- [ ] Historique des générations
- [ ] Édition en ligne avec suggestions IA
- [ ] Analyse du CV pour meilleure personnalisation
- [ ] Multi-langues (anglais, espagnol, etc.)
- [ ] Templates de styles différents (formel, startup, créatif)

## 📚 Ressources

- [Documentation OpenAI](https://platform.openai.com/docs)
- [Documentation Anthropic](https://docs.anthropic.com/)
- [Documentation Gemini](https://ai.google.dev/docs)

---

**Note :** L'utilisation de l'IA est entièrement optionnelle. L'application fonctionne parfaitement sans clé API avec le mode template.
