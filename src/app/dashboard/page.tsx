'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Profile {
    username: string
    bio: string
    avatar_url: string
    is_guest: boolean
}

interface Post {
    id: string
    title: string
    content: string
    cover_url: string
    created_at: string
}


export default function DashboardPage() {

    const [profile, setProfile] = useState<Profile | null>(null)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [posts, setPosts] = useState<Post[]>([])
    const router = useRouter()
    const [publishedPosts, setPublishedPosts] = useState<Post[]>([])
    const [draftPosts, setDraftPosts] = useState<Post[]>([])

    useEffect(() => {
        const fetchUserProfile = async () => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (userError || !user) {
                router.push('/login')
                return
            }

            setEmail(user.email!)

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error('Failed to load profile: ', profileError.message)
            } else {
                setProfile(profileData)
            }

            const { data: published, error: pubErr } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', user.id)
                .eq('published', true)
                .order('created_at', { ascending: false })

            if (published) setPublishedPosts(published)

            const { data: drafts, error: draftErr } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', user.id)
                .is('published', false)
                .order('created_at', { ascending: false })

            if (drafts) setDraftPosts(drafts)

            setLoading(false)
        }
        fetchUserProfile()
    }, [router])

    const handlePublish = async (postId: string) => {
        const { error } = await supabase
            .from('posts')
            .update({ published: true })
            .eq('id', postId)

        if (error) {
            alert('❌ Failed to publish draft')
            console.error(error)
        } else {
            alert('✅ Draft published!')

            const publishedPost = draftPosts.find((post) => post.id === postId)
            if(publishedPost){
                setDraftPosts(draftPosts.filter((post) => post.id !== postId))
                setPublishedPosts([publishedPost, ...publishedPosts])
            }
        }
    }

    if (loading) return <div className="p-4 text-center">Loading...</div>

    const isGuest = email === 'guest@demo.com' || profile?.is_guest === true


    return (
        <main className="max-w-7xl mx-auto px-4 py-12 space-y-10">

            <section>
                <h2 className="text-2xl font-bold mb-6">📢 Published Posts</h2>
                {publishedPosts.length === 0 ? (
                    <p className="text-gray-500">No published posts yet</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {publishedPosts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
                                {post.cover_url && (
                                    <Image
                                        src={post.cover_url}
                                        alt={post.title}
                                        width={500}
                                        height={300}
                                        className="w-full h-60 object-cover"
                                    />
                                )}
                                <div className="p-4 flex flex-col justify-between flex-grow">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                                        <p className="text-sm text-gray-500 line-clamp-3">
                                            {post.content.replace(/<[^>]+>/g, '').slice(0, 150)}...
                                        </p>
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            onClick={() => router.push(`/post/${post.id}`)}
                                        >
                                            Read More →
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="mt-12">
                <h3 className="text-2xl font-bold mb-6">📝 Drafts</h3>
                {draftPosts.length === 0 ? (
                    <p className="text-gray-500">No drafts saved yet</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {draftPosts.map((post) => (
                            <div key={post.id} className="bg-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition flex flex-col h-full">
                                {post.cover_url && (
                                    <Image
                                        src={post.cover_url}
                                        alt={post.title}
                                        width={500}
                                        height={300}
                                        className="w-full h-60 object-cover"
                                    />
                                )}
                                <div className="p-4 flex flex-col justify-between flex-grow">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                                        <p className="text-sm text-gray-500 line-clamp-3">
                                            {post.content.replace(/<[^>]+>/g, '').slice(0, 150)}...
                                        </p>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push(`/post/${post.id}`)}
                                        >
                                            Edit Draft →
                                        </Button>
                                        <Button
                                            variant="default"
                                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                                            onClick={() => handlePublish(post.id)}
                                        >
                                            📤 Publish
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </main>
    )
}