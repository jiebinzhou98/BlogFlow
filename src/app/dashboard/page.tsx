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

    useEffect(() => {
        const fetchUserProfile = async () =>{
            const {
                data: {user},
                error: userError,
            } = await supabase.auth.getUser()

            if(userError || !user){
                router.push('/login')
                return
            }

            setEmail(user.email!)

            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if(error){
                console.error('Failed to load profile: ', error.message)
            }else{
                setProfile(data)
            }
            setLoading(false)
        }
        fetchUserProfile()
    },[router])

    if(loading) return <div className="p-4 text-center">Loading...</div>

    const isGuest = email === 'guest@demo.com' || profile?.is_guest === true


    return(
        <main className="max-w-7xl mx-auto px-4 py-12 space-y-10">
            <Card className="w-full max-w-3xl mx-auto p-6">
                <CardContent className="space-y-4">
                    <h2 className="text-2xl font-semibold text-center">
                        Welcome, {profile?.username || 'User'}👋
                    </h2>
                    <p className="text-center text-gray-500">{email}</p>

                    {isGuest && (
                        <div className="text-yellow-600 text-center font-medium">
                            You are logged in as guest. Some features are disabled.
                        </div>
                    )}
                    <div className="flex flex-col gap-3 mt-4">
                        {!isGuest &&(
                            <Button onClick={() => router.push('/create')}>➕ Create New Post</Button>
                        )}
                        <Button variant="outline" onClick={() => router.push('/')}>🏠Go to Home</Button>
                    </div>
                    
                </CardContent>
            </Card>

            <section>
                <h3 className="text-2xl font-bold mb-6">Latest Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                            >
                                {post.cover_url &&(
                                    <Image
                                        src={post.cover_url}
                                        alt={post.title}
                                        width={500}
                                        height={300}
                                        className="w-full h-60 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                                    <p className="text-sm text-gray-500 line-clamp-3">
                                        {post.content.replace(/<[^>]+>/g, '').slice(0, 150)}...
                                    </p>
                                    <Button
                                        variant="link"
                                        className="mt-2 px-0"
                                        onClick={() => router.push(`/post/${post.id}`)}
                                    >
                                        Read More →
                                    </Button>
                                </div>
                            </div>
                        ))}
                </div>
            </section>
        </main>
    )
}