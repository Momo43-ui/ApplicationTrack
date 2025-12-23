import os
import re

# Fichiers à formater
files = [
    r"C:\Users\pasca\Desktop\ApplicationTrack\frontend\src\components\AdvancedStatistics.jsx",
    r"C:\Users\pasca\Desktop\ApplicationTrack\frontend\src\components\ChatBot.jsx",
    r"C:\Users\pasca\Desktop\ApplicationTrack\frontend\src\components\CoverLetterGenerator.jsx",
    r"C:\Users\pasca\Desktop\ApplicationTrack\frontend\src\components\CSVImport.jsx",
    r"C:\Users\pasca\Desktop\ApplicationTrack\frontend\src\components\DocumentsManager.jsx",
    r"C:\Users\pasca\Desktop\ApplicationTrack\frontend\src\components\RappelsNotifications.jsx"
]

def format_jsx(content):
    """Reformate le JSX en ajoutant des retours à la ligne"""
    # Ajouter des retours après les imports
    content = re.sub(r"(import.*?;)", r"\1\n", content)
    
    # Ajouter des retours après les accolades ouvrantes
    content = re.sub(r"(\{)\s*(?![\s\n])", r"\1\n  ", content)
    
    # Ajouter des retours avant les accolades fermantes
    content = re.sub(r"(?<![\s\n])\s*(\})", r"\n\1", content)
    
    # Ajouter des retours après les points-virgules
    content = re.sub(r"(;)\s*(?![\s\n])", r"\1\n", content)
    
    return content

for file_path in files:
    if not os.path.exists(file_path):
        print(f"Fichier introuvable: {file_path}")
        continue
    
    try:
        # Lire le contenu
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Vérifier si tout est sur une ligne
        if '\n' not in content[:1000]:
            print(f"Reformatage de {os.path.basename(file_path)}...")
            formatted = format_jsx(content)
            
            # Sauvegarder
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(formatted)
            
            print(f"✓ {os.path.basename(file_path)} reformaté")
        else:
            print(f"✓ {os.path.basename(file_path)} déjà formaté")
            
    except Exception as e:
        print(f"Erreur pour {os.path.basename(file_path)}: {str(e)}")

print("\nTerminé!")
