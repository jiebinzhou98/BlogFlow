'use client'

import { useState, useEffect, useRef } from 'react'
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
import { useLoginPromptTimer } from '@/lib/hooks/useLoginPromptTimer'
import { Star } from 'lucide-react'

export default function CreatePostPage() {
    const [title, setTitle] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [showLoginDialog, setShowLoginDialog] = useState(false)
    const [rating, setRating] = useState(0)
    const [clearing, setClearing] = useState(false)
    const router = useRouter()

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
    })

    useEffect(() => {
        const draft = localStorage.getItem('draft_post')
        if (draft) {
            const parsed = JSON.parse(draft)
            setTitle(parsed.title || '')
            editor?.commands.setContent(parsed.content || '')
        }
    }, [editor])

    useEffect(() => {
        const interval = setInterval(() => {
            const draft = {
                title,
                content: editor?.getHTML() || '',
            }
            localStorage.setItem('draft_post', JSON.stringify(draft))
        }, 1000)
        return () => clearInterval(interval)
    }, [title, editor])

    useLoginPromptTimer(() => {
        setShowLoginDialog(true)
    }, 60 * 1000)

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
            initial_rating: rating,
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

    const handleClearDraft = () => {
        setClearing(true)

        setTimeout(() => {
            localStorage.removeItem('draft_post')
            setTitle('')
            setRating(0)
            setCoverFile(null)
            editor?.commands.setContent('')

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            setClearing(false)
            alert('🗑️ Draft cleared!')
        }, 300)
    }



    const handleBack = async () => {
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
            router.push('/dashboard')
        } else {
            router.push('/explore')
        }
    }

    return (
        <main className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">📝 Add New Restaurant</h1>
                <Button variant="ghost" className="text-sm text-red-500" onClick={handleClearDraft} disabled={clearing}>
                    {clearing ? 'Clearing...' : '🗑️ Clear Draft'}
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Input
                        placeholder="Restaurant name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">✨ Initial Rating:</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`text-yellow-500 hover:scale-110 transition-transform ${star <= rating ? '' : 'opacity-40'}`}
                                >
                                    <Star fill="currentColor" stroke="currentColor" className="w-5 h-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input
                        ref={fileInputRef}
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
                            className="w-full h-40 object-cover rounded border"
                        />
                    )}
                </div>

                <div className="border rounded p-2 min-h-[300px]">
                    {editor && <EditorContent editor={editor} />}
                </div>
            </div>

            <div className='flex items-center justify-between mt-6'>
                <div className='flex gap-4'>
                    <Button disabled={uploading} onClick={() => handleSave(true)}>
                        {uploading ? 'Publishing...' : 'Publish'}
                    </Button>
                    <Button variant="outline" disabled={uploading} onClick={() => handleSave(false)}>
                        {uploading ? 'Saving...' : 'Save as Draft'}
                    </Button>
                </div>
                <Button variant="outline" onClick={handleBack}>🔙 Back</Button>
            </div>

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>🔐 Login to continue writing</DialogTitle>
                        <DialogDescription>
                            To publish this post, please login or register. Your draft will be saved and restored after login.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setShowLoginDialog(false)}>
                            Continue without login
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/register')}>Register</Button>
                        <Button onClick={() => router.push('/login')}>Login</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    )
}