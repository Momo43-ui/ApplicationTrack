import os
import io
import csv
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func, extract
from config import Config
from models import db, User, Candidature

app = Flask(__name__)
app.config.from_object(Config)

# Initialiser la base de données
db.init_app(app)

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
        password_hash=generate_password_hash(data['password'])
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
    
    # Recherche par entreprise
    search = request.args.get('search')
    if search:
        query = query.filter(Candidature.entreprise.ilike(f'%{search}%'))
    
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
    
    nouvelle_candidature = Candidature(
        user_id=user_id,
        entreprise=data['entreprise'],
        annonce=data['annonce'],
        date=data['date'],
        etat=data.get('etat', 'en_attente'),
        notes=data.get('notes', '')
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

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Erreur interne du serveur'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
