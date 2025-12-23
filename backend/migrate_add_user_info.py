"""
Migration pour ajouter les champs telephone et ville à la table users
"""
from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        try:
            # Ajouter la colonne telephone
            db.session.execute(text('ALTER TABLE users ADD COLUMN telephone VARCHAR(20)'))
            print("✅ Colonne 'telephone' ajoutée")
        except Exception as e:
            if 'already exists' in str(e).lower() or 'duplicate column' in str(e).lower():
                print("ℹ️  Colonne 'telephone' existe déjà")
            else:
                print(f"❌ Erreur pour 'telephone': {e}")
        
        try:
            # Ajouter la colonne ville
            db.session.execute(text('ALTER TABLE users ADD COLUMN ville VARCHAR(100)'))
            print("✅ Colonne 'ville' ajoutée")
        except Exception as e:
            if 'already exists' in str(e).lower() or 'duplicate column' in str(e).lower():
                print("ℹ️  Colonne 'ville' existe déjà")
            else:
                print(f"❌ Erreur pour 'ville': {e}")
        
        db.session.commit()
        print("\n🎉 Migration terminée avec succès!")

if __name__ == '__main__':
    migrate()
