# Audioask — site commercial

Site vitrine statique (Astro 5, CSS maison, aucun framework front). Bilingue
français / anglais. Déployé chez Infomaniak par `rsync`, sans aucun code
exécuté côté serveur : `mail()` y est désactivé, c'est pourquoi les
formulaires appellent une API externe plutôt que le PHP local
(`public/contact-handler.php` n'est plus utilisé).

Le français est la langue de travail : commentaires, messages de commit,
descriptions de PR, libellés de l'admin.

## Commandes

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # sort dans dist/
npm run preview   # sert dist/
```

Il n'y a **ni tests, ni linter, ni formateur**. `npm run build` est le seul
garde-fou automatique : il échoue si un contenu ne respecte pas son schéma Zod.
Voir « Vérifier un changement » plus bas.

## Structure

| Chemin | Rôle |
|---|---|
| `src/pages/` | une page = un fichier ; FR à la racine, EN sous `en/` |
| `src/layouts/Layout.astro` | `<head>`, SEO, canonical, hreflang, JSON-LD global |
| `src/components/` | Header, Footer, ConsentBanner, MobileTease |
| `src/styles/global.css` | tout le CSS partagé (variables, composants, responsive) |
| `src/content/` | contenus éditables, validés par `src/content/config.ts` |
| `src/pages/admin/` | interface d'édition (voir `docs/ADMIN.md`) |
| `public/` | copié tel quel : assets, `.htaccess`, handlers PHP, config de l'admin |

### Bilinguisme

Les pages FR et EN sont **deux fichiers distincts**, pas un fichier traduit :
`src/pages/tarifs.astro` et `src/pages/en/pricing.astro`. Les URL sont
localisées (`/fonctionnalites/transcrire` ↔ `/en/features/transcribe`), et la
correspondance est déclarée par `alternatePath` passé au `Layout` — c'est ce qui
alimente les balises `hreflang`. Modifier une page FR n'a **aucun** effet sur son
équivalent EN : il faut traiter les deux.

Le Header et le Footer font exception : leurs libellés vivent dans le composant,
choisis par des ternaires `isFr`.

### Contenus éditables

Trois collections, définies dans `src/content/config.ts` :

- **`home`** — textes de la page d'accueil, `fr.json` et `en.json`. Les pages
  `index.astro` ne contiennent plus que la mise en page.
- **`blog`** — articles Markdown. Le champ `lang` décide de l'URL (`/blog/` ou
  `/en/blog/`). Un article n'existe que dans une langue ; sa traduction est un
  second article, avec son propre slug.
- **`podcasts`** — une page par podcast, en JSON.

Le reste des pages garde ses textes en dur. Les migrer une par une vers une
collection est le chantier en cours ; la marche à suivre est dans
`docs/ADMIN.md`.

## Deux sources de vérité à garder alignées

`public/admin/config.yml` décrit ce que voit la personne qui édite.
`src/content/config.ts` décrit ce que le build accepte.

**Toute modification de l'un doit être répercutée sur l'autre.** En cas
d'oubli, le build échoue avec un message clair : le site en ligne n'est jamais
cassé, mais la publication ne part pas.

## Trois domaines applicatifs

Le site en appelle trois, et la distinction n'est pas un accident :

| Usage | Domaine | Ce qui le sert |
|---|---|---|
| Liens de connexion et d'inscription (`APP_URL`) | `app.audioask.ai` | application Next.js |
| Formulaires : `/api/contact`, `/api/notify` | `api.audioask.ai` | backend PHP (dépôt `audioask`) |
| Lecteur podcast : `/embed/<token>` | `dev.audioask.ai` | Next.js — **provisoire**, voir plus bas |

Le backend PHP a été sorti sur son propre domaine (`api.audioask.ai` en
production, `dev-api.audioask.ai` en préversion — voir `.env.tpl` du dépôt
`audioask-app`). Les formulaires doivent donc viser `api`, jamais `app` :
l'application Next ne porte pas ces routes et répond par une page d'erreur
HTML, que le site interprète comme une panne réseau.

Le lecteur, lui, est bien une page de l'application Next
(`src/app/embed/[token]/page.tsx`) et devrait vivre sur `app.audioask.ai`.
Il reste sur `dev` parce que les tokens actuels appartiennent à la base de
développement. Quand ils auront été régénérés depuis un compte de
production, basculer `podcast/[slug].astro` sur `app` et supprimer cette
ligne.

`APP_URL` est par ailleurs redéclaré dans chacun des 22 gabarits qui
l'utilisent : un changement de domaine se fait donc partout à la fois.

## Pièges vérifiés

Chacun a coûté un aller-retour. Ils ne se devinent pas à la lecture du code.

- **L'admin supprime les espaces en début et fin de chaque champ** à
  l'enregistrement. Ne jamais faire porter du sens à ces espaces : `" /mois"`
  revient `"/mois"`, et deux textes concaténés se retrouvent collés. Les
  séparateurs — espaces, espaces insécables — appartiennent au gabarit.
- **`set:html` perd l'attribut de portée CSS.** Le HTML injecté ne reçoit pas le
  `data-astro-cid-*` de la page : à l'intérieur, seules les classes définies dans
  `global.css` fonctionnent, jamais celles d'un `<style>` de page.
- **Le serveur de développement ne sert pas les index de dossier de `public/`.**
  Une page qui doit répondre sur `/xxx/` en local doit être une page Astro, pas
  un `index.html` dans `public/` — c'est pourquoi l'admin vit dans
  `src/pages/admin/`.
- **`rsync --delete`** : tout ce qui n'est pas dans `dist/` est supprimé du
  serveur. Un fichier déposé à la main sur l'hébergement ne survit pas au
  déploiement suivant.
- **Les entités HTML dans les fichiers de contenu ne sont pas interprétées.**
  Un `&nbsp;` interpolé par `{...}` s'affiche littéralement ; utiliser le
  caractère U+00A0.

## Vérifier un changement

Sans tests, la vérification est manuelle mais systématique.

**Refactorisation censée ne rien changer au rendu** — la méthode qui a servi à
sortir les textes de l'accueil, à reprendre telle quelle :

1. `npm run build`, mettre `dist/` de côté ;
2. appliquer la modification, reconstruire ;
3. comparer le HTML produit en normalisant les espaces et les attributs
   `data-astro-cid-*` ; tout écart restant doit s'expliquer.

Pour une certitude visuelle, Chromium est préinstallé
(`/opt/pw-browsers/chromium`, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, ne
pas lancer `playwright install`) : servir les deux versions, capturer les pages
entières et comparer les images. Figer les animations et forcer la classe
`in-view` sur `#product-stage` rend le rendu déterministe.

**Changement de contenu** : `npm run build` suffit — le schéma Zod valide.

## Conventions Git

- Commits en français, préfixe conventionnel : `feat(scope):`, `fix(scope):`,
  `docs:`. Le corps explique **pourquoi**, pas ce que montre déjà le diff.
- Développer sur une branche, ouvrir une PR, fusionner avec un commit de merge.
- **Un merge sur `main` déclenche le déploiement en production.** Ne fusionner
  qu'une fois le build vérifié.

## Déploiement

`.github/workflows/deploy.yml` : push sur `main` → build → `rsync` vers
Infomaniak → correction des permissions. Environ 30 secondes, puis en ligne.

L'admin publie de la même façon : chaque enregistrement crée un commit sur
`main`, donc un déploiement. Il n'y a pas d'étape de relecture (`publish_mode:
simple`).

## Depuis une session Claude Code

Le domaine `www.audioask.ai` **n'est pas joignable** depuis l'environnement
d'exécution : le proxy sortant le bloque. Vérifier en construisant le site
localement, jamais en consultant la page en ligne — et le dire clairement quand
la vérification finale revient à l'utilisateur.
