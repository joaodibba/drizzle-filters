import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Drizzle Filters",
  description: "Type-safe filtering for Drizzle ORM with Zod validation. Prisma-like filter API for modern TypeScript applications.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Examples', link: '/examples' },
      { text: 'API', link: '/api/filter-builder' },
      { text: 'FAQ', link: '/faq' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Examples', link: '/examples' },
          { text: 'FAQ', link: '/faq' }
        ]
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Filters', link: '/concepts/filters' },
          { text: 'Operators', link: '/concepts/operators' },
          { text: 'Relations', link: '/concepts/relations' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'FilterBuilder', link: '/api/filter-builder' },
          { text: 'Utilities', link: '/api/utils' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Building Nested Filters', link: '/guides/building-nested-filters' },
          { text: 'Customization', link: '/guides/customization' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/joaodibba/drizzle-filters' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/joaodibba/drizzle-filters/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
