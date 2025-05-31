'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus, Star } from "lucide-react"

interface Post {
    id: string
    title: string
    content: string
    cover_url: string
    created_at: string
}

export default function ExplorePage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [ratings, setRatings] = useState<{ [key: string]: number }>({})
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchPostsAndRatings = async () => {
            const { data: postData, error } = await supabase
                .from("posts")
                .select("*")
                .eq("published", true)
                .order("created_at", { ascending: false })

            if (!error && postData) {
                setPosts(postData)

                const postIds = postData.map((p) => p.id)
                const { data: ratingData } = await supabase
                    .from("ratings")
                    .select("post_id, rating")
                    .in("post_id", postIds)

                if (ratingData) {
                    const grouped: { [key: string]: number[] } = {}
                    ratingData.forEach((r) => {
                        if (!grouped[r.post_id]) grouped[r.post_id] = []
                        grouped[r.post_id].push(r.rating)
                    })
                    const avgRatings: { [key: string]: number } = {}
                    for (const id in grouped) {
                        const avg = grouped[id].reduce((a, b) => a + b, 0) / grouped[id].length
                        avgRatings[id] = avg
                    }
                    setRatings(avgRatings)
                }
            }
            setLoading(false)
        }
        fetchPostsAndRatings()
    }, [])

    if (loading) return <div className="p-4 text-center">Loading posts...</div>

    return (
        <main className="max-w-7xl mx-auto px-4 py-12 space-y-10">
            <h1 className="text-3xl font-bold text-center">🍽️ Foodie Picks Near You</h1>

            <div className="max-w-md mx-auto">
                <input
                    type="text"
                    placeholder="Search restaurants by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* ➕ Create new post card */}
                <div
                    onClick={() => router.push("/create")}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition h-64 md:h-72"
                >
                    <Plus className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-gray-600 font-medium">Create New Post</p>
                </div>

                {/* 📄 Existing posts */}
                {posts
                    .filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((post) => (
                    <div
                        key={post.id}
                        onClick={() => router.push(`/post/${post.id}`)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-blue-200 hover:scale-[1.01] cursor-progress flex flex-col h-64 md:h-72"
                    >
                        {post.cover_url && (
                            <Image
                                src={post.cover_url}
                                alt={post.title}
                                width={500}
                                height={200}
                                className="w-full h-40 object-cover"
                            />
                        )}
                        <div className="p-4 flex flex-col justify-between flex-grow">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
                                {ratings[post.id] && (
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i <= Math.round(ratings[post.id]) ? 'text-yellow-500' : 'text-gray-300'}`}
                                                fill={i <= Math.round(ratings[post.id]) ? 'currentColor' : 'none'}
                                            />
                                        ))}
                                        <span className="text-sm text-gray-500">({ratings[post.id].toFixed(1)})</span>
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {(() => {
                                        const plainText = post.content.replace(/<[^>]+>/g, "")
                                        return plainText.length > 100
                                            ? plainText.slice(0, 100) + "..."
                                            : plainText
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}