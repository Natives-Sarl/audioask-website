import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.audioask.ai',
  integrations: [
    // L'interface d'administration n'a rien à faire dans le sitemap.
    sitemap({ filter: (page) => !page.includes('/admin') }),
  ],
});
