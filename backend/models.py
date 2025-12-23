from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import secrets

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    telephone = db.Column(db.String(20), nullable=True)
    ville = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relation avec les candidatures
    candidatures = db.relationship('Candidature', backref='user', lazy=True, cascade='all, delete-orphan')
    
    # Relation avec les tokens de réinitialisation
    reset_tokens = db.relationship('PasswordResetToken', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'telephone': self.telephone,
            'ville': self.ville,
            'created_at': self.created_at.isoformat()
        }

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    
    def __init__(self, user_id):
        self.user_id = user_id
        self.token = secrets.token_urlsafe(32)
        self.expires_at = datetime.utcnow() + timedelta(hours=1)  # Expire après 1 heure
    
    def is_valid(self):
        return not self.used and datetime.utcnow() < self.expires_at

class Candidature(db.Model):
    __tablename__ = 'candidatures'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    entreprise = db.Column(db.String(200), nullable=False)
    annonce = db.Column(db.Text, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    etat = db.Column(db.String(50), default='en_attente')
    notes = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String(500), nullable=True)  # Stocké comme JSON string
    contact_nom = db.Column(db.String(200), nullable=True)
    contact_email = db.Column(db.String(200), nullable=True)
    contact_telephone = db.Column(db.String(50), nullable=True)
    rappel_date = db.Column(db.DateTime, nullable=True)
    salaire = db.Column(db.String(100), nullable=True)
    localisation = db.Column(db.String(200), nullable=True)
    type_contrat = db.Column(db.String(50), nullable=True)  # CDI, CDD, Stage, Alternance
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation avec les documents
    documents = db.relationship('Document', backref='candidature', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'entreprise': self.entreprise,
            'annonce': self.annonce,
            'date': self.date,
            'etat': self.etat,
            'notes': self.notes,
            'tags': json.loads(self.tags) if self.tags else [],
            'contact_nom': self.contact_nom,
            'contact_email': self.contact_email,
            'contact_telephone': self.contact_telephone,
            'rappel_date': self.rappel_date.isoformat() if self.rappel_date else None,
            'salaire': self.salaire,
            'localisation': self.localisation,
            'type_contrat': self.type_contrat,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'documents': [doc.to_dict() for doc in self.documents]
        }

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    candidature_id = db.Column(db.Integer, db.ForeignKey('candidatures.id'), nullable=False)
    nom_fichier = db.Column(db.String(255), nullable=False)
    type_document = db.Column(db.String(50), nullable=False)  # cv, lettre_motivation, fiche_poste, autre
    url_fichier = db.Column(db.String(500), nullable=False)  # Chemin ou URL du fichier
    taille = db.Column(db.Integer, nullable=True)  # Taille en bytes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'candidature_id': self.candidature_id,
            'nom_fichier': self.nom_fichier,
            'type_document': self.type_document,
            'url_fichier': self.url_fichier,
            'taille': self.taille,
            'created_at': self.created_at.isoformat()
        }
