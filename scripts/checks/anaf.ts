/**
 * Checks that the ANAF company service still answers at the address the checkout uses. ANAF
 * changes the version in the path from time to time. Runs on every deploy as a warning.
 *
 *   npm run check:anaf
 */
import { ANAF_URL, fetchCompany } from '../../src/lib/commerce/anaf'

try {
  // A large, long-registered company, only to prove the service answers.
  const company = await fetchCompany('14399840')
  if (!company) throw new Error('no company in the answer')
  console.log(`ANAF: ${ANAF_URL} answers.`)
} catch (error) {
  console.warn(`WARNING: ANAF did not answer at ${ANAF_URL}: ${(error as Error).message}`)
  console.warn(
    'Buyers can still type company data by hand. Update ANAF_URL in src/lib/commerce/anaf.ts.',
  )
  process.exit(1)
}
