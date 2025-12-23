# 🚀 Guide rapide - Génération de lettres de motivation par IA

## Démarrage rapide

### Sans clé API (Mode Template)
L'application fonctionne **immédiatement** sans configuration ! Une lettre template sera générée.

### Avec IA (Recommandé)

**Option la plus simple : Google Gemini (Gratuit)**

1. Obtenez une clé gratuite : https://makersuite.google.com/app/apikey
2. Créez un fichier `.env` dans le dossier `backend/` :
```bash
GEMINI_API_KEY=votre_clé_ici
```
3. Redémarrez le backend
4. C'est prêt ! ✨

**Option la plus performante : OpenAI**

1. Créez un compte : https://platform.openai.com/
2. Ajoutez $5 de crédit minimum
3. Générez une clé API : https://platform.openai.com/api-keys
4. Dans votre `.env` :
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```
5. Redémarrez le backend

## Comment l'utiliser ?

1. Ouvrez une candidature (bouton "👁️ Voir détails")
2. Cliquez sur le bouton **"✨ Lettre IA"** (violet/bleu)
3. Remplissez votre profil (optionnel) :
   - Votre nom
   - Votre expérience  
   - Vos compétences
4. Cliquez sur **"Générer"**
5. Attendez 5-10 secondes
6. Copiez ou téléchargez la lettre !

## Coûts

| Provider | Coût par lettre | Note |
|----------|----------------|------|
| **Gemini** | 0€ | ✅ GRATUIT (60 req/min) |
| **Claude** | ~0.005€ | Très bon rapport qualité/prix |
| **OpenAI** | ~0.02€ | Le plus performant |
| **Template** | 0€ | Sans IA, lettre basique |

## Aide

**"Aucune clé API configurée"**
→ Normal ! Le mode template sera utilisé. Pour activer l'IA, ajoutez une clé dans `.env`

**La génération échoue**
→ Vérifiez que votre clé API est valide et que vous avez du crédit (OpenAI) ou n'avez pas dépassé le quota (Gemini)

**C'est trop long**
→ Normal, l'IA prend 5-15 secondes. Si > 30s, timeout et erreur.

Pour plus d'infos : voir `AI_INTEGRATION.md`
