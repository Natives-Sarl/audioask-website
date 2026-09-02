# Administration des contenus

L'interface d'édition est disponible sur **https://www.audioask.ai/admin**.

Elle repose sur [Sveltia CMS](https://github.com/sveltia/sveltia-cms), un CMS
open source « git-based » : il n'y a ni base de données, ni service tiers qui
héberge le contenu. L'interface lit et écrit directement les fichiers du dépôt
GitHub. Chaque enregistrement crée un commit, l'action de déploiement publie le
site dans les deux minutes qui suivent.

---

## Première connexion (à faire une seule fois)

L'admin s'authentifie avec un **token d'accès personnel GitHub**. C'est plus
simple et plus sûr qu'un service OAuth : aucun secret ne se trouve sur
l'hébergement, et le token peut être révoqué à tout moment.

1. Ouvrir https://github.com/settings/personal-access-tokens/new
   (*Settings → Developer settings → Personal access tokens → Fine-grained*).
2. Renseigner :
   - **Token name** : `Audioask CMS`
   - **Expiration** : au choix — noter la date, le token devra être recréé après.
   - **Repository access** : *Only select repositories* → `Natives-Sarl/audioask-website`
   - **Permissions → Repository permissions → Contents** : `Read and write`
     (c'est la seule permission nécessaire)
3. Cliquer **Generate token** et copier la valeur affichée : elle n'est montrée
   qu'une fois.
4. Ouvrir https://www.audioask.ai/admin, choisir la connexion par token d'accès
   et coller la valeur.

L'interface est en anglais par défaut mais existe en français : elle propose
généralement de basculer d'elle-même, sinon le réglage se trouve dans les
préférences du CMS (*Preferences → Language*).

Le token est conservé par le navigateur : la manipulation n'est à refaire qu'en
cas de changement de machine, de navigateur, ou d'expiration du token.

> Si la connexion est refusée avec un token « fine-grained », créer à la place
> un token classique (*Tokens (classic)* → **Generate new token**) avec la seule
> portée `repo`. L'écran de connexion de l'admin propose de toute façon un lien
> direct vers la bonne page de GitHub.

---

## Ce qui est éditable

### Pages du site

**Accueil** — tous les textes de la page d'accueil : titres, chapeaux, cartes de
fonctionnalités, tarifs, appels à l'action, ainsi que le titre et la description
utilisés par Google.

Le français et l'anglais s'éditent **dans le même écran**, chaque champ affichant
ses deux versions. Un seul enregistrement met les deux langues à jour :
`www.audioask.ai/` et `www.audioask.ai/en/` restent ainsi alignées, sans risque
d'oublier la traduction d'une modification.

Certains champs acceptent du **HTML simple**, signalé par une aide sous le
champ :

| Balise | Effet |
|---|---|
| `<br>` | retour à la ligne |
| `<span class="serif-it">mot</span>` | le mot en italique serif |
| `<span class="em-serif">mot</span>` | idem, avec la couleur d'accent |

Ces balises servent à la mise en forme des grands titres. En cas de doute, du
texte simple fonctionne toujours.

### Articles de blog

Création, modification et suppression. Le champ **Langue** décide de l'adresse
de publication : `fr` publie sous `/blog/`, `en` sous `/en/blog/`.

Le blog n'utilise **pas** l'édition côte à côte des pages, et c'est délibéré : un
article n'est pas la traduction d'un autre. Chacun a sa propre adresse
(`/blog/audioask-lancement/` et `/en/blog/audioask-launch/`, pas la même dans
les deux langues — c'est meilleur pour le référencement), sa propre date, et
peut exister dans une seule langue. Pour une version anglaise d'un article
français, on crée un second article avec la langue `English`.

Un article coché **Brouillon** n'est ni listé ni publié : aucune page n'est
créée pour lui, il reste invisible tant que la case n'est pas décochée.

### Pages podcast

Une page par podcast, avec son lecteur intégré. L'**identifiant du lecteur
intégré** est l'UUID visible dans l'URL de l'embed Audioask.

---

## Publier une modification

1. Modifier le contenu, cliquer **Save**.
2. L'admin crée un commit sur la branche `main`.
3. GitHub Actions reconstruit le site et le déploie sur Infomaniak.
4. Le changement est en ligne au bout d'environ deux minutes.

Il n'y a pas d'étape de validation intermédiaire : ce qui est enregistré part
en production. L'historique Git permet de revenir en arrière sur n'importe
quelle modification.

---

## Ce qui n'est pas éditable depuis l'admin, et pourquoi

- **Les liens et la navigation** — un texte modifié ne doit pas pouvoir casser
  une URL. La phrase sous les tarifs, par exemple, est découpée en trois champs
  (avant / texte du lien / après) précisément pour cette raison.
- **Les icônes et la maquette de l'application** en haut de la page d'accueil :
  c'est une illustration construite en HTML, pas du contenu.
- **Les autres pages** (tarifs, à propos, fonctionnalités…) : leurs textes sont
  encore codés en dur dans les gabarits. La migration se fait page par page,
  sur le modèle de l'accueil (voir plus bas).

---

## Pour les développeurs

### Où vivent les choses

| Fichier | Rôle |
|---|---|
| `public/admin/index.html` | charge Sveltia CMS (version figée dans l'URL) |
| `public/admin/config.yml` | décrit les collections et les champs de l'admin |
| `src/content/config.ts` | schémas Zod qui **valident** les fichiers au build |
| `src/content/home/{fr,en}.json` | textes de la page d'accueil |
| `src/content/blog/*.md` | articles |
| `src/content/podcasts/*.json` | pages podcast |

`config.yml` et `config.ts` décrivent la même chose de deux points de vue :
l'un ce que voit l'éditeur, l'autre ce que le build accepte. **Toute
modification de l'un doit être répercutée sur l'autre.** En cas d'oubli, le
build échoue avec un message explicite — le site en ligne n'est jamais cassé,
mais la publication ne part pas.

### Ajouter une page à l'admin

1. Créer `src/content/<page>/fr.json` et `en.json` avec les textes extraits du
   gabarit.
2. Déclarer la collection et son schéma dans `src/content/config.ts`.
3. Remplacer les textes du `.astro` par les valeurs lues via `getEntry`.
4. Ajouter l'entrée dans `public/admin/config.yml`, sous
   `collections → pages → files`, avec `file: src/content/<page>/{{locale}}.json`
   et `i18n: true`.
5. **Marquer chaque champ `i18n: true`**, à tous les niveaux d'imbrication. Un
   champ sans cette marque n'existe que dans la langue par défaut : il
   disparaîtrait de la version anglaise.
6. Vérifier que le rendu n'a pas bougé : construire avant et après, et comparer
   le HTML produit (`dist/`) — c'est la méthode utilisée pour l'accueil.

### Mettre à jour Sveltia CMS

La version est figée dans `public/admin/index.html`. Pour la faire évoluer,
consulter https://github.com/sveltia/sveltia-cms/releases puis changer le
numéro dans l'URL du script.

### Passer à une connexion GitHub par OAuth

Le token personnel convient à un ou deux éditeurs techniques. Pour ouvrir
l'admin à des personnes non techniques, un client OAuth évite de leur faire
gérer un token : déployer
[`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) puis ajouter
son URL sous `backend.base_url` dans `config.yml`. Rien d'autre ne change.

### Circuit de relecture

`publish_mode: simple` publie directement. Le passage à `editorial_workflow`
fait passer chaque modification par une pull request à valider avant mise en
ligne.
