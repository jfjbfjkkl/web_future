# Déploiement sur Render (Laravel + Next.js)

Ce dépôt contient deux services :
- backend (Laravel)
- frontend (Next.js)

Le fichier render.yaml est prêt pour créer :
- 1 service web PHP (backend)
- 1 service web Node (frontend)
- 1 base PostgreSQL (Render)

## Étapes rapides

1. Connecte le repo sur Render.
2. Choisis "Blueprint" et sélectionne le fichier render.yaml.
3. Une fois les services créés, configure les variables d’environnement suivantes (voir ci‑dessous).
4. Redeploie si nécessaire.

## Variables d’environnement à définir

### Backend (Laravel)

Obligatoires (liaison frontend + base) :
- APP_URL=https://<backend>.onrender.com
- FRONTEND_URLS=https://<frontend>.onrender.com
- SANCTUM_STATEFUL_DOMAINS=<frontend>.onrender.com
- SESSION_DOMAIN=.onrender.com
- SESSION_SECURE_COOKIE=true
- SESSION_SAME_SITE=lax (ou none si vous utilisez un domaine différent)

Base de données (si vous ne utilisez pas le bloc fromDatabase du render.yaml) :
- DB_CONNECTION=pgsql
- DB_HOST=<host Render>
- DB_PORT=5432
- DB_DATABASE=<database>
- DB_USERNAME=<user>
- DB_PASSWORD=<password>

Recommandées :
- APP_ENV=production
- APP_DEBUG=false
- LOG_LEVEL=info

### Frontend (Next.js)

- NEXT_PUBLIC_API_URL=https://<backend>.onrender.com/api

## Notes

- Le backend utilise Sanctum + cookies. Les domaines doivent être compatibles pour que les cookies soient acceptés.
- Si vous utilisez un domaine personnalisé, remplacez .onrender.com par votre domaine.
