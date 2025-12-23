"""
Script de test pour vérifier la configuration Gmail
"""
from app import app, mail
from flask_mail import Message

def test_email():
    with app.app_context():
        try:
            # Créer un message de test
            msg = Message(
                subject='Test de configuration Gmail - ApplicationTrack',
                recipients=[app.config['MAIL_USERNAME']],  # Envoie à vous-même
                body='Ceci est un email de test pour vérifier la configuration Gmail.',
                html='''
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #3B82F6;">✅ Test réussi !</h2>
                    <p>Votre configuration Gmail fonctionne correctement.</p>
                    <p>L'envoi d'emails depuis ApplicationTrack est opérationnel.</p>
                </body>
                </html>
                '''
            )
            
            # Envoyer l'email
            mail.send(msg)
            print("✅ Email envoyé avec succès !")
            print(f"📧 Envoyé à : {app.config['MAIL_USERNAME']}")
            print("\nVérifiez votre boîte de réception (et les spams si nécessaire).")
            
        except Exception as e:
            print("❌ Erreur lors de l'envoi de l'email :")
            print(f"   {str(e)}")
            print("\nVérifiez :")
            print("1. Que MAIL_USERNAME et MAIL_PASSWORD sont bien configurés dans .env")
            print("2. Que vous utilisez un mot de passe d'application Gmail (pas votre mot de passe normal)")
            print("3. Que la validation en 2 étapes est activée sur votre compte Google")

if __name__ == '__main__':
    test_email()
