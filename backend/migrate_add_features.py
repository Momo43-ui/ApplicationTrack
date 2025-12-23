"""
Script de migration pour ajouter les nouvelles fonctionnalités
(tags, contacts, rappels, etc.)
"""
from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        try:
            # Ajouter les nouvelles colonnes si elles n'existent pas
            with db.engine.connect() as conn:
                # Vérifier et ajouter la colonne tags
                try:
                    conn.execute(text("ALTER TABLE candidatures ADD COLUMN tags VARCHAR(500)"))
                    print("✅ Colonne 'tags' ajoutée")
                except Exception as e:
                    print(f"ℹ️  Colonne 'tags' existe déjà ou erreur: {e}")
                
                # Vérifier et ajouter la colonne contact_nom
                try:
                    conn.execute(text("ALTER TABLE candidatures ADD COLUMN contact_nom VARCHAR(200)"))
                    print("✅ Colonne 'contact_nom' ajoutée")
                except Exception as e:
                    print(f"ℹ️  Colonne 'contact_nom' existe déjà ou erreur: {e}")
                
                # Vérifier et ajouter la colonne contact_email
                try:
                    conn.execute(text("ALTER TABLE candidatures ADD COLUMN contact_email VARCHAR(200)"))
                    print("✅ Colonne 'contact_email' ajoutée")
                except Exception as e:
                    print(f"ℹ️  Colonne 'contact_email' existe déjà ou erreur: {e}")
                
                # Vérifier et ajouter la colonne contact_telephone
                try:
                    conn.execute(text("ALTER TABLE candidatures ADD COLUMN contact_telephone VARCHAR(50)"))
                    print("✅ Colonne 'contact_telephone' ajoutée")
                except Exception as e:
                    print(f"ℹ️  Colonne 'contact_telephone' existe déjà ou erreur: {e}")
                
                # Vérifier et ajouter la colonne rappel_date
                try:
                    conn.execute(text("ALTER TABLE candidatures ADD COLUMN rappel_date TIMESTAMP"))
                    print("✅ Colonne 'rappel_date' ajoutée")
                except Exception as e:
                    print(f"ℹ️  Colonne 'rappel_date' existe déjà ou erreur: {e}")
                
                # Vérifier et ajouter la colonne salaire
                try:
                    conn.execute(text("ALTER TABLE candidatures ADD COLUMN salaire VARCHAR(100)"))
                    print("✅ Colonne 'salaire' ajoutée")
                except Exception as e:
                    print(f"ℹ️  Colonne 'salaire' existe déjà ou erreur: {e}")
                
                # Vérifier et ajouter la colonne localisation
                try:
                    conn.execute(text("ALTER TABLE candidatures ADD COLUMN localisation VARCHAR(200)"))
                    print("✅ Colonne 'localisation' ajoutée")
                except Exception as e:
                    print(f"ℹ️  Colonne 'localisation' existe déjà ou erreur: {e}")
                
                # Vérifier et ajouter la colonne type_contrat
                try:
                    conn.execute(text("ALTER TABLE candidatures ADD COLUMN type_contrat VARCHAR(50)"))
                    print("✅ Colonne 'type_contrat' ajoutée")
                except Exception as e:
                    print(f"ℹ️  Colonne 'type_contrat' existe déjà ou erreur: {e}")
                
                conn.commit()
            
            print("\n✅ Migration terminée avec succès!")
            
        except Exception as e:
            print(f"\n❌ Erreur lors de la migration: {e}")
            raise

if __name__ == '__main__':
    migrate()
