# ApplicationTrack - Frontend

Application de suivi de candidatures développée en React avec Tailwind CSS.

## 🎯 Fonctionnalités

### 1. Ajouter une annonce
- **Entreprise** (obligatoire) : Nom de l'entreprise
- **Annonce** (obligatoire) : Description du poste
- **Date** (auto-incrémentée) : Date de candidature
- Notification de succès après sauvegarde

### 2. Suivi des candidatures
Tableau de bord complet avec gestion des états :

#### États initiaux (après candidature) :
- ✉️ **En attente** : Candidature envoyée
- ❌ **Refus après études** : Rejeté sans entretien
- 📞 **Entretien passé** : Entretien réalisé
- 🔕 **Sans réponse** : Pas de retour

#### États après entretien :
- ✅ **Accepté** : Offre reçue
- ❌ **Refusé après entretien** : Rejeté après entretien
- 🔕 **Sans réponse** : Pas de retour après entretien

### 3. Statistiques en temps réel
- Total des candidatures
- Nombre d'acceptations
- Candidatures en cours
- Candidatures refusées

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build
```

## 📁 Structure

```
src/
├── components/
│   ├── AddJobForm.jsx      # Formulaire d'ajout d'annonce
│   └── JobTracker.jsx      # Tableau de suivi
├── App.jsx                  # Composant principal
├── App.css                  # Styles globaux
├── index.css               # Tailwind + styles
└── main.jsx                # Point d'entrée
```

## 💾 Persistance des données

Les candidatures sont sauvegardées dans `localStorage` pour persister entre les sessions.

## 🎨 Design

- Tailwind CSS pour le styling
- Interface responsive
- Animations et transitions fluides
- Code couleur pour les états

## 🔄 Flux de travail

```
Début
  ↓
Ajouter une annonce → Sauvegarder → Notification succès
  ↓
Suivi des candidatures
  ↓
En attente → [Refus / Entretien / Sans réponse]
  ↓
Entretien passé → [Accepté / Refusé / Sans réponse]
  ↓
Fin
```

## 🛠️ Technologies

- React 19
- Vite
- Tailwind CSS
- LocalStorage API

## 📝 Notes

- Les données sont stockées localement dans le navigateur
- L'ID est auto-généré avec `Date.now()`
- Interface française
- Validation des champs obligatoires
