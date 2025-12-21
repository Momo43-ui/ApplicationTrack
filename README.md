# ApplicationTrack

Application full-stack avec React (frontend) et Flask (backend).

## Structure du projet

```
ApplicationTrack/
├── frontend/          # Application React avec Tailwind CSS
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/           # API Flask
│   ├── app.py
│   ├── requirements.txt
│   └── venv/
└── README.md
```

## Technologies utilisées

### Frontend
- **React** 18.3.1
- **Vite** - Build tool rapide
- **Tailwind CSS** - Framework CSS utility-first
- **ESLint** - Linting du code

### Backend
- **Python** 3.x
- **Flask** 3.0.0
- **Flask-CORS** - Gestion CORS
- **python-dotenv** - Variables d'environnement

## Installation

### Prérequis
- Node.js (v18 ou supérieur)
- Python (v3.8 ou supérieur)
- npm ou yarn

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# ou
source venv/bin/activate      # Linux/Mac
pip install -r requirements.txt
```

## Démarrage

### Lancer le backend (Port 5000)

```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows PowerShell
python app.py
```

Le serveur Flask démarre sur `http://localhost:5000`

### Lancer le frontend (Port 3000)

```bash
cd frontend
npm run dev
```

L'application React démarre sur `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Vérifie l'état de l'API
- `GET /api/hello` - Message de test

## Scripts disponibles

### Frontend
- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build l'application pour la production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Vérifie le code avec ESLint

### Backend
- `python app.py` - Démarre le serveur Flask en mode debug

## Configuration

### Variables d'environnement (Backend)

Copiez `.env.example` vers `.env` dans le dossier backend et ajustez les valeurs:

```bash
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
```

## Développement

Le frontend est configuré pour faire des proxy des requêtes `/api/*` vers le backend Flask sur le port 5000.

## License

MIT
