// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';
import { createCssVariablesTheme } from 'shiki';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://minnow.sh',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx(), sitemap(), pagefind()],
  markdown: {
    shikiConfig: {
      // Emit CSS variables so syntax colours are mapped onto the site's
      // --cm-* / --mn-syntax-* tokens (spec §3.9). The variable names are
      // remapped by hand in a later wave; the shape here is what matters.
      theme: createCssVariablesTheme({ variablePrefix: '--cm-' }),
      wrap: false,
    },
  },
});