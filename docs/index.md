---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Drizzle Filters"
  text: "Type-safe filtering for Drizzle ORM"
  tagline: Build consistent, validated API filtering without reinventing logic for each endpoint
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View Examples
      link: /examples
    - theme: alt
      text: GitHub
      link: https://github.com/joaodibba/drizzle-filters

features:
  - icon: 🔒
    title: Type-Safe
    details: Full TypeScript support with Zod validation. Catch filter errors at compile-time and runtime.
  - icon: ⚡
    title: Prisma-like API
    details: Familiar filter syntax inspired by Prisma. Operators like contains, gte, lte, and more.
  - icon: 🛡️
    title: SQL Injection Protected
    details: Operator keys are whitelisted and values are parameterized by Drizzle. Safe by default.
  - icon: 🧩
    title: Composable
    details: Build simple WHERE conditions or complex nested filters with AND/OR/NOT logic.
  - icon: 📦
    title: Zero Dependencies
    details: Only peer dependencies are Drizzle ORM and Zod—both you're likely already using.
  - icon: 🎯
    title: Flexible
    details: Choose from buildWhere for simple cases, or buildNestedFilters for complex group logic.
---


