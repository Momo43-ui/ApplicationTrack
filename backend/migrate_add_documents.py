import psycopg2
from config import Config

def migrate():
    # Connexion à PostgreSQL
    conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URI)
    cur = conn.cursor()
    
    try:
        # Créer la table documents
        cur.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                candidature_id INTEGER NOT NULL REFERENCES candidatures(id) ON DELETE CASCADE,
                nom_fichier VARCHAR(255) NOT NULL,
                type_document VARCHAR(50) NOT NULL,
                url_fichier VARCHAR(500) NOT NULL,
                taille INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        print("✅ Table 'documents' créée avec succès!")
        
        conn.commit()
        print("\n✅ Migration terminée avec succès!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur lors de la migration: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    migrate()
