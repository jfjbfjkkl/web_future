# 📬 Système de Messagerie et Notifications

## Aperçu

Le système de messagerie permet aux clients connectés de recevoir des notifications, des codes de diamants et des confirmations de commande directement dans l'interface.

## 🎯 Caractéristiques

✅ **Icône de notification** dans le header avec badge compteur  
✅ **Panneau glissant moderne** avec tous les messages  
✅ **Types de messages** : notifications, codes, commandes  
✅ **Marquage comme lu/non lu**  
✅ **Suppression de messages**  
✅ **Compteur de messages non lus**  
✅ **Formatage des dates** avec date-fns  
✅ **Design gamer moderne** adapté au thème du site

## 🗂️ Structure Backend

### Migration
- Fichier : `database/migrations/2026_02_01_000000_create_user_messages_table.php`
- Crée la table `user_messages` avec les colonnes :
  - `user_id` : référence à l'utilisateur
  - `type` : notification|code|order
  - `title` : titre du message
  - `content` : contenu long du message
  - `code` : code diamants (optionnel)
  - `read_status` : booléen pour le statut lu/non lu
  - `created_at`, `updated_at` : timestamps

### Modèle
- Fichier : `app/Models/UserMessage.php`
- Relations avec User
- Scopes : `unread()`, `ofType($type)`

### Contrôleur
- Fichier : `app/Http/Controllers/MessageController.php`
- Endpoints :
  - `GET /api/messages` - Lister les messages
  - `GET /api/messages/unread-count` - Compteur non lus
  - `PUT /api/messages/{id}/read` - Marquer comme lu
  - `PUT /api/messages/{id}/unread` - Marquer comme non lu
  - `PUT /api/messages/mark-all-read` - Marquer tous comme lus
  - `DELETE /api/messages/{id}` - Supprimer un message

### Routes
- Fichier : `routes/api.php`
- Routes protégées par `auth:sanctum`

## 📱 Structure Frontend

### Store Zustand
- Fichier : `src/store/messages.ts`
- Actions :
  - `fetchMessages()` - Récupère tous les messages
  - `fetchUnreadCount()` - Récupère le nombre non lus
  - `markAsRead(id)` - Marque comme lu
  - `markAsUnread(id)` - Marque comme non lu
  - `markAllAsRead()` - Tous comme lus
  - `deleteMessage(id)` - Supprime un message

### Composant Icône
- Fichier : `src/components/NotificationIcon.tsx`
- Affiche l'icône 📬 avec badge
- Bouton cliquable pour ouvrir/fermer le panneau
- Rafraîchit les messages toutes les 30s

### Composant Panneau
- Fichier : `src/components/MessagingPanel.tsx`
- Panneau glissant côté droit
- Liste complète des messages
- Actions par message : marquer lu, supprimer
- Formatage des dates relatif (ex: "il y a 2 heures")

### Intégration
- Fichier : `src/app/page.tsx`
- L'icône s'affiche seulement si l'utilisateur est connecté
- Placée à droite du bouton panier dans le header

## 🚀 Utilisation

### Installation et Déploiement Backend
```bash
# Exécuter la migration
php artisan migrate

# (Optionnel) Charger les données de test
php artisan db:seed --class=MessageSeeder
```

### Créer des messages pour un utilisateur
```php
use App\Models\UserMessage;
use App\Models\User;

$user = User::find(1);

// Créer une notification
UserMessage::create([
    'user_id' => $user->id,
    'type' => 'notification',
    'title' => 'Titre du message',
    'content' => 'Contenu du message',
    'read_status' => false,
]);

// Créer un code
UserMessage::create([
    'user_id' => $user->id,
    'type' => 'code',
    'title' => 'Code reçu',
    'content' => 'Voici votre code',
    'code' => 'CODE123456',
    'read_status' => false,
]);
```

### Frontend - Messages automatiques
Les messages peuvent être créés automatiquement lors de :
- **Inscription** : message de bienvenue
- **Achat** : confirmation de commande + codes
- **Promotions** : notifications spéciales

## 🎨 Design

### Couleurs par type
- **Notification** 📢 : Bleu cyan
- **Code** 💎 : Orange
- **Commande** 📦 : Rouge-orange

### Animations
- Badge pulse au hover
- Panneau slide-in fluide
- Messages fade in/out
- Glue lumineux au survol

## 📊 Base de données

```sql
SELECT * FROM user_messages 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

## 🔒 Sécurité

✅ Les utilisateurs ne peuvent voir que leurs propres messages  
✅ Authentification Sanctum requise  
✅ Vérification des autorisations au niveau du contrôleur  
✅ Tokens CSRF pour les modifications

## 🔄 Mise à jour en temps réel

Actuellement : rafraîchissement manuel toutes les 30 secondes.

Pour le temps réel (futur) :
- Implémenter WebSockets avec Laravel Reverb
- Utiliser la souscription Pusher
- Émettre des événements lors de la création de messages

## 📝 Exemple de réponse API

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "type": "code",
        "title": "Votre code diamants",
        "content": "Utilisez ce code dans Free Fire",
        "code": "FREE-2024-ABC123",
        "read_status": false,
        "created_at": "2026-02-01T10:30:00Z"
      }
    ]
  }
}
```

## ✨ Prochaines améliorations

- [ ] Notifications push desktop
- [ ] WebSockets pour mise à jour temps réel
- [ ] Filtrer par type de message
- [ ] Recherche et pagination avancée
- [ ] Archivage de messages
- [ ] Notifications par email
- [ ] Rappels automatiques

