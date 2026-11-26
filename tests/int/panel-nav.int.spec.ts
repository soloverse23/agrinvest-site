import { describe, expect, it } from 'vitest'

import { departmentRoles, departments } from '@/access/departments'
import { panelNav, sectionIcon } from '@/lib/panel/nav'

describe('panel sidebar', () => {
  it('lists every section of a department exactly once, each with an icon', () => {
    for (const role of departmentRoles) {
      const items = panelNav[role].flatMap((g) => g.items)
      expect(new Set(items).size).toBe(items.length)
      expect([...items].sort()).toEqual([...departments[role].sections].sort())
      for (const slug of items) expect(sectionIcon[slug]).toBeTruthy()
    }
  })
})
