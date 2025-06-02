'use client'

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Star } from "lucide-react"
import MapSelector from "@/components/MapSelector"

export default function EditPostPage() {
    const router = useRouter()
    const params = useParams()
    const postId = params?.id as string

    const [title, setTitle] = useState('')
    const [coverUrl, setCoverUrl] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [rating, setRating] = useState(0)
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [address, setAddress] = useState('')
    const [mapResetKey, setMapResetKey] = useState(0)
    const [mapOpen, setMapOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [backPath, setBackPath] = useState('/explore')

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
    })

    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', postId)
                .single()

            if (error || !data) {
                alert('Failed to load post')
                router.push('/dashboard')
                return
            }

            setTitle(data.title)
            setCoverUrl(data.cover_url)
            setRating(data.initial_rating || 0)
            setLatitude(data.latitude)
            setLongitude(data.longitude)
            setAddress(data.address || '')
            editor?.commands.setContent(data.content)
            setLoading(false)

            const { data: userData } = await supabase.auth.getUser()
            if (userData?.user) setBackPath('/dashboard')
        }

        if (editor) fetchPost()
    }, [editor, postId, router])

    const handleUpload = async (): Promise<string | null> => {
        if (!coverFile) return coverUrl

        const fileName = `${Date.now()}-${coverFile.name}`
        const { error } = await supabase.storage
            .from('covers')
            .upload(fileName, coverFile)

        if (error) {
            console.error('Upload error:', error.message)
            return coverUrl
        }

        const { data: urlData } = supabase.storage
            .from('covers')
            .getPublicUrl(fileName)

        return urlData?.publicUrl || coverUrl
    }

    const handleUpdate = async () => {
        const content = editor?.getHTML()
        if (!title || !content) {
            alert('Please fill in title and content')
            return
        }

        const newCoverUrl = await handleUpload()

        const { error } = await supabase
            .from('posts')
            .update({
                title,
                content,
                cover_url: newCoverUrl,
                initial_rating: rating,
                latitude,
                longitude,
                address,
            })
            .eq('id', postId)

        if (error) {
            alert('Failed to update post')
            console.error(error)
        } else {
            alert('✅ Post updated!')
            router.push(`/post/${postId}`)
        }
    }

    if (loading) return <div className="p-4 text-center">Loading post...</div>

    return (
        <main className="relative max-w-6xl mx-auto p-4 sm:p-6 bg-muted rounded-xl shadow space-y-6 pb-24">
            <h1 className="text-2xl font-bold mb-4">✏️ Edit Post</h1>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* left section */}
                <div className="lg:w-2/3 space-y-4 max-w-[600px]">
                    {/* Restaurant Name */}
                    <section className="bg-white p-3 rounded-lg shadow space-y-2">
                        <label className="block text-sm font-medium text-gray-700">📌 Restaurant Name</label>
                        <Input
                            placeholder="e.g. Sushi Masa"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="rounded-xl"
                        />
                    </section>

                    {/* Rating */}
                    <section className="bg-white p-3 rounded-lg shadow space-y-2">
                        <label className="block text-sm font-medium text-gray-700">✨ Initial Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`text-yellow-400 transition-transform hover:scale-110 ${star <= rating ? 'opacity-100' : 'opacity-40'}`}
                                >
                                    <Star fill="currentColor" stroke="currentColor" className="w-6 h-6" />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Description */}
                    <section className="bg-white p-3 rounded-lg shadow space-y-2">
                        <label className="block text-sm font-medium text-gray-700">📝 Description</label>
                        <div className="border rounded-lg p-2 min-h-[120px] bg-white">
                            {editor && <EditorContent editor={editor} />}
                        </div>
                    </section>

                    {/* Update & Back Buttons */}
                    <section className="flex gap-4 justify-start pt-2">
                        <Button onClick={handleUpdate} className="px-6 py-2 text-base">💾 Update</Button>
                        <Button variant="outline" onClick={() => router.push(backPath)} className="px-6 py-2 text-base">🔙 Back</Button>
                    </section>
                </div>

                {/* right section */}
                <div className="lg:w-1/3 space-y-6 w-full">
                    {/* Cover Upload */}
                    <section className="bg-white p-4 rounded-xl shadow space-y-2">
                        <label className="block text-sm font-medium text-gray-700">📷 Cover Image</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) setCoverFile(e.target.files[0])
                            }}
                        />
                        {(coverFile || coverUrl) && (
                            <img
                                src={coverFile ? URL.createObjectURL(coverFile) : coverUrl}
                                alt="Cover"
                                className="mt-2 w-full h-40 object-cover rounded-md border shadow"
                            />
                        )}
                    </section>

                    {/* Map Dropdown */}
                    <section className="bg-white p-4 rounded-xl shadow space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">📍 Location</label>
                            <button
                                onClick={() => setMapOpen(!mapOpen)}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                {mapOpen ? 'Hide Map' : 'Show Map'}
                            </button>
                        </div>

                        {/* Always show selected address */}
                        {address && (
                            <p className="text-sm text-gray-600">📌 Selected: {address}</p>
                        )}

                        {mapOpen && (
                            <MapSelector
                                latitude={latitude}
                                longitude={longitude}
                                address={address}
                                resetKey={mapResetKey}
                                onLocationChange={(lat, lng, addr) => {
                                    setLatitude(lat)
                                    setLongitude(lng)
                                    setAddress(addr)
                                }}
                            />
                        )}
                    </section>
                </div>
            </div>
        </main>
    )
}
