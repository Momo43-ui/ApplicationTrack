import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
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
    """Récupérer toutes les candidatures d'un utilisateur"""
    user = User.query.get_or_404(user_id)
    candidatures = [c.to_dict() for c in user.candidatures]
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
        etat=data.get('etat', 'en_attente')
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
