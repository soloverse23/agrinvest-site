/**
 * `npm run apply:panel`: the department accounts of the staff panel (Phase 9). Runs on every
 * deploy and only adds an account that does not exist yet; an existing account, its password
 * and its roles are never touched, so a password changed in the panel stays changed.
 *
 * `data/panel/accounts.json` holds each account's PBKDF2 salt and hash (Payload's own format,
 * 600 000 rounds), never a password: the passwords were handed to the owner separately.
 */
import config from '@payload-config'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'

type Account = { email: string; name: string; roles: string[]; salt: string; hash: string }

const accounts = JSON.parse(
  readFileSync(new URL('../../data/panel/accounts.json', import.meta.url), 'utf8'),
) as Account[]

const payload = await getPayload({ config })
for (const account of accounts) {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: account.email } },
    limit: 1,
    depth: 0,
  })
  if (found.docs[0]) {
    console.log(`panel: ${account.email} exists, left as it is`)
    continue
  }
  const user = await payload.create({
    collection: 'users',
    data: {
      email: account.email,
      name: account.name,
      roles: account.roles as never,
      // Replaced at once by the stored hash below.
      password: randomBytes(24).toString('hex'),
    },
  })
  await payload.db.updateOne({
    collection: 'users',
    id: user.id,
    data: { salt: account.salt, hash: account.hash },
  })
  console.log(`panel: ${account.email} created (${account.roles.join(', ')})`)
}
process.exit(0)
