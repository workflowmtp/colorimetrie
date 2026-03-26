# ================================================================
# COLORLAB PRO — STRUCTURE NEXT.JS
# 30 modeles Prisma | 10 enums | ~90 fichiers
# Stack: Next.js 15 + TypeScript + Prisma + PostgreSQL + NextAuth + Zustand + Tailwind
# ================================================================

## Structure des fichiers

```
colorlab-pro/
├── prisma/
│   ├── schema.prisma              ✅ 30 modeles, 10 enums, relations completes
│   └── seed.ts                    ✅ Donnees demo MULTIPRINT completes
│
├── src/
│   ├── app/                       # App Router (Next.js 15)
│   │   ├── layout.tsx             # Layout racine + providers
│   │   ├── page.tsx               # Redirect → /dashboard
│   │   ├── globals.css            # Tailwind + variables custom
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx     # Page connexion
│   │   │   └── layout.tsx         # Layout auth (sans sidebar)
│   │   │
│   │   ├── (app)/                 # Layout principal avec sidebar
│   │   │   ├── layout.tsx         # Sidebar + header + content area
│   │   │   ├── dashboard/page.tsx
│   │   │   │
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx       # Liste dossiers (accordeons)
│   │   │   │   ├── new/page.tsx   # Formulaire nouveau dossier (multi-couleurs)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Fiche dossier detail
│   │   │   │       └── edit/page.tsx
│   │   │   │
│   │   │   ├── trials/
│   │   │   │   ├── page.tsx       # Liste essais
│   │   │   │   └── [id]/page.tsx  # Detail essai
│   │   │   │
│   │   │   ├── spectro/
│   │   │   │   └── page.tsx       # Page spectro (groupee par dossier)
│   │   │   │
│   │   │   ├── densito/
│   │   │   │   └── page.tsx       # Page densito (groupee par dossier)
│   │   │   │
│   │   │   ├── formulations/
│   │   │   │   ├── page.tsx       # Editeur formulation (offset vs helio)
│   │   │   │   └── recipes/page.tsx # Bibliotheque recettes
│   │   │   │
│   │   │   ├── validation/
│   │   │   │   └── page.tsx       # Validation labo (par couleur)
│   │   │   │
│   │   │   ├── production/
│   │   │   │   └── page.tsx       # Suivi production (multi-couleurs)
│   │   │   │
│   │   │   ├── qc/
│   │   │   │   └── page.tsx       # Controle qualite (par couleur)
│   │   │   │
│   │   │   ├── metal/
│   │   │   │   └── page.tsx       # Offset metal specifique
│   │   │   │
│   │   │   ├── tints/
│   │   │   │   └── page.tsx       # Bibliotheque teintes
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   └── page.tsx       # Agent IA ColorLab
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   └── page.tsx       # Parametres (tolerances, standards, supports, machines, clients)
│   │   │   │
│   │   │   └── users/
│   │   │       └── page.tsx       # Gestion utilisateurs
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts   # NextAuth config
│   │       │
│   │       ├── projects/
│   │       │   ├── route.ts                  # GET list + POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts              # GET one + PUT update + DELETE
│   │       │       ├── status/route.ts       # PATCH workflow status change
│   │       │       └── priority/route.ts     # PATCH priority change
│   │       │
│   │       ├── colors/
│   │       │   └── route.ts                  # CRUD project_colors
│   │       │
│   │       ├── trials/
│   │       │   ├── route.ts                  # GET + POST
│   │       │   └── [id]/route.ts             # GET + PUT + DELETE
│   │       │
│   │       ├── spectro/
│   │       │   ├── route.ts                  # GET + POST (multi-create)
│   │       │   └── [id]/route.ts             # GET + PUT + DELETE
│   │       │
│   │       ├── densito/
│   │       │   ├── route.ts                  # GET + POST (multi-create)
│   │       │   └── [id]/route.ts             # GET + PUT + DELETE
│   │       │
│   │       ├── formulations/
│   │       │   ├── route.ts                  # GET + POST
│   │       │   └── [id]/route.ts             # GET + PUT + DELETE
│   │       │
│   │       ├── validations/
│   │       │   └── route.ts                  # GET + POST
│   │       │
│   │       ├── production/
│   │       │   └── route.ts                  # GET + POST (multi-create per color)
│   │       │
│   │       ├── qc/
│   │       │   └── route.ts                  # GET + POST
│   │       │
│   │       ├── metal/
│   │       │   └── route.ts                  # GET + PUT metal/white-lacquer/oven
│   │       │
│   │       ├── settings/
│   │       │   ├── tolerances/route.ts
│   │       │   ├── machines/route.ts
│   │       │   ├── clients/route.ts
│   │       │   └── standards/route.ts
│   │       │
│   │       ├── users/
│   │       │   └── route.ts
│   │       │
│   │       ├── ai/
│   │       │   └── route.ts                  # POST → Anthropic API or n8n webhook
│   │       │
│   │       └── export/
│   │           └── route.ts                  # GET CSV exports
│   │
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth options + helpers
│   │   ├── permissions.ts         # RBAC permission matrix
│   │   ├── workflow.ts            # Status transition rules
│   │   ├── colorimetry.ts         # deltaE76, deltaE2000, labToRgb, proximityScore
│   │   ├── utils.ts               # formatDate, generateCode, round, escapeHtml
│   │   └── constants.ts           # PROCESSES, SUPPORTS, STATUS maps, COMP_TYPES
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces & type exports
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             # Current user + role + permissions
│   │   ├── useProjects.ts         # SWR/fetch projects
│   │   └── useToast.ts            # Toast notifications
│   │
│   ├── stores/
│   │   └── app-store.ts           # Zustand: sidebar, theme, modal, filters
│   │
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.tsx
│       │   ├── Header.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── UserMenu.tsx
│       │
│       ├── ui/
│       │   ├── Badge.tsx
│       │   ├── Button.tsx
│       │   ├── Modal.tsx
│       │   ├── Toast.tsx
│       │   ├── Accordion.tsx
│       │   ├── DataTable.tsx
│       │   ├── Pagination.tsx
│       │   ├── SwatchStrip.tsx
│       │   ├── DeltaEBadge.tsx
│       │   └── ConformityIndicator.tsx
│       │
│       ├── projects/
│       │   ├── ProjectList.tsx
│       │   ├── ProjectCard.tsx
│       │   ├── ProjectDetail.tsx
│       │   ├── ProjectForm.tsx
│       │   ├── ColorRowEditor.tsx      # Multi-color row inputs
│       │   ├── StatusChangeModal.tsx
│       │   └── PriorityChangeModal.tsx
│       │
│       ├── trials/
│       │   ├── TrialList.tsx
│       │   ├── TrialDetail.tsx
│       │   └── NewTrialModal.tsx
│       │
│       ├── spectro/
│       │   ├── SpectroPage.tsx
│       │   ├── SpectroMultiForm.tsx     # Multi-line + CMJN toggle
│       │   ├── SpectroSingleForm.tsx    # Edit single measurement
│       │   ├── SpectroDetailModal.tsx   # Grand format: comparison + CMJN + reflectances
│       │   └── CMJNDensityCards.tsx     # Cartes couleur densites
│       │
│       ├── densito/
│       │   ├── DensitoPage.tsx
│       │   └── DensitoMultiForm.tsx
│       │
│       ├── formulations/
│       │   ├── FormulationEditor.tsx    # Offset vs Helio dynamic
│       │   ├── FormulationView.tsx
│       │   └── RecipeLibrary.tsx
│       │
│       ├── validation/
│       │   ├── ValidationPage.tsx
│       │   └── ValidationCard.tsx       # Per-color breakdown table
│       │
│       ├── production/
│       │   ├── ProductionPage.tsx
│       │   └── ProductionForm.tsx       # Multi-color conforme/NC per row
│       │
│       ├── qc/
│       │   ├── QCPage.tsx
│       │   └── QCComparisonTable.tsx    # Labo vs Production per color
│       │
│       ├── dashboard/
│       │   ├── DashboardKPIs.tsx
│       │   ├── DashboardAlerts.tsx
│       │   └── DashboardRecentProjects.tsx
│       │
│       └── ai/
│           ├── AIPanel.tsx
│           └── AIChat.tsx
│
├── .env.example                   ✅
├── package.json                   ✅
├── tsconfig.json                  → Partie 2
├── next.config.ts                 → Partie 2
├── tailwind.config.ts             → Partie 2
├── postcss.config.js              → Partie 2
└── middleware.ts                   → Partie 2 (protection routes)
```

## Plan de livraison

| Partie | Contenu | Fichiers |
|--------|---------|----------|
| **1** ✅ | Prisma schema + seed + config | 4 fichiers |
| **2** | Config (tsconfig, next, tailwind, middleware) + lib/ (prisma, auth, permissions, workflow, colorimetry, utils, constants) + types/ | ~12 fichiers |
| **3** | Layout + auth (login, sidebar, header, providers) | ~8 fichiers |
| **4** | API routes (projects, colors, trials, spectro, densito) | ~12 fichiers |
| **5** | API routes (formulations, validations, production, qc, metal, settings, users, ai, export) | ~12 fichiers |
| **6** | Composants UI de base (Badge, Button, Modal, Accordion, DataTable, SwatchStrip, DeltaEBadge) | ~10 fichiers |
| **7** | Pages + composants: Dashboard + Projects + Trials | ~12 fichiers |
| **8** | Pages + composants: Spectro + Densito + Formulations | ~10 fichiers |
| **9** | Pages + composants: Validation + Production + QC | ~8 fichiers |
| **10** | Pages: Metal + Tints + AI + Settings + Users | ~8 fichiers |

**Total estimé : ~90 fichiers, ~8 500 lignes TypeScript**
