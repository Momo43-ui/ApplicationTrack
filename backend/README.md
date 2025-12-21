# ApplicationTrack Backend API

Backend Flask avec base de données SQL pour l'application de suivi de candidatures.

## 🚀 Installation

```bash
# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

## 📊 Base de données

La base de données SQLite est créée automatiquement au premier lancement.

**Tables :**
- `users` : Utilisateurs de l'application
- `candidatures` : Candidatures de chaque utilisateur

## 🔧 Configuration

Créer un fichier `.env` à la racine du dossier backend :

```env
SECRET_KEY=votre-clé-secrète
DATABASE_URL=sqlite:///applicationtrack.db
```

## ▶️ Lancement

```bash
python app.py
```

L'API sera disponible sur `http://localhost:5000`

## 📡 Endpoints API

### Authentification

- `POST /api/register` - Inscription d'un utilisateur
  ```json
  {
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/login` - Connexion d'un utilisateur
  ```json
  {
    "username": "john",
    "password": "password123"
  }
  ```

### Candidatures

- `GET /api/users/<user_id>/candidatures` - Récupérer toutes les candidatures
- `POST /api/users/<user_id>/candidatures` - Créer une candidature
  ```json
  {
    "entreprise": "Google",
    "annonce": "Développeur Full Stack",
    "date": "2025-12-21",
    "etat": "en_attente"
  }
  ```

- `GET /api/candidatures/<candidature_id>` - Récupérer une candidature
- `PUT /api/candidatures/<candidature_id>` - Mettre à jour une candidature
- `DELETE /api/candidatures/<candidature_id>` - Supprimer une candidature
- `PATCH /api/candidatures/<candidature_id>/etat` - Mettre à jour l'état
  ```json
  {
    "etat": "entretien_passe"
  }
  ```

### Statistiques

- `GET /api/users/<user_id>/stats` - Statistiques des candidatures

### Utilitaires

- `GET /api/health` - Vérifier l'état de l'API
- `GET /api/hello` - Test de connexion

## 📦 Structure

```
backend/
├── app.py              # Application Flask principale
├── models.py           # Modèles de base de données
├── config.py           # Configuration
├── requirements.txt    # Dépendances Python
├── .env               # Variables d'environnement
└── applicationtrack.db # Base de données SQLite (créée auto)
```

## 🔒 Sécurité

- Les mots de passe sont hashés avec `werkzeug.security`
- CORS configuré pour les origines autorisées
- Validation des données entrantes

## États des candidatures

- `en_attente` : En attente de réponse
- `refus_etude` : Refusé après études du dossier
- `entretien_passe` : Entretien réalisé
- `sans_reponse` : Sans réponse
- `accepte` : Candidature acceptée
- `refuse_entretien` : Refusé après entretien
- `sans_reponse_entretien` : Sans réponse après entretien
