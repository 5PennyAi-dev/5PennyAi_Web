import test from 'node:test'
import assert from 'node:assert/strict'
import {
  downloadPublicAsset,
  resolveBlobDownloadFileName,
} from './publicAssetDownload.js'

test('harmonise l’extension avec le MIME réel du Blob', () => {
  assert.equal(resolveBlobDownloadFileName('article-infographie.webp', 'image/png'), 'article-infographie.png')
  assert.equal(resolveBlobDownloadFileName('article-infographie.png', 'image/jpeg'), 'article-infographie.jpg')
  assert.equal(resolveBlobDownloadFileName('article-infographie.jpg', 'image/webp'), 'article-infographie.webp')
  assert.equal(resolveBlobDownloadFileName('article-infographie.png', ''), 'article-infographie.png')
})

test('télécharge le Blob complet et libère toujours son URL temporaire', async () => {
  const calls = []
  const link = {
    click() { calls.push(['click', this.download]) },
    remove() { calls.push(['remove']) },
  }
  await downloadPublicAsset('https://storage.example/signed', 'article-infographie.webp', {
    fetchObject: async () => ({ ok: true, blob: async () => ({ type: 'image/png' }) }),
    documentObject: {
      createElement: () => link,
      body: { appendChild: () => calls.push(['append']) },
    },
    urlObject: {
      createObjectURL: () => 'blob:test',
      revokeObjectURL: (url) => calls.push(['revoke', url]),
    },
  })
  assert.deepEqual(calls, [
    ['append'],
    ['click', 'article-infographie.png'],
    ['remove'],
    ['revoke', 'blob:test'],
  ])
})

test('propage une erreur réseau ou un asset absent sans créer de lien', async () => {
  await assert.rejects(downloadPublicAsset('https://storage.example/signed', 'asset.png', {
    fetchObject: async () => { throw new Error('network') },
  }), /network/)
  await assert.rejects(downloadPublicAsset('https://storage.example/missing', 'asset.png', {
    fetchObject: async () => ({ ok: false }),
  }), /download_failed/)
})
