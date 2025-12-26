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
    
    def parse_job_announcement(self, text: str, url: Optional[str] = None) -> Dict:
        """
        Parse automatiquement une annonce et extrait les informations clés
        Accepte soit du texte direct, soit une URL à scraper
        """
        if not self.gemini_key:
            return {'success': False, 'error': 'Gemini API key non configurée'}
        
        # Si URL fournie, scraper le contenu
        if url and not text:
            try:
                print(f"[AI Parse] Scraping URL: {url}")
                from bs4 import BeautifulSoup
                
                response = requests.get(url, timeout=15, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                
                if response.status_code != 200:
                    return {'success': False, 'error': f'Erreur lors du scraping: Status {response.status_code}'}
                
                soup = BeautifulSoup(response.content, 'lxml')
                
                # Extraire le texte principal (enlever scripts, styles, etc.)
                for script in soup(['script', 'style', 'nav', 'header', 'footer']):
                    script.decompose()
                
                text = soup.get_text(separator='\n', strip=True)
                
                # Limiter à 5000 caractères pour l'API
                text = text[:5000]
                
                print(f"[AI Parse] Texte extrait: {len(text)} caractères")
                
            except Exception as e:
                print(f"[AI Parse] Erreur scraping: {e}")
                return {'success': False, 'error': f'Erreur scraping: {str(e)}'}
        
        # Extraire le nom de l'entreprise depuis l'URL comme fallback
        url_company_hint = ""
        if url:
            # Essayer d'extraire depuis le domaine
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.replace('www.', '').replace('careers.', '').replace('jobs.', '')
            # Extraire le nom principal (avant le premier point)
            company_from_url = domain.split('.')[0]
            url_company_hint = f"\n**CONTEXTE URL:** L'annonce provient du site {domain}, l'entreprise est probablement {company_from_url.title()}"
        
        prompt = f"""Tu es un expert en analyse d'offres d'emploi. Analyse cette annonce et extrais UNIQUEMENT les informations suivantes au format JSON strict :

**ANNONCE :**
{text}{url_company_hint}

**INSTRUCTIONS :**
Retourne UNIQUEMENT un objet JSON valide avec ces champs :
{{
  "entreprise": "nom de l'entreprise (cherche dans le texte, dans l'URL si besoin. NE METS PAS NULL si tu peux déduire)",
  "poste": "titre du poste (si trouvé, sinon null)",
  "type_contrat": "CDI, CDD, Stage, Alternance, Freelance, Interim ou Apprentissage (si trouvé, sinon null)",
  "salaire": "fourchette de salaire (si mentionné, sinon null)",
  "localisation": "ville ou lieu (si trouvé, sinon null)",
  "competences": ["compétence1", "compétence2", "compétence3"],
  "description_courte": "résumé en 1 phrase du poste"
}}

IMPORTANT : 
- Pour l'entreprise, utilise toutes les infos disponibles (texte, URL, domaine)
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après."""

        try:
            print(f"[AI Parse] Envoi requête à Gemini...")
            response = requests.post(
                f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}',
                json={
                    'contents': [{'parts': [{'text': prompt}]}],
                    'generationConfig': {
                        'temperature': 0.3,
                        'maxOutputTokens': 800  # Augmenté pour éviter la troncature
                    }
                },
                timeout=30
            )
            
            print(f"[AI Parse] Status code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                text_response = result['candidates'][0]['content']['parts'][0]['text'].strip()
                print(f"[AI Parse] Texte brut: {len(text_response)} caractères")
                
                # Nettoyer les markdown code blocks
                # Enlever ```json au début
                if text_response.startswith('```json'):
                    text_response = text_response[7:].strip()
                elif text_response.startswith('```'):
                    text_response = text_response[3:].strip()
                
                # Enlever ``` à la fin
                if text_response.endswith('```'):
                    text_response = text_response[:-3].strip()
                
                # Enlever tout texte avant le premier { et après le dernier }
                start_idx = text_response.find('{')
                end_idx = text_response.rfind('}')
                
                if start_idx != -1 and end_idx != -1:
                    text_response = text_response[start_idx:end_idx+1]
                
                print(f"[AI Parse] JSON extrait ({len(text_response)} chars):\n{text_response}\n[FIN]")
                
                import json
                
                try:
                    parsed_data = json.loads(text_response)
                    print(f"[AI Parse] ✓ Parsing réussi")
                    
                    return {
                        'success': True,
                        'data': parsed_data
                    }
                except json.JSONDecodeError as je:
                    print(f"[AI Parse] ✗ Erreur JSON: {je}")
                    print(f"[AI Parse] Position erreur: ligne {je.lineno}, colonne {je.colno}")
                    
                    return {
                        'success': False, 
                        'error': f'JSON invalide: {str(je)}'
                    }
            else:
                error_text = response.text
                print(f"[AI Parse] ERREUR: {error_text}")
                return {'success': False, 'error': f'Erreur API {response.status_code}: {error_text}'}
                
        except Exception as e:
            print(f"[AI Parse] EXCEPTION: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': str(e)}
    
    def calculate_matching_score(self, job_data: Dict, user_profile: Dict) -> Dict:
        """
        Calcule un score de matching entre le profil utilisateur et l'offre (0-100)
        """
        if not self.gemini_key:
            return {'success': False, 'error': 'Gemini API key non configurée'}
        
        prompt = f"""Tu es un expert en recrutement. Analyse la compatibilité entre ce profil candidat et cette offre d'emploi.

**PROFIL CANDIDAT :**
- Expérience : {user_profile.get('experience', 'Non spécifié')}
- Compétences : {user_profile.get('competences', 'Non spécifié')}
- Ville : {user_profile.get('ville', 'Non spécifié')}

**OFFRE D'EMPLOI :**
- Entreprise : {job_data.get('entreprise', 'N/A')}
- Type de contrat : {job_data.get('type_contrat', 'N/A')}
- Localisation : {job_data.get('localisation', 'N/A')}
- Description : {job_data.get('annonce', 'N/A')}

**INSTRUCTIONS :**
Retourne UNIQUEMENT un JSON avec :
{{
  "score": 75,  // score de 0 à 100
  "points_forts": ["point 1", "point 2", "point 3"],
  "points_faibles": ["point 1", "point 2"],
  "conseils": ["conseil 1", "conseil 2", "conseil 3"]
}}

IMPORTANT : JSON uniquement, sans texte additionnel."""

        try:
            response = requests.post(
                f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}',
                json={
                    'contents': [{'parts': [{'text': prompt}]}],
                    'generationConfig': {
                        'temperature': 0.5,
                        'maxOutputTokens': 800
                    }
                },
                timeout=30
            )
            
            if response.status_code == 429:
                return {
                    'success': False,
                    'error': 'Quota API Gemini dépassé (429). Veuillez réessayer dans quelques minutes ou vérifier votre clé API.'
                }
            
            if response.status_code == 200:
                result = response.json()
                text_response = result['candidates'][0]['content']['parts'][0]['text'].strip()
                
                print(f"[AI Service] Réponse brute Gemini: {text_response[:200]}...")
                
                # Nettoyer la réponse de manière plus robuste
                if text_response.startswith('```'):
                    # Extraire le contenu entre les ``` markers
                    parts = text_response.split('```')
                    if len(parts) >= 2:
                        text_response = parts[1]
                        # Supprimer le mot 'json' si présent au début
                        if text_response.strip().startswith('json'):
                            text_response = text_response.strip()[4:]
                
                # Supprimer les espaces et retours à la ligne au début et à la fin
                text_response = text_response.strip()
                
                # Si la réponse contient du texte avant le JSON, essayer de l'extraire
                if not text_response.startswith('{'):
                    # Chercher le premier {
                    start_idx = text_response.find('{')
                    if start_idx != -1:
                        text_response = text_response[start_idx:]
                
                # Si la réponse contient du texte après le JSON, essayer de le supprimer
                if not text_response.endswith('}'):
                    # Chercher le dernier }
                    end_idx = text_response.rfind('}')
                    if end_idx != -1:
                        text_response = text_response[:end_idx + 1]
                
                print(f"[AI Service] JSON nettoyé: {text_response[:200]}...")
                
                import json
                try:
                    analysis = json.loads(text_response)
                    
                    # Valider la structure
                    if not isinstance(analysis, dict):
                        return {'success': False, 'error': 'Format de réponse invalide'}
                    
                    # S'assurer que tous les champs nécessaires sont présents
                    if 'score' not in analysis:
                        analysis['score'] = 50  # Valeur par défaut
                    if 'points_forts' not in analysis:
                        analysis['points_forts'] = []
                    if 'points_faibles' not in analysis:
                        analysis['points_faibles'] = []
                    if 'conseils' not in analysis:
                        analysis['conseils'] = []
                    
                    return {
                        'success': True,
                        'analysis': analysis
                    }
                except json.JSONDecodeError as je:
                    print(f"[AI Service] Erreur JSON: {str(je)}")
                    print(f"[AI Service] Texte problématique: {text_response}")
                    return {'success': False, 'error': f'Impossible de parser la réponse: {str(je)}'}
            else:
                return {'success': False, 'error': f'Erreur API: {response.status_code}'}
                
        except Exception as e:
            print(f"[AI Service] Exception: {str(e)}")
            return {'success': False, 'error': str(e)}
