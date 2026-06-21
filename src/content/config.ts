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

export const collections = { blog, podcasts };
