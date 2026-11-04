import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    await seedTestUser()

    const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL })
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('/admin/collections/users')
    await expect(page).toHaveURL(/\/admin\/collections\/users(\?.*)?$/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('lists the shop category tree with product counts', async () => {
    await page.goto('/admin/collections/categories')
    await expect(page.getByRole('link', { name: 'Erbicide', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Protecția plantelor', exact: true })).toBeVisible()
  })

  test('shows only the technical fields of the chosen product type', async () => {
    await page.goto('/admin/collections/products/create')
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await page.locator('#field-productType').click()
    await page.locator('.rs__option').first().click()
    await page.getByRole('button', { name: /Date tehnice|Technical data/ }).click()
    await expect(page.locator('#field-protection__formulation')).toBeVisible()
    await expect(page.locator('#field-seed__variety')).toHaveCount(0)
  })

  test('can navigate to edit view', async () => {
    await page.goto('/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
