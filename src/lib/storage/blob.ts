import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { del, put } from '@vercel/blob'

/**
 * Vercel Blob storage for uploads. Payload's own adapter still needs a static read-write
 * token; stores connected to a project now use OIDC, which the SDK reads from the environment.
 * Blob stays private to this code: pages keep using `/api/{collection}/file/{name}`, so image
 * optimisation and access rules work as they do on disk.
 *
 * The plugin always runs with its fields inserted, so the schema is the same with or without
 * a store and the migrations always match the database.
 */

/** Public host of a store: `store_AbC` → `https://abc.public.blob.vercel-storage.com`. */
export const blobBaseUrl = (storeId: string) =>
  `https://${storeId.replace(/^store_/, '').toLowerCase()}.public.blob.vercel-storage.com`

const adapter =
  (baseUrl: string): Adapter =>
  ({ collection }) => {
    const pathname = (filename: string) => `${collection.slug}/${filename}`
    const urlOf = (filename: string) =>
      `${baseUrl}/${pathname(filename).split('/').map(encodeURIComponent).join('/')}`
    return {
      name: 'vercel-blob',
      handleUpload: async ({ data, file }) => {
        await put(pathname(file.filename), file.buffer, {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: file.mimeType,
        })
        return data
      },
      handleDelete: async ({ filename }) => {
        await del(urlOf(filename))
      },
      staticHandler: async (_req, { params: { filename } }) => {
        const res = await fetch(urlOf(filename))
        if (!res.ok) return new Response(null, { status: 404, statusText: 'Not Found' })
        const headers = new Headers({ 'Cache-Control': 'public, max-age=86400' })
        for (const name of ['Content-Type', 'Content-Length', 'ETag', 'Last-Modified']) {
          const value = res.headers.get(name)
          if (value) headers.set(name, value)
        }
        return new Response(res.body, { headers })
      },
    }
  }

/** The storage plugin: active once a Blob store is connected to the project. */
export function vercelBlob() {
  const storeId = process.env.BLOB_STORE_ID
  const storage = { adapter: storeId ? adapter(blobBaseUrl(storeId)) : null }
  return cloudStoragePlugin({
    enabled: Boolean(storeId),
    alwaysInsertFields: true,
    collections: { media: storage, documents: storage },
  })
}
