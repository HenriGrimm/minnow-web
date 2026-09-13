/**
 * Astro Content Collections (spec §6.4, §7.5).
 *
 * The docs collection uses the glob loader over src/content/docs, populated
 * by scripts/sync-minnow.mjs (never hand-edited). Each synced file has
 * injected frontmatter (title from the H1, description from the first
 * paragraph).
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { docs };