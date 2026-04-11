# Guide API pour publication automatique via n8n

> ⚠️ **La clé `service_role` donne un accès total à la base Supabase (bypass RLS).**
> Ne JAMAIS la committer dans git, ne JAMAIS l'exposer côté client. Stockée uniquement dans les credentials n8n ou les variables d'environnement server-side.

## Prérequis

1. Table `posts` créée (voir `supabase/schema.sql`).
2. Bucket Storage `blog-images` créé (public).
3. Récupérer depuis Supabase Dashboard → Project Settings → API :
   - `[PROJECT_ID]` : l'ID du projet (ex: `abcdefghij`).
   - `[SERVICE_ROLE_KEY]` : la clé `service_role` (jamais la clé anon).

---

## 1. Créer un article (POST)

**URL**
```
https://[PROJECT_ID].supabase.co/rest/v1/posts
```

**Headers**
```
Content-Type: application/json
apikey: [SERVICE_ROLE_KEY]
Authorization: Bearer [SERVICE_ROLE_KEY]
Prefer: return=representation
```

**Body (JSON)**
```json
{
  "slug": "mon-article-sur-lia",
  "status": "published",
  "title_fr": "Mon article sur l'IA",
  "title_en": "My article about AI",
  "excerpt_fr": "Résumé de l'article en une ou deux phrases.",
  "excerpt_en": "One or two sentence summary of the article.",
  "content_fr": "# Titre\n\nContenu en **Markdown**. Supporte GFM (tables, listes, code, etc).",
  "content_en": "# Title\n\nContent in **Markdown**. Supports GFM (tables, lists, code, etc).",
  "cover_image": "https://[PROJECT_ID].supabase.co/storage/v1/object/public/blog-images/cover.jpg",
  "tags": ["ia-generative", "tutoriel"],
  "reading_time_minutes": 5,
  "meta_title_fr": "Mon article | 5PennyAi",
  "meta_description_fr": "Description SEO en une phrase, ~150 caractères.",
  "meta_title_en": "My article | 5PennyAi",
  "meta_description_en": "SEO description in one sentence, ~150 chars.",
  "published_at": "2026-04-10T12:00:00Z"
}
```

**Champs obligatoires** : `slug` (unique), `title_fr`, `content_fr`.

**Champs générés automatiquement** : `id`, `created_at`, `updated_at`.

**Réponse** : `201 Created` + l'article complet (grâce au header `Prefer: return=representation`).

---

## 2. Modifier un article (PATCH)

**URL**
```
https://[PROJECT_ID].supabase.co/rest/v1/posts?id=eq.[POST_ID]
```

**Headers** : idem POST.

**Body** : uniquement les champs à mettre à jour, ex :
```json
{
  "status": "archived"
}
```

---

## 3. Supprimer un article (DELETE)

**URL**
```
https://[PROJECT_ID].supabase.co/rest/v1/posts?id=eq.[POST_ID]
```

**Headers** : idem POST (sans `Content-Type` ni `Prefer`).

---

## 4. Uploader une image de couverture

### Upload (POST)
**URL**
```
https://[PROJECT_ID].supabase.co/storage/v1/object/blog-images/[filename]
```

**Headers**
```
Authorization: Bearer [SERVICE_ROLE_KEY]
Content-Type: image/jpeg   # ou image/png, image/webp, etc.
```

**Body** : le fichier binaire.

### URL publique
Une fois uploadé, l'image est accessible à :
```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/blog-images/[filename]
```

C'est cette URL qu'on met dans le champ `cover_image` du post.

**Astuce** : utiliser un nom unique (ex : `${timestamp}-${slug}.jpg`) pour éviter les collisions.

---

## 5. Workflow n8n typique

1. **Trigger** (cron, webhook, ou manuel).
2. **Générer le contenu** via un noeud OpenAI/Claude/Gemini (titre FR/EN, excerpt, content Markdown, tags, meta SEO).
3. **Upload de l'image** (si générée) → noeud HTTP Request POST vers le bucket.
4. **Insert du post** → noeud HTTP Request POST vers `/rest/v1/posts` avec le JSON.
5. **Notification** (optionnel) : Slack, email, etc.

### Réponse Supabase — gestion d'erreurs

- `201` : post créé.
- `409` : slug déjà utilisé (contrainte `unique`).
- `400` : champ obligatoire manquant ou JSON invalide.
- `401` : clé API manquante ou incorrecte.

---

## Tester rapidement en local

```bash
curl -X POST 'https://[PROJECT_ID].supabase.co/rest/v1/posts' \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "slug": "test-article",
    "status": "published",
    "title_fr": "Article de test",
    "content_fr": "# Bonjour\n\nCeci est un test.",
    "tags": ["test"],
    "reading_time_minutes": 1,
    "published_at": "2026-04-10T12:00:00Z"
  }'
```

L'article devrait apparaître sur `https://5pennyai.com/blog` en quelques secondes.
