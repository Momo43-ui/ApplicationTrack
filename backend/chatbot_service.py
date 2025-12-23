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
        
        # Analyser les candidatures
        stats = self._analyze_candidatures(candidatures) if candidatures else {}
        
        prompt = f"""Tu es un assistant virtuel expert en recherche d'emploi et suivi de candidatures. Tu t'appelles "Assistant ApplicationTrack".

**TON RÔLE :**
- Analyser les candidatures de l'utilisateur
- Donner des conseils personnalisés et pratiques
- Aider à la rédaction (emails, relances)
- Préparer aux entretiens
- Motiver et encourager l'utilisateur

**CONTEXTE DE L'UTILISATEUR :**
{f"- Prénom : {user_info.get('username', 'Utilisateur')}" if user_info else ""}
- Nombre total de candidatures : {stats.get('total', 0)}
- En attente de réponse : {stats.get('en_attente', 0)}
- Entretiens passés : {stats.get('entretiens', 0)}
- Refus : {stats.get('refuses', 0)}
- Acceptées : {stats.get('acceptees', 0)}
"""

        if candidatures and len(candidatures) > 0:
            prompt += "\n**DERNIÈRES CANDIDATURES :**\n"
            for c in candidatures[:5]:  # 5 dernières
                prompt += f"- {c.get('entreprise', 'N/A')} ({c.get('etat', 'N/A')}) - {c.get('type_contrat', 'N/A')} à {c.get('localisation', 'N/A')}\n"
        
        prompt += f"""

**MESSAGE DE L'UTILISATEUR :**
"{user_message}"

**INSTRUCTIONS :**
1. Réponds de manière amicale, concise mais COMPLÈTE
2. Utilise des emojis pour rendre la conversation plus vivante
3. Si l'utilisateur demande des statistiques, base-toi sur le contexte ci-dessus
4. Si l'utilisateur demande des conseils, sois spécifique et actionnable
5. Si l'utilisateur veut rédiger quelque chose, fournis un modèle complet et personnalisé
6. Adapte ton ton : encourageant si refus, félicitant si accepté, motivant si en recherche
7. IMPORTANT : Génère une réponse COMPLÈTE, ne t'arrête pas au milieu d'une phrase
8. Maximum 300 mots dans ta réponse

Génère une réponse utile, personnalisée et COMPLÈTE."""
        
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
                        'maxOutputTokens': 1500  # Augmenté pour réponses complètes
                    }
                },
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            # Vérifier que la réponse est complète
            response_text = data['candidates'][0]['content']['parts'][0]['text']
            
            print(f"[CHATBOT] Réponse générée: {len(response_text)} caractères")
            
            return {
                'success': True,
                'response': response_text,
                'provider': 'Gemini 2.5 Flash'
            }
        except Exception as e:
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
