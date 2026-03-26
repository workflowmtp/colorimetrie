# ColorLab Pro - Gestion Colorimétrique Industrielle

Application Next.js 15 pour la gestion colorimétrique industrielle de MULTIPRINT S.A. (Cameroun).

## 🚀 Déploiement sur Vercel

### Prérequis
- Compte Vercel
- Base de données PostgreSQL (Vercel Postgres recommandé)
- Compte GitHub/GitLab/Bitbucket

### Étapes de déploiement

#### 1. Fork/Push sur GitHub
```bash
git init
git add .
git commit -m "Initial commit - ColorLab Pro v1.0.0"
git branch -M main
git remote add origin https://github.com/yourusername/colorlab-pro.git
git push -u origin main
```

#### 2. Import sur Vercel
1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Cliquez "Add New..." → "Project"
3. Importez votre dépôt GitHub
4. Vercel détectera automatiquement Next.js

#### 3. Configuration des variables d'environnement
Dans Vercel Dashboard → Settings → Environment Variables, ajoutez ces variables directement :

```bash
# Base de données (OBLIGATOIRE)
# Pour Vercel Postgres: utilisez l'URL fournie par Vercel (commence par prisma://)
# Pour base externe: utilisez postgresql://
DATABASE_URL=prisma://user:password@host:port/database?schema=public

# Authentification (TRÈS IMPORTANT)
NEXTAUTH_URL=https://colorimetrie.vercel.app
NEXTAUTH_SECRET=votre-secret-32-caractères-minimum-généré-avec-openssl

# Agent IA (optionnel - choisissez l'une des deux options)
# Option 1: Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-votre-clé-ici

# Option 2: n8n webhook
N8N_WEBHOOK_URL=https://votre-n8n-instance.com/webhook/votre-webhook-id
N8N_WEBHOOK_USER=votre-username-n8n
N8N_WEBHOOK_PASSWORD=votre-password-n8n

# Application (valeurs suggérées)
NEXT_PUBLIC_APP_NAME=ColorLab Pro
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_COMPANY=MULTIPRINT S.A.
NEXT_PUBLIC_CURRENCY=FCFA
```

**IMPORTANT**: 
- Ne créez PAS de secrets Vercel séparés
- Ajoutez directement les variables d'environnement comme ci-dessus
- Le `NEXTAUTH_SECRET` doit être une chaîne de 32+ caractères (utilisez `openssl rand -base64 32`)

#### 4. Base de données
**Option A: Vercel Postgres (recommandé)**
1. Dans Vercel Dashboard → Storage → Create Database
2. Choisissez PostgreSQL
3. **IMPORTANT**: L'URL générée commencera par `prisma://` (pas `postgresql://`)
4. Copiez le `DATABASE_URL` généré
5. Ajoutez-le aux variables d'environnement

**Note**: Vercel Postgres utilise le protocole `prisma://` qui est spécifique à Vercel. N'utilisez pas `postgresql://`.

**Option B: Base externe**
1. Assurez-vous que votre base est accessible
2. Configurez le `DATABASE_URL` manuellement avec `postgresql://`

#### 5. Déploiement initial
Cliquez "Deploy" sur Vercel. Le build devrait prendre 2-3 minutes.

#### 6. Initialisation de la base
Après le premier déploiement, vous devez initialiser la base :

```bash
# Génération Prisma
npx prisma generate

# Push du schéma
npx prisma db push

# Peuplement des données
npm run db:seed
```

**OU** utilisez Vercel CLI :
```bash
vercel env pull .env.production
npx prisma db push --schema-url $DATABASE_URL
npm run db:seed
```

## 📋 Configuration requise

### Permissions système
L'application utilise un système RBAC avec les permissions suivantes :

**Administrateur** : Toutes les permissions
**Responsable Labo** : project.*, trial.*, formulation.*, validation.*, ai.use
**Technicien Labo** : project.read, trial.read, measure.read, formulation.read
**Conducteur Machine** : production.read, qc.read
**Responsable Qualité** : validation.read, qc.read, production.read
**Direction Technique** : project.read, validation.read, settings.read

### Comptes par défaut (après seed)
- **admin@multiprint.cm / colorlab2026** (Administrateur)
- **jm.nguema@multiprint.cm / colorlab2026** (Responsable Labo)
- **p.mbarga@multiprint.cm / colorlab2026** (Technicien Labo)
- **y.ndongo@multiprint.cm / colorlab2026** (Technicien Labo)
- **s.fotso@multiprint.cm / colorlab2026** (Conducteur Machine)
- **t.ekane@multiprint.cm / colorlab2026** (Conducteur Machine)
- **m.atangana@multiprint.cm / colorlab2026** (Responsable Qualité)
- **direction@multiprint.cm / colorlab2026** (Direction Technique)

## 🔧 Fonctionnalités

### Modules principaux
- **Dashboard** : Vue d'ensemble des activités
- **Dossiers couleur** : Gestion des projets colorimétriques
- **Essais** : Suivi des essais laboratoire
- **Spectrocolorimètre** : Mesures spectrales
- **Densitomètre** : Mesures densitométriques
- **Formulations** : Bibliothèque de formulations
- **Recettes** : Recettes optimisées par procédé
- **Validation Labo** : Validation des couleurs
- **Suivi Production** : Contrôle en ligne
- **Contrôle Qualité** : QC et statistiques
- **Offset Metal** : Formulations métal (ETP/TFS)
- **Bibl. Teintes** : Bibliothèque de standards
- **Agent IA** : Assistant colorimétrie
- **Paramètres** : Configuration système
- **Utilisateurs** : Gestion des accès

### Agent IA
L'agent IA peut être configuré avec :
- **Anthropic API** : Claude pour l'analyse colorimétrique
- **n8n Webhook** : Workflow personnalisé

## 🛠️ Stack technique

- **Frontend** : Next.js 15, React 19, TypeScript
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : PostgreSQL
- **Authentification** : NextAuth.js
- **Styling** : Tailwind CSS + CSS Variables
- **State Management** : Zustand
- **Déploiement** : Vercel

## 📝 Notes importantes

### Sécurité
- Changez immédiatement les mots de passe par défaut
- Utilisez un `NEXTAUTH_SECRET` sécurisé (32+ caractères)
- Configurez HTTPS en production
- Limitez les permissions selon les rôles

### Performance
- L'application utilise Prisma avec connection pooling
- Les images sont optimisées automatiquement
- Le cache Next.js est configuré pour la production

### Monitoring
- Vercel Analytics inclus
- Logs disponibles dans Vercel Dashboard
- Erreurs envoyées à Vercel Error Tracking

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez les logs dans Vercel Dashboard
2. Consultez la documentation Next.js
3. Contactez l'équipe technique MULTIPRINT

---

**Développé pour MULTIPRINT S.A. - Cameroun**  
**Version 1.0.0** - Mars 2026
