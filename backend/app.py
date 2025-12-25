import os
import io
import csv
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, make_response, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy import func, extract
from config import Config
from models import db, User, Candidature, PasswordResetToken, Document
from ai_service import AIService
from chatbot_service import ChatBotService

app = Flask(__name__)
app.config.from_object(Config)

# Initialiser les services IA
ai_service = AIService()
chatbot_service = ChatBotService()

# Configuration pour l'upload de fichiers
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Créer le dossier uploads s'il n'existe pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialiser la base de données
db.init_app(app)

# Initialiser Flask-Mail
mail = Mail(app)

# Configurer CORS
CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

# Créer les tables
with app.app_context():
    db.create_all()

# ============= Routes d'authentification =============

@app.route('/api/register', methods=['POST'])
def register():
    """Inscription d'un nouvel utilisateur"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Données manquantes'}), 400
    
    # Vérifier si l'utilisateur existe déjà
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Nom d\'utilisateur déjà utilisé'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email déjà utilisé'}), 409
    
    # Créer le nouvel utilisateur
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        telephone=data.get('telephone'),
        ville=data.get('ville')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'Utilisateur créé avec succès',
        'user': new_user.to_dict()
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    """Connexion d'un utilisateur"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Données manquantes'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Identifiants incorrects'}), 401
    
    return jsonify({
        'message': 'Connexion réussie',
        'user': user.to_dict()
    }), 200

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Demander la réinitialisation du mot de passe"""
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'error': 'Email requis'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        # Par sécurité, on retourne toujours un succès même si l'email n'existe pas
        return jsonify({'message': 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation'}), 200
    
    # Créer un token de réinitialisation
    reset_token = PasswordResetToken(user_id=user.id)
    db.session.add(reset_token)
    db.session.commit()
    
    # Créer le lien de réinitialisation
    reset_link = f"{Config.FRONTEND_URL}/reset-password/{reset_token.token}"
    
    # Envoyer l'email
    try:
        msg = Message(
            subject='Réinitialisation de votre mot de passe - ApplicationTrack',
            recipients=[user.email],
            body=f'''Bonjour {user.username},

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur le lien suivant pour créer un nouveau mot de passe :
{reset_link}

Ce lien est valable pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.

Cordialement,
L'équipe ApplicationTrack
''',
            html=f'''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3B82F6;">Réinitialisation de mot de passe</h2>
        <p>Bonjour <strong>{user.username}</strong>,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" 
               style="background-color: #3B82F6; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
                Réinitialiser mon mot de passe
            </a>
        </div>
        <p style="color: #666; font-size: 14px;">
            Ce lien est valable pendant <strong>1 heure</strong>.
        </p>
        <p style="color: #666; font-size: 14px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
            L'équipe ApplicationTrack
        </p>
    </div>
</body>
</html>
'''
        )
        mail.send(msg)
    except Exception as e:
        print(f"Erreur d'envoi d'email: {e}")
        return jsonify({'error': 'Erreur lors de l\'envoi de l\'email'}), 500
    
    return jsonify({'message': 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation'}), 200

@app.route('/api/reset-password/<token>', methods=['POST'])
def reset_password(token):
    """Réinitialiser le mot de passe avec un token"""
    data = request.get_json()
    
    if not data or not data.get('password'):
        return jsonify({'error': 'Nouveau mot de passe requis'}), 400
    
    # Vérifier le token
    reset_token = PasswordResetToken.query.filter_by(token=token).first()
    
    if not reset_token or not reset_token.is_valid():
        return jsonify({'error': 'Lien invalide ou expiré'}), 400
    
    # Mettre à jour le mot de passe
    user = User.query.get(reset_token.user_id)
    user.password_hash = generate_password_hash(data['password'])
    
    # Marquer le token comme utilisé
    reset_token.used = True
    
    db.session.commit()
    
    return jsonify({'message': 'Mot de passe réinitialisé avec succès'}), 200

@app.route('/api/reset-password/<token>', methods=['GET'])
def verify_reset_token(token):
    """Vérifier si un token de réinitialisation est valide"""
    reset_token = PasswordResetToken.query.filter_by(token=token).first()
    
    if not reset_token or not reset_token.is_valid():
        return jsonify({'valid': False, 'error': 'Lien invalide ou expiré'}), 400
    
    return jsonify({'valid': True}), 200

# ============= Routes pour les candidatures =============

@app.route('/api/users/<int:user_id>/candidatures', methods=['GET'])
def get_candidatures(user_id):
    """Récupérer toutes les candidatures d'un utilisateur avec recherche et filtres"""
    user = User.query.get_or_404(user_id)
    
    # Commencer par toutes les candidatures de l'utilisateur
    query = Candidature.query.filter_by(user_id=user_id)
    
    # Filtre par état
    etat = request.args.get('etat')
    if etat:
        query = query.filter(Candidature.etat == etat)
    
    # Recherche par entreprise, annonce, notes, localisation
    search = request.args.get('search')
    if search:
        search_pattern = f'%{search}%'
        query = query.filter(
            db.or_(
                Candidature.entreprise.ilike(search_pattern),
                Candidature.annonce.ilike(search_pattern),
                Candidature.notes.ilike(search_pattern),
                Candidature.localisation.ilike(search_pattern),
                Candidature.contact_nom.ilike(search_pattern)
            )
        )
    
    # Filtre par tags
    tags_filter = request.args.get('tags')
    if tags_filter:
        query = query.filter(Candidature.tags.ilike(f'%{tags_filter}%'))
    
    # Filtre par type de contrat
    type_contrat = request.args.get('type_contrat')
    if type_contrat:
        query = query.filter(Candidature.type_contrat == type_contrat)
    
    # Filtre par date (range)
    date_debut = request.args.get('date_debut')
    date_fin = request.args.get('date_fin')
    if date_debut:
        query = query.filter(Candidature.date >= date_debut)
    if date_fin:
        query = query.filter(Candidature.date <= date_fin)
    
    # Tri
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    if sort_by == 'date':
        query = query.order_by(Candidature.date.desc() if sort_order == 'desc' else Candidature.date.asc())
    elif sort_by == 'entreprise':
        query = query.order_by(Candidature.entreprise.asc() if sort_order == 'asc' else Candidature.entreprise.desc())
    else:  # created_at par défaut
        query = query.order_by(Candidature.created_at.desc() if sort_order == 'desc' else Candidature.created_at.asc())
    
    candidatures = [c.to_dict() for c in query.all()]
    return jsonify(candidatures), 200

@app.route('/api/users/<int:user_id>/candidatures', methods=['POST'])
def create_candidature(user_id):
    """Créer une nouvelle candidature"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if not data or not data.get('entreprise') or not data.get('annonce') or not data.get('date'):
        return jsonify({'error': 'Données manquantes'}), 400
    
    import json
    from datetime import datetime as dt
    
    # Gérer les tags
    tags = data.get('tags', [])
    tags_json = json.dumps(tags) if tags else None
    
    # Gérer la date de rappel
    rappel_date = None
    if data.get('rappel_date'):
        try:
            rappel_date = dt.fromisoformat(data['rappel_date'].replace('Z', '+00:00'))
        except:
            pass
    
    nouvelle_candidature = Candidature(
        user_id=user_id,
        entreprise=data['entreprise'],
        annonce=data['annonce'],
        date=data['date'],
        etat=data.get('etat', 'en_attente'),
        notes=data.get('notes', ''),
        tags=tags_json,
        contact_nom=data.get('contact_nom'),
        contact_email=data.get('contact_email'),
        contact_telephone=data.get('contact_telephone'),
        rappel_date=rappel_date,
        salaire=data.get('salaire'),
        localisation=data.get('localisation'),
        type_contrat=data.get('type_contrat')
    )
    
    db.session.add(nouvelle_candidature)
    db.session.commit()
    
    return jsonify({
        'message': 'Candidature créée avec succès',
        'candidature': nouvelle_candidature.to_dict()
    }), 201

@app.route('/api/candidatures/<int:candidature_id>', methods=['GET'])
def get_candidature(candidature_id):
    """Récupérer une candidature spécifique"""
    candidature = Candidature.query.get_or_404(candidature_id)
    return jsonify(candidature.to_dict()), 200

@app.route('/api/candidatures/<int:candidature_id>', methods=['PUT'])
def update_candidature(candidature_id):
    """Mettre à jour une candidature"""
    candidature = Candidature.query.get_or_404(candidature_id)
    data = request.get_json()
    
    import json
    from datetime import datetime as dt
    
    if 'entreprise' in data:
        candidature.entreprise = data['entreprise']
    if 'annonce' in data:
        candidature.annonce = data['annonce']
    if 'date' in data:
        candidature.date = data['date']
    if 'etat' in data:
        candidature.etat = data['etat']
    if 'notes' in data:
        candidature.notes = data['notes']
    if 'tags' in data:
        candidature.tags = json.dumps(data['tags']) if data['tags'] else None
    if 'contact_nom' in data:
        candidature.contact_nom = data['contact_nom']
    if 'contact_email' in data:
        candidature.contact_email = data['contact_email']
    if 'contact_telephone' in data:
        candidature.contact_telephone = data['contact_telephone']
    if 'rappel_date' in data:
        if data['rappel_date']:
            try:
                candidature.rappel_date = dt.fromisoformat(data['rappel_date'].replace('Z', '+00:00'))
            except:
                pass
        else:
            candidature.rappel_date = None
    if 'salaire' in data:
        candidature.salaire = data['salaire']
    if 'localisation' in data:
        candidature.localisation = data['localisation']
    if 'type_contrat' in data:
        candidature.type_contrat = data['type_contrat']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Candidature mise à jour',
        'candidature': candidature.to_dict()
    }), 200

@app.route('/api/candidatures/<int:candidature_id>', methods=['DELETE'])
def delete_candidature(candidature_id):
    """Supprimer une candidature"""
    candidature = Candidature.query.get_or_404(candidature_id)
    db.session.delete(candidature)
    db.session.commit()
    
    return jsonify({'message': 'Candidature supprimée'}), 200

@app.route('/api/candidatures/<int:candidature_id>/etat', methods=['PATCH'])
def update_etat(candidature_id):
    """Mettre à jour uniquement l'état d'une candidature"""
    candidature = Candidature.query.get_or_404(candidature_id)
    data = request.get_json()
    
    if not data or 'etat' not in data:
        return jsonify({'error': 'État manquant'}), 400
    
    candidature.etat = data['etat']
    db.session.commit()
    
    return jsonify({
        'message': 'État mis à jour',
        'candidature': candidature.to_dict()
    }), 200

# ============= Routes de statistiques =============

@app.route('/api/users/<int:user_id>/stats', methods=['GET'])
def get_stats(user_id):
    """Obtenir les statistiques des candidatures d'un utilisateur"""
    user = User.query.get_or_404(user_id)
    candidatures = user.candidatures
    
    stats = {
        'total': len(candidatures),
        'en_attente': len([c for c in candidatures if c.etat == 'en_attente']),
        'entretien_passe': len([c for c in candidatures if c.etat == 'entretien_passe']),
        'accepte': len([c for c in candidatures if c.etat == 'accepte']),
        'refus_etude': len([c for c in candidatures if c.etat == 'refus_etude']),
        'refuse_entretien': len([c for c in candidatures if c.etat == 'refuse_entretien']),
        'sans_reponse': len([c for c in candidatures if c.etat == 'sans_reponse']),
        'sans_reponse_entretien': len([c for c in candidatures if c.etat == 'sans_reponse_entretien'])
    }
    
    return jsonify(stats), 200

@app.route('/api/users/<int:user_id>/stats/advanced', methods=['GET'])
def get_advanced_stats(user_id):
    """Obtenir des statistiques avancées avec timeline et taux de conversion"""
    user = User.query.get_or_404(user_id)
    
    # Statistiques de base
    candidatures = user.candidatures
    total = len(candidatures)
    
    if total == 0:
        return jsonify({
            'total': 0,
            'stats_par_etat': {},
            'taux_reponse': 0,
            'taux_entretien': 0,
            'taux_acceptation': 0,
            'timeline': [],
            'stats_mensuelles': []
        }), 200
    
    # Statistiques par état
    stats_par_etat = {
        'en_attente': len([c for c in candidatures if c.etat == 'en_attente']),
        'entretien_passe': len([c for c in candidatures if c.etat == 'entretien_passe']),
        'accepte': len([c for c in candidatures if c.etat == 'accepte']),
        'refus_etude': len([c for c in candidatures if c.etat == 'refus_etude']),
        'refuse_entretien': len([c for c in candidatures if c.etat == 'refuse_entretien']),
        'sans_reponse': len([c for c in candidatures if c.etat == 'sans_reponse']),
        'sans_reponse_entretien': len([c for c in candidatures if c.etat == 'sans_reponse_entretien'])
    }
    
    # Taux de conversion
    reponses = total - stats_par_etat['sans_reponse'] - stats_par_etat['en_attente']
    taux_reponse = (reponses / total * 100) if total > 0 else 0
    
    entretiens = stats_par_etat['entretien_passe'] + stats_par_etat['refuse_entretien'] + stats_par_etat['accepte']
    taux_entretien = (entretiens / total * 100) if total > 0 else 0
    
    acceptations = stats_par_etat['accepte']
    taux_acceptation = (acceptations / total * 100) if total > 0 else 0
    
    # Timeline des candidatures (7 derniers jours)
    today = datetime.now()
    timeline = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        count = len([c for c in candidatures if c.created_at.strftime('%Y-%m-%d') == date_str])
        timeline.append({'date': date_str, 'count': count})
    
    # Statistiques mensuelles (6 derniers mois)
    stats_mensuelles = []
    for i in range(5, -1, -1):
        date = today - timedelta(days=i*30)
        mois = date.strftime('%Y-%m')
        count = len([c for c in candidatures if c.created_at.strftime('%Y-%m') == mois])
        stats_mensuelles.append({'mois': mois, 'count': count})
    
    return jsonify({
        'total': total,
        'stats_par_etat': stats_par_etat,
        'taux_reponse': round(taux_reponse, 2),
        'taux_entretien': round(taux_entretien, 2),
        'taux_acceptation': round(taux_acceptation, 2),
        'timeline': timeline,
        'stats_mensuelles': stats_mensuelles
    }), 200

@app.route('/api/users/<int:user_id>/candidatures/export', methods=['GET'])
def export_candidatures(user_id):
    """Exporter les candidatures en CSV"""
    user = User.query.get_or_404(user_id)
    candidatures = user.candidatures
    
    # Créer le fichier CSV en mémoire
    output = io.StringIO()
    writer = csv.writer(output)
    
    # En-têtes
    writer.writerow(['ID', 'Entreprise', 'Annonce', 'Date', 'État', 'Notes', 'Créé le', 'Mis à jour le'])
    
    # Données
    for c in candidatures:
        writer.writerow([
            c.id,
            c.entreprise,
            c.annonce,
            c.date,
            c.etat,
            c.notes or '',
            c.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            c.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    # Préparer la réponse
    output.seek(0)
    response = make_response(output.getvalue())
    response.headers['Content-Type'] = 'text/csv; charset=utf-8'
    response.headers['Content-Disposition'] = f'attachment; filename=candidatures_{user_id}_{datetime.now().strftime("%Y%m%d")}.csv'
    
    return response

# ============= Routes utilitaires =============

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'Bienvenue sur l\'API ApplicationTrack',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'auth': {
                'register': '/api/register',
                'login': '/api/login'
            },
            'candidatures': '/api/users/<user_id>/candidatures'
        }
    }), 200

# ============= Routes pour les documents =============

@app.route('/api/candidatures/<int:candidature_id>/documents', methods=['POST'])
def upload_document(candidature_id):
    user_id = request.form.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    # Vérifier que la candidature existe et appartient à l'utilisateur
    candidature = Candidature.query.filter_by(id=candidature_id, user_id=user_id).first()
    if not candidature:
        return jsonify({'error': 'Candidature not found'}), 404
    
    # Vérifier qu'un fichier est présent
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Créer un dossier pour l'utilisateur
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], str(user_id))
    os.makedirs(user_folder, exist_ok=True)
    
    # Sécuriser le nom du fichier
    original_filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{original_filename}"
    filepath = os.path.join(user_folder, filename)
    
    # Sauvegarder le fichier
    file.save(filepath)
    file_size = os.path.getsize(filepath)
    
    # Créer l'entrée dans la base de données
    type_document = request.form.get('type_document', 'autre')
    document = Document(
        candidature_id=candidature_id,
        nom_fichier=original_filename,
        type_document=type_document,
        url_fichier=filepath,
        taille=file_size
    )
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify(document.to_dict()), 201

@app.route('/api/candidatures/<int:candidature_id>/documents', methods=['GET'])
def get_documents(candidature_id):
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    # Vérifier que la candidature existe et appartient à l'utilisateur
    candidature = Candidature.query.filter_by(id=candidature_id, user_id=user_id).first()
    if not candidature:
        return jsonify({'error': 'Candidature not found'}), 404
    
    documents = Document.query.filter_by(candidature_id=candidature_id).all()
    return jsonify([doc.to_dict() for doc in documents]), 200

@app.route('/api/documents/<int:document_id>', methods=['DELETE'])
def delete_document(document_id):
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    # Récupérer le document
    document = Document.query.get(document_id)
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    # Vérifier que la candidature appartient à l'utilisateur
    candidature = Candidature.query.filter_by(id=document.candidature_id, user_id=user_id).first()
    if not candidature:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Supprimer le fichier du système
    try:
        if os.path.exists(document.url_fichier):
            os.remove(document.url_fichier)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    # Supprimer l'entrée de la base de données
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'message': 'Document deleted successfully'}), 200

@app.route('/api/documents/<int:document_id>/download', methods=['GET'])
def download_document(document_id):
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    # Récupérer le document
    document = Document.query.get(document_id)
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    # Vérifier que la candidature appartient à l'utilisateur
    candidature = Candidature.query.filter_by(id=document.candidature_id, user_id=user_id).first()
    if not candidature:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Envoyer le fichier
    directory = os.path.dirname(document.url_fichier)
    filename = os.path.basename(document.url_fichier)
    return send_from_directory(directory, filename, as_attachment=True, download_name=document.nom_fichier)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'API is running'}), 200

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello from Flask!'}), 200

# Gestionnaire d'erreurs
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Ressource non trouvée'}), 404

# ============= Routes IA =============

@app.route('/api/ai/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    """Génère une lettre de motivation avec IA"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Données manquantes'}), 400
        
        candidature_id = data.get('candidature_id')
        user_profile = data.get('user_profile', {})
        provider = data.get('provider', 'openai')  # 'openai', 'anthropic', 'gemini'
        
        print(f"[AI] Génération - ID: {candidature_id}, Provider: {provider}")
        print(f"[AI] Profil: {user_profile}")
        
        # Récupérer la candidature
        candidature = Candidature.query.get(candidature_id)
        if not candidature:
            print(f"[AI] ERREUR: Candidature non trouvée")
            return jsonify({'error': 'Candidature non trouvée'}), 404
        
        # Préparer les données du job
        job_data = {
            'entreprise': candidature.entreprise,
            'annonce': candidature.annonce,
            'type_contrat': candidature.type_contrat,
            'localisation': candidature.localisation,
            'tags': candidature.tags
        }
        
        print(f"[AI] Entreprise: {job_data['entreprise']}")
        
        # Générer la lettre
        result = ai_service.generate_cover_letter(job_data, user_profile, provider)
        
        print(f"[AI] Résultat success: {result.get('success')}")
        print(f"[AI] Provider utilisé: {result.get('provider')}")
        print(f"[AI] ========== LETTRE COMPLÈTE ==========")
        print(result.get('letter', ''))
        print(f"[AI] ========== FIN LETTRE ==========")
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'letter': result['letter'],
                'provider': result['provider'],
                'tokens_used': result.get('tokens_used', 0)
            })
        else:
            print(f"[AI] ERREUR: {result.get('error')}")
            return jsonify({
                'success': False,
                'error': result.get('error', 'Erreur lors de la génération')
            }), 500
            
    except Exception as e:
        print(f"[AI] EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/check-config', methods=['GET'])
def check_ai_config():
    """Vérifie quels providers IA sont configurés"""
    return jsonify({
        'openai': bool(ai_service.openai_key),
        'anthropic': bool(ai_service.anthropic_key),
        'gemini': bool(ai_service.gemini_key)
    })

@app.route('/api/ai/parse-announcement', methods=['POST'])
def parse_announcement():
    """Parse automatiquement une annonce d'emploi"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        url = data.get('url')
        
        # Accepter soit text soit url
        if not text and not url:
            return jsonify({'success': False, 'error': 'Texte ou URL de l\'annonce requis'}), 400
        
        print(f"[Parse API] Text: {len(text) if text else 0} chars, URL: {url}")
        
        result = ai_service.parse_job_announcement(text, url)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        print(f"[Parse API] Exception: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/matching-score', methods=['POST'])
def matching_score():
    """Calcule le score de matching entre profil et offre"""
    try:
        data = request.get_json()
        candidature_id = data.get('candidature_id')
        user_id = data.get('user_id')
        
        if not candidature_id or not user_id:
            return jsonify({'success': False, 'error': 'candidature_id et user_id requis'}), 400
        
        # Récupérer la candidature
        candidature = Candidature.query.get(candidature_id)
        if not candidature:
            return jsonify({'success': False, 'error': 'Candidature non trouvée'}), 404
        
        # Récupérer le profil utilisateur
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404
        
        job_data = {
            'entreprise': candidature.entreprise,
            'annonce': candidature.annonce,
            'type_contrat': candidature.type_contrat,
            'localisation': candidature.localisation
        }
        
        user_profile = {
            'experience': data.get('experience', ''),
            'competences': data.get('competences', ''),
            'ville': user.ville or ''
        }
        
        result = ai_service.calculate_matching_score(job_data, user_profile)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ai/chat', methods=['POST'])
def chatbot_endpoint():
    """Endpoint pour le chatbot assistant"""
    try:
        data = request.get_json()
        
        if not data or not data.get('message'):
            return jsonify({'error': 'Message manquant'}), 400
        
        user_message = data.get('message')
        candidatures = data.get('candidatures', [])
        user_id = data.get('user_id')
        
        # Récupérer les infos utilisateur si besoin
        user_info = None
        if user_id:
            user = User.query.get(user_id)
            if user:
                user_info = {
                    'username': user.username,
                    'email': user.email
                }
        
        print(f"[CHATBOT] Message: {user_message[:50]}...")
        print(f"[CHATBOT] Candidatures: {len(candidatures)}")
        
        # Générer la réponse
        result = chatbot_service.generate_response(
            user_message=user_message,
            candidatures=candidatures,
            user_info=user_info
        )
        
        print(f"[CHATBOT] Réponse générée ({result.get('provider')})")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"[CHATBOT] EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Erreur interne du serveur'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
