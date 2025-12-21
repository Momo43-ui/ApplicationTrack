# Guide de déploiement en production

## 🚀 Déploiement sur Render (Recommandé - Gratuit)

### Prérequis
✅ Base de données PostgreSQL créée sur Render (fait ✓)
✅ Compte GitHub
✅ Code poussé sur GitHub

### Option 1 : Déploiement automatique (Blueprint)

1. **Poussez le code sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Sur Render.com Dashboard**
   - Cliquez sur "New +" → "Blueprint"
   - Connectez votre dépôt GitHub
   - Render détectera automatiquement le fichier `render.yaml`
   - Cliquez sur "Apply"

3. **Configuration automatique**
   - Render créera automatiquement :
     - Backend API (avec Gunicorn)
     - Frontend static site
     - Connexion à la base PostgreSQL

### Option 2 : Déploiement manuel

#### Backend (API)

1. **Sur Render Dashboard → New → Web Service**
2. Configurez :
   - **Repository** : Votre repo GitHub
   - **Root Directory** : `backend`
   - **Environment** : Python
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `gunicorn app:app`
   - **Region** : Frankfurt

3. **Variables d'environnement** :
   ```
   FLASK_ENV=production
   SECRET_KEY=<générer-une-clé-secrète>
   DATABASE_URL=<URL-de-votre-postgresql>
   CORS_ORIGINS=https://votre-frontend.onrender.com
   ```

4. Déployez → Copiez l'URL du backend (ex: `https://applicationtrack-api.onrender.com`)

#### Frontend

1. **Sur Render Dashboard → New → Static Site**
2. Configurez :
   - **Repository** : Votre repo GitHub
   - **Root Directory** : `frontend`
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
   - **Region** : Frankfurt

3. **Variable d'environnement** :
   ```
   VITE_API_URL=https://applicationtrack-api.onrender.com/api
   ```

4. **Routes (pour React Router)** :
   - Rewrite rule : `/*` → `/index.html`

---

## 🔐 Sécurité

### Générer une SECRET_KEY sécurisée
```bash
cd backend
python -c "import secrets; print(secrets.token_hex(32))"
```

Copiez le résultat dans la variable `SECRET_KEY` sur Render.

---

## 🌐 Alternative : Vercel (Frontend) + Render (Backend)

### Frontend sur Vercel

1. **Installez Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Déployez le frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Configurez les variables d'environnement sur Vercel**
   - `VITE_API_URL` = URL de votre backend Render

### Backend reste sur Render (voir instructions ci-dessus)

---

## 📋 Checklist avant déploiement

- [x] PostgreSQL configuré sur Render
- [x] Backend compatible avec Gunicorn
- [x] Variables d'environnement configurées
- [ ] Code poussé sur GitHub
- [ ] Tests de l'API en local
- [ ] SECRET_KEY changée pour production
- [ ] CORS configuré avec les bons domaines

---

## 🧪 Test après déploiement

1. **Backend API**
   ```
   https://votre-backend.onrender.com/api/health
   ```
   Devrait retourner : `{"status": "ok"}`

2. **Frontend**
   Accédez à : `https://votre-frontend.onrender.com`

3. **Connexion Frontend-Backend**
   - Créez un compte
   - Ajoutez une candidature
   - Vérifiez que les données sont sauvegardées

---

## 💡 Notes importantes

- **Render Free Tier** : Les services s'endorment après 15 min d'inactivité
- Premier accès peut prendre 30-60 secondes (réveil du service)
- PostgreSQL Free : 256 MB de stockage
- Logs disponibles dans le dashboard Render

---

## 🆘 Dépannage

### Backend ne démarre pas
- Vérifiez les logs Render
- Confirmez que `DATABASE_URL` est bien défini
- Vérifiez que `gunicorn` est dans requirements.txt

### Frontend ne se connecte pas au backend
- Vérifiez `VITE_API_URL` dans les variables Vercel/Render
- Confirmez que CORS inclut l'URL du frontend
- Regardez la console du navigateur (F12)

### Base de données vide
- Les tables sont créées automatiquement au premier lancement
- Vérifiez que `db.create_all()` est dans app.py
