import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({ page, serverURL = '', user }: LoginOptions): Promise<void> {
  await page.goto(`${serverURL}/admin/login`)

  // With username sign-in the field takes an email or a username (`#field-username`).
  await page.locator('#field-username, #field-email').first().fill(user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(`${serverURL}/admin`)

  const dashboardArtifact = page.locator('span[title="Dashboard"]')
  await expect(dashboardArtifact).toBeVisible()
}
