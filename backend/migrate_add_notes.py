"""
Script de migration pour ajouter le champ notes à la table candidatures
"""
from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        try:
            # Vérifier si la colonne existe déjà
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='candidatures' AND column_name='notes'
            """))
            
            if result.fetchone() is None:
                print("Ajout de la colonne 'notes' à la table candidatures...")
                db.session.execute(text("""
                    ALTER TABLE candidatures 
                    ADD COLUMN notes TEXT
                """))
                db.session.commit()
                print("✅ Colonne 'notes' ajoutée avec succès!")
            else:
                print("ℹ️  La colonne 'notes' existe déjà.")
                
        except Exception as e:
            print(f"❌ Erreur lors de la migration: {e}")
            db.session.rollback()

if __name__ == '__main__':
    migrate()
