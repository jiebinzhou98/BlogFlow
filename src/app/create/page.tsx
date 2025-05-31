// ✅ 修改目标：
// 1. 未登录时允许填写内容
// 2. 超时（如2分钟）自动提示登录（通过 Shadcn Dialog）
// 3. 所有输入实时保存到 localStorage，并在页面加载时恢复

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function CreatePostPage() {
    const [title, setTitle] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [showLoginDialog, setShowLoginDialog] = useState(false)
    const router = useRouter()

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
    })

    // ✅ 读取 localStorage 草稿
    useEffect(() => {
        const draft = localStorage.getItem('draft_post')
        if (draft) {
            const parsed = JSON.parse(draft)
            setTitle(parsed.title || '')
            editor?.commands.setContent(parsed.content || '')
        }
    }, [editor])

    // ✅ 实时保存到 localStorage
    useEffect(() => {
        const interval = setInterval(() => {
            const draft = {
                title,
                content: editor?.getHTML() || ''
            }
            localStorage.setItem('draft_post', JSON.stringify(draft))
        }, 1000)
        return () => clearInterval(interval)
    }, [title, editor])

    // ✅ 计时器提示登录（使用 Dialog）
    useEffect(() => {
        const checkLoginTimer = async () => {
            const { data } = await supabase.auth.getUser()
            if (!data?.user) {
                setTimeout(() => {
                    setShowLoginDialog(true)
                }, 30 * 1000)
            }
        }
        checkLoginTimer()
    }, [router])

    const handleUpload = async (): Promise<string | null> => {
        if (!coverFile) return null
        const fileName = `${Date.now()}-${coverFile.name}`
        const { data, error } = await supabase.storage.from('covers').upload(fileName, coverFile)
        if (error) return null
        const { data: publicUrl } = supabase.storage.from('covers').getPublicUrl(fileName)
        return publicUrl?.publicUrl || null
    }

    const handleSave = async (published: boolean) => {
        if (!title || !editor?.getHTML()) {
            alert('Please fill in title and content')
            return
        }
        setUploading(true)

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
            setUploading(false)
            setShowLoginDialog(true)
            return
        }

        const cover_url = await handleUpload()

        const newPost = {
            title,
            content: editor.getHTML(),
            cover_url,
            published: !!published,
            author_id: userData.user.id,
        }

        const { error: insertError } = await supabase.from('posts').insert(newPost)
        setUploading(false)

        if (insertError) {
            alert('Failed to create post')
        } else {
            localStorage.removeItem('draft_post')
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

            <div className='flex items-center justify-between'>
                <div className='flex gap-4'>
                    <Button disabled={uploading} onClick={() => handleSave(true)}>
                        {uploading ? 'Publishing...' : 'Publish'}
                    </Button>
                    <Button variant="outline" disabled={uploading} onClick={() => handleSave(false)}>
                        {uploading ? 'Saving...' : 'Save as Draft'}
                    </Button>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    🔙 Back
                </Button>
            </div>

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>⚠️ Login Required</DialogTitle>
                        <DialogDescription>
                            To continue creating this post, please login or register.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => router.push('/register')}>Register</Button>
                        <Button onClick={() => router.push('/login')}>Login</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    )
} 
