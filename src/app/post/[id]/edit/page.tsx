'use client'

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export default function EditPostPage({params}: {params: {id : string}}){
    const router = useRouter()
    const postId = params.id

    const [title, setTitle] = useState('')
    const [coverUrl, setCoverUrl] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [backPath, setBackPath] = useState('/explore')

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
    })

    useEffect(() => {
        const fetchPost = async() =>{
            const {data, error} = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single()

            if(error || !data){
                alert('Failed to load post')
                router.push('/dashboard')
                return
            }

            setTitle(data.title)
            setCoverUrl(data.cover_url)
            editor?.commands.setContent(data.content)
            setLoading(false)

            const checkUser = async () =>{
                const {data: userData} = await supabase.auth.getUser()
                if(userData?.user){
                    setBackPath('/dashboard')
                }
            }
            checkUser()
        }
        if(editor)fetchPost()
    }, [editor, postId, router])

    const handleUpload = async (): Promise<string | null> => {
        if (!coverFile) return coverUrl

        const fileName = `${Date.now()} - ${coverFile.name}`
        const {error} = await supabase.storage
            .from('covers')
            .upload(fileName, coverFile)

        if (error){
            console.error('Upload error: ', error.message)
            return coverUrl
        }

        const {data: urlData} = supabase.storage
            .from('covers')
            .getPublicUrl(fileName)

        return urlData?.publicUrl || coverUrl
    }

    const handleUpdate = async() => {
        const content = editor?.getHTML()
        if(!title || !content){
            alert ('Please fill in title and content')
            return
        }

        const newCoverUrl = await handleUpload()

        const {error} = await supabase
            .from('posts')
            .update({
                title,
                content,
                cover_url: newCoverUrl
            })
            .eq('id', postId)

        if(error){
            alert('Failed to update post')
            console.error(error)
        }else{
            alert('✅ Post Update!')
            router.push(`/post/${postId}`)
        }
    }

    if (loading) return <div className="p-4 text-center">Loading post...</div>

    return(
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">✏️ Edit Post</h1>
                <Input
                    placeholder="Post title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files?.[0]){
                            setCoverFile(e.target.files[0])
                        }
                    }}
                />

                {coverFile ?(
                    <img
                        src={URL.createObjectURL(coverFile)}
                        alt="New Cover Preview"
                        className="w-full max-h-64 object-cover rounded"
                    />
                ): coverUrl ? (
                    <img
                        src={coverUrl}
                        alt="Current Cover"
                        className="w-full max-h-64 object-cover rounded"
                    />
                ) : null}

                {editor && (
                    <div className="border rounded p-2 min-h[200px]">
                        <EditorContent editor={editor}/>
                    </div>
                )}
                <Button onClick={handleUpdate}>💾 Update Post</Button>
                <Button variant="outline" onClick={() => router.push(backPath)}>🔙 Back</Button>
        </main>
    )
}