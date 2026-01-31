# 🗄️ Configuration Base de Données - Système d'Authentification

## ✅ Ce qui est déjà configuré

### Backend Laravel (PHP)

#### 📊 Base de données : **SQLite**
- Fichier : `backend/database/database.sqlite`
- Configuration : `.env` (DB_CONNECTION=sqlite)

#### 📋 Table `users`
```sql
- id (auto-increment)
- name (string)
- email (string, unique)
- email_verified_at (timestamp, nullable)
- password (hashed avec bcrypt)
- remember_token
- created_at (date d'inscription)
- updated_at
```

#### 🔐 Sécurité implémentée
- ✅ Mots de passe hashés automatiquement avec **bcrypt** (BCRYPT_ROUNDS=12)
- ✅ Protection contre injections SQL (Eloquent ORM)
- ✅ Validation des champs (Laravel Validation)
- ✅ CSRF protection (Laravel Sanctum)
- ✅ Rate limiting (10 requêtes/minute sur auth)
- ✅ Sessions sécurisées

### 🌐 API Endpoints disponibles

#### Inscription
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!"
}
Response: { "user": { "id": 1, "name": "John Doe", "email": "john@example.com" } }
```

#### Connexion
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "Password123!"
}
Response: { "user": { "id": 1, "name": "John Doe", "email": "john@example.com" } }
```

#### Profil utilisateur
```
GET /api/auth/me
Headers: Cookie avec session
Response: { "user": { "id": 1, "name": "John Doe", "email": "john@example.com" } }
```

#### Déconnexion
```
POST /api/auth/logout
Response: { "message": "Logged out" }
```

### 🎨 Frontend Next.js

#### Store Zustand (`frontend/src/store/auth.ts`)
```typescript
useAuthStore:
- user: User | null
- loading: boolean
- error: string | null
- login(email, password)
- register(name, email, password, password_confirmation)
- logout()
- fetchUser()
```

#### Configuration API
- Base URL : `http://localhost:8000/api` (backend Laravel)
- Credentials: `include` (cookies de session)
- CSRF protection automatique

## 🚀 Démarrage

### 1. Backend Laravel
```bash
cd backend
php artisan serve
# Serveur : http://localhost:8000
```

### 2. Frontend Next.js
```bash
cd frontend
npm run dev
# Serveur : http://localhost:3000
```

## 🧪 Test de l'authentification

### Via le frontend
1. Aller sur http://localhost:3000
2. Cliquer sur "Connexion" (bouton en haut à droite ou dans le panier)
3. Créer un compte ou se connecter

### Via API directement
```bash
# Inscription
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'

# Connexion
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }' \
  -c cookies.txt

# Profil (avec session)
curl -X GET http://localhost:8000/api/auth/me \
  -b cookies.txt
```

## 📊 Vérifier la base de données

```bash
cd backend
php artisan tinker

# Dans tinker:
User::count()                    # Nombre d'utilisateurs
User::latest()->first()          # Dernier utilisateur
User::where('email', 'test@example.com')->first()  # Chercher par email
```

Ou avec SQLite directement:
```bash
cd backend/database
sqlite3 database.sqlite
SELECT * FROM users;
.exit
```

## 📁 Structure des fichiers

```
backend/
├── app/
│   ├── Http/Controllers/
│   │   └── AuthController.php       # Contrôleur auth (register, login, logout)
│   └── Models/
│       └── User.php                  # Model User avec hash auto
├── database/
│   ├── migrations/
│   │   └── 0001_01_01_000000_create_users_table.php
│   └── database.sqlite              # Base SQLite
├── routes/
│   └── api.php                      # Routes /api/auth/*
└── .env                             # Config DB

frontend/
├── src/
│   ├── store/
│   │   └── auth.ts                  # Store Zustand pour auth
│   ├── lib/
│   │   └── api.ts                   # Helper API avec CSRF
│   └── app/
│       ├── login/
│       │   └── page.tsx             # Page connexion
│       └── register/
│           └── page.tsx             # Page inscription
```

## 🛡️ Règles de validation

### Inscription
- **name** : requis, string, max 255 caractères
- **email** : requis, format email, max 255, unique
- **password** : requis, confirmé, règles de sécurité Laravel (min 8 caractères)

### Connexion
- **email** : requis, format email
- **password** : requis

## ⚠️ Notes importantes

1. **Mots de passe** : Jamais stockés en clair, toujours hashés avec bcrypt
2. **Sessions** : Gérées par Laravel, stockées côté serveur
3. **CORS** : Configuré pour accepter les requêtes du frontend (localhost:3000)
4. **Rate Limiting** : 10 tentatives/minute sur register et login
5. **Production** : Configurer une vraie base de données (PostgreSQL/MySQL) dans .env

## 🔧 Commandes utiles

```bash
# Réinitialiser la base de données
php artisan migrate:fresh

# Créer un utilisateur de test
php artisan tinker
User::create([
  'name' => 'Admin',
  'email' => 'admin@example.com',
  'password' => Hash::make('password')
]);

# Voir les routes
php artisan route:list --path=auth

# Vider le cache
php artisan cache:clear
php artisan config:clear
```

## ✨ Fonctionnalités

- ✅ Inscription sécurisée
- ✅ Connexion avec validation
- ✅ Déconnexion
- ✅ Session persistante
- ✅ Protection CSRF
- ✅ Hash automatique des mots de passe
- ✅ Validation côté backend
- ✅ Rate limiting
- ✅ Gestion d'erreurs
- ✅ Store frontend (Zustand)
- ✅ API REST complète

## 🎯 Prochaines étapes possibles

1. Vérification d'email
2. Réinitialisation de mot de passe
3. Profil utilisateur éditable
4. Rôles et permissions
5. OAuth (Google, Facebook)
6. Two-factor authentication (2FA)
