"""
Script de migration de SQLite vers PostgreSQL
"""
import os
from app import app, db
from models import User, Candidature
import sqlite3
import sys

def migrate_to_postgres():
    """Migrer les données de SQLite vers PostgreSQL"""
    
    # Vérifier que DATABASE_URL est configuré
    if not os.environ.get('DATABASE_URL') or 'sqlite' in os.environ.get('DATABASE_URL', ''):
        print("❌ Erreur: DATABASE_URL doit pointer vers PostgreSQL")
        print("Configurez DATABASE_URL dans .env avec votre connexion PostgreSQL")
        sys.exit(1)
    
    # Lire les données de SQLite
    sqlite_path = 'instance/applicationtrack.db'
    if not os.path.exists(sqlite_path):
        print("❌ Aucune base SQLite trouvée à migrer")
        sys.exit(1)
    
    print(f"📂 Lecture des données depuis {sqlite_path}...")
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Récupérer les utilisateurs
    cursor.execute("SELECT * FROM user")
    users_data = [dict(row) for row in cursor.fetchall()]
    
    # Récupérer les candidatures
    cursor.execute("SELECT * FROM candidature")
    candidatures_data = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    print(f"✅ Trouvé {len(users_data)} utilisateurs et {len(candidatures_data)} candidatures")
    
    # Créer les tables PostgreSQL
    print("🔨 Création des tables PostgreSQL...")
    with app.app_context():
        db.create_all()
        
        # Migrer les utilisateurs
        print("👤 Migration des utilisateurs...")
        for user_data in users_data:
            user = User(
                id=user_data['id'],
                username=user_data['username'],
                email=user_data['email'],
                password_hash=user_data['password_hash']
            )
            db.session.add(user)
        
        # Migrer les candidatures
        print("📋 Migration des candidatures...")
        for cand_data in candidatures_data:
            candidature = Candidature(
                id=cand_data['id'],
                user_id=cand_data['user_id'],
                entreprise=cand_data['entreprise'],
                annonce=cand_data['annonce'],
                date=cand_data['date'],
                etat=cand_data['etat']
            )
            db.session.add(candidature)
        
        db.session.commit()
        print("✅ Migration terminée avec succès!")
        print(f"   - {len(users_data)} utilisateurs migrés")
        print(f"   - {len(candidatures_data)} candidatures migrées")

if __name__ == '__main__':
    migrate_to_postgres()
