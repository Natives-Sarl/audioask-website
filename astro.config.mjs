import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.audioask.ai',
  integrations: [
    // L'interface d'administration n'a rien à faire dans le sitemap.
    // /accueil-b est une variante de la page d'accueil pour comparaison : elle
    // duplique son contenu et ne doit ni être indexée ni figurer au sitemap.
    sitemap({ filter: (page) => !page.includes('/admin') && !page.includes('/accueil-b') }),
  ],
});
