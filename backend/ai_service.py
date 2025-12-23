"""
Service d'intelligence artificielle pour la génération de lettres de motivation
Supporte plusieurs providers : OpenAI, Anthropic Claude, Google Gemini
"""

import os
import requests
from typing import Dict, Optional

class AIService:
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        
    def generate_cover_letter(
        self, 
        job_data: Dict,
        user_profile: Optional[Dict] = None,
        provider: str = 'openai'
    ) -> Dict:
        """
        Génère une lettre de motivation basée sur les données du job
        
        Args:
            job_data: Informations sur le poste (entreprise, annonce, etc.)
            user_profile: Profil de l'utilisateur (optionnel)
            provider: 'openai', 'anthropic', ou 'gemini'
            
        Returns:
            Dict avec la lettre générée et métadonnées
        """
        prompt = self._build_prompt(job_data, user_profile)
        
        if provider == 'openai' and self.openai_key:
            return self._generate_with_openai(prompt)
        elif provider == 'anthropic' and self.anthropic_key:
            return self._generate_with_claude(prompt)
        elif provider == 'gemini' and self.gemini_key:
            return self._generate_with_gemini(prompt)
        else:
            # Fallback : génération simple sans IA
            return self._generate_template(job_data, user_profile)
    
    def _build_prompt(self, job_data: Dict, user_profile: Optional[Dict]) -> str:
        """Construit le prompt pour l'IA"""
        entreprise = job_data.get('entreprise', '[Entreprise]')
        annonce = job_data.get('annonce', '')
        type_contrat = job_data.get('type_contrat', '')
        localisation = job_data.get('localisation', '')
        
        # Informations du candidat
        nom = user_profile.get('nom', 'Le Candidat') if user_profile else 'Le Candidat'
        email = user_profile.get('email', '') if user_profile else ''
        experience = user_profile.get('experience', '') if user_profile else ''
        competences = user_profile.get('competences', '') if user_profile else ''
        motivation = user_profile.get('motivation', '') if user_profile else ''
        telephone = user_profile.get('telephone', '') if user_profile else ''
        ville = user_profile.get('ville', '') if user_profile else ''
        
        prompt = f"""Tu es un expert en recrutement et rédaction de lettres de motivation professionnelles en français.

Génère une lettre de motivation COMPLÈTE et personnalisée pour cette candidature :

**INFORMATIONS SUR LE POSTE :**
- Entreprise : {entreprise}
- Type de contrat : {type_contrat}
- Localisation : {localisation}
- Description complète du poste :
{annonce}

**PROFIL DU CANDIDAT :**
- Nom complet : {nom}
- Email : {email if email else '[À compléter]'}
- Téléphone : {telephone if telephone else '[À compléter]'}
- Ville : {ville if ville else '[À compléter]'}
- Années d'expérience : {experience}
- Compétences clés : {competences}
- Motivation personnelle : {motivation}

**INSTRUCTIONS POUR LA LETTRE :**
1. **En-tête** : Commence par les coordonnées du candidat :
   - {nom}
   - [Adresse complète à compléter]
   - {telephone if telephone else '[Téléphone]'}
   - {email if email else '[Email]'}
2. **Date** : Ajoute [Date] comme placeholder
3. **Destinataire** : Ajoute {entreprise} et [Adresse de l'entreprise]
4. **Objet** : Ligne "Objet : Candidature au poste de {type_contrat}"
5. **Corps de la lettre** :
   - Introduction : Pourquoi je postule, comment j'ai découvert l'offre
   - Paragraphe 1 : Mon expérience de {experience} et mes compétences ({competences}) en lien avec le poste
   - Paragraphe 2 : Analyse de l'offre et en quoi mon profil correspond parfaitement
   - Paragraphe 3 : Ma motivation ({motivation}) et ce que je peux apporter à {entreprise}
   - Conclusion : Disponibilité pour un entretien
6. **Formule de politesse** : Formule de politesse professionnelle
7. **Signature** : {nom}

**CRITÈRES IMPORTANTS :**
- Ton professionnel, enthousiaste et personnalisé
- Utilise VRAIMENT les informations du candidat (expérience, compétences, motivation)
- Analyse l'offre d'emploi et fais des liens concrets
- Longueur : 300-400 mots
- Format français standard avec sauts de lignes appropriés
- AUCUN commentaire ou note en dehors de la lettre

Génère UNIQUEMENT la lettre complète, prête à être envoyée."""
        
        return prompt
    
    def _generate_with_openai(self, prompt: str) -> Dict:
        """Génère avec OpenAI GPT"""
        try:
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.openai_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'gpt-4o-mini',  # Plus économique que GPT-4
                    'messages': [
                        {'role': 'system', 'content': 'Tu es un expert en rédaction de lettres de motivation professionnelles.'},
                        {'role': 'user', 'content': prompt}
                    ],
                    'temperature': 0.7,
                    'max_tokens': 1000
                },
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                'success': True,
                'letter': data['choices'][0]['message']['content'],
                'provider': 'OpenAI GPT-4o-mini',
                'tokens_used': data.get('usage', {}).get('total_tokens', 0)
            }
        except Exception as e:
            error_msg = str(e)
            if self.openai_key and self.openai_key in error_msg:
                error_msg = error_msg.replace(self.openai_key, '***')
            return {
                'success': False,
                'error': f'Erreur OpenAI: {error_msg}'
            }
    
    def _generate_with_claude(self, prompt: str) -> Dict:
        """Génère avec Anthropic Claude"""
        try:
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers={
                    'x-api-key': self.anthropic_key,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                json={
                    'model': 'claude-3-haiku-20240307',  # Version économique
                    'max_tokens': 1024,
                    'messages': [
                        {'role': 'user', 'content': prompt}
                    ]
                },
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                'success': True,
                'letter': data['content'][0]['text'],
                'provider': 'Claude 3 Haiku',
                'tokens_used': data.get('usage', {}).get('input_tokens', 0) + data.get('usage', {}).get('output_tokens', 0)
            }
        except Exception as e:
            error_msg = str(e)
            if self.anthropic_key and self.anthropic_key in error_msg:
                error_msg = error_msg.replace(self.anthropic_key, '***')
            return {
                'success': False,
                'error': f'Erreur Claude: {error_msg}'
            }
    
    def _generate_with_gemini(self, prompt: str) -> Dict:
        """Génère avec Google Gemini"""
        try:
            print("[GEMINI] Envoi de la requête...")
            response = requests.post(
                f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}',
                headers={'Content-Type': 'application/json'},
                json={
                    'contents': [{
                        'parts': [{'text': prompt}]
                    }],
                    'generationConfig': {
                        'temperature': 0.7,
                        'maxOutputTokens': 2048  # Augmenté pour lettres plus longues
                    }
                },
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            print(f"[GEMINI] Réponse reçue")
            print(f"[GEMINI] Data complète: {data}")
            
            letter_text = data['candidates'][0]['content']['parts'][0]['text']
            print(f"[GEMINI] Longueur lettre: {len(letter_text)} caractères")
            
            return {
                'success': True,
                'letter': letter_text,
                'provider': 'Google Gemini 2.5 Flash',
                'tokens_used': 0  # Gemini ne retourne pas toujours cette info
            }
        except Exception as e:
            error_msg = str(e)
            # Masquer la clé API dans le message d'erreur
            if self.gemini_key and self.gemini_key in error_msg:
                error_msg = error_msg.replace(self.gemini_key, '***')
            return {
                'success': False,
                'error': f'Erreur Gemini: {error_msg}'
            }
    
    def _generate_template(self, job_data: Dict, user_profile: Optional[Dict]) -> Dict:
        """Génère une lettre template sans IA (fallback)"""
        entreprise = job_data.get('entreprise', '[Nom de l\'entreprise]')
        type_contrat = job_data.get('type_contrat', 'poste')
        localisation = job_data.get('localisation', '')
        annonce = job_data.get('annonce', '')
        
        # Récupérer les infos du candidat
        nom = user_profile.get('nom', '[Votre nom]') if user_profile else '[Votre nom]'
        email = user_profile.get('email', '[Email]') if user_profile else '[Email]'
        telephone = user_profile.get('telephone', '[Téléphone]') if user_profile else '[Téléphone]'
        ville = user_profile.get('ville', '[Ville]') if user_profile else '[Ville]'
        experience = user_profile.get('experience', '[X années d\'expérience]') if user_profile else '[X années d\'expérience]'
        competences = user_profile.get('competences', '[vos compétences]') if user_profile else '[vos compétences]'
        motivation = user_profile.get('motivation', 'contribuer à vos projets') if user_profile else 'contribuer à vos projets'
        
        # Extraire quelques mots-clés de l'annonce pour la personnalisation
        contexte_poste = ""
        if annonce and len(annonce) > 50:
            # Prendre les 150 premiers caractères de l'annonce
            contexte_poste = f" décrit dans votre offre"
        
        letter = f"""{nom}
[Adresse complète]
{telephone}
{email}

[Date]

{entreprise}
[Adresse de l'entreprise]
{localisation if localisation else '[Ville]'}

Objet : Candidature pour le poste de {type_contrat}

Madame, Monsieur,

C'est avec un vif intérêt que je vous adresse ma candidature pour le poste de {type_contrat}{contexte_poste} au sein de {entreprise}.

Forte de {experience} dans le domaine, j'ai développé une expertise solide en {competences}. Mon parcours professionnel m'a permis d'acquérir des compétences techniques et relationnelles qui correspondent parfaitement aux exigences de ce poste.

Votre entreprise, {entreprise}, représente pour moi une opportunité exceptionnelle de {motivation}. Les responsabilités décrites dans l'offre résonnent particulièrement avec mon expérience et mes ambitions professionnelles.

Mes principales qualifications incluent :
- {experience} d'expérience pertinente dans le secteur
- Maîtrise de : {competences}
- Grande capacité d'adaptation et esprit d'équipe
- Motivation à relever de nouveaux défis

Je suis convaincu(e) que mon profil et ma motivation peuvent apporter une réelle valeur ajoutée à votre équipe. Je serais ravi(e) de pouvoir échanger avec vous lors d'un entretien pour vous exposer plus en détail ma vision et mes compétences.

Je reste à votre entière disposition pour toute information complémentaire.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{nom}"""
        
        return {
            'success': True,
            'letter': letter,
            'provider': 'Template personnalisé (aucune clé API configurée)',
            'tokens_used': 0
        }
