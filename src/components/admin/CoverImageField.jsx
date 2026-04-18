import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Field } from '@/components/admin/editorPrimitives'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/posts'

const BUCKET = 'blog-images'

export default function CoverImageField({ value, onChange, t, label, hint }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (file) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const extMatch = file.name.match(/\.[a-z0-9]+$/i)
      const ext = extMatch ? extMatch[0].toLowerCase() : ''
      const safeBase = slugify(file.name.replace(/\.[a-z0-9]+$/i, '')) || 'image'
      const fileName = `${Date.now()}-${safeBase}${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
      onChange(data.publicUrl)
    } catch (err) {
      console.error(err)
      setError(err.message || t('admin.editor.feedback.uploadError'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Field
      label={label || t('admin.editor.fields.coverImage')}
      hint={hint || t('admin.editor.fields.coverImageHint')}
      error={error}
    >
      <div className="space-y-3">
        {value && (
          <div className="relative inline-block">
            <img
              src={value}
              alt=""
              className="max-h-48 w-auto rounded-xl object-cover border border-navy/[0.08]"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[13px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors disabled:opacity-60"
          >
            <Upload size={14} strokeWidth={2} />
            {uploading
              ? t('admin.editor.fields.coverImageUploading')
              : value
              ? t('admin.editor.fields.coverImageChange')
              : t('admin.editor.fields.coverImage')}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[12px] font-medium text-muted hover:text-accent-deep transition-colors"
            >
              {t('admin.editor.fields.coverImageRemove')}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </Field>
  )
}
