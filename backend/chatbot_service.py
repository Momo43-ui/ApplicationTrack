"""
Service de chatbot intelligent pour ApplicationTrack
Utilise Gemini pour analyser et conseiller l'utilisateur sur ses candidatures
"""

import os
import requests
from typing import Dict, List, Optional

class ChatBotService:
    def __init__(self):
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        
    def generate_response(
        self, 
        user_message: str,
        candidatures: Optional[List[Dict]] = None,
        user_info: Optional[Dict] = None
    ) -> Dict:
        """
        Génère une réponse intelligente basée sur le message et le contexte
        
        Args:
            user_message: Message de l'utilisateur
            candidatures: Liste des candidatures pour contexte
            user_info: Informations sur l'utilisateur
            
        Returns:
            Dict avec la réponse et métadonnées
        """
        if not self.gemini_key:
            return self._generate_fallback_response(user_message, candidatures)
        
        prompt = self._build_prompt(user_message, candidatures, user_info)
        
        try:
            return self._generate_with_gemini(prompt)
        except Exception as e:
            print(f"[CHATBOT] Erreur Gemini: {e}")
            return self._generate_fallback_response(user_message, candidatures)
    
    def _build_prompt(
        self, 
        user_message: str, 
        candidatures: Optional[List[Dict]], 
        user_info: Optional[Dict]
    ) -> str:
        """Construit le prompt avec contexte"""
        
        # Déterminer si l'utilisateur demande vraiment des infos sur les candidatures
        message_lower = user_message.lower()
        needs_candidatures = any(word in message_lower for word in [
            'candidature', 'postule', 'entreprise', 'statut', 'combien', 
            'statistique', 'analyse', 'entretien', 'refus', 'accepté'
        ])
        
        # Analyser les candidatures seulement si nécessaire
        stats = {}
        if needs_candidatures and candidatures:
            stats = self._analyze_candidatures(candidatures)
        
        prompt = f"""Tu es un assistant virtuel pour le suivi de candidatures. Réponds de manière CONCISE et PERTINENTE.

**MESSAGE :** "{user_message}"
"""

        # Ajouter le contexte seulement si pertinent
        if needs_candidatures and stats:
            prompt += f"""
**STATISTIQUES :**
- Total : {stats.get('total', 0)} | En attente : {stats.get('en_attente', 0)} | Entretiens : {stats.get('entretiens', 0)} | Refus : {stats.get('refuses', 0)} | Acceptées : {stats.get('acceptees', 0)}
"""
            if candidatures and len(candidatures) > 0:
                prompt += "\n**DERNIÈRES CANDIDATURES :**\n"
                for c in candidatures[:3]:  # Seulement 3
                    prompt += f"- {c.get('entreprise', 'N/A')} ({c.get('etat', 'N/A')})\n"
        
        prompt += """
**INSTRUCTIONS :**
1. Si c'est une salutation simple ("bonjour", "comment vas-tu"), réponds brièvement et amicalement
2. Si on te demande des stats, fournis-les de manière claire
3. Si on demande des conseils, sois précis et actionnable
4. Utilise des emojis mais reste professionnel
5. RESTE BREF : Maximum 150 mots pour les questions simples, 250 pour les analyses

Réponds maintenant de manière CONCISE et COMPLÈTE :"""
        
        return prompt
    
    def _analyze_candidatures(self, candidatures: List[Dict]) -> Dict:
        """Analyse rapide des candidatures pour les stats"""
        stats = {
            'total': len(candidatures),
            'en_attente': 0,
            'entretiens': 0,
            'refuses': 0,
            'acceptees': 0
        }
        
        for c in candidatures:
            etat = c.get('etat', '')
            if etat in ['en_attente', 'candidature_envoyee']:
                stats['en_attente'] += 1
            elif etat == 'entretien_passe':
                stats['entretiens'] += 1
            elif etat == 'refuse':
                stats['refuses'] += 1
            elif etat == 'accepte':
                stats['acceptees'] += 1
        
        return stats
    
    def _generate_with_gemini(self, prompt: str) -> Dict:
        """Génère avec Gemini"""
        try:
            response = requests.post(
                f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}',
                headers={'Content-Type': 'application/json'},
                json={
                    'contents': [{
                        'parts': [{'text': prompt}]
                    }],
                    'generationConfig': {
                        'temperature': 0.7,
                        'maxOutputTokens': 800,  # Réduit pour réponses plus courtes
                        'topP': 0.95,
                        'topK': 40
                    }
                },
                timeout=30
            )
            
            if not response.ok:
                print(f"[CHATBOT] Erreur API: {response.status_code} - {response.text}")
                raise Exception(f"Erreur API Gemini: {response.status_code}")
            
            data = response.json()
            
            if 'candidates' not in data or len(data['candidates']) == 0:
                print(f"[CHATBOT] Pas de candidats dans la réponse: {data}")
                raise Exception("Réponse Gemini vide")
            
            response_text = data['candidates'][0]['content']['parts'][0]['text']
            
            print(f"[CHATBOT] Réponse générée: {len(response_text)} caractères")
            
            return {
                'success': True,
                'response': response_text,
                'provider': 'Gemini 2.5 Flash'
            }
        except requests.exceptions.RequestException as e:
            print(f"[CHATBOT] Erreur réseau: {e}")
            raise Exception(f"Erreur de connexion à l'API: {str(e)}")
        except Exception as e:
            print(f"[CHATBOT] Erreur: {e}")
            raise e
    
    def _generate_fallback_response(self, user_message: str, candidatures: Optional[List[Dict]]) -> Dict:
        """Réponse de secours si Gemini ne fonctionne pas"""
        
        message_lower = user_message.lower()
        stats = self._analyze_candidatures(candidatures) if candidatures else {}
        
        # Réponses simples basées sur des mots-clés
        if any(word in message_lower for word in ['combien', 'nombre', 'statistique', 'total']):
            response = f"""📊 **Voici tes statistiques :**

• Total de candidatures : {stats.get('total', 0)}
• En attente : {stats.get('en_attente', 0)}
• Entretiens passés : {stats.get('entretiens', 0)}
• Refus : {stats.get('refuses', 0)}
• Acceptées : {stats.get('acceptees', 0)}

Continue comme ça ! 💪"""
        
        elif any(word in message_lower for word in ['conseil', 'aide', 'comment', 'que faire']):
            response = """💡 **Quelques conseils généraux :**

• Relance les entreprises 1-2 semaines après candidature
• Personnalise chaque lettre de motivation
• Prépare des questions pour les entretiens
• Note tes impressions après chaque contact
• Reste motivé(e), la recherche prend du temps !

N'hésite pas à demander plus de détails ! 😊"""
        
        elif any(word in message_lower for word in ['relance', 'email', 'contacter']):
            response = """✉️ **Modèle d'email de relance :**

Objet : Suivi de ma candidature - [Poste]

Bonjour,

Je me permets de revenir vers vous concernant ma candidature pour le poste de [Poste] envoyée le [Date].

Toujours très intéressé(e) par cette opportunité, je reste à votre disposition pour échanger.

Cordialement,
[Ton nom]

Simple et efficace ! 👍"""
        
        else:
            response = f"""Je suis ton assistant ApplicationTrack ! 🤖

Je peux t'aider à :
• 📊 Analyser tes {stats.get('total', 0)} candidatures
• 💡 Te donner des conseils personnalisés
• ✉️ Rédiger des emails de relance
• 🎯 Préparer tes entretiens

Pose-moi une question plus précise ! 😊"""
        
        return {
            'success': True,
            'response': response,
            'provider': 'Réponse automatique'
        }
