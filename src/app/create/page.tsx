'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  })

  const handleUpload = async (): Promise<string | null> => {
    if (!coverFile) {
      console.warn('⚠️ No cover file selected')
      return null
    }

    const fileName = `${Date.now()}-${coverFile.name}`
    console.log('📤 Uploading:', fileName)

    const { data, error: uploadError } = await supabase.storage
      .from('covers')
      .upload(fileName, coverFile)

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message)
      return null
    }

    console.log('✅ Upload success:', data)

    const { data: publicUrl } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName)

    console.log('🌐 Public URL:', publicUrl?.publicUrl)

    return publicUrl?.publicUrl || null
  }

  const handleSubmit = async () => {
    if (!title || !editor?.getHTML()) {
      alert('Please fill in title and content')
      return
    }

    setUploading(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      alert('Not logged in')
      setUploading(false)
      return
    }

    const cover_url = await handleUpload()

    const newPost = {
      title,
      content: editor.getHTML(),
      cover_url,
      published: true,
      author_id: userData.user.id,
    }

    console.log('📦 Insert data:', newPost)

    const { error: insertError } = await supabase.from('posts').insert(newPost)

    setUploading(false)

    if (insertError) {
      alert('Failed to create post')
      console.error('❌ Insert failed:', insertError.message)
    } else {
      alert('✅ Post created successfully!')
      router.push('/dashboard')
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">📝 Create New Post</h1>

      <Input
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setCoverFile(e.target.files[0])
          }
        }}
      />

      {coverFile && (
        <img
          src={URL.createObjectURL(coverFile)}
          alt="Preview"
          className="w-full max-h-64 object-cover rounded"
        />
      )}

      {editor && (
        <div className="border rounded p-2 min-h-[200px]">
          <EditorContent editor={editor} />
        </div>
      )}

      <Button disabled={uploading} onClick={handleSubmit}>
        {uploading ? 'Publishing...' : 'Publish'}
      </Button>
    </main>
  )
}
