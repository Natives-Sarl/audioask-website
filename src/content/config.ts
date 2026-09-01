import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default("L'équipe Audioask"),
    tags: z.array(z.string()).optional().default([]),
    image: z.string().optional(),
    lang: z.enum(['fr', 'en']).default('fr'),
    draft: z.boolean().default(false),
  }),
});

const podcasts = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    pageTitle: z.string(),
    embedId: z.string(),
    iframeTitle: z.string(),
    description: z.string(),
    metaDescription: z.string(),
    language: z.string(),
    languageLabel: z.string(),
    languageFlag: z.string(),
    category: z.string(),
    host: z.string().optional(),
    episodeCount: z.number().optional(),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Textes de la page d'accueil, une entrée par langue (fr.json, en.json).
// Édités depuis /admin ; le gabarit src/pages/index.astro ne contient plus que
// la mise en page. Les libellés qui acceptent du HTML simple (<br>, <span
// class="serif-it">) sont marqués « HTML » ci-dessous : ils sont injectés tels
// quels dans la page.
const richText = z.string(); // HTML simple autorisé

/** Un point de liste, avec l'étiquette « prochainement » en option. */
const listItem = z.object({
  label: z.string(),
  soon: z.boolean().default(false),
});

/** Une carte : un titre, un texte, et un lien optionnel vers la page dédiée. */
const card = z.object({
  title: z.string(),
  text: z.string(),
  ctaLabel: z.string().optional(),
});

const home = defineCollection({
  type: 'data',
  schema: z.object({
    meta: z.object({
      title: z.string(),
      description: z.string(),
    }),
    hero: z.object({
      pill: z.string(),
      eyebrow: z.string(),
      title: richText, // HTML
      lede: z.string(),
      ctaLabel: z.string(),
      highlights: z.array(z.string()),
    }),
    features: z.object({
      eyebrow: z.string(),
      title: richText, // HTML
      lede: z.string(),
      soonLabel: z.string(),
      basics: z.array(listItem),
      dividerLabel: z.string(),
      cards: z.object({
        search: card,
        transcribe: card,
        ask: card,
        prompts: card,
        automate: card,
        bookmarks: card,
      }),
    }),
    discover: z.object({
      eyebrow: z.string(),
      title: richText, // HTML
      linkLabel: z.string(),
      soonBadge: z.string(),
      cards: z.object({
        transcribe: card,
        ask: card,
        automate: card,
        translate: card,
      }),
    }),
    library: z.object({
      eyebrow: z.string(),
      title: richText, // HTML
      lede: z.string(),
      bigNumber: z.string(),
      bigNumberCaption: richText, // HTML
      tags: z.array(z.string()),
      tagsMore: z.string(),
    }),
    pricing: z.object({
      eyebrow: z.string(),
      title: richText, // HTML
      lede: z.string(),
      soonLabel: z.string(),
      free: z.object({
        name: z.string(),
        tagline: z.string(),
        price: z.string(),
        period: z.string(),
        features: z.array(listItem),
        ctaLabel: z.string(),
      }),
      premium: z.object({
        name: z.string(),
        tag: z.string(),
        price: z.string(),
        period: z.string(),
        tagline: z.string(),
        features: z.array(listItem),
        ctaLabel: z.string(),
      }),
      // Phrase découpée pour garder le lien vers /pro hors des textes éditables.
      note: z.object({
        before: z.string(),
        linkLabel: z.string(),
        after: z.string(),
      }),
    }),
    pro: z.object({
      eyebrow: z.string(),
      title: richText, // HTML
      text: z.string(),
      ctaPrimary: z.string(),
      ctaSecondary: z.string(),
      planLabel: z.string(),
      items: z.object({
        hours: z.object({ name: z.string(), sub: z.string() }),
        ai: z.object({ name: z.string(), sub: z.string() }),
        cross: z.object({ name: z.string(), sub: z.string() }),
        prompts: z.object({ name: z.string(), sub: z.string() }),
        channels: z.object({ name: z.string(), sub: z.string() }),
        export: z.object({ name: z.string(), sub: z.string() }),
      }),
    }),
    finalCta: z.object({
      title: richText, // HTML
      lede: z.string(),
      ctaLabel: z.string(),
      loginNote: z.string(),
      loginLabel: z.string(),
    }),
  }),
});

export const collections = { blog, podcasts, home };
