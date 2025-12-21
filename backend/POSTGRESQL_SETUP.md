# Migration vers PostgreSQL

## 📋 Guide complet

### 1. **Installation de PostgreSQL**

Installez psycopg2 :
```bash
cd backend
pip install -r requirements.txt
```

### 2. **Configuration locale (optionnel)**

Si vous voulez tester PostgreSQL localement :

1. Installez PostgreSQL : https://www.postgresql.org/download/
2. Créez une base de données :
```bash
createdb applicationtrack
```
3. Modifiez `.env` :
```env
DATABASE_URL=postgresql://username:password@localhost:5432/applicationtrack
```

### 3. **Configuration pour production**

#### Option A : Render.com (Recommandé - Gratuit)

1. Créez un compte sur [Render.com](https://render.com)
2. Créez une **PostgreSQL Database** (gratuit)
3. Copiez l'URL de connexion fournie
4. Ajoutez à vos variables d'environnement :
```
DATABASE_URL=postgresql://user:pass@host/dbname
SECRET_KEY=génère-une-clé-secrète-aléatoire
FLASK_ENV=production
CORS_ORIGINS=https://votre-frontend.vercel.app
```

#### Option B : Railway.app

1. Compte sur [Railway.app](https://railway.app)
2. New Project → PostgreSQL
3. Copiez DATABASE_URL
4. Configurez les variables d'environnement

#### Option C : Supabase

1. Compte sur [Supabase.com](https://supabase.com)
2. New Project → Database Settings
3. Connection String (URI mode)

### 4. **Migration des données**

Si vous avez déjà des données dans SQLite :

```bash
cd backend
# Configurez DATABASE_URL vers PostgreSQL dans .env
python migrate_to_postgres.py
```

### 5. **Démarrage**

**Développement (SQLite) :**
```bash
python app.py
```

**Production (PostgreSQL avec Gunicorn) :**
```bash
gunicorn app:app
```

### 6. **Vérification**

Testez l'API :
```
http://your-domain/api/health
```

## 🔒 Sécurité

Générez une vraie SECRET_KEY pour production :
```python
import secrets
print(secrets.token_hex(32))
```

## 📝 Notes

- SQLite reste la DB par défaut pour le développement
- PostgreSQL est configuré automatiquement si DATABASE_URL est défini
- Les migrations sont automatiques avec SQLAlchemy
